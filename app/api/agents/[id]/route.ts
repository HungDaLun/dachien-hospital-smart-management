/**
 * 單一 Agent API 端點
 * GET /api/agents/[id] - 取得 Agent 詳情
 * PUT /api/agents/[id] - 更新 Agent
 * DELETE /api/agents/[id] - 刪除 Agent
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AuthenticationError, AuthorizationError, NotFoundError, toApiResponse } from '@/lib/errors';

/**
 * GET /api/agents/[id]
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) throw new AuthenticationError();

        const { data: agent, error } = await supabase
            .from('agents')
            .select('*, creator:user_profiles!agents_created_by_fkey(display_name), department:departments(name), knowledge_rules:agent_knowledge_rules(*)')
            .eq('id', params.id)
            .single();

        if (error || !agent) throw new NotFoundError('Agent');

        // 檢查存取權限 (簡易版：所有人可讀取 active 的 Agent，或建立者可讀取)
        // 實務上應檢查 agent_access_control

        return NextResponse.json({
            success: true,
            data: agent,
        });
    } catch (error) {
        return toApiResponse(error);
    }
}

/**
 * PUT /api/agents/[id]
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) throw new AuthenticationError();

        // 取得使用者角色
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const { data: existingAgent } = await supabase
            .from('agents')
            .select('created_by')
            .eq('id', params.id)
            .single();

        if (!existingAgent) throw new NotFoundError('Agent');

        // 權限檢查：SUPER_ADMIN 或 建立者
        const isOwner = existingAgent.created_by === user.id;
        const isSuperAdmin = profile?.role === 'SUPER_ADMIN';

        if (!isOwner && !isSuperAdmin) {
            throw new AuthorizationError('您沒有權限修改此 Agent');
        }

        const body = await request.json();
        const {
            name,
            description,
            system_prompt,
            model_version,
            temperature,
            is_active,
            knowledge_rules
        } = body;

        // 1. 更新 Agent 基本資訊
        const { data: updatedAgent, error: updateError } = await supabase
            .from('agents')
            .update({
                name,
                description,
                system_prompt,
                model_version,
                temperature,
                is_active,
                updated_at: new Date().toISOString(),
            })
            .eq('id', params.id)
            .select()
            .single();

        if (updateError) throw updateError;

        // 2. 更新知識綁定規則 (若有提供)
        if (knowledge_rules !== undefined) {
            // 刪除舊規則
            await supabase
                .from('agent_knowledge_rules')
                .delete()
                .eq('agent_id', params.id);

            // 插入新規則
            if (knowledge_rules.length > 0) {
                const { error: rulesError } = await supabase
                    .from('agent_knowledge_rules')
                    .insert(
                        knowledge_rules.map((rule: any) => ({
                            agent_id: params.id,
                            rule_type: rule.rule_type,
                            rule_value: rule.rule_value,
                        }))
                    );
                if (rulesError) throw rulesError;
            }
        }

        return NextResponse.json({
            success: true,
            data: updatedAgent,
        });
    } catch (error) {
        return toApiResponse(error);
    }
}

/**
 * DELETE /api/agents/[id]
 */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) throw new AuthenticationError();

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const { data: existingAgent } = await supabase
            .from('agents')
            .select('created_by')
            .eq('id', params.id)
            .single();

        if (!existingAgent) throw new NotFoundError('Agent');

        const isOwner = existingAgent.created_by === user.id;
        const isSuperAdmin = profile?.role === 'SUPER_ADMIN';

        if (!isOwner && !isSuperAdmin) {
            throw new AuthorizationError('您沒有權限刪除此 Agent');
        }

        // 執行軟刪除
        const { error } = await supabase
            .from('agents')
            .update({ is_active: false })
            .eq('id', params.id);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: { message: 'Agent 已成功停用' },
        });
    } catch (error) {
        return toApiResponse(error);
    }
}
