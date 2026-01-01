/**
 * Agent API 端點
 * GET /api/agents - 列出所有可用的 Agent
 * POST /api/agents - 建立新的 Agent
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toApiErrorResponse } from '@/lib/errors';
import type { ApiResponse, ApiErrorResponse } from '@/lib/errors';
import type { Agent } from '@/types';

/**
 * GET /api/agents
 * 列出所有使用者有權限存取的 Agent
 */
export async function GET(_request: NextRequest): Promise<NextResponse<ApiResponse<Agent[]> | ApiErrorResponse>> {
  try {
    const supabase = await createClient();

    // 取得目前使用者
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        toApiErrorResponse(new Error('未授權')),
        { status: 401 }
      );
    }

    // TODO: 實作權限檢查邏輯
    // 根據使用者角色與部門過濾 Agent

    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        toApiErrorResponse(error),
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: agents || [],
    });
  } catch (error) {
    return NextResponse.json(
      toApiErrorResponse(error),
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents
 * 建立新的 Agent（需要 DEPT_ADMIN 或 SUPER_ADMIN 權限）
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Agent> | ApiErrorResponse>> {
  try {
    const supabase = await createClient();

    // 取得目前使用者
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        toApiErrorResponse(new Error('未授權')),
        { status: 401 }
      );
    }

    // 取得使用者角色以進行權限檢查
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, department_id')
      .eq('id', user.id)
      .single();

    if (!profile || !['SUPER_ADMIN', 'DEPT_ADMIN'].includes(profile.role)) {
      return NextResponse.json(
        toApiErrorResponse(new Error('權限不足，僅管理員可建立 Agent')),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, system_prompt, model_version, temperature } = body;

    // 驗證必填欄位
    if (!name || !system_prompt || !model_version) {
      return NextResponse.json(
        toApiErrorResponse(new Error('缺少必填欄位：name, system_prompt, model_version')),
        { status: 400 }
      );
    }

    // 建立 Agent
    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        name,
        description,
        system_prompt,
        model_version,
        temperature: temperature ?? 0.7,
        department_id: profile.role === 'DEPT_ADMIN' ? profile.department_id : (body.department_id || null),
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        toApiErrorResponse(error),
        { status: 500 }
      );
    }

    // 儲存知識規則 (若有提供)
    const { knowledge_rules } = body;
    if (knowledge_rules && knowledge_rules.length > 0) {
      const { error: rulesError } = await supabase
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
        // 雖然規則失敗，但 Agent 已建立，此處視情況是否要回報錯誤
      }
    }

    return NextResponse.json({
      success: true,
      data: agent,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      toApiErrorResponse(error),
      { status: 500 }
    );
  }
}
