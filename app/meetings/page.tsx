import MeetingSetup from '@/components/meeting/MeetingSetup';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function MeetingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Load Departments
    const { data: departments } = await supabase.from('departments').select('id, name');

    // Load Agents (All active agents)
    const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('id, name, description, avatar_url')
        .eq('is_active', true);

    // Debug logging
    console.log('[MeetingPage] Agents query result:', { agents, agentsError, count: agents?.length });

    return <MeetingSetup
        initialDepartments={departments || []}
        initialAgents={agents || []}
    />;
}
