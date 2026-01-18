/**
 * LINE 帳號綁定 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ success: false, error: '未授權' }, { status: 401 });
        }

        const { data: connection, error } = await supabase
            .from('user_social_connections')
            .select('*')
            .eq('user_id', user.id)
            .eq('provider', 'line')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('取得綁定資訊失敗:', error);
        }

        return NextResponse.json({
            success: true,
            data: connection || null
        });
    } catch (error) {
        console.error('API 錯誤:', error);
        return NextResponse.json({ success: false, error: '伺服器錯誤' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ success: false, error: '未授權' }, { status: 401 });
        }

        const { lineUserId, action } = await request.json();

        if (action === 'unbind') {
            const { error } = await supabase
                .from('user_social_connections')
                .delete()
                .eq('user_id', user.id)
                .eq('provider', 'line');

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (!lineUserId || !lineUserId.startsWith('U')) {
            return NextResponse.json({ success: false, error: '無效的 LINE User ID' }, { status: 400 });
        }

        // 儲存綁定資訊
        const { error } = await supabase
            .from('user_social_connections')
            .upsert({
                user_id: user.id,
                provider: 'line',
                provider_account_id: lineUserId,
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,provider'
            });

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ success: false, error: '此 LINE 帳號已被其他使用者綁定' }, { status: 400 });
            }
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('綁定錯誤:', error);
        const message = error instanceof Error ? error.message : '連線錯誤';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
