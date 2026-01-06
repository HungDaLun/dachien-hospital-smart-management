
import dynamic from 'next/dynamic';
import { getCurrentUserProfile } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { Spinner } from '@/components/ui';

// 動態匯入 GalaxyGraph，減少初始 bundle 大小
// ssr: false 因為 ReactFlow 需要瀏覽器 API
const GalaxyGraph = dynamic(
    () => import('@/components/visualization/GalaxyGraph'),
    {
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <Spinner size="lg" />
                    <span className="text-text-tertiary animate-pulse font-black uppercase tracking-[0.2em] text-[10px]">🌌 Initializing Neural Galaxy...</span>
                </div>
            </div>
        ),
        ssr: false
    }
);

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
        <div className="h-[calc(100vh-65px)] -m-6 flex flex-col overflow-hidden bg-background-primary">
            <div className="border-b border-white/5 px-8 py-4 bg-background-secondary/80 backdrop-blur-md flex justify-between items-center z-10">
                <div>
                    <h2 className="text-xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tight">
                        🧠 Enterprise Brain
                        <span className="text-[10px] font-black text-primary-400 bg-primary-500/10 border border-primary-500/20 px-2 py-0.5 rounded-md uppercase tracking-widest">
                            Neural Galaxy 2.0
                        </span>
                    </h2>
                    <p className="text-[10px] text-text-tertiary mt-1 font-bold uppercase tracking-widest">
                        Visualizing Departmental Knowledge Silos & Insights
                        <span className="ml-3 text-secondary-400">· 視覺效果可在右上角切換</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest px-3 py-1 bg-white/[0.03] rounded-full border border-white/5">
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
