/**
 * LiveKit Token API
 * 產生用於連線 LiveKit Server 的 Access Token
 */

import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { getCurrentUserProfile } from '@/lib/permissions';
import { getSystemSettings } from '@/lib/supabase/settings';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const profile = await getCurrentUserProfile();

        // 優先從資料庫讀取設定
        const settings = await getSystemSettings({
            'livekit_api_key': 'LIVEKIT_API_KEY',
            'livekit_api_secret': 'LIVEKIT_API_SECRET',
            'livekit_url': 'NEXT_PUBLIC_LIVEKIT_URL'
        });

        const apiKey = settings.livekit_api_key;
        const apiSecret = settings.livekit_api_secret;
        const wsUrl = settings.livekit_url;

        if (!apiKey || !apiSecret || !wsUrl) {
            return NextResponse.json(
                { error: 'LiveKit Server 未設定' },
                { status: 503 }
            );
        }

        // 取得房間名稱（預設為使用者的私有房間）
        const { searchParams } = new URL(request.url);
        const room = searchParams.get('room') || `room_${profile.id}`;
        const identity = profile.id; // 改用 ID 作為唯一識別碼

        // 建立 Access Token
        const at = new AccessToken(apiKey, apiSecret, {
            identity,
            name: identity,
        });

        // 設定權限
        at.addGrant({
            roomJoin: true,
            room,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });

        return NextResponse.json({
            token: await at.toJwt(),
            serverUrl: wsUrl,
            room,
        });
    } catch (error) {
        console.error('[LiveKit Token API] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
