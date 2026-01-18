/**
 * Google Calendar OAuth Callback
 * 處理 Google OAuth 回呼並儲存授權
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// ==================== Constants ====================

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

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
    const redirectUri = settings['google_oauth_redirect_uri'] ||
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/calendar/callback`;

    if (!clientId || !clientSecret) {
        return null;
    }

    return { clientId, clientSecret, redirectUri };
}

// ==================== GET - Handle OAuth Callback ====================

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // 處理使用者拒絕授權
        if (error) {
            console.warn('[Google OAuth Callback] User denied access:', error);
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?google_auth=denied`
            );
        }

        if (!code || !state) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?google_auth=error&message=missing_params`
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
                    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?google_auth=error&message=state_expired`
                );
            }
        } catch {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?google_auth=error&message=invalid_state`
            );
        }

        // 取得 Google OAuth 設定
        const config = await getGoogleOAuthConfig();
        if (!config) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?google_auth=error&message=config_missing`
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
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?google_auth=error&message=token_exchange_failed`
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
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?google_auth=error&message=save_failed`
            );
        }

        // 成功，重導向回設定頁面
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?google_auth=success`
        );
    } catch (error) {
        console.error('[Google OAuth Callback] Error:', error);
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?google_auth=error&message=unknown`
        );
    }
}
