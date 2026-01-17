import { createClient } from '@/lib/supabase/server';

export interface ExecutionReport {
    execution_rate: number;
    status: string;
    related_documents: {
        id: string;
        filename: string;
        ai_summary: string | null;
    }[];
    ai_insight: string;
}

export class StrategyExecutionCalculator {

    async calculateExecutionRate(userId: string): Promise<ExecutionReport> {
        const supabase = await createClient();

        // 1. Try to find explicit strategy metrics from ETL
        // Use userId to filter metrics and satisfy linter
        const { data: metrics } = await supabase
            .from('metric_values')
            .select('*')
            .eq('metric_id', 'strategy_execution_rate')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false })
            .limit(1);

        let executionRate = 0;
        if (metrics && metrics.length > 0) {
            executionRate = metrics[0].value;
        } else {
            // Fallback: Calculate based on closed/completed tasks in 'knowledge_units' or similar
            // For now, return a placeholder or 0
            executionRate = 0;
        }

        // 2. Fetch recent strategy docs
        const { data: docs } = await supabase
            .from('files')
            .select('id, filename, ai_summary')
            .textSearch('search_vector', `'strategy' | 'okr' | 'goal'`)
            .limit(5);

        // 3. Construct response
        return {
            execution_rate: executionRate,
            status: this.getStatus(executionRate),
            related_documents: docs || [],
            // In real implementation, AI insight would be generated here
            ai_insight: `Execution rate is at ${executionRate}%. ${docs?.length ? 'Based on ' + docs.length + ' strategy documents.' : 'No strategy documents found.'}`
        };
    }

    private getStatus(rate: number): string {
        if (rate >= 80) return 'on_track';
        if (rate >= 50) return 'at_risk';
        return 'critical';
    }
}
