/**
 * Google Calendar OAuth Callback
 * 處理 Google OAuth 回呼並儲存授權
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// ==================== Constants ====================

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const DEFAULT_APP_URL = 'https://nexus-ai.zeabur.app';

// ==================== Helpers ====================

/**
 * 取得應用程式的基礎 URL
 * 優先順序：環境變數 > 動態偵測 > 預設值
 * 
 * ⚠️ 安全檢查：永遠不會返回 localhost:8080
 */
function getAppUrl(request?: NextRequest): string {
    // 1. 優先使用環境變數（但需要驗證）
    if (process.env.NEXT_PUBLIC_APP_URL) {
        const envUrl = process.env.NEXT_PUBLIC_APP_URL;
        // 安全檢查：拒絕 localhost:8080
        if (envUrl.includes('localhost:8080')) {
            console.warn('[getAppUrl] 環境變數包含 localhost:8080，使用預設值:', envUrl);
            return DEFAULT_APP_URL;
        }
        return envUrl;
    }

    // 2. 嘗試從 request 動態取得（用於處理不同部署環境）
    if (request) {
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        // 安全檢查：拒絕 localhost:8080
        if (host && !host.includes('localhost')) {
            const dynamicUrl = `${protocol}://${host}`;
            if (dynamicUrl.includes('localhost:8080')) {
                console.warn('[getAppUrl] 動態偵測到 localhost:8080，使用預設值');
                return DEFAULT_APP_URL;
            }
            return dynamicUrl;
        }
    }

    // 3. 使用預設值
    return DEFAULT_APP_URL;
}

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

async function getGoogleOAuthConfig(request?: NextRequest): Promise<{
    clientId: string;
    clientSecret: string;
    redirectUri: string;
} | null> {
    const supabase = getSupabaseAdmin();

    const { data } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
            'google_oauth_client_id',
            'google_oauth_client_secret',
            'google_oauth_redirect_uri',
        ]);

    if (!data) return null;

    const settings: Record<string, string | null> = {};
    for (const row of data) {
        settings[row.setting_key] = row.setting_value;
    }

    const clientId = settings['google_oauth_client_id'];
    const clientSecret = settings['google_oauth_client_secret'];
    const appUrl = getAppUrl(request);
    
    // 取得 redirect URI（優先使用資料庫設定，否則動態生成）
    let redirectUri = settings['google_oauth_redirect_uri'] ||
        `${appUrl}/api/auth/google/calendar/callback`;

    // ⚠️ 安全檢查：拒絕 localhost:8080
    if (redirectUri.includes('localhost:8080')) {
        console.error('[getGoogleOAuthConfig] 偵測到無效的 redirect URI（包含 localhost:8080）:', redirectUri);
        // 強制使用正確的 URL
        redirectUri = `${appUrl}/api/auth/google/calendar/callback`;
        console.warn('[getGoogleOAuthConfig] 已修正為:', redirectUri);
    }

    // 驗證 redirect URI 格式
    try {
        const uri = new URL(redirectUri);
        if (!uri.pathname.includes('/api/auth/google/calendar/callback')) {
            console.warn('[getGoogleOAuthConfig] redirect URI 路徑不正確，已修正');
            redirectUri = `${appUrl}/api/auth/google/calendar/callback`;
        }
    } catch {
        // URL 格式錯誤，使用預設值
        console.error('[getGoogleOAuthConfig] redirect URI 格式錯誤，使用預設值:', redirectUri);
        redirectUri = `${appUrl}/api/auth/google/calendar/callback`;
    }

    if (!clientId || !clientSecret) {
        return null;
    }

    return { clientId, clientSecret, redirectUri };
}

// ==================== GET - Handle OAuth Callback ====================

export async function GET(request: NextRequest) {
    // 取得應用程式 URL（用於所有重導向）
    const appUrl = getAppUrl(request);

    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // 處理使用者拒絕授權
        if (error) {
            console.warn('[Google OAuth Callback] User denied access:', error);
            return NextResponse.redirect(
                `${appUrl}/dashboard/settings?google_auth=denied`
            );
        }

        if (!code || !state) {
            return NextResponse.redirect(
                `${appUrl}/dashboard/settings?google_auth=error&message=missing_params`
            );
        }

        // 解析 state 取得使用者 ID
        let userId: string;
        try {
            const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
            userId = stateData.userId;

            // 驗證 state 是否過期（5 分鐘）
            if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
                return NextResponse.redirect(
                    `${appUrl}/dashboard/settings?google_auth=error&message=state_expired`
                );
            }
        } catch {
            return NextResponse.redirect(
                `${appUrl}/dashboard/settings?google_auth=error&message=invalid_state`
            );
        }

        // 取得 Google OAuth 設定
        const config = await getGoogleOAuthConfig(request);
        if (!config) {
            return NextResponse.redirect(
                `${appUrl}/dashboard/settings?google_auth=error&message=config_missing`
            );
        }

        // 交換 code 取得 access token
        const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: config.clientId,
                client_secret: config.clientSecret,
                redirect_uri: config.redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('[Google OAuth Callback] Token exchange failed:', errorText);
            return NextResponse.redirect(
                `${appUrl}/dashboard/settings?google_auth=error&message=token_exchange_failed`
            );
        }

        const tokenData = await tokenResponse.json();

        // 儲存授權資訊到資料庫
        const supabase = getSupabaseAdmin();
        const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

        const { error: upsertError } = await supabase
            .from('google_calendar_authorizations')
            .upsert({
                user_id: userId,
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token || null,
                token_expires_at: expiresAt.toISOString(),
                sync_enabled: true,
                is_active: true,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id',
            });

        if (upsertError) {
            console.error('[Google OAuth Callback] Save auth error:', upsertError);
            return NextResponse.redirect(
                `${appUrl}/dashboard/settings?google_auth=error&message=save_failed`
            );
        }

        // 成功，重導向回設定頁面
        return NextResponse.redirect(
            `${appUrl}/dashboard/settings?google_auth=success`
        );
    } catch (error) {
        console.error('[Google OAuth Callback] Error:', error);
        return NextResponse.redirect(
            `${appUrl}/dashboard/settings?google_auth=error&message=unknown`
        );
    }
}
