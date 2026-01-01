/**
 * GET /api/agents/[id]/stats
 * 取得 Agent 使用量統計
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AuthenticationError, toApiResponse } from '@/lib/errors';

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) throw new AuthenticationError();

        // 1. 總 Session 數
        const { count: sessionCount, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('agent_id', params.id);

        if (sessionError) throw sessionError;

        // 2. 總訊息數與 Token 數
        // 由於 Supabase client 不支援直接 SUM，這邊先取得 count，Token 部分若量大建議用 RPC
        // 為了 MVP，我們先僅計算訊息數，並嘗試用 JS 加總 Token (若量不大)
        // 優化：直接 select sum(token_count) from chat_messages where agent_id = ... 需透過 RPC 或 raw SQL
        // 這裡暫時只計算 Count，Token 留待未來優化
        const { count: messageCount, error: messageError } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('agent_id', params.id);

        if (messageError) throw messageError;

        return NextResponse.json({
            success: true,
            data: {
                total_sessions: sessionCount || 0,
                total_messages: messageCount || 0,
                // total_tokens: 0 // 暫不實作，需 RPC 支援
            },
        });
    } catch (error) {
        return toApiResponse(error);
    }
}
