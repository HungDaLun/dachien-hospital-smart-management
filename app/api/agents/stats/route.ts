import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/lib/permissions';
import { toApiResponse } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/agents/stats
 * 取得 Agent 統計數據
 * - 總 Agent 數
 * - 活躍 Agent 數
 * - 總對話數 (Session count)
 * - 熱門 Agent (基於 Session 數)
 */
export async function GET(_request: NextRequest) {
    try {
        const supabase = await createClient();

        // 確保使用者已登入
        await getCurrentUserProfile();

        // 1. 查詢 Agent 總數與活躍數
        const agentsResult = await supabase
            .from('agents')
            .select('id, is_active, name, model_version');

        if (agentsResult.error) throw agentsResult.error;

        const agents = agentsResult.data || [];
        const totalAgents = agents.length;
        const activeAgents = agents.filter(a => a.is_active).length;

        // 2. 查詢總對話數 (Session Count)
        const sessionsResult = await supabase
            .from('chat_sessions')
            .select('id, agent_id', { count: 'exact' });

        if (sessionsResult.error) throw sessionsResult.error;

        const totalSessions = sessionsResult.count || 0;
        const sessions = sessionsResult.data || [];

        // 3. 計算熱門 Agent (在記憶體中聚合，MVP 方案)
        // 預期資料量不大，若資料量大應改用 RPC 或 View
        const sessionCounts: Record<string, number> = {};
        sessions.forEach(session => {
            if (session.agent_id) {
                sessionCounts[session.agent_id] = (sessionCounts[session.agent_id] || 0) + 1;
            }
        });

        // 轉換為陣列並排序
        const popularAgents = Object.entries(sessionCounts)
            .map(([agentId, count]) => {
                const agent = agents.find(a => a.id === agentId);
                return {
                    id: agentId,
                    name: agent?.name || 'Unknown Agent',
                    count
                };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 3); // 取前 3 名

        return NextResponse.json({
            success: true,
            data: {
                totalAgents,
                activeAgents,
                totalSessions,
                popularAgents
            }
        });

    } catch (error) {
        return toApiResponse(error);
    }
}
