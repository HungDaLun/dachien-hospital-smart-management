'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/permissions';
import { getCurrentUserProfile } from '@/lib/permissions';

export interface SystemStats {
    totalUsers: number;
    totalFiles: number;
    totalAgents: number;
    totalDepartments: number;
    filesGrowth: { date: string; count: number }[];
    agentDistribution: { name: string; value: number }[];
    recentActivity: {
        id: string;
        action: string;
        user: string;
        time: string;
    }[];
}

/**
 * Get aggregated system statistics
 */
export async function getSystemStats(): Promise<{ success: boolean; data?: SystemStats; error?: string }> {
    try {
        const supabase = await createClient();
        const profile = await getCurrentUserProfile();
        requireAdmin(profile);

        // 1. Basic Counts
        const countPromises = [
            supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
            supabase.from('files').select('*', { count: 'exact', head: true }),
            supabase.from('agents').select('*', { count: 'exact', head: true }),
            supabase.from('departments').select('*', { count: 'exact', head: true })
        ];

        const [usersRes, filesRes, agentsRes, deptsRes] = await Promise.all(countPromises);

        // 2. File Growth (Last 7 days)
        // Note: Group by date in SQL is ideal, but Supabase client is limited. 
        // We'll fetch last 7 days of created_at dates and aggregate in JS for simplicity on small scale.
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentFiles } = await supabase
            .from('files')
            .select('created_at')
            .gte('created_at', sevenDaysAgo.toISOString());

        const filesGrowthMap = new Map<string, number>();
        // Init last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            filesGrowthMap.set(dateStr, 0);
        }

        recentFiles?.forEach(f => {
            const dateStr = f.created_at.split('T')[0];
            if (filesGrowthMap.has(dateStr)) {
                filesGrowthMap.set(dateStr, filesGrowthMap.get(dateStr)! + 1);
            }
        });

        const filesGrowth = Array.from(filesGrowthMap.entries()).map(([date, count]) => ({ date, count }));

        // 3. Agent Distribution by Model
        const { data: agentModels } = await supabase
            .from('agents')
            .select('model_version');

        const modelCounts: Record<string, number> = {};
        agentModels?.forEach(a => {
            modelCounts[a.model_version] = (modelCounts[a.model_version] || 0) + 1;
        });

        const agentDistribution = Object.entries(modelCounts).map(([name, value]) => ({ name, value }));

        // 4. Recent Audit Logs
        // Using existing audit_logs table
        const { data: recentLogs } = await supabase
            .from('audit_logs')
            .select('id, action_type, created_at, user_profiles(display_name)')
            .order('created_at', { ascending: false })
            .limit(5);

        const recentActivity = recentLogs?.map(log => {
            const userProfile = Array.isArray(log.user_profiles)
                ? log.user_profiles[0]
                : log.user_profiles;

            return {
                id: log.id,
                action: log.action_type,
                user: userProfile?.display_name || 'Unknown',
                time: log.created_at
            };
        }) || [];

        return {
            success: true,
            data: {
                totalUsers: usersRes.count || 0,
                totalFiles: filesRes.count || 0,
                totalAgents: agentsRes.count || 0,
                totalDepartments: deptsRes.count || 0,
                filesGrowth,
                agentDistribution,
                recentActivity
            }
        };

    } catch (error: unknown) {
        console.error('Error fetching system stats:', error);
        return { success: false, error: (error as Error).message };
    }
}
