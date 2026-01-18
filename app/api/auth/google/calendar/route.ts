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
    
    // 取得 redirect URI（優先使用資料庫設定，否則動態生成）
    let redirectUri = settings.google_oauth_redirect_uri ||
        `${appUrl}/api/auth/google/calendar/callback`;

    // 🔍 偵錯日誌：記錄原始值
    console.log('[getGoogleOAuthConfig] 資料庫中的 redirect_uri:', settings.google_oauth_redirect_uri);
    console.log('[getGoogleOAuthConfig] 計算出的 appUrl:', appUrl);
    console.log('[getGoogleOAuthConfig] 初始 redirectUri:', redirectUri);

    // ⚠️ 安全檢查：拒絕 localhost:8080
    if (redirectUri.includes('localhost:8080')) {
        console.error('[getGoogleOAuthConfig] 偵測到無效的 redirect URI（包含 localhost:8080）:', redirectUri);
        // 強制使用正確的 URL
        redirectUri = `${appUrl}/api/auth/google/calendar/callback`;
        console.warn('[getGoogleOAuthConfig] 已修正為:', redirectUri);
    }

    // 驗證 redirect URI 格式（確保包含 /calendar 路徑段）
    try {
        const uri = new URL(redirectUri);
        if (!uri.pathname.includes('/api/auth/google/calendar/callback')) {
            console.warn('[getGoogleOAuthConfig] redirect URI 路徑不正確（缺少 /calendar），已修正');
            console.warn('[getGoogleOAuthConfig] 原始路徑:', uri.pathname);
            redirectUri = `${appUrl}/api/auth/google/calendar/callback`;
        }
    } catch {
        // URL 格式錯誤，使用預設值
        console.error('[getGoogleOAuthConfig] redirect URI 格式錯誤，使用預設值:', redirectUri);
        redirectUri = `${appUrl}/api/auth/google/calendar/callback`;
    }

    // 🔍 偵錯日誌：記錄最終值
    console.log('[getGoogleOAuthConfig] 最終使用的 redirectUri:', redirectUri);

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

        // 🔍 偵錯日誌：記錄使用的 redirect URI
        console.log('[Google OAuth] 使用 redirect URI:', config.redirectUri);
        console.log('[Google OAuth] appUrl 來源:', getAppUrl(request));
        console.log('[Google OAuth] 完整授權 URL:', authUrl.toString());

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
