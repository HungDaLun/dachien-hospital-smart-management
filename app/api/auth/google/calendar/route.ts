/**
 * Google Calendar OAuth API
 * 處理 Google Calendar 授權流程
 *
 * GET  /api/auth/google/calendar - 開始授權流程（重導向到 Google）
 * GET  /api/auth/google/calendar/callback - 處理 Google 回呼
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserProfile } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

import { getSystemSettings } from '@/lib/supabase/settings';

// ==================== Constants ====================

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
].join(' ');
const DEFAULT_APP_URL = 'https://nexus-ai.zeabur.app';

// ==================== Helpers ====================

/**
 * 取得應用程式的基礎 URL
 * 優先順序：環境變數 > 動態偵測 > 預設值
 */
function getAppUrl(request?: NextRequest): string {
    // 1. 優先使用環境變數
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    // 2. 嘗試從 request 動態取得（用於處理不同部署環境）
    if (request) {
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        if (host && !host.includes('localhost')) {
            return `${protocol}://${host}`;
        }
    }

    // 3. 使用預設值
    return DEFAULT_APP_URL;
}

async function getGoogleOAuthConfig(request?: NextRequest): Promise<{
    clientId: string;
    clientSecret: string;
    redirectUri: string;
} | null> {
    const settings = await getSystemSettings({
        'google_oauth_client_id': 'GOOGLE_OAUTH_CLIENT_ID',
        'google_oauth_client_secret': 'GOOGLE_OAUTH_CLIENT_SECRET',
        'google_oauth_redirect_uri': 'GOOGLE_OAUTH_REDIRECT_URI'
    });

    const clientId = settings.google_oauth_client_id;
    const clientSecret = settings.google_oauth_client_secret;
    const appUrl = getAppUrl(request);
    const redirectUri = settings.google_oauth_redirect_uri ||
        `${appUrl}/api/auth/google/calendar/callback`;

    if (!clientId || !clientSecret) {
        return null;
    }

    return { clientId, clientSecret, redirectUri };
}

// ==================== GET - Start OAuth Flow ====================

export async function GET(request: NextRequest) {
    try {
        const profile = await getCurrentUserProfile();

        // 取得 Google OAuth 設定（傳入 request 以便動態偵測 host）
        const config = await getGoogleOAuthConfig(request);
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
