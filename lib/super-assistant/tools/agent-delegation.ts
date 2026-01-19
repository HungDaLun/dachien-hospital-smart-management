import { ToolExecutionResult } from '../tools';
import { runAgentChat } from '@/lib/agents/runtime';

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
     * 調度指定 Agent 處理查詢 (Direct Neural Link)
     * 不透過 HTTP API，直接調用 Agent Runtime 以確保穩定性與繼承權限
     */
    async execute(params: AgentDelegationParams): Promise<ToolExecutionResult> {
        const { targetAgentId, query, userId, sessionContext } = params;

        try {
            console.log(`[AgentDelegation] Direct invoking agent: ${targetAgentId}`);

            // 建構完整查詢
            const fullQuery = sessionContext
                ? `${sessionContext}\n\n使用者問題：${query}`
                : query;

            // 直接執行 Agent Runtime
            const result = await runAgentChat({
                agentId: targetAgentId,
                message: fullQuery,
                userId: userId,
                isDelegation: true // 標記為內部委派
            });

            return {
                success: true,
                data: {
                    agentName: 'System Agent', // Runtime doesn't return name yet, but that's fine
                    response: result.text,
                    confidence: result.metadata.confidence,
                    sources: result.metadata.citations, // Fix type mismatch: `result.metadata.citations` should be formatted to string[] if needed
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
}
