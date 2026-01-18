import { NextRequest, NextResponse } from 'next/server';

/**
 * Vapi Webhook API
 *
 * 接收 Vapi 的語音轉文字結果，透過 Gemini 處理後回傳
 *
 * Vapi 會發送以下類型的請求：
 * - assistant-request: 請求 assistant 配置
 * - function-call: 呼叫自定義函數
 * - status-update: 狀態更新
 * - end-of-call-report: 通話結束報告
 * - conversation-update: 對話更新（包含使用者說的話）
 */

// Vapi 訊息類型定義
interface VapiMessage {
    type: string;
    call?: {
        id: string;
        customer?: {
            number?: string;
        };
    };
    message?: {
        role: string;
        content: string;
    };
    messages?: Array<{
        role: string;
        content: string;
    }>;
    transcript?: string;
    functionCall?: {
        name: string;
        parameters: Record<string, unknown>;
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: VapiMessage = await request.json();

        console.log('[Vapi Webhook] Received:', body.type);

        // 根據不同的訊息類型處理
        switch (body.type) {
            case 'assistant-request':
                // Vapi 請求 assistant 配置
                // 回傳自定義配置，使用 Vapi 的 TTS/STT 但用我們的 LLM
                return NextResponse.json({
                    assistant: {
                        // 使用 Custom LLM 模式
                        model: {
                            provider: 'custom-llm',
                            url: `${getBaseUrl(request)}/api/vapi/chat`,
                            model: 'gemini-2.5-flash',
                        },
                        // 保持原有的語音設定
                        voice: {
                            provider: 'openai',
                            voiceId: 'alloy',
                        },
                        transcriber: {
                            provider: 'deepgram',
                            model: 'nova-2',
                            language: 'zh-TW',
                        },
                        firstMessage: '您好，我是 Nexus，您的超級管家。有什麼我可以幫您的嗎？',
                    },
                });

            case 'conversation-update':
                // 對話更新 - 這是主要的處理邏輯
                // 但如果使用 custom-llm，這個可能不會被呼叫
                console.log('[Vapi Webhook] Conversation update received');
                return NextResponse.json({ success: true });

            case 'function-call':
                // 處理函數呼叫（未來擴充用）
                console.log('[Vapi Webhook] Function call:', body.functionCall);
                return NextResponse.json({
                    result: '功能呼叫已收到，但尚未實作',
                });

            case 'status-update':
                // 狀態更新（連線、斷線等）
                console.log('[Vapi Webhook] Status update');
                return NextResponse.json({ success: true });

            case 'end-of-call-report':
                // 通話結束報告（可用於記錄）
                console.log('[Vapi Webhook] Call ended');
                return NextResponse.json({ success: true });

            default:
                console.log('[Vapi Webhook] Unknown type:', body.type);
                return NextResponse.json({ success: true });
        }
    } catch (error) {
        console.error('[Vapi Webhook] Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// 取得 base URL
function getBaseUrl(request: NextRequest): string {
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${host}`;
}
