/**
 * Agent Delegation Tool
 * 超級管家調度專用 Agent 的核心工具
 */

import { ToolExecutionResult } from '../tools';

export interface AgentDelegationParams {
    targetAgentId: string;
    query: string;
    userId: string;
    sessionContext?: string; // 對話脈絡摘要
}

export interface DelegationResult {
    success: boolean;
    agentName: string;
    response: string;
    confidence?: number;
    sources?: string[];
}

export class AgentDelegationTool {

    /**
     * 調度指定 Agent 處理查詢
     */
    async execute(params: AgentDelegationParams): Promise<ToolExecutionResult> {
        const { targetAgentId, query, userId, sessionContext } = params;

        try {
            // 1. 建立內部 API 請求
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const response = await fetch(`${baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 傳遞原始使用者身份以繼承權限
                    'X-Delegated-User-Id': userId,
                },
                body: JSON.stringify({
                    agent_id: targetAgentId,
                    message: this.buildDelegatedQuery(query, sessionContext),
                    is_delegation: true, // 標記為調度請求
                }),
            });

            if (!response.ok) {
                return {
                    success: false,
                    error: `Agent 調度失敗：${response.status}`,
                };
            }

            // 2. 處理 SSE 串流回應，收集完整內容
            const fullResponse = await this.collectStreamResponse(response);

            // 3. 解析回應中的 metadata
            const { text, confidence, citations } = this.parseResponse(fullResponse);

            return {
                success: true,
                data: {
                    response: text,
                    confidence: confidence,
                    sources: citations,
                } as DelegationResult,
            };

        } catch (error) {
            console.error('[AgentDelegation] Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '未知錯誤',
            };
        }
    }

    /**
     * 建構調度用查詢（加入脈絡）
     */
    private buildDelegatedQuery(query: string, context?: string): string {
        if (!context) return query;
        return `${context}\n\n使用者問題：${query}`;
    }

    /**
     * 收集 SSE 串流回應
     */
    private async collectStreamResponse(response: Response): Promise<string> {
        const reader = response.body?.getReader();
        if (!reader) return '';

        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n\n');

            for (const line of lines) {
                if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                    try {
                        const data = JSON.parse(line.replace('data: ', ''));
                        if (data.text) fullText += data.text;
                    } catch {
                        // 忽略解析錯誤
                    }
                }
            }
        }

        return fullText;
    }

    /**
     * 解析回應內容
     */
    private parseResponse(text: string): {
        text: string;
        confidence?: number;
        citations?: string[];
    } {
        // 基本實作，未來可增強
        return { text, confidence: undefined, citations: undefined };
    }
}
