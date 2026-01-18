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

        // 寒暄關鍵字
        const greetingKeywords = ['你好', 'hi', 'hello', '嗨', '早安', '午安', '晚安', '哈囉'];
        if (greetingKeywords.some((kw) => text.includes(kw))) {
            return { type: 'greeting', confidence: 0.9 };
        }

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
     * 處理寒暄
     */
    private async handleGreeting(_message: UnifiedMessage): Promise<UnifiedResponse> {
        const greetings = [
            '您好！我是超級管家，請問有什麼可以幫您的？',
            '嗨！有什麼需要我協助的嗎？',
            '您好！今天想做點什麼呢？',
        ];

        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

        return {
            content: {
                type: 'text',
                text: randomGreeting,
            },
        };
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
                        text: `抱歉，查詢時發生錯誤：${searchResult.error}`,
                    },
                    metadata: { confidence: intent.confidence },
                };
            }

            const data = searchResult.data as { message: string; results: Array<{ title: string; content: string; relevance: number }> };

            if (data.results.length === 0) {
                return {
                    content: {
                        type: 'text',
                        text: `🔍 未找到與「${queryText}」相關的知識。\n\n您可以試著：\n• 使用不同的關鍵字\n• 詢問更具體的問題`,
                    },
                    metadata: { confidence: intent.confidence },
                };
            }

            // 格式化搜尋結果
            const resultText = data.results
                .slice(0, 3) // 最多顯示 3 筆
                .map((r, i) => `**${i + 1}. ${r.title}** (相關度 ${r.relevance}%)\n${r.content}`)
                .join('\n\n');

            return {
                content: {
                    type: 'text',
                    text: `📚 找到 ${data.results.length} 筆相關知識：\n\n${resultText}`,
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
                    text: `抱歉，查詢時發生錯誤，請稍後再試。`,
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
                text: `🔧 收到您的指令：「${message.content.text}」\n\n（動作執行功能開發中，敬請期待...）`,
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
                text: `⏰ 收到您的排程請求：「${message.content.text}」\n\n（排程功能開發中，敬請期待...）`,
            },
            metadata: {
                confidence: intent.confidence,
            },
        };
    }

    /**
     * 處理未知意圖
     */
    private async handleUnknown(_message: UnifiedMessage): Promise<UnifiedResponse> {
        return {
            content: {
                type: 'text',
                text: `抱歉，我不太確定您的需求。您可以嘗試：
• 詢問公司資訊或知識
• 建立會議或行事曆事件
• 設定提醒或排程任務

請再說得更具體一些！`,
            },
        };
    }
}

// ==================== Factory Function ====================

/**
 * 建立 Orchestrator Agent
 */
export function createOrchestratorAgent(config?: OrchestratorConfig): OrchestratorAgent {
    return new OrchestratorAgent(config);
}
