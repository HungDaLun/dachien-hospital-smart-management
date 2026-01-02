/**
 * 單一 Agent API 端點
 * GET /api/agents/[id] - 取得 Agent 詳情
 * PUT /api/agents/[id] - 更新 Agent
 * DELETE /api/agents/[id] - 刪除 Agent
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NotFoundError, toApiResponse } from '@/lib/errors';
import { getCurrentUserProfile, canAccessAgent, requireAdmin } from '@/lib/permissions';

/**
 * GET /api/agents/[id]
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();

        // 取得使用者資料
        const profile = await getCurrentUserProfile();

        const { data: agent, error } = await supabase
            .from('agents')
            .select('*, creator:user_profiles!agents_created_by_fkey(display_name), department:departments(name), knowledge_rules:agent_knowledge_rules(*)')
            .eq('id', params.id)
            .single();

        if (error || !agent) throw new NotFoundError('Agent');

        // 檢查存取權限
        const hasAccess = await canAccessAgent(profile, params.id);
        if (!hasAccess) {
            throw new NotFoundError('Agent'); // 為了安全，不透露 Agent 是否存在
        }

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

        // 取得使用者資料並檢查權限（需要管理員權限）
        const profile = await getCurrentUserProfile();
        requireAdmin(profile);

        const { data: existingAgent } = await supabase
            .from('agents')
            .select('created_by, system_prompt, department_id')
            .eq('id', params.id)
            .single();

        if (!existingAgent) throw new NotFoundError('Agent');

        // 檢查部門權限（DEPT_ADMIN 只能修改自己部門的 Agent）
        if (profile.role === 'DEPT_ADMIN') {
            if (existingAgent.department_id !== profile.department_id) {
                throw new NotFoundError('Agent'); // 為了安全，不透露 Agent 是否存在
            }
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

        // 1.5 若 System Prompt 有變更，儲存版本歷史
        if (system_prompt && system_prompt !== existingAgent.system_prompt) {
            // 取得目前的版本數
            const { count } = await supabase
                .from('agent_prompt_versions')
                .select('*', { count: 'exact', head: true })
                .eq('agent_id', params.id);

            const nextVersion = (count || 0) + 1;

            // 儲存舊版本
            await supabase.from('agent_prompt_versions').insert({
                agent_id: params.id,
                system_prompt: existingAgent.system_prompt,
                version_number: nextVersion,
                created_by: profile.id
            });
        }

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
 * 硬刪除 Agent 及其所有關聯資料
 */
/**
 * DELETE /api/agents/[id]
 * 硬刪除 Agent 及其所有關聯資料
 */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();

        // 取得使用者資料並檢查權限（需要管理員權限）
        const profile = await getCurrentUserProfile();
        requireAdmin(profile);

        const { data: existingAgent } = await supabase
            .from('agents')
            .select('created_by, department_id')
            .eq('id', params.id)
            .single();

        if (!existingAgent) throw new NotFoundError('Agent');

        // 檢查部門權限（DEPT_ADMIN 只能刪除自己部門的 Agent）
        if (profile.role === 'DEPT_ADMIN') {
            if (existingAgent.department_id !== profile.department_id) {
                throw new NotFoundError('Agent'); // 為了安全，不透露 Agent 是否存在
            }
        }

        // 使用 Admin Client 進行刪除，以繞過 RLS 限制，確保能刪除所有關聯資料 (即使是其他使用者的)
        const adminSupabase = await createAdminClient();

        // 1. 先取得所有相關的訊息 ID
        const { data: messages } = await adminSupabase
            .from('chat_messages')
            .select('id')
            .eq('agent_id', params.id);

        const messageIds = messages?.map((m: { id: string }) => m.id) || [];

        // 2. 刪除所有關聯的對話回饋（chat_feedback）
        if (messageIds.length > 0) {
            await adminSupabase
                .from('chat_feedback')
                .delete()
                .in('message_id', messageIds);
        }

        // 3. 刪除所有關聯的對話訊息（chat_messages）
        await adminSupabase
            .from('chat_messages')
            .delete()
            .eq('agent_id', params.id);

        // 4. 刪除所有關聯的對話 Session（chat_sessions）
        await adminSupabase
            .from('chat_sessions')
            .delete()
            .eq('agent_id', params.id);

        // 5. 刪除 Agent 知識規則（agent_knowledge_rules）
        await adminSupabase
            .from('agent_knowledge_rules')
            .delete()
            .eq('agent_id', params.id);

        // 6. 刪除 Agent Prompt 版本歷史（agent_prompt_versions）
        await adminSupabase
            .from('agent_prompt_versions')
            .delete()
            .eq('agent_id', params.id);

        // 7. 刪除 Agent 存取控制（agent_access_control）
        await adminSupabase
            .from('agent_access_control')
            .delete()
            .eq('agent_id', params.id);

        // 8. 刪除使用者收藏中的此 Agent（user_favorites）
        await adminSupabase
            .from('user_favorites')
            .delete()
            .eq('resource_type', 'AGENT')
            .eq('resource_id', params.id);

        // 9. 最後刪除 Agent 本身（硬刪除）
        const { error } = await adminSupabase
            .from('agents')
            .delete()
            .eq('id', params.id);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: { message: 'Agent 已成功刪除' },
        });
    } catch (error) {
        return toApiResponse(error);
    }
}
