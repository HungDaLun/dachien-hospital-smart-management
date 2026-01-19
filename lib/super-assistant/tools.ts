/**
 * Super Assistant - 工具模組
 * 提供 Orchestrator 可用的工具函式
 */

import { createClient } from '@/lib/supabase/server';
import { ANNSemanticSearchEngine, SearchResult } from '@/lib/knowledge/ann-search';
import { getGoogleCalendarSyncService } from './google-calendar-sync';
import { AgentDelegationTool, AgentDelegationParams } from './tools/agent-delegation';
import { getNotificationService } from './notification';

// ==================== Types ====================

export interface ToolExecutionResult {
    success: boolean;
    data?: unknown;
    error?: string;
}

export interface CreateEventParams {
    title?: string;
    summary?: string;
    description?: string;
    location?: string;
    startTime?: string;
    start?: string;
    endTime?: string;
    end?: string;
    timezone?: string;
    isAllDay?: boolean;
}

export interface ToolDefinition {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, unknown>;
        required?: string[];
    };
}


// ==================== Knowledge Search Tool ====================

/**
 * 知識庫搜尋工具
 * 用於查詢企業知識庫中的相關資訊
 */
export class KnowledgeSearchTool {
    private searchEngine: ANNSemanticSearchEngine;

    constructor() {
        this.searchEngine = new ANNSemanticSearchEngine();
    }

    /**
     * 執行知識庫搜尋
     * @param query 搜尋查詢
     * @param options 搜尋選項
     */
    async execute(
        query: string,
        options?: {
            topK?: number;
            departmentId?: string;
            categoryId?: string;
            dikwLevel?: string;
        }
    ): Promise<ToolExecutionResult> {
        try {
            const results = await this.searchEngine.search(
                query,
                options?.topK ?? 5,
                {
                    departmentId: options?.departmentId,
                    categoryId: options?.categoryId,
                    dikwLevel: options?.dikwLevel,
                }
            );

            if (results.length === 0) {
                return {
                    success: true,
                    data: {
                        message: '未找到相關知識',
                        results: [],
                    },
                };
            }

            // 格式化結果供 LLM 使用
            const formattedResults = results.map((r: SearchResult) => ({
                title: r.filename,
                content: this.truncateContent(r.markdown_content, 500),
                relevance: Math.round(r.similarity * 100),
                level: r.dikw_level,
            }));

            return {
                success: true,
                data: {
                    message: `找到 ${results.length} 筆相關知識`,
                    results: formattedResults,
                },
            };
        } catch (error) {
            console.error('[KnowledgeSearchTool] Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '知識庫搜尋失敗',
            };
        }
    }

    /**
     * 截斷內容
     */
    private truncateContent(content: string, maxLength: number): string {
        if (!content) return '';
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    }
}

// ==================== War Room Data Tool ====================

/**
 * 戰情室數據工具
 * 用於查詢公司營運狀況、KPI 等資訊
 */
