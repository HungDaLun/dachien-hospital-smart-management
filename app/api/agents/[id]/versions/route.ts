/**
 * GET /api/agents/[id]/versions
 * 取得 Agent Prompt 歷史版本
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

        // 權限檢查
        const hasAccess = await canAccessAgent(profile, id);
        if (!hasAccess) {
            throw new NotFoundError('Agent');
        }

        const supabase = await createClient();

        // 查詢歷史版本
        const { data: versions, error } = await supabase
            .from('agent_prompt_versions')
            .select(`
                id,
                version_number,
                system_prompt,
                created_at,
                created_by_user:user_profiles!agent_prompt_versions_created_by_fkey (display_name)
            `)
            .eq('agent_id', id)
            .order('version_number', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: versions || [],
        });
    } catch (error) {
        return toApiResponse(error);
    }
}
