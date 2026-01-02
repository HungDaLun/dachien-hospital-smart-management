
import { getCurrentUserProfile } from '@/lib/permissions';
import GalaxyGraph from '@/components/visualization/GalaxyGraph';

import { createClient } from '@/lib/supabase/server';

export default async function BrainPage() {
    const profile = await getCurrentUserProfile();

    // Fetch departments if SUPER_ADMIN for the interactive filter
    let departments: Array<{ id: string; name: string }> = [];
    if (profile.role === 'SUPER_ADMIN') {
        const supabase = await createClient();
        const { data } = await supabase
            .from('departments')
            .select('id, name')
            .order('name');
        if (data) departments = data;
    }

    return (
        <div className="h-[calc(100vh-4rem)] -m-6 flex flex-col">
            <div className="border-b px-6 py-3 bg-white flex justify-between items-center shadow-sm z-10">
                <div>
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        🧠 Enterprise Brain
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Beta</span>
                    </h2>
                    <p className="text-xs text-gray-500">Visualizing Departmental Knowledge Silos & Insights</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400">
                        {profile.department_id ? `Scope: Current Department` : 'Scope: Personal'}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <GalaxyGraph
                    initialDepartments={departments}
                    currentUserRole={profile.role}
                />
            </div>
        </div>
    );
}
