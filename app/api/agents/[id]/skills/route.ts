import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params; // agent_id
    const supabase = await createClient();

    try {
        const { skillId } = await request.json();

        if (!skillId) {
            return NextResponse.json(
                { success: false, error: 'Missing skillId' },
                { status: 400 }
            );
        }

        // 1. Get the Agent
        const { data: agent, error: agentError } = await supabase
            .from('agents')
            .select('enabled_skills, enabled_tools')
            .eq('id', id)
            .single();

        if (agentError || !agent) {
            return NextResponse.json(
                { success: false, error: 'Agent not found' },
                { status: 404 }
            );
        }

        // 2. Get the Skill
        const { data: skill, error: skillError } = await supabase
            .from('skills_library')
            .select('id, required_tools')
            .eq('id', skillId)
            .single();

        if (skillError || !skill) {
            return NextResponse.json(
                { success: false, error: 'Skill not found' },
                { status: 404 }
            );
        }

        // 3. Update Agent
        // Merge Skills
        const currentSkills = agent.enabled_skills || [];
        const newSkills = currentSkills.includes(skill.id)
            ? currentSkills
            : [...currentSkills, skill.id];

        // Merge Tools
        const currentTools = agent.enabled_tools || [];
        const requiredTools = skill.required_tools || [];
        const newTools = [...new Set([...currentTools, ...requiredTools])];

        const { error: updateError } = await supabase
            .from('agents')
            .update({
                enabled_skills: newSkills,
                enabled_tools: newTools,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error installing skill:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
