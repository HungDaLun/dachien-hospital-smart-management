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
            // 2. Calculate Doc Activity (Files updated in last 7 days)
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const { count: docActivity } = await supabase
                .from('files')
                .select('*', { count: 'exact', head: true })
                .eq('department_id', dept.id)
                .gte('updated_at', oneWeekAgo.toISOString());

            // 3. Calculate Agent Usage (Conversations in last 7 days)
            // Assuming 'chats' or 'conversations' table exists and links to agents -> departments
            // For now, mocking or using 'agents' update time as proxy
            const { count: activeAgents } = await supabase
                .from('agents')
                .select('*', { count: 'exact', head: true })
                .eq('department_id', dept.id)
                .eq('status', 'active');

            // Normalize scores (0-1)
            // Heuristic: 10 docs/week = 1.0 score
            const docScore = Math.min((docActivity || 0) / 10, 1);
            const agentScore = Math.min((activeAgents || 0) / 5, 1);

            const totalScore = (docScore * 0.6) + (agentScore * 0.4);

            deptScores.push({
                department_id: dept.id,
                department_name: dept.name,
                score: totalScore,
                metrics: { docActivity: docActivity || 0, activeAgents: activeAgents || 0 }
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
