/**
 * Super Assistant - Orchestrator Agent
 * 超級管家核心：意圖識別、任務分解、工具呼叫
 */

import { UnifiedMessage, UnifiedResponse } from './gateway';
import { getToolRegistry } from './tools';

// ==================== Types ====================

/**
 * 意圖類型
 */
export type IntentType =
    | 'query' // 查詢類：問問題
    | 'action' // 動作類：執行操作
    | 'scheduled' // 排程類：定時任務
    | 'greeting' // 寒暄類：打招呼
    | 'unknown'; // 未知

/**
 * 意圖識別結果
 */
export interface IntentResult {
    type: IntentType;
    confidence: number;
    entities?: Record<string, string | string[]>;
    suggestedTools?: string[];
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
        // 1. 意圖識別
        const intent = await this.identifyIntent(message);

        // 2. 根據意圖執行對應處理
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
     * 意圖識別 (簡易版本)
     * TODO: 未來替換為 LLM 意圖分類
     */
    private async identifyIntent(message: UnifiedMessage): Promise<IntentResult> {
        const text = message.content.text?.toLowerCase() || '';

        // 移除靜態寒暄偵測，改由 LLM 統一處理以展現更擬人的個性
        // const greetingKeywords = ['你好', 'hi', 'hello', '嗨', '早安', '午安', '晚安', '哈囉'];
        // if (greetingKeywords.some((kw) => text.includes(kw))) {
        //     return { type: 'greeting', confidence: 0.9 };
        // }

        // 查詢關鍵字
        const queryKeywords = ['什麼', '多少', '怎麼', '如何', '為什麼', '是否', '有沒有', '查詢', '搜尋'];
        if (queryKeywords.some((kw) => text.includes(kw))) {
            return { type: 'query', confidence: 0.8 };
        }

        // 動作關鍵字
        const actionKeywords = ['幫我', '請', '設定', '建立', '刪除', '修改', '發送', '寄送', '約', '排'];
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
            // 使用知識庫搜尋工具
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
        // TODO: 整合行事曆、Email、工具執行等
        return {
            content: {
                type: 'text',
                text: `收到！你想「${message.content.text}」是吧？\n\n不過我的手腳（動作執行功能）還在訓練中，目前還不能幫你實際操作，但我記下來了！`,
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
}

// ==================== Factory Function ====================

/**
 * 建立 Orchestrator Agent
 */
export function createOrchestratorAgent(config?: OrchestratorConfig): OrchestratorAgent {
    return new OrchestratorAgent(config);
}