export class WarRoomDataTool {
    /**
     * 取得公司營運摘要
     */
    async getOperationalSummary(): Promise<ToolExecutionResult> {
        try {
            // 呼叫內部 API 取得戰情室數據
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/dashboard/intelligence`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('無法取得戰情室數據');
            }

            const data = await response.json();

            return {
                success: true,
                data: {
                    message: '已取得營運摘要',
                    summary: data.data || data,
                },
            };
        } catch (error) {
            console.error('[WarRoomDataTool] Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '戰情室數據查詢失敗',
            };
        }
    }

    /**
     * 取得風險警示
     */
    async getRiskAlerts(): Promise<ToolExecutionResult> {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/war-room/kpi/risk-alerts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                // 如果端點不存在，返回空結果
                return {
                    success: true,
                    data: {
                        message: '目前無風險警示',
                        alerts: [],
                    },
                };
            }

            const data = await response.json();

            return {
                success: true,
                data: {
                    message: `發現 ${data.alerts?.length || 0} 個風險警示`,
                    alerts: data.alerts || [],
                },
            };
        } catch (error) {
            console.error('[WarRoomDataTool] getRiskAlerts Error:', error);
            return {
                success: true, // 不阻擋流程
                data: {
                    message: '目前無法取得風險警示',
                    alerts: [],
                },
            };
        }
    }
}

// ==================== Calendar Tool ====================

/**
 * 行事曆工具
 * 用於查詢與管理使用者的 Google Calendar 行程
 */
export class CalendarTool {
    private syncService = getGoogleCalendarSyncService();

    /**
     * 讀取行程
     */
    async listEvents(userId: string, query?: string): Promise<ToolExecutionResult> {
        if (!userId) {
            return { success: false, error: '未提供使用者識別 ID' };
        }

        try {
            // 目前簡單處理，獲取接下來 7 天的行程
            const timeMin = new Date().toISOString();
            const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            const result = await this.syncService.listEvents(userId, {
                timeMin,
                timeMax,
                maxResults: 10
            });

            if (!result.success) {
                return { success: false, error: result.error };
            }

            const events = result.events || [];

            // 如果有 query，進行簡單過濾 (未來可由 LLM 處理更精準的過濾)
            const filteredEvents = query
                ? events.filter(e =>
                    e.summary.toLowerCase().includes(query.toLowerCase()) ||
                    (e.description && e.description.toLowerCase().includes(query.toLowerCase()))
                )
                : events;

            return {
                success: true,
                data: {
                    message: `找到 ${filteredEvents.length} 筆行程`,
                    events: filteredEvents.map(e => ({
                        id: e.id,
                        summary: e.summary,
                        start: e.start.dateTime || e.start.date,
                        end: e.end.dateTime || e.end.date,
                        location: e.location,
                        description: e.description
                    })),
                },
            };
        } catch (error) {
            console.error('[CalendarTool] List error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '行事曆讀取失敗',
            };
        }
    }

    /**
     * 建立行程
     */
    async createEvent(userId: string, eventData: CreateEventParams): Promise<ToolExecutionResult> {
        if (!userId) {
            return { success: false, error: '未提供使用者識別 ID' };
        }

        try {
            const title = eventData.title || eventData.summary || '無標題行程';
            const startTime = eventData.startTime || eventData.start;
            const endTime = eventData.endTime || eventData.end;

            if (!startTime || !endTime) {
                return { success: false, error: '未提供開始或結束時間' };
            }

            // 0. 準備資料
            const eventId = crypto.randomUUID();
            const timezone = eventData.timezone || 'Asia/Taipei';
            const isAllDay = eventData.isAllDay || false;


            // 1. 先寫入資料庫
            const supabase = await createClient();
            const { error: insertError } = await supabase
                .from('calendar_events')
                .insert({
                    id: eventId,
                    organizer_id: userId, // Fix: Schema uses 'organizer_id', not 'user_id'
                    title: title,
                    description: eventData.description,
                    location: eventData.location,
                    start_time: startTime,
                    end_time: endTime,
                    timezone: timezone,
                    is_all_day: isAllDay,
                    status: 'scheduled', // Fix: Use 'scheduled' as per schema comment
                    created_at: new Date().toISOString()
                });

            if (insertError) {
                console.error('[CalendarTool] DB Insert Error:', insertError);
                return { success: false, error: `資料庫寫入失敗: ${insertError.message}` };
            }

            // 2. 同步到 Google
            const result = await this.syncService.syncEventToGoogle(userId, {
                id: eventId,
                title: title,
                description: eventData.description,
                location: eventData.location,
                start_time: startTime,
                end_time: endTime,
                timezone: timezone,
                is_all_day: isAllDay,
            });

            if (!result.success) {
                // 如果同步失敗，標記資料庫中的記錄為未同步或刪除？
                // 這裡暫時保留，但記錄錯誤
                console.error('[CalendarTool] Google Sync Failed:', result.error);
                return { success: false, error: `Google 行事曆同步失敗: ${result.error}` };
            }

            return {
                success: true,
                data: {
                    message: '行程建立成功',
                    googleEventId: result.googleEventId,
                },
            };
        } catch (error) {
            console.error('[CalendarTool] Create error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '行程建立失敗',
            };
        }
    }
}

// ==================== Line Notification Tool ====================

/**
 * Line 通知工具
 * 用於發送訊息到使用者的 Line
 */
export class LineNotificationTool {
    private notificationService = getNotificationService();

    /**
     * 發送訊息
     */
    async execute(userId: string, message: string): Promise<ToolExecutionResult> {
        if (!userId) {
            return { success: false, error: '未提供使用者識別 ID' };
        }
        if (!message) {
            return { success: false, error: '未提供訊息內容' };
        }

        try {
            const results = await this.notificationService.send(
                { userId, channels: ['line'] },
                {
                    title: '來自超級管家的訊息',
                    body: message
                }
            );

            const lineResult = results.find(r => r.channel === 'line');
            if (lineResult && !lineResult.success) {
                return { success: false, error: lineResult.error || 'Line 訊息發送失敗' };
            }

            return {
                success: true,
                data: {
                    message: '訊息已發送',
                },
            };
        } catch (error) {
            console.error('[LineNotificationTool] Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Line 訊息發送失敗',
            };
        }
    }
}


// ==================== Tool Registry ====================

/**
 * 工具註冊表
 * 提供 Orchestrator 查詢和執行工具的統一介面
 */
export class ToolRegistry {
    private knowledgeSearch: KnowledgeSearchTool;
    private warRoomData: WarRoomDataTool;
    private calendar: CalendarTool;
    private agentDelegation: AgentDelegationTool;
    private lineNotification: LineNotificationTool;

    constructor() {
        this.knowledgeSearch = new KnowledgeSearchTool();
        this.warRoomData = new WarRoomDataTool();
        this.calendar = new CalendarTool();
        this.agentDelegation = new AgentDelegationTool();
        this.lineNotification = new LineNotificationTool();
    }

    /**
     * 取得可用工具清單 (Simple Format)
     */
    getAvailableTools(): Array<{
        name: string;
        description: string;
        category: string;
    }> {
        return [
            {
                name: 'knowledge_search',
                description: '搜尋企業知識庫，查找相關文件、政策、流程等資訊',
                category: 'query',
            },
            {
                name: 'operational_summary',
                description: '取得公司營運摘要，包含 KPI、財務狀況等',
                category: 'query',
            },
            {
                name: 'risk_alerts',
                description: '取得目前的風險警示和異常偵測結果',
                category: 'query',
            },
            {
                name: 'list_calendar_events',
                description: '查詢使用者的 Google Calendar 行程，可指定查詢關鍵字',
                category: 'query',
            },
            {
                name: 'create_calendar_event',
                description: '在 Google Calendar 中建立新的行程',
                category: 'action',
            },
            {
                name: 'send_line_message',
                description: '發送 Line 訊息給使用者 (需要提供訊息內容)',
                category: 'action',
            },
        ];
    }

    /**
     * 取得工具定義 (LLM Function Calling Schema)
     */
    getToolDefinitions(): ToolDefinition[] {
        return [
            {
                name: 'list_calendar_events',
                description: '查詢行事曆行程。可用於查詢特定時間範圍、特定關鍵字的行程。當使用者問"下週行程"時，應自動計算 timeMin/timeMax。',
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        userId: {
                            type: 'STRING',
                            description: 'System User ID (通常由系統自動注入，但在 Function Call 中可由 Context 提供)',
                        },
                        query: {
                            type: 'STRING',
                            description: '搜尋關鍵字(可選)，例如"會議"、"台積電"。若為一般時間查詢則留空。',
                        },
                        timeMin: {
                            type: 'STRING',
                            description: '搜尋起始時間 (ISO 8601 format, e.g. 2026-01-01T00:00:00Z)',
                        },
                        timeMax: {
                            type: 'STRING',
                            description: '搜尋結束時間 (ISO 8601 format)',
                        },
                        maxResults: {
                            type: 'INTEGER',
                            description: '最大回傳筆數 (預設 10)',
                        }
                    },
                    required: [], // userId 通常由系統 context 注入，這裡暫不強制 LLM 輸出
                }
            },
            {
                name: 'create_calendar_event',
                description: '建立行事曆行程。必須包含標題、開始與結束時間。location 和 description 為可選。',
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        userId: {
                            type: 'STRING',
                            description: 'System User ID',
                        },
                        title: {
                            type: 'STRING',
                            description: '行程標題 (Title/Summary)',
                        },
                        startTime: {
                            type: 'STRING',
                            description: '開始時間 (ISO 8601, e.g. 2026-01-20T14:00:00+08:00)',
                        },
                        endTime: {
                            type: 'STRING',
                            description: '結束時間 (ISO 8601)',
                        },
                        location: {
                            type: 'STRING',
                            description: '地點 (Location)',
                        },
                        description: {
                            type: 'STRING',
                            description: '詳細描述 (Content)',
                        },
                        isAllDay: {
                            type: 'BOOLEAN',
                            description: '是否為全天行程',
                        }
                    },
                    required: ['title', 'startTime', 'endTime']
                }
            },
            {
                name: 'send_line_message',
                description: '發送 Line 訊息給使用者。當需要通知使用者、發送查詢結果時使用。',
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        message: {
                            type: 'STRING',
                            description: '要發送的訊息內容。若為轉發行程，請將行程格式化為易讀的清單文字。',
                        }
                    },
                    required: ['message']
                }
            },
            {
                name: 'knowledge_search',
                description: '搜尋企業知識庫。當問題涉及公司規章、流程、文件內容時使用。',
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        query: {
                            type: 'STRING',
                            description: '搜尋關鍵字',
                        },
                        topK: {
                            type: 'INTEGER',
                            description: '回傳筆數',
                        }
                    },
                    required: ['query']
                }
            },
            {
                name: 'agent_delegation',
                description: '將問題委派給其他專業 Agent 處理。當問題超出您的能力範圍，或屬於特定領域(如財務、法律、HR)時使用。',
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        targetAgentId: {
                            type: 'STRING',
                            description: '目標 Agent ID (可從 context 或 available agents 列表獲取)',
                        },
                        reason: {
                            type: 'STRING',
                            description: '委派原因',
                        },
                        query: {
                            type: 'STRING',
                            description: '要傳遞給目標 Agent 的問題 (通常是原問題)',
                        }
                    },
                    required: ['targetAgentId', 'reason', 'query']
                }
            }
        ];
    }

    /**
     * 執行指定工具
     */
    async executeTool(
        toolName: string,
        params: Record<string, unknown>
    ): Promise<ToolExecutionResult> {
        switch (toolName) {
            case 'knowledge_search':
                return this.knowledgeSearch.execute(
                    params.query as string,
                    {
                        topK: params.topK as number | undefined,
                        departmentId: params.departmentId as string | undefined,
                    }
                );

            case 'operational_summary':
                return this.warRoomData.getOperationalSummary();

            case 'risk_alerts':
                return this.warRoomData.getRiskAlerts();

            case 'list_calendar_events':
                return this.calendar.listEvents(
                    params.userId as string,
                    params.query as string
                );

            case 'create_calendar_event':
                return this.calendar.createEvent(
                    params.userId as string,
                    params
                );

            case 'agent_delegation':
                return this.agentDelegation.execute(params as unknown as AgentDelegationParams);

            case 'send_line_message':
                return this.lineNotification.execute(
                    params.userId as string,
                    params.message as string
                );

            default:
                return {
                    success: false,
                    error: `未知的工具：${toolName}`,
                };
        }
    }
}

// ==================== Singleton ====================

let toolRegistryInstance: ToolRegistry | null = null;

export function getToolRegistry(): ToolRegistry {
    if (!toolRegistryInstance) {
        toolRegistryInstance = new ToolRegistry();
    }
    return toolRegistryInstance;
}
