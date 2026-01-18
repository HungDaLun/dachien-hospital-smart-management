import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
    try {
        const supabase = await createClient();

        // 1. 驗證使用者身份
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. 取得 LINE 綁定狀態 (這通常存在 user_identities 或自定義表)
        // 這裡我們假設 line_connection 邏輯與原有 /api/user/line/bind 同步
        const { data: lineAuth } = await supabase
            .from('user_social_connections')
            .select('provider_account_id')
            .eq('user_id', user.id)
            .eq('provider', 'line')
            .maybeSingle();

        // 3. 取得 Google Calendar 授權狀態
        const { data: googleAuth } = await supabase
            .from('google_calendar_authorizations')
            .select('is_active, updated_at')
            .eq('user_id', user.id)
            .maybeSingle();

        return NextResponse.json({
            success: true,
            data: {
                line: {
                    connected: !!lineAuth,
                    provider_account_id: lineAuth?.provider_account_id || null
                },
                google_calendar: {
                    connected: !!googleAuth?.is_active,
                    updated_at: googleAuth?.updated_at || null
                }
            }
        });

    } catch (error) {
        console.error('[User Integrations] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
