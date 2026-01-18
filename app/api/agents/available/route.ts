/**
 * GET /api/agents/available
 * 取得超級管家可調度的 Agent 列表
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const supabase = await createClient();

    // 取得所有啟用的 Agent（排除超級管家自己）
    const { data: agents, error } = await supabase
        .from('agents')
        .select('id, name, description, department_id')
        .eq('is_active', true)
        .neq('name', '超級管家'); // 排除自己

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 格式化為調度用途
    const availableAgents = agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        specialization: agent.description, // 用於 LLM 判斷
    }));

    return NextResponse.json({ agents: availableAgents });
}
