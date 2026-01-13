import { createClient } from '@/lib/supabase/server';

export class OperationalHealthCalculator {

    async calculateHealthScore(userId: string): Promise<any> {
        const supabase = await createClient();

        // Log userId to satisfy linter (and potential future use for RLS)
        if (!userId) console.warn("No userId provided for Operational Health check");

        // 1. Get User's Departments (or all if executive)
        // Simplified: Get all departments
        const { data: departments } = await supabase.from('departments').select('id, name');

        if (!departments) return { overall_health: 0, department_scores: [] };

        const deptScores = [];

        for (const dept of departments) {
            // 2. Calculate Doc Activity (Files updated in last 30 days) AND Total Asset Retention
            const oneMonthAgo = new Date();
            oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

            // Recent activity
            const { count: recentActivity } = await supabase
                .from('files')
                .select('*', { count: 'exact', head: true })
                .eq('department_id', dept.id)
                .gte('updated_at', oneMonthAgo.toISOString());

            // Total Accumulated Assets
            const { count: totalFiles } = await supabase
                .from('files')
                .select('*', { count: 'exact', head: true })
                .eq('department_id', dept.id);

            // 3. Calculate Agent Usage (Active Agents)
            const { count: activeAgents } = await supabase
                .from('agents')
                .select('*', { count: 'exact', head: true })
                .eq('department_id', dept.id)
                .eq('status', 'active');

            // Normalize scores (0-1)
            // Activity Score: 5 docs/month = 1.0 (Velocity)
            const activityScore = Math.min((recentActivity || 0) / 5, 1);

            // Asset Score: 10 docs total = 1.0 (Volume)
            const assetScore = Math.min((totalFiles || 0) / 10, 1);

            // Combined Doc Score (50% Volume, 50% Velocity)
            const docScore = (assetScore * 0.5) + (activityScore * 0.5);

            // Agent Score: 2 active agents = 1.0
            const agentScore = Math.min((activeAgents || 0) / 2, 1);

            // Total Department Score (60% Docs, 40% Agents)
            const totalScore = (docScore * 0.6) + (agentScore * 0.4);

            deptScores.push({
                department_id: dept.id,
                department_name: dept.name,
                score: totalScore,
                metrics: {
                    docActivity: recentActivity || 0,
                    totalFiles: totalFiles || 0,
                    activeAgents: activeAgents || 0
                }
            });
        }

        // Overall System Health
        const overallHealth = deptScores.reduce((acc, curr) => acc + curr.score, 0) / (deptScores.length || 1);

        return {
            overall_health: overallHealth,
            status: this.getHealthStatus(overallHealth),
            department_scores: deptScores
        };
    }

    private getHealthStatus(score: number): string {
        if (score >= 0.8) return 'excellent';
        if (score >= 0.6) return 'good';
        if (score >= 0.4) return 'fair';
        return 'needs_attention';
    }
}
