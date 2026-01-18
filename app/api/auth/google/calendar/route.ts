/**
 * Google Calendar OAuth API
 * 處理 Google Calendar 授權流程
 * 
 * GET  /api/auth/google/calendar - 開始授權流程（重導向到 Google）
 * GET  /api/auth/google/calendar/callback - 處理 Google 回呼
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUserProfile } from '@/lib/permissions';

// ==================== Constants ====================

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
].join(' ');

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

// ==================== GET - Start OAuth Flow ====================

export async function GET(_request: NextRequest) {
    try {
        const profile = await getCurrentUserProfile();

        // 取得 Google OAuth 設定
        const config = await getGoogleOAuthConfig();
        if (!config) {
            return NextResponse.json(
                { error: 'Google OAuth 未設定，請聯繫系統管理員' },
                { status: 503 }
            );
        }

        // 產生 state token（用於防止 CSRF）
        const state = Buffer.from(JSON.stringify({
            userId: profile.id,
            timestamp: Date.now(),
        })).toString('base64');

        // 建立授權 URL
        const authUrl = new URL(GOOGLE_AUTH_URL);
        authUrl.searchParams.set('client_id', config.clientId);
        authUrl.searchParams.set('redirect_uri', config.redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', GOOGLE_SCOPES);
        authUrl.searchParams.set('access_type', 'offline'); // 取得 refresh token
        authUrl.searchParams.set('prompt', 'consent'); // 強制顯示同意畫面
        authUrl.searchParams.set('state', state);

        // 重導向到 Google 授權頁面
        return NextResponse.redirect(authUrl.toString());
    } catch (error) {
        console.error('[Google OAuth] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
