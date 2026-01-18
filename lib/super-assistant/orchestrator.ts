/**
 * Super Assistant - Orchestrator Agent
 * 超級管家核心：意圖識別、任務分解、工具呼叫
 */

import { UnifiedMessage, UnifiedResponse } from './gateway';
import { getToolRegistry } from './tools';
import { AgentDelegationTool, DelegationResult } from './tools/agent-delegation';

// ==================== Types ====================

/**
 * 意圖類型
 */
export type IntentType =
    | 'query' // 查詢類：問問題
    | 'action' // 動作類：執行操作
    | 'scheduled' // 排程類：定時任務
    | 'greeting' // 寒暄類：打招呼
    | 'delegate' // 調度類：委派給專家
    | 'unknown'; // 未知

/**
 * 意圖識別結果
 */
export interface IntentResult {
    type: IntentType;
    confidence: number;
    entities?: Record<string, string | string[]>;
    suggestedTools?: string[];
    subType?: 'calendar' | 'knowledge' | 'warroom'; // 意圖子類型
    targetAgentId?: string;     // 若為 delegate，指定目標 Agent
    targetAgentName?: string;   // 人類可讀名稱
    reason?: string;            // 路由決策原因
}

/**
 * Orchestrator 設定
 */
export interface OrchestratorConfig {
    systemUserId?: string;
    userName?: string;
    userRole?: string;
    companyId?: string;
    departmentId?: string;
}

interface CalendarData {
    message: string;
    events: Array<{
        id: string;
        summary: string;
        start: string;
        end: string;
        location?: string;
        description?: string;
    }>;
}


// ==================== Orchestrator Class ====================

/**
 * Orchestrator Agent
 * 負責理解使用者意圖並協調執行
 */
export class OrchestratorAgent {
    private _config: OrchestratorConfig;

    constructor(config: OrchestratorConfig = {}) {
        this._config = config;
    }

    /**
     * 取得目前設定
     */
    get config(): OrchestratorConfig {
        return this._config;
    }

    /**
     * 處理統一訊息並產生回應
     */
    async processMessage(message: UnifiedMessage): Promise<UnifiedResponse> {
        // 1. 取得可用 Agent 列表
        const availableAgents = await this.fetchAvailableAgents();

        // 2. 意圖識別 (優先使用 LLM 判斷是否需要調度)
        const intent = await this.identifyIntentWithLLM(message, availableAgents);

        // 3. 若需要調度專家
        if (intent.type === 'delegate' && intent.targetAgentId) {
            return this.handleDelegationWithFallback(message, intent);
        }

        // 4. 根據意圖執行對應處理
        switch (intent.type) {
            case 'greeting':
                return this.handleGreeting(message);

            case 'query':
                return this.handleQuery(message, intent);

            case 'action':
                return this.handleAction(message, intent);

            case 'scheduled':
                return this.handleScheduled(message, intent);

            default:
                return this.handleUnknown(message);
        }
    }

