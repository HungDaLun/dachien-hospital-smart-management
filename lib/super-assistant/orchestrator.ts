/**
 * Super Assistant - Orchestrator Agent
 * 超級管家核心：意圖識別、任務分解、工具呼叫 (LLM Function Calling Edition)
 */

import { UnifiedMessage, UnifiedResponse } from './gateway';
import { getToolRegistry } from './tools';
import { createGeminiClientAsync } from '@/lib/gemini/client';
import { FunctionDeclarationSchema, Part, Content } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';

// ==================== Types ====================

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
 * 負責理解使用者意圖並協調執行 (Powered by Gemini Function Calling)
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
     * 處理統一訊息並產生回應 (New LLM-driven Logic with Memory)
     */
    async processMessage(message: UnifiedMessage, history: Content[] = []): Promise<UnifiedResponse> {
        try {
            // 使用 Function Calling Loop 處理
            const responseText = await this.executeFunctionCallLoop(message, history);

            return {
                content: {
                    type: 'text',
                    text: responseText
                }
            };
        } catch (error) {
            console.error('[Orchestrator] Process error:', error);
            return {
                content: {
                    type: 'text',
                    text: '抱歉，我目前無法處理您的請求。請稍後再試。'
                }
            };
        }
    }

    /**
     * 執行 Function Calling Loop
     */
    private async executeFunctionCallLoop(message: UnifiedMessage, history: Content[] = []): Promise<string> {
        const genAI = await createGeminiClientAsync();
        const toolRegistry = getToolRegistry();
        const availableTools = toolRegistry.getToolDefinitions();

        // 取得可用 Agent 列表並注入 System Prompt
        const availableAgents = await this.fetchAvailableAgents();
        const agentsContext = availableAgents.map(a => `- ${a.name} (ID: ${a.id}): ${a.description}`).join('\n');

        const now = new Date();
        const currentDateTime = now.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });

        const systemPrompt = `你是一個專業的企業超級管家 (Super Assistant)。
你的目標是協助使用者解決問題，你可以使用多種工具來達成任務。

## 當前時間資訊 (台北時間):
- 現在時間: ${currentDateTime} (請根據此時間推算 "下午三點"、"明天"、"下週" 等相對時間)

## 可用工具與用途：
- knowledge_search: 搜尋企業知識庫。當問題涉及公司規章、流程、文件內容時使用。
- list_calendar_events: 查詢行程。請自動根據語意推斷 timeMin/timeMax (例如"下週"就是未來7天)。
- create_calendar_event: 建立新行程。當使用者要求"安排"、"新增"或"預約"行程時使用。
- send_line_message: 發送 Line 通知。
- agent_delegation: 將問題委派給其他專業 Agent。當問題超出你的能力範圍，或屬於特定領域(如財務、法律、HR)時使用。

## 專業 Agent 列表 (供 agent_delegation 使用):
${agentsContext}

## 當前使用者資訊:
- User ID: ${this._config.systemUserId || 'unknown'}
- Name: ${this._config.userName || 'User'}
- Role: ${this._config.userRole || 'User'}
- CopyId: ${this._config.companyId || 'unknown'}
- DeptId: ${this._config.departmentId || 'unknown'}

## 執行原則:
1. **一步一步思考 (Step-by-step)**：分析使用者意圖，決定需要哪些步驟。
2. **複合指令處理**：若指令包含多個步驟 (例如 "查行程並發 Line")，請先呼叫查詢工具，獲得結果後，再呼叫發送工具。
3. **委派判斷**：若不確定，優先委派給專家。
4. **回應風格**：請以繁體中文 (台灣習慣)、親切、專業的口吻回答。回答要簡潔有力。

現在，請處理使用者的訊息。
`;

        // 轉換工具定義為 Gemini SDK 格式
        const toolsForGemini = availableTools.map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters as unknown as FunctionDeclarationSchema
        }));


        const model = genAI.getGenerativeModel({
            model: 'gemini-3-pro-preview', // User mandated: Use Gemini 3 Pro Preview
            systemInstruction: systemPrompt,
            tools: [{
                functionDeclarations: toolsForGemini
            }],
        });

        const chat = model.startChat({
            history: history // Use provided history
        });

        // 傳送使用者訊息
        const userMsg = message.content.text || '';
        console.log(`[Orchestrator] User Message: ${userMsg}`);

        // 第一次呼叫
        let result = await chat.sendMessage(userMsg);

        const MAX_STEPS = 8; // Increase steps for complex reasoning
        let step = 0;

        while (step < MAX_STEPS) {
            step++;
            const response = result.response;
            const functionCalls = response.functionCalls();

            // 若沒有呼叫函式，表示已生成最終文字回應
            if (!functionCalls || functionCalls.length === 0) {
                return response.text();
            }

            // 處理函式呼叫
            const toolParts: Part[] = [];

            for (const call of functionCalls) {
                const toolName = call.name;
                const args = call.args;

                console.log(`[Orchestrator] Tool Call: ${toolName}`, args);

                // 執行工具
                let toolResult;
                try {
                    // 根據工具名稱準備參數
                    const execParams = { ...args } as Record<string, unknown>;
                    if (!execParams.userId && this._config.systemUserId) {
                        execParams.userId = this._config.systemUserId;
                    }

                    const execution = await toolRegistry.executeTool(toolName, execParams);

                    if (execution.success) {
                        toolResult = execution.data;
                    } else {
                        toolResult = { error: execution.error };
                    }
                } catch (e: unknown) {
                    const errorMessage = e instanceof Error ? e.message : String(e);
                    toolResult = { error: errorMessage };
                }

                // 建構 FunctionResponse
                toolParts.push({
                    functionResponse: {
                        name: toolName,
                        response: {
                            result: toolResult
                        }
                    }
                });
            }

            // 將工具執行結果回傳給模型
            result = await chat.sendMessage(toolParts);
        }

        return "（處理步驟過多，系統已停止執行）";
    }

    /**
     * 取得可用 Agent 列表
     */
    /**
     * 取得可用 Agent 列表
     */
    private async fetchAvailableAgents(): Promise<Array<{
        id: string;
        name: string;
        description: string;
    }>> {
        try {
            // 改為直接查詢資料庫，避免 Server-Side 自我呼叫 API 造成的網絡問題
            const supabase = await createClient();

            const { data: agents, error } = await supabase
                .from('agents')
                .select('id, name, description')
                .eq('is_active', true)
                .neq('name', '超級管家'); // 排除自己

            if (error || !agents) {
                console.error('[Orchestrator] fetchAvailableAgents DB error:', error);
                return [];
            }

            return agents.map((a: { id: string; name: string; description: string | null }) => ({
                id: a.id,
                name: a.name,
                description: a.description || ''
            }));
        } catch (error) {
            console.warn('[Orchestrator] fetchAvailableAgents error:', error);
            return [];
        }
    }
}

/**
 * 建立 Orchestrator Agent
 */
export function createOrchestratorAgent(config?: OrchestratorConfig): OrchestratorAgent {
    return new OrchestratorAgent(config);
}
