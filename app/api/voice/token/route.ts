import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // 1. 驗證使用者身分
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. 取得 LiveKit 設定 (優先從環境變數，無則從資料庫)
        let livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
        let apiKey = process.env.LIVEKIT_API_KEY;
        let apiSecret = process.env.LIVEKIT_API_SECRET;

        // 如果環境變數缺漏，嘗試從資料庫讀取
        if (!livekitUrl || !apiKey || !apiSecret) {
            const adminClient = createAdminClient();
            const { data: settings } = await adminClient
                .from('system_settings')
                .select('setting_key, setting_value')
                .in('setting_key', ['livekit_url', 'livekit_api_key', 'livekit_api_secret']);

            if (settings) {
                settings.forEach(s => {
                    if (s.setting_key === 'livekit_url' && !livekitUrl) livekitUrl = s.setting_value;
                    if (s.setting_key === 'livekit_api_key' && !apiKey) apiKey = s.setting_value;
                    if (s.setting_key === 'livekit_api_secret' && !apiSecret) apiSecret = s.setting_value;
                });
            }
        }

        if (!livekitUrl || !apiKey || !apiSecret) {
            return NextResponse.json(
                { error: 'LiveKit configuration missing' },
                { status: 500 }
            );
        }

        // 3. 取得請求參數
        const body = await request.json();
        const { agent_id } = body;

        // 4. 取得使用者顯示名稱
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('display_name')
            .eq('id', user.id)
            .single();

        // 5. 建立 LiveKit AccesToken
        const participantName = profile?.display_name || user.email || 'User';
        const at = new AccessToken(apiKey, apiSecret, {
            identity: user.id,
            name: participantName,
            metadata: JSON.stringify({
                user_id: user.id,
                agent_id: agent_id || process.env.DEFAULT_VOICE_AGENT_ID || 'default',
            }),
        });

        // 6. 設定權限 (加入特定房間)
        const roomName = `voice-assistant-${user.id}`;
        at.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });

        const token = await at.toJwt();

        return NextResponse.json({
            token,
            url: livekitUrl,
            room: roomName,
        });

    } catch (error) {
        console.error('[Voice Token] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate token' },
            { status: 500 }
        );
    }
}
