/**
 * Google OAuth Callback Proxy
 * 將 /api/auth/google/callback 轉導至 /api/auth/google/calendar/callback
 * 解決 Google Cloud Console 設定與實際路徑不一致的問題
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const callbackUrl = new URL('/api/auth/google/calendar/callback', request.url);

    // 複製所有查詢參數 (code, state, scope 等)
    searchParams.forEach((value, key) => {
        callbackUrl.searchParams.set(key, value);
    });

    return NextResponse.redirect(callbackUrl.toString());
}
