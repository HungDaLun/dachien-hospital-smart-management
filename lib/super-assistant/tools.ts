/**
 * Super Assistant - 工具模組
 * 提供 Orchestrator 可用的工具函式
 */

import { ANNSemanticSearchEngine, SearchResult } from '@/lib/knowledge/ann-search';

// ==================== Types ====================

export interface ToolExecutionResult {
    success: boolean;
    data?: unknown;
    error?: string;
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

// ==================== Tool Registry ====================

/**
 * 工具註冊表
 * 提供 Orchestrator 查詢和執行工具的統一介面
 */
export class ToolRegistry {
    private knowledgeSearch: KnowledgeSearchTool;
    private warRoomData: WarRoomDataTool;

    constructor() {
        this.knowledgeSearch = new KnowledgeSearchTool();
        this.warRoomData = new WarRoomDataTool();
    }

    /**
     * 取得可用工具清單
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
