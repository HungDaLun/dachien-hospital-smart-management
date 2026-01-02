
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = createAdminClient();

        // 3. Fetch all active agents
        const { data: agents, error } = await supabase
            .from('agents')
            .select('id, name, created_at')
            .eq('is_active', true);

        if (error) {
            console.error('Error fetching agents:', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }

        // Map agents to OpenAI models format
        // We use agent.name as the ID so Open WebUI displays it nicely.
        // NOTE: This requires chat/completions to support looking up agents by name.
        const models = agents.map((agent) => ({
            id: agent.name, // Use Name as ID for UI display
            object: 'model',
            created: new Date(agent.created_at).getTime() / 1000,
            owned_by: 'system',
            permission: [],
            root: agent.id,
            parent: null,
        }));

        return NextResponse.json({
            object: 'list',
            data: models,
        });
    } catch (error) {
        console.error('Error in models route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
