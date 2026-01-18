import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedGateway, createOrchestratorAgent } from '@/lib/super-assistant';

/**
 * Vapi Custom LLM API
 *
 * 這個 API 接收 Vapi 的 OpenAI 相容格式請求
 * 使用我們的 Gemini + 知識庫處理後回傳
 *
 * Vapi 會發送 OpenAI Chat Completions 格式的請求
 */

interface VapiChatRequest {
    model: string;
    messages: Array<{
        role: 'system' | 'user' | 'assistant' | 'function';
        content: string;
        name?: string;
    }>;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    call?: {
        id: string;
        customer?: {
            number?: string;
        };
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: VapiChatRequest = await request.json();

        console.log('[Vapi Chat] Received request');
        console.log('[Vapi Chat] Messages count:', body.messages?.length);

        // 取得使用者最後一則訊息
        const userMessages = body.messages?.filter(m => m.role === 'user') || [];
        const lastUserMessage = userMessages[userMessages.length - 1];

        if (!lastUserMessage?.content) {
            console.log('[Vapi Chat] No user message found');
            return createOpenAIResponse('抱歉，我沒有聽清楚，請再說一次。');
        }

        const userText = lastUserMessage.content;
        console.log('[Vapi Chat] User said:', userText);

        // 使用超級管家的 Gateway 和 Orchestrator
        // 注意：這裡沒有使用者身份驗證，因為是從 Vapi 呼叫的
        // 在生產環境中，您可能需要透過 call.customer.number 或其他方式識別使用者
        const gateway = getUnifiedGateway();
        const orchestrator = createOrchestratorAgent({
            // 使用系統預設使用者，或者可以從 Vapi 的 metadata 取得使用者 ID
            systemUserId: 'vapi-voice-user'
        });

        // 建立統一訊息格式
        const unifiedMessage = await gateway.processWebMessage({
            userId: 'vapi-voice-user',
            text: userText,
            sessionId: body.call?.id || `vapi-session-${Date.now()}`
        });

        // 透過 Gemini + 知識庫處理
        const response = await orchestrator.processMessage(unifiedMessage);
        const responseText = response.content.text || '我可能需要更多資訊才能回答您。';

        console.log('[Vapi Chat] Response:', responseText.substring(0, 100) + '...');

        // 回傳 OpenAI 相容格式
        return createOpenAIResponse(responseText);

    } catch (error) {
        console.error('[Vapi Chat] Error:', error);

        // 即使發生錯誤也要回傳有效的 OpenAI 格式
        return createOpenAIResponse('抱歉，系統發生了一點問題。請稍後再試。');
    }
}

/**
 * 建立 OpenAI Chat Completions 相容的回應格式
 */
function createOpenAIResponse(text: string): NextResponse {
    const response = {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'gemini-2.5-flash',
        choices: [
            {
                index: 0,
                message: {
                    role: 'assistant',
                    content: text,
                },
                finish_reason: 'stop',
            },
        ],
        usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
        },
    };

    return NextResponse.json(response);
}
