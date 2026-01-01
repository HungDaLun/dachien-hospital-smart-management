/**
 * GET /api/agents/[id]/versions
 * 取得 Agent Prompt 歷史版本
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

        // 查詢歷史版本
        const { data: versions, error } = await supabase
            .from('agent_prompt_versions')
            .select(`
                id,
                version_number,
                system_prompt,
                created_at,
                created_by_user:user_profiles!agent_prompt_versions_created_by_fkey(display_name)
            `)
            .eq('agent_id', params.id)
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