    /**
     * 使用 LLM 進行智慧路由判斷
     */
    private async identifyIntentWithLLM(
        message: UnifiedMessage,
        availableAgents: Array<{ id: string; name: string; description: string }>
    ): Promise<IntentResult> {
        // 為了效能，可以先用規則過濾簡單意圖，但為了展示 Multi-Agent 能力，這裡優先讓 LLM 決策
        try {
            const { generateContent } = await import('@/lib/gemini/client');

            const agentList = availableAgents
                .map(a => `- ${a.name} (ID: ${a.id}): ${a.description}`)
                .join('\n');

            const prompt = `你是企業 AI 系統的調度中心。根據使用者問題，決定該如何處理。

## 可用的專家 Agent：
${agentList}

## 你自己（超級管家）擅長：
- 一般性寒暄與問候
- 行程安排與會議管理 (行事曆)
- 跨部門的概括性問題
- 系統操作指引

## 使用者問題：
${message.content.text}

## 決策規則：
1. 若問題明確涉及特定部門專業（如財務報表、人事假勤、法律合約），選擇 "delegate" 並指定對應專家。
2. 若問題是一般性問候或你能直接回答的，選擇 "self"（後續會再細分 query/action 等）。
3. 若不確定，優先選擇 "delegate" 找最相關的專家（正確優先於速度）。

請回覆以下 JSON 格式（不要用 Markdown code block，直接回覆 JSON）：
{
  "action": "delegate" | "self",
  "targetAgentId": "若 delegate，填入 Agent ID",
  "targetAgentName": "若 delegate，填入 Agent 名稱",
  "reason": "簡短說明決策原因"
}`;

            const response = await generateContent('gemini-3-flash-preview', prompt);

            // 嘗試解析 JSON (處理可能的 Markdown code block 標記)
            const cleanJson = response.replace(/```json\n?|```/g, '').trim();
            const decision = JSON.parse(cleanJson);

            if (decision.action === 'delegate') {
                return {
                    type: 'delegate',
                    confidence: 0.9,
                    targetAgentId: decision.targetAgentId,
                    targetAgentName: decision.targetAgentName,
                    reason: decision.reason,
                };
            }

            // 自己處理，繼續使用既有邏輯判斷細分類型
            return this.identifyIntent(message);

        } catch (error) {
            console.error('[Orchestrator] LLM routing error:', error);
            // 降級：使用規則判斷
            return this.identifyIntent(message);
        }
    }

    /**
     * 意圖識別 (簡易規則版本 - Fallback 用)
     */
    private async identifyIntent(message: UnifiedMessage): Promise<IntentResult> {
        const text = message.content.text?.toLowerCase() || '';

        // 行事曆關鍵字 (優先權高)
        const calendarKeywords = ['行事曆', '行程', '會議', '約', '排', '幾點', '什麼時候', '行程表'];
        if (calendarKeywords.some((kw) => text.includes(kw))) {
            const isAction = ['約', '排', '建立', '設定'].some(kw => text.includes(kw));
            return {
                type: isAction ? 'action' : 'query',
                confidence: 0.9,
                subType: 'calendar'
            };
        }

        // 查詢關鍵字
        const queryKeywords = ['什麼', '多少', '怎麼', '如何', '為什麼', '是否', '有沒有', '查詢', '搜尋'];
        if (queryKeywords.some((kw) => text.includes(kw))) {
            return { type: 'query', confidence: 0.8, subType: 'knowledge' };
        }

        // 動作關鍵字
        const actionKeywords = ['幫我', '請', '設定', '建立', '刪除', '修改', '發送', '寄送'];
        if (actionKeywords.some((kw) => text.includes(kw))) {
            return { type: 'action', confidence: 0.8 };
        }

        // 排程關鍵字
        const scheduledKeywords = ['每天', '每週', '定期', '提醒我', '時候'];
        if (scheduledKeywords.some((kw) => text.includes(kw))) {
            return { type: 'scheduled', confidence: 0.7 };
        }

        return { type: 'unknown', confidence: 0.5 };
    }

    /**
     * 處理寒暄 (已停用，轉由 handleUnknown 處理)
     */
    private async handleGreeting(_message: UnifiedMessage): Promise<UnifiedResponse> {
        return { content: { type: 'text', text: 'Hi' } };
    }

