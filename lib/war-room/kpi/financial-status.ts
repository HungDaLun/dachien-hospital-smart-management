import { createClient } from '@/lib/supabase/server';


export interface FinancialStatus {
    revenue: number;
    expenses: number;
    profit_margin: number;
    budget_variance: number;
    burn_rate: number;
    runway_months: number;
    forecast_next_quarter: {
        next_month_revenue: number;
        confidence: number;
    };
    ai_insight: string;
}

export class FinancialStatusAnalyzer {

    async analyzeFinancials(userId: string): Promise<FinancialStatus> {
        const supabase = await createClient();

        // 1. Fetch latest financial metrics
        // We look for standard metrics: 'revenue', 'expenses', 'budget'
        const { data: metrics } = await supabase
            .from('metric_values')
            .select('*')
            .in('metric_id', ['revenue', 'expenses', 'budget', 'cash_balance'])
            .eq('is_active', true)
            .eq('user_id', userId)
            .order('timestamp', { ascending: false });

        // Helper to get latest value
        const getLatest = (id: string) => {
            const m = metrics?.find((item: { metric_id: string; value: number }) => item.metric_id === id);
            return m?.value || 0;
        };

        const revenue = getLatest('revenue');
        const expenses = getLatest('expenses');
        const budget = getLatest('budget');
        const cash = getLatest('cash_balance');

        // 2. Calculate Derived KPIs
        const netProfit = revenue - expenses;
        const profitMargin = revenue > 0 ? (netProfit / revenue) : 0;
        const burnRate = expenses; // Simplified: Assuming expenses = burn
        const runwayMonths = burnRate > 0 ? (cash / burnRate) : 0;

        // 3. Generate Forecast (Primitive linear projection for now, or placeholder)
        const forecast = {
            next_month_revenue: revenue * 1.05, // Assumed 5% growth
            confidence: 0.8
        };

        return {
            revenue,
            expenses,
            profit_margin: profitMargin,
            budget_variance: budget > 0 ? (revenue - budget) / budget : 0,
            burn_rate: burnRate,
            runway_months: runwayMonths,
            forecast_next_quarter: forecast,
            ai_insight: `目前利潤率為 ${(profitMargin * 100).toFixed(1)}%。資金跑道約 ${runwayMonths.toFixed(1)} 個月。`
        };
    }
}
