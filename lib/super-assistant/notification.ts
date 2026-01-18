/**
 * 通知服務
 * 統一處理各種通知管道的發送 (Line, Email, Web Push)
 */

import { LineClient } from '@/lib/integrations/line/client';
import { createClient } from '@supabase/supabase-js';

// ==================== Types ====================

export interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, unknown>;
}

export interface NotificationTarget {
    userId: string; // 系統使用者 ID
    channels?: ('line' | 'email' | 'web')[];
}

export interface NotificationResult {
    success: boolean;
    channel: string;
    error?: string;
}

// ==================== Supabase Admin Client ====================

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// ==================== Settings Helpers ====================

async function getLineSettings(): Promise<{ token: string; secret: string } | null> {
    const supabase = getSupabaseAdmin();

    const { data } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['line_channel_access_token', 'line_channel_secret']);

    if (!data) return null;

    const settings: Record<string, string | null> = {};
    for (const row of data) {
        settings[row.setting_key] = row.setting_value;
    }

    const token = settings['line_channel_access_token'];
    const secret = settings['line_channel_secret'];

    if (!token || !secret) return null;

    return { token, secret };
}

// ==================== Notification Service ====================

export class NotificationService {
    /**
     * 發送通知給指定使用者
     */
    async send(
        target: NotificationTarget,
        payload: NotificationPayload
    ): Promise<NotificationResult[]> {
        const results: NotificationResult[] = [];
        const channels = target.channels || ['line']; // 預設使用 Line

        for (const channel of channels) {
            try {
                switch (channel) {
                    case 'line':
                        await this.sendLineNotification(target.userId, payload);
                        results.push({ success: true, channel: 'line' });
                        break;

                    case 'email':
                        // TODO: Email 通知實作
                        results.push({ success: false, channel: 'email', error: 'Email 通知尚未實作' });
                        break;

                    case 'web':
                        // TODO: Web Push 實作
                        results.push({ success: false, channel: 'web', error: 'Web Push 尚未實作' });
                        break;

                    default:
                        results.push({ success: false, channel, error: '不支援的通知管道' });
                }
            } catch (error) {
                console.error(`[NotificationService] ${channel} error:`, error);
                results.push({
                    success: false,
                    channel,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        return results;
    }

    /**
     * 發送 Line 通知
     */
    private async sendLineNotification(
        userId: string,
        payload: NotificationPayload
    ): Promise<void> {
        const supabase = getSupabaseAdmin();

        // 1. 取得使用者的 Line User ID
        const { data: connection } = await supabase
            .from('user_social_connections')
            .select('provider_account_id')
            .eq('user_id', userId)
            .eq('provider', 'line')
            .eq('is_active', true)
            .single();

        if (!connection?.provider_account_id) {
            throw new Error('使用者未綁定 Line 帳號');
        }

        // 2. 取得 Line 設定
        const lineSettings = await getLineSettings();
        if (!lineSettings) {
            throw new Error('Line 整合未設定');
        }

        // 3. 發送訊息
        const client = new LineClient(lineSettings.token, lineSettings.secret);

        const message = `📢 ${payload.title}\n\n${payload.body}`;
        await client.sendTextMessage(connection.provider_account_id, message);
    }

    /**
     * 發送會議提醒
     */
    async sendMeetingReminder(params: {
        userId: string;
        meetingTitle: string;
        startTime: Date;
        minutesBefore: number;
    }): Promise<NotificationResult[]> {
        const timeString = params.startTime.toLocaleString('zh-TW', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        return this.send(
            { userId: params.userId, channels: ['line'] },
            {
                title: '會議提醒',
                body: `您的會議「${params.meetingTitle}」將於 ${timeString} 開始（${params.minutesBefore} 分鐘後）`,
                data: { type: 'meeting_reminder' },
            }
        );
    }

    /**
     * 發送風險警示
     */
    async sendRiskAlert(params: {
        userId: string;
        riskTitle: string;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
        description: string;
    }): Promise<NotificationResult[]> {
        const levelEmoji: Record<string, string> = {
            low: '🟡',
            medium: '🟠',
            high: '🔴',
            critical: '🚨',
        };

        return this.send(
            { userId: params.userId, channels: ['line'] },
            {
                title: `${levelEmoji[params.riskLevel]} 風險警示：${params.riskTitle}`,
                body: params.description,
                data: { type: 'risk_alert', level: params.riskLevel },
            }
        );
    }

    /**
     * 發送每日簡報
     */
    async sendDailyBriefing(params: {
        userId: string;
        summary: string;
    }): Promise<NotificationResult[]> {
        return this.send(
            { userId: params.userId, channels: ['line'] },
            {
                title: '☀️ 每日簡報',
                body: params.summary,
                data: { type: 'daily_briefing' },
            }
        );
    }
}

// ==================== Singleton ====================

let notificationServiceInstance: NotificationService | null = null;

export function getNotificationService(): NotificationService {
    if (!notificationServiceInstance) {
        notificationServiceInstance = new NotificationService();
    }
    return notificationServiceInstance;
}