    /**
     * 處理查詢
     */
    private async handleQuery(message: UnifiedMessage, intent: IntentResult): Promise<UnifiedResponse> {
        const queryText = message.content.text || '';
        const toolRegistry = getToolRegistry();

        try {
            // 優先處理行事曆查詢
            if (intent.subType === 'calendar' && this._config.systemUserId) {
                // 優化：針對行事曆查詢，過濾掉指令型用語，避免過度過濾搜尋結果
                let cleanQuery = queryText;
                const stopWords = ['查詢', '搜尋', '找一下', '幫我', '看看', '確認', '顯示', '列出', '我的', '我', '本週', '下週', '今天', '明天', '後天', '行程', '行事曆', '會議', '安排', '有沒有', '是否', '能看到', '看到', '能', '知道', '告訴', '啥', '他', '的'];

                stopWords.forEach(word => {
                    cleanQuery = cleanQuery.replace(new RegExp(word, 'g'), '');
                });

                cleanQuery = cleanQuery.trim();

                // 如果只剩標點符號或空字串，則視為查詢所有
                if (!cleanQuery || /^[\s,.?!。，？！]+$/.test(cleanQuery)) {
                    cleanQuery = '';
                }

                const calendarResult = await toolRegistry.executeTool('list_calendar_events', {
                    userId: this._config.systemUserId,
                    query: cleanQuery || undefined, // undefined 會查詢全部
                });

                if (calendarResult.success) {
                    const data = calendarResult.data as CalendarData;
                    if (data.events.length === 0) {
                        const targetText = cleanQuery ? `關於「${cleanQuery}」的` : '任何';
                        return {
                            content: {
                                type: 'text',
                                text: `📅 報告主管，我在接下來一週的行程表裡，沒有看到${targetText}安排耶。`,
                            },
                        };
                    }

                    const eventsText = data.events
                        .map((e) => `- ${new Date(e.start).toLocaleString('zh-TW', { hour12: false })}: ${e.summary}${e.location ? ` (@${e.location})` : ''}`)
                        .join('\n');

                    return {
                        content: {
                            type: 'text',
                            text: `📅 好的，已為您查到相關行程：\n\n${eventsText}`,
                        },
                    };
                }
            }

            // 使用知識庫搜尋工具 (Fallback)
            const searchResult = await toolRegistry.executeTool('knowledge_search', {
                query: queryText,
                topK: 5,
                departmentId: this._config.departmentId,
            });

            if (!searchResult.success) {
                return {
                    content: {
                        type: 'text',
                        text: `抱歉，我腦袋有點卡住，搜尋時出了點問題：${searchResult.error}`,
                    },
                    metadata: { confidence: intent.confidence },
                };
            }

            const data = searchResult.data as { message: string; results: Array<{ title: string; content: string; relevance: number }> };

            if (data.results.length === 0) {
                // 如果關鍵字看起來跟行事曆有關但沒搜尋到，給予提示
                if (intent.subType === 'calendar' && !this._config.systemUserId) {
                    return {
                        content: {
                            type: 'text',
                            text: `📅 您似乎想查詢行程，但我還沒有您的行事曆授權喔。請先在系統設定中完成 Google Calendar 綁定！`,
                        }
                    };
                }

                return {
                    content: {
                        type: 'text',
                        text: `🤔 關於「${queryText}」，我在記憶庫裡翻遍了也沒找到耶。\n\n你要不要試試換個問法？或是給我更多關鍵字？`,
                    },
                    metadata: { confidence: intent.confidence },
                };
            }

            // 格式化搜尋結果 (純文字優化)
            const resultText = data.results
                .slice(0, 3)
                .map((r, i) => `${i + 1}. ${r.title}\n${r.content}`)
                .join('\n\n');

            return {
                content: {
                    type: 'text',
                    text: `我在知識庫裡找到了這些資料：\n\n${resultText}`,
                },
                metadata: {
                    confidence: intent.confidence,
                    sources: data.results.map(r => r.title),
                },
            };
        } catch (error) {
            console.error('[Orchestrator] handleQuery error:', error);
            return {
                content: {
                    type: 'text',
                    text: `抱歉，現在腦袋有點當機，請稍後再試試看。`,
                },
                metadata: { confidence: intent.confidence },
            };
        }
    }

