/**
 * Agent API 端點
 * GET /api/agents - 列出所有可用的 Agent
 * POST /api/agents - 建立新的 Agent
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toApiResponse } from '@/lib/errors';
import type { ApiResponse, ApiErrorResponse } from '@/lib/errors';
import type { Agent } from '@/types';
import { getCurrentUserProfile, requireAdmin } from '@/lib/permissions';

/**
 * GET /api/agents
 * 列出所有使用者有權限存取的 Agent
 */
export async function GET(_request: NextRequest): Promise<NextResponse<ApiResponse<Agent[]> | ApiErrorResponse>> {
  try {
    const supabase = await createClient();

    // 取得使用者資料（僅用於驗證登入）
    await getCurrentUserProfile();

    // 所有已登入使用者都可以查看 Agent 列表
    // RLS 會根據 agent_access_control 過濾結果

    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return toApiResponse(error);
    }

    return NextResponse.json({
      success: true,
      data: agents || [],
    });
  } catch (error) {
    return toApiResponse(error);
  }
}

/**
 * POST /api/agents
 * 建立新的 Agent（需要 DEPT_ADMIN 或 SUPER_ADMIN 權限）
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Agent> | ApiErrorResponse>> {
  try {
    // 取得使用者資料並檢查權限（需要管理員權限）
    const profile = await getCurrentUserProfile();
    requireAdmin(profile);

    // 建立 Agent 需要繞過 RLS 的 Select 限制 (Insert 後 Select 回來)
    const adminSupabase = await createAdminClient();

    const body = await request.json();
    const { name, description, system_prompt, model_version, temperature, knowledge_files, mcp_config, enabled_tools, enabled_skills } = body;

    // 驗證必填欄位
    if (!name || !system_prompt || !model_version) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '缺少必填欄位：name, system_prompt, model_version' } },
        { status: 400 }
      );
    }

    // 建立 Agent
    const { data: agent, error } = await adminSupabase
      .from('agents')
      .insert({
        name,
        description,
        system_prompt,
        model_version,
        temperature: temperature ?? 0.7,
        knowledge_files: Array.isArray(knowledge_files)
          ? knowledge_files.filter((id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
          : [],
        mcp_config: mcp_config || {},
        enabled_tools: Array.isArray(enabled_tools) ? enabled_tools : [],
        enabled_skills: Array.isArray(enabled_skills) ? enabled_skills : [],
        department_id: profile.role === 'DEPT_ADMIN' ? profile.department_id : (body.department_id || null),
        created_by: profile.id,
      })
      .select()
      .single();

    if (error) {
      return toApiResponse(error);
    }

    // 儲存知識規則 (若有提供)
    const { knowledge_rules } = body;
    if (knowledge_rules && knowledge_rules.length > 0) {
      const { error: rulesError } = await adminSupabase
        .from('agent_knowledge_rules')
        .insert(
          knowledge_rules.map((rule: any) => ({
            agent_id: agent.id,
            rule_type: rule.rule_type,
            rule_value: rule.rule_value,
          }))
        );

      if (rulesError) {
        console.error('儲存 Agent 規則失敗:', rulesError);
      }
    }

    return NextResponse.json({
      success: true,
      data: agent,
    }, { status: 201 });
  } catch (error) {
    return toApiResponse(error);
  }
}
