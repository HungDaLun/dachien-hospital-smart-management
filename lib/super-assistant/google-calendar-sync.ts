/**
 * Google Calendar Sync Service
 * 處理系統行事曆與 Google Calendar 的同步
 */

import { createClient } from '@supabase/supabase-js';

// ==================== Constants ====================

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

// ==================== Types ====================

interface GoogleEvent {
    id?: string;
    summary: string;
    description?: string;
    location?: string;
    start: {
        dateTime?: string;
        date?: string;
        timeZone?: string;
    };
    end: {
        dateTime?: string;
        date?: string;
        timeZone?: string;
    };
    attendees?: Array<{ email: string }>;
}

interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time: string;
    timezone: string;
    is_all_day: boolean;
    google_calendar_id?: string;
    participants?: Array<{ email?: string }>;
}

// ==================== Helpers ====================

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

async function getGoogleOAuthConfig(): Promise<{
    clientId: string;
    clientSecret: string;
} | null> {
    const supabase = getSupabaseAdmin();

    const { data } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['google_oauth_client_id', 'google_oauth_client_secret']);

    if (!data) return null;

    const settings: Record<string, string | null> = {};
    for (const row of data) {
        settings[row.setting_key] = row.setting_value;
    }

    const clientId = settings['google_oauth_client_id'];
    const clientSecret = settings['google_oauth_client_secret'];

    if (!clientId || !clientSecret) return null;

    return { clientId, clientSecret };
}

// ==================== Google Calendar Sync Service ====================

export class GoogleCalendarSyncService {
    private supabase = getSupabaseAdmin();

    /**
     * 取得使用者的有效 access token
     * 如果過期會自動刷新
     */
    async getValidAccessToken(userId: string): Promise<string | null> {
        const { data: auth, error } = await this.supabase
            .from('google_calendar_authorizations')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (error || !auth) {
            console.warn('[GoogleSync] No authorization found for user:', userId);
            return null;
        }

        // 檢查 token 是否過期（提前 5 分鐘）
        const expiresAt = new Date(auth.token_expires_at);
        const now = new Date();
        const isExpired = expiresAt.getTime() - now.getTime() < 5 * 60 * 1000;

        if (!isExpired) {
            return auth.access_token;
        }

        // 需要刷新 token
        if (!auth.refresh_token) {
            console.warn('[GoogleSync] Token expired and no refresh token available');
            return null;
        }

        const newToken = await this.refreshAccessToken(userId, auth.refresh_token);
        return newToken;
    }

    /**
     * 刷新 access token
     */
    private async refreshAccessToken(
        userId: string,
        refreshToken: string
    ): Promise<string | null> {
        const config = await getGoogleOAuthConfig();
        if (!config) {
            console.error('[GoogleSync] OAuth config not found');
            return null;
        }

        try {
            const response = await fetch(GOOGLE_TOKEN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: config.clientId,
                    client_secret: config.clientSecret,
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token',
                }),
            });

            if (!response.ok) {
                console.error('[GoogleSync] Token refresh failed:', await response.text());
                return null;
            }

            const tokenData = await response.json();
            const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

            // 更新資料庫
            await this.supabase
                .from('google_calendar_authorizations')
                .update({
                    access_token: tokenData.access_token,
                    token_expires_at: expiresAt.toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);

            return tokenData.access_token;
        } catch (error) {
            console.error('[GoogleSync] Token refresh error:', error);
            return null;
        }
    }

    /**
     * 同步事件到 Google Calendar
     */
    async syncEventToGoogle(
        userId: string,
        event: CalendarEvent
    ): Promise<{ success: boolean; googleEventId?: string; error?: string }> {
        const accessToken = await this.getValidAccessToken(userId);
        if (!accessToken) {
            return { success: false, error: '無法取得 Google 授權' };
        }

        // 轉換為 Google Event 格式
        const googleEvent: GoogleEvent = {
            summary: event.title,
            description: event.description,
            location: event.location,
            start: event.is_all_day
                ? { date: event.start_time.split('T')[0] }
                : { dateTime: event.start_time, timeZone: event.timezone },
            end: event.is_all_day
                ? { date: event.end_time.split('T')[0] }
                : { dateTime: event.end_time, timeZone: event.timezone },
            attendees: event.participants
                ?.filter(p => p.email)
                .map(p => ({ email: p.email! })),
        };

        try {
            let response: Response;
            let method: string;

            if (event.google_calendar_id) {
                // 更新現有事件
                method = 'PATCH';
                response = await fetch(
                    `${GOOGLE_CALENDAR_API}/calendars/primary/events/${event.google_calendar_id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(googleEvent),
                    }
                );
            } else {
                // 建立新事件
                method = 'POST';
                response = await fetch(
                    `${GOOGLE_CALENDAR_API}/calendars/primary/events`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(googleEvent),
                    }
                );
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[GoogleSync] ${method} event failed:`, errorText);
                return { success: false, error: `Google API 錯誤：${response.status}` };
            }

            const result = await response.json();

            // 更新系統事件的 google_calendar_id
            if (!event.google_calendar_id && result.id) {
                await this.supabase
                    .from('calendar_events')
                    .update({
                        google_calendar_id: result.id,
                        google_sync_enabled: true,
                        last_synced_at: new Date().toISOString(),
                    })
                    .eq('id', event.id);
            }

            return { success: true, googleEventId: result.id };
        } catch (error) {
            console.error('[GoogleSync] Sync error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * 從 Google Calendar 刪除事件
     */
    async deleteEventFromGoogle(
        userId: string,
        googleEventId: string
    ): Promise<{ success: boolean; error?: string }> {
        const accessToken = await this.getValidAccessToken(userId);
        if (!accessToken) {
            return { success: false, error: '無法取得 Google 授權' };
        }

        try {
            const response = await fetch(
                `${GOOGLE_CALENDAR_API}/calendars/primary/events/${googleEventId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok && response.status !== 404) {
                return { success: false, error: `Google API 錯誤：${response.status}` };
            }

            return { success: true };
        } catch (error) {
            console.error('[GoogleSync] Delete error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * 從 Google Calendar 讀取事件清單
     */
    async listEvents(
        userId: string,
        options: {
            timeMin?: string;
            timeMax?: string;
            maxResults?: number;
        } = {}
    ): Promise<{ success: boolean; events?: GoogleEvent[]; error?: string }> {
        const accessToken = await this.getValidAccessToken(userId);
        if (!accessToken) {
            return { success: false, error: '無法取得 Google 授權' };
        }

        try {
            const queryParams = new URLSearchParams({
                singleEvents: 'true',
                orderBy: 'startTime',
            });

            if (options.timeMin) queryParams.append('timeMin', options.timeMin);
            if (options.timeMax) queryParams.append('timeMax', options.timeMax);
            if (options.maxResults) queryParams.append('maxResults', options.maxResults.toString());

            const response = await fetch(
                `${GOOGLE_CALENDAR_API}/calendars/primary/events?${queryParams.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[GoogleSync] List events failed:', errorText);
                return { success: false, error: `Google API 錯誤：${response.status}` };
            }

            const data = await response.json();
            return { success: true, events: data.items || [] };
        } catch (error) {
            console.error('[GoogleSync] List events error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}

// ==================== Singleton ====================

let syncServiceInstance: GoogleCalendarSyncService | null = null;

export function getGoogleCalendarSyncService(): GoogleCalendarSyncService {
    if (!syncServiceInstance) {
        syncServiceInstance = new GoogleCalendarSyncService();
    }
    return syncServiceInstance;
}
