/**
 * 對話 Session API
 * 列出使用者的對話歷史
 * 遵循 EAKAP API 規範
 */
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationError, toApiResponse } from '@/lib/errors';

/**
 * GET /api/chat/sessions
 * 列出使用者的對話 Sessions
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // 驗證使用者身份
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new AuthenticationError();
        }

        // 解析查詢參數
        const { searchParams } = new URL(request.url);
        const agentId = searchParams.get('agent_id');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
        const offset = (page - 1) * limit;

        // 建立查詢
        let query = supabase
            .from('chat_sessions')
            .select(`
        *,
        agents (
          id,
          name,
          avatar_url
        )
      `, { count: 'exact' })
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        // 按 Agent 篩選
        if (agentId) {
            query = query.eq('agent_id', agentId);
        }

        // 分頁
        query = query.range(offset, offset + limit - 1);

        const { data: sessions, count, error } = await query;

        if (error) {
            console.error('查詢 Sessions 失敗:', error);
            return NextResponse.json(
                { success: false, error: { code: 'QUERY_ERROR', message: '載入對話歷史失敗' } },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: sessions || [],
            meta: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });

    } catch (error) {
        return toApiResponse(error);
    }
}
