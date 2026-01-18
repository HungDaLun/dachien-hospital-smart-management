/**
 * Line Webhook API Endpoint
 * 接收來自 Line 的 Webhook 事件並送入 Super Assistant Gateway
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LineClient, LineWebhookBody, LineWebhookEvent } from '@/lib/integrations/line/client';
import { getUnifiedGateway, createOrchestratorAgent } from '@/lib/super-assistant';

// ==================== Supabase Service Client ====================

function getSupabaseServiceClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(supabaseUrl, serviceRoleKey);
}

// ==================== Settings Helpers ====================

interface LineSettings {
    channelAccessToken: string;
    channelSecret: string;
    webhookEnabled: boolean;
}

async function getLineSettings(): Promise<LineSettings | null> {
    const supabase = getSupabaseServiceClient();

    const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
            'line_channel_access_token',
            'line_channel_secret',
            'line_webhook_enabled',
        ]);

    if (error || !data) {
        console.error('[Line Webhook] Failed to get settings:', error);
        return null;
    }

    const settings: Record<string, string | null> = {};
    for (const row of data) {
        settings[row.setting_key] = row.setting_value;
    }

    const token = settings['line_channel_access_token'];
    const secret = settings['line_channel_secret'];
    const enabled = settings['line_webhook_enabled'] === 'true';

    if (!token || !secret) {
        return null;
    }

    return {
        channelAccessToken: token,
        channelSecret: secret,
        webhookEnabled: enabled,
    };
}

// ==================== Event Handlers ====================

/**
 * 處理訊息事件
 */
async function handleMessageEvent(
    client: LineClient,
    event: LineWebhookEvent,
    supabase: ReturnType<typeof getSupabaseServiceClient>
): Promise<void> {
    const userId = event.source.userId;
    const message = event.message;

    if (!userId || !message || message.type !== 'text') {
        return;
    }

    const userText = message.text as string;
    console.log(`[Line Webhook] Received message from ${userId}: ${userText}`);

    // 查找是否有綁定的系統使用者
    const { data: connection } = await supabase
        .from('user_social_connections')
        .select('user_id')
        .eq('provider', 'line')
        .eq('provider_account_id', userId)
        .eq('is_active', true)
        .single();

    // 使用 Orchestrator Agent 處理訊息
    if (event.replyToken) {
        let replyText: string;

        if (connection?.user_id) {
            // 已綁定使用者 - 使用 Orchestrator 處理
            const gateway = getUnifiedGateway();
            const orchestrator = createOrchestratorAgent({ systemUserId: connection.user_id });

            const unifiedMessage = await gateway.processLineMessage({
                lineUserId: userId,
                systemUserId: connection.user_id,
                text: userText,
                replyToken: event.replyToken,
            });

            const response = await orchestrator.processMessage(unifiedMessage);
            replyText = response.content.text || '處理完成';
        } else {
            // 未綁定使用者
            replyText = `👋 您好！您的 Line 帳號尚未綁定系統使用者。\n\n請至系統設定頁面完成綁定後，即可使用超級管家功能。`;
        }

        await client.replyTextMessage(event.replyToken, replyText);
    }
}

/**
 * 處理追蹤事件 (使用者加入好友)
 */
async function handleFollowEvent(
    client: LineClient,
    event: LineWebhookEvent
): Promise<void> {
    const userId = event.source.userId;

    if (!userId || !event.replyToken) {
        return;
    }

    console.log(`[Line Webhook] New follower: ${userId}`);

    // 歡迎訊息
    const welcomeMessage = `🎉 歡迎使用 Knowledge Architects 超級管家！

我是您的 AI 助理，可以幫助您：
• 📅 管理行事曆與會議
• 📊 查詢公司資訊與數據
• 📝 產生報告與文件

請先至系統設定頁面綁定您的帳號，即可開始使用！`;

    await client.replyTextMessage(event.replyToken, welcomeMessage);
}

/**
 * 處理 Postback 事件 (按鈕點擊)
 */
async function handlePostbackEvent(
    client: LineClient,
    event: LineWebhookEvent
): Promise<void> {
    const postbackData = event.postback?.data;

    if (!postbackData || !event.replyToken) {
        return;
    }

    console.log(`[Line Webhook] Postback received: ${postbackData}`);

    // TODO: 根據 postbackData 執行對應動作
    await client.replyTextMessage(event.replyToken, `收到操作：${postbackData}`);
}

// ==================== Main Handler ====================

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // 1. 取得 Line 設定
        const settings = await getLineSettings();

        if (!settings) {
            console.warn('[Line Webhook] Line integration not configured');
            return NextResponse.json({ error: 'Line integration not configured' }, { status: 503 });
        }

        if (!settings.webhookEnabled) {
            console.warn('[Line Webhook] Webhook is disabled');
            return NextResponse.json({ error: 'Webhook disabled' }, { status: 503 });
        }

        // 2. 驗證簽章
        const signature = request.headers.get('x-line-signature');
        const rawBody = await request.text();

        if (!signature) {
            console.warn('[Line Webhook] Missing signature');
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        const client = new LineClient(settings.channelAccessToken, settings.channelSecret);

        if (!client.validateSignature(rawBody, signature)) {
            console.warn('[Line Webhook] Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // 3. 解析事件
        const body: LineWebhookBody = JSON.parse(rawBody);
        const supabase = getSupabaseServiceClient();

        console.log(`[Line Webhook] Received ${body.events.length} events`);

        // 4. 處理每個事件
        for (const event of body.events) {
            try {
                switch (event.type) {
                    case 'message':
                        await handleMessageEvent(client, event, supabase);
                        break;
                    case 'follow':
                        await handleFollowEvent(client, event);
                        break;
                    case 'postback':
                        await handlePostbackEvent(client, event);
                        break;
                    default:
                        console.log(`[Line Webhook] Unhandled event type: ${event.type}`);
                }
            } catch (eventError) {
                console.error(`[Line Webhook] Error handling event:`, eventError);
                // 繼續處理其他事件，不中斷
            }
        }

        // Line 需要 200 回應
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Line Webhook] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Line Webhook 驗證用 (Line 會發 GET 請求確認)
export async function GET(): Promise<NextResponse> {
    return NextResponse.json({ status: 'Line Webhook endpoint is ready' });
}
