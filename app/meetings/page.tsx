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
    const { data: agents } = await supabase
        .from('agents')
        .select('id, name, description, avatar_url')
        .eq('is_active', true);

    // Load User Profile with Department
    const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('display_name, department_id, departments(name)')
        .eq('id', user.id)
        .single();

    interface UserProfileWithDept {
        display_name: string | null;
        department_id: string | null;
        departments: { name: string } | null;
    }

    return <MeetingSetup
        initialDepartments={departments || []}
        initialAgents={agents || []}
        currentUser={{
            name: userProfile?.display_name || user.email || 'Unknown User',
            department: (userProfile as UserProfileWithDept | null)?.departments?.name || '管理部'
        }}
    />;
}