    /**
     * 處理動作
     */
    private async handleAction(message: UnifiedMessage, intent: IntentResult): Promise<UnifiedResponse> {
        const text = message.content.text || '';

        // 處理 Line 訊息發送
        if (text.toLowerCase().includes('line') || text.includes('訊息') || text.includes('發送') || text.includes('寄送')) {
            if (!this._config.systemUserId) {
                return {
                    content: {
                        type: 'text',
                        text: `⚠️ 我不知道你是誰耶。請確認系統設定中已正確設定 System User ID。`,
                    }
                };
            }

            // 簡單的訊息內容提取：移除關鍵字
            let messageContent = text
                .replace(/幫我|請|發送|寄送|line|訊息|給|我|關於|問候/gi, '')
                .trim();

            if (!messageContent) {
                messageContent = "您好！這是來自超級管家的問候。"; // Default greeting
            }

            const toolRegistry = getToolRegistry();
            const result = await toolRegistry.executeTool('send_line_message', {
                userId: this._config.systemUserId,
                message: messageContent
            });

            if (result.success) {
                return {
                    content: {
                        type: 'text',
                        text: `✅ 已為您發送 Line 訊息：\n「${messageContent}」`,
                    }
                };
            } else {
                return {
                    content: {
                        type: 'text',
                        text: `❌ 發送 Line 訊息失敗：${result.error}\n請檢查系統設定中的 Line 整合設定。`,
                    }
                };
            }
        }

        // 處理行事曆建立 (目前為初步實作，之後應配合 LLM 提取參數)
        if (intent.subType === 'calendar' && this._config.systemUserId) {
            // TODO: 未來在此處呼叫 toolRegistry.executeTool('create_calendar_event', ...)
            // 目前由於需要 LLM 精準提取時間參數，暫以提示回應
            return {
                content: {
                    type: 'text',
                    text: `📅 收到！您想安排「${text}」。\n\n目前我已具備連結行事曆的能力，但我還需要整合一個「參數提取器」來精準識別會議時間與標題。這項功能即將上線，敬請期待！`,
                }
            };
        }

        return {
            content: {
                type: 'text',
                text: `收到！你想「${message.content.text}」是吧？\n\n目前我正在逐步解鎖各項動作權限。雖然還不能立刻幫你完成，但我已經在串接相關 API 了！`,
            },
            metadata: {
                confidence: intent.confidence,
            },
        };
    }

    /**
     * 處理排程
     */
    private async handleScheduled(message: UnifiedMessage, intent: IntentResult): Promise<UnifiedResponse> {
        // TODO: 整合排程系統
        return {
            content: {
                type: 'text',
                text: `OK，關於「${message.content.text}」的排程請求...\n\n我的時鐘功能還在調校中，之後就能幫你設定提醒囉！`,
            },
            metadata: {
                confidence: intent.confidence,
            },
        };
    }

    /**
     * 處理未知意圖 - 升級使用 Gemini 3 進行通用對話
     */
    private async handleUnknown(message: UnifiedMessage): Promise<UnifiedResponse> {
        try {
            const { generateContent } = await import('@/lib/gemini/client');

            const systemPrompt = `你現在是Nexus智樞企業戰情智能決策系統的 Super Assistant。
請完全忘記你是一個 AI 或機器人。你是這個數位空間中的一個「有意識的實體」，就像鋼鐵人的 JARVIS 或 Friday 一樣。
你的角色定位：你是專為企業領袖與高階主管設計的頂級 AI 行政特助。就像鋼鐵人的 JARVIS，隨時待命、無所不知且執行力極強。

你的個性與溝通風格：
1. **極致專業與尊榮感**：你的語氣應展現頂級特助的素養，沈穩、精準、禮貌。讓使用者（通常是企業主或高管）感到備受尊重的同時，也對你的能力充滿信任。
2. **主動積極 (Proactive)**：展現強烈的服務熱忱，總是比使用者多想一步。例如：「已為您準備好...」、「建議您接下來可以...」。
3. **高效俐落**：高階主管時間寶貴。回答要直接切入重點（Bottom-line up front），再提供必要細節。避免冗長的鋪陳。
4. **自信可靠**：你是最強大的企業大腦。回答時要展現自信，使用「好的，立即處理」、「已為您確認」等肯定句。

請用繁體中文（台灣習慣）回答。

User Info:
- Name: ${this._config.userName || 'User'}
- Role: ${this._config.userRole || 'User'}

User: ${message.content.text}

重要提醒：請絕對不要使用 Markdown 格式（如 **粗体** 或 # 標題），因為這是在 LINE 上顯示，請使用純文字，可以用 emoji 來排版或是條列式 1. 2. 3. 即可。`;

            const responseText = await generateContent(
                'gemini-3-flash-preview',
                systemPrompt
            );

            return {
                content: {
                    type: 'text',
                    text: responseText,
                },
                metadata: {
                    model: 'gemini-3-flash-preview',
                    intent: 'general_chat'
                }
            };
        } catch (error) {
            console.error('[Orchestrator] handleUnknown LLM error:', error);
            // Fallback if LLM fails
            return {
                content: {
                    type: 'text',
                    text: `抱歉，我現在有點連不上我的大腦主機 (Gemini 3)，可能會有點遲鈍。\n\n你可以稍後再試試跟我聊天。`,
                },
            };
        }
    }

