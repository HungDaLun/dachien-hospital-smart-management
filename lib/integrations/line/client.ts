/**
 * Line Messaging API Client
 * 封裝 Line Messaging API 的常用操作
 */

import crypto from 'crypto';

// ==================== Types ====================

export interface LineProfile {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
}

export interface LineMessage {
    type: 'text' | 'sticker' | 'image' | 'video' | 'audio' | 'location' | 'template' | 'flex';
    text?: string;
    // 其他類型的訊息內容可在此擴充
    [key: string]: unknown;
}

export interface LinePushMessageOptions {
    to: string; // Line User ID
    messages: LineMessage[];
}

export interface LineReplyMessageOptions {
    replyToken: string;
    messages: LineMessage[];
}

// Webhook Event Types
export interface LineWebhookEvent {
    type: 'message' | 'follow' | 'unfollow' | 'join' | 'leave' | 'postback' | 'beacon';
    replyToken?: string;
    source: {
        type: 'user' | 'group' | 'room';
        userId?: string;
        groupId?: string;
        roomId?: string;
    };
    timestamp: number;
    message?: {
        id: string;
        type: string;
        text?: string;
        [key: string]: unknown;
    };
    postback?: {
        data: string;
        params?: Record<string, string>;
    };
}

export interface LineWebhookBody {
    destination: string;
    events: LineWebhookEvent[];
}

// ==================== Client Class ====================

export class LineClient {
    private channelAccessToken: string;
    private channelSecret: string;
    private baseUrl = 'https://api.line.me/v2/bot';

    constructor(channelAccessToken: string, channelSecret: string) {
        this.channelAccessToken = channelAccessToken;
        this.channelSecret = channelSecret;
    }

    // ==================== Signature Validation ====================

    /**
     * 驗證 Line Webhook 請求的簽章
     * @param body - 請求的原始 body (string)
     * @param signature - X-Line-Signature header
     */
    validateSignature(body: string, signature: string): boolean {
        const hash = crypto
            .createHmac('sha256', this.channelSecret)
            .update(body)
            .digest('base64');
        return hash === signature;
    }

    // ==================== Profile ====================

    /**
     * 取得使用者資料
     */
    async getProfile(userId: string): Promise<LineProfile> {
        const response = await fetch(`${this.baseUrl}/profile/${userId}`, {
            headers: {
                Authorization: `Bearer ${this.channelAccessToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to get Line profile: ${error}`);
        }

        return response.json();
    }

    // ==================== Messaging ====================

    /**
     * 推播訊息 (Push Message)
     * 主動發送訊息給使用者，不需要 replyToken
     */
    async pushMessage(options: LinePushMessageOptions): Promise<void> {
        const response = await fetch(`${this.baseUrl}/message/push`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.channelAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: options.to,
                messages: options.messages,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to push Line message: ${error}`);
        }
    }

    /**
     * 回覆訊息 (Reply Message)
     * 回應使用者的訊息，需要 replyToken
     */
    async replyMessage(options: LineReplyMessageOptions): Promise<void> {
        const response = await fetch(`${this.baseUrl}/message/reply`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.channelAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                replyToken: options.replyToken,
                messages: options.messages,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to reply Line message: ${error}`);
        }
    }

    /**
     * 發送純文字訊息的便利方法
     */
    async sendTextMessage(to: string, text: string): Promise<void> {
        await this.pushMessage({
            to,
            messages: [{ type: 'text', text }],
        });
    }

    /**
     * 回覆純文字訊息的便利方法
     */
    async replyTextMessage(replyToken: string, text: string): Promise<void> {
        await this.replyMessage({
            replyToken,
            messages: [{ type: 'text', text }],
        });
    }
}

// ==================== Factory Function ====================

/**
 * 從系統設定建立 LineClient
 * 實際使用時會從 Supabase 的 system_settings 表取得設定
 */
export async function createLineClientFromSettings(): Promise<LineClient | null> {
    // 這裡需要從 system_settings 取得設定
    // 暫時使用環境變數作為備用
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const secret = process.env.LINE_CHANNEL_SECRET;

    if (!token || !secret) {
        console.warn('[LineClient] Missing LINE_CHANNEL_ACCESS_TOKEN or LINE_CHANNEL_SECRET');
        return null;
    }

    return new LineClient(token, secret);
}
