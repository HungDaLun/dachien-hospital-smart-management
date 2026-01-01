/**
 * GET /api/agents/[id]/stats
 * 取得 Agent 使用量統計
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NotFoundError, toApiResponse } from '@/lib/errors';
import { getCurrentUserProfile, canAccessAgent } from '@/lib/permissions';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const profile = await getCurrentUserProfile();

        // 權限檢查：只有能存取該 Agent 的人才能看統計
        const hasAccess = await canAccessAgent(profile, id);
        if (!hasAccess) {
            throw new NotFoundError('Agent');
        }

        const supabase = await createClient();

        // 1. 總 Session 數
        const { count: sessionCount, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('agent_id', id);

        if (sessionError) throw sessionError;

        // 2. 總訊息數
        const { count: messageCount, error: messageError } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('agent_id', id);

        if (messageError) throw messageError;

        return NextResponse.json({
            success: true,
            data: {
                total_sessions: sessionCount || 0,
                total_messages: messageCount || 0,
            },
        });
    } catch (error) {
        return toApiResponse(error);
    }
}