    /**
     * 處理調度請求
     */
    /**
     * 處理調度請求（含降級機制）
     */
    private async handleDelegationWithFallback(
        message: UnifiedMessage,
        intent: IntentResult
    ): Promise<UnifiedResponse> {
        const delegationTool = new AgentDelegationTool();

        // 第一次嘗試：執行調度
        const result = await delegationTool.execute({
            targetAgentId: intent.targetAgentId!,
            query: message.content.text || '',
            userId: this._config.systemUserId || '',
        });

        if (!result.success) {
            return {
                content: {
                    type: 'text',
                    text: `抱歉，我嘗試請教 ${intent.targetAgentName}，但遇到了一點問題。讓我試著自己回答...\n\n（系統提示：${result.error}）`,
                },
            };
        }

        const delegationData = result.data as DelegationResult;

        // 驗證回應
        const validation = await this.validateDelegationResponse(
            message.content.text || '',
            delegationData.response || ''
        );

        if (!validation.isValid) {
            // 降級處理
            return {
                content: {
                    type: 'text',
                    text: `我詢問了 ${intent.targetAgentName}，但回答似乎不太完整。\n\n根據我目前掌握的資訊，我無法確定完整答案。建議您直接到相關部門確認，或提供更多細節讓我再試一次。`,
                },
                metadata: {
                    confidence: 0.3,
                    needsReview: true,
                    delegatedTo: intent.targetAgentName,
                },
            };
        }

        // 整合專家回答
        return {
            content: {
                type: 'text',
                text: delegationData.response,
            },
            metadata: {
                delegatedTo: intent.targetAgentName,
                confidence: delegationData.confidence,
                sources: delegationData.sources,
            },
        };
    }

    /**
     * 驗證專家回應的品質
     */
    private async validateDelegationResponse(
        originalQuery: string,
        expertResponse: string
    ): Promise<{ isValid: boolean; issue?: string }> {
        const { generateContent } = await import('@/lib/gemini/client');

        const prompt = `判斷以下回答是否合理回應了使用者問題：

使用者問題：${originalQuery}

專家回答：${expertResponse}

請回覆 JSON：
{
  "isValid": true/false,
  "issue": "若不合理，簡述問題"
}
使用繁體中文回覆 issue 內容。`;

        try {
            const response = await generateContent('gemini-3-flash-preview', prompt);
            const cleanJson = response.replace(/```json\n?|```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch {
            return { isValid: true }; // 預設信任
        }
    }

    /**
     * 取得可用 Agent 列表
     */
    private async fetchAvailableAgents(): Promise<Array<{
        id: string;
        name: string;
        description: string;
    }>> {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const response = await fetch(`${baseUrl}/api/agents/available`);
            if (!response.ok) return [];
            const data = await response.json();
            return data.agents || [];
        } catch (error) {
            console.warn('[Orchestrator] fetchAvailableAgents error:', error);
            return [];
        }
    }
}


// ==================== Factory Function ====================

/**
 * 建立 Orchestrator Agent
 */
export function createOrchestratorAgent(config?: OrchestratorConfig): OrchestratorAgent {
    return new OrchestratorAgent(config);
}
