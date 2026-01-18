import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedGateway, createOrchestratorAgent } from '@/lib/super-assistant';

/**
 * Vapi Custom LLM API - OpenAI Compatible Endpoint
 *
 * Vapi 會呼叫這個端點：/api/vapi/chat/chat/completions
 * 使用我們的 Gemini 3 Flash + 知識庫處理後回傳
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

        console.log('[Vapi Completions] Received request');
        console.log('[Vapi Completions] Messages count:', body.messages?.length);
        console.log('[Vapi Completions] Stream:', body.stream);

        // 取得使用者最後一則訊息
        const userMessages = body.messages?.filter(m => m.role === 'user') || [];
        const lastUserMessage = userMessages[userMessages.length - 1];

        if (!lastUserMessage?.content) {
            console.log('[Vapi Completions] No user message found');
            return createOpenAIResponse('抱歉，我沒有聽清楚，請再說一次。');
        }

        const userText = lastUserMessage.content;
        console.log('[Vapi Completions] User said:', userText);

        // 使用超級管家的 Gateway 和 Orchestrator
        const gateway = getUnifiedGateway();
        const orchestrator = createOrchestratorAgent({
            systemUserId: 'vapi-voice-user'
        });

        // 建立統一訊息格式
        const unifiedMessage = await gateway.processWebMessage({
            userId: 'vapi-voice-user',
            text: userText,
            sessionId: body.call?.id || `vapi-session-${Date.now()}`
        });

        // 透過 Gemini 3 Flash + 知識庫處理
        const response = await orchestrator.processMessage(unifiedMessage);
        const responseText = response.content.text || '我可能需要更多資訊才能回答您。';

        console.log('[Vapi Completions] Response:', responseText.substring(0, 100) + '...');

        // 回傳 OpenAI 相容格式
        return createOpenAIResponse(responseText);

    } catch (error) {
        console.error('[Vapi Completions] Error:', error);

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
        model: 'gemini-3-flash-preview',
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
