import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 批次刪除外部情報
 */
export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    try {
        const { ids } = await request.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: '無效的請求 ID' }, { status: 400 });
        }

        const { error } = await supabase
            .from('external_intelligence')
            .delete()
            .in('id', ids)
            .eq('user_id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: `成功刪除 ${ids.length} 則情報。` });
    } catch (error) {
        console.error('[Intelligence Delete] Error:', error);
        return NextResponse.json(
            { error: '刪除失敗', details: String(error) },
            { status: 500 }
        );
    }
}
