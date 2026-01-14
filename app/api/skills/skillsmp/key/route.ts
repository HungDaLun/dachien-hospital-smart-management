import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * 取得 SkillsMP API Key (前端直接請求用)
 * 僅限登入使用者獲取
 */
export async function GET(_request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const adminSupabase = createAdminClient();
        const { data } = await adminSupabase
            .from('system_settings')
            .select('setting_value')
            .eq('setting_key', 'skillsmp_api_key');

        const apiKey = (data && data.length > 0) ? data[0].setting_value : process.env.SKILLSMP_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ success: false, error: 'API Key not set' }, { status: 404 });
        }

        return NextResponse.json({ success: true, apiKey });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
