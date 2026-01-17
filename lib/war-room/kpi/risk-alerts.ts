import { createClient } from '@/lib/supabase/server';
import { FinancialStatusAnalyzer } from './financial-status';
import { OperationalHealthCalculator } from './operational-health';

export class RiskAlertSystem {
    private financialAnalyzer = new FinancialStatusAnalyzer();
    private opsCalculator = new OperationalHealthCalculator();

    async detectRisks(userId: string): Promise<RiskReport> {
        const supabase = await createClient(); // Initialize async

        const risks: RiskItem[] = [];

        // 1. Check Financial Risks
        const finance = await this.financialAnalyzer.analyzeFinancials(userId);
        if (finance.burn_rate > 0 && finance.runway_months < 6) {
            risks.push({
                level: finance.runway_months < 3 ? 'critical' : 'high',
                category: 'financial',
                title: '資金跑道短缺警報',
                description: `資金跑道剩餘 ${finance.runway_months.toFixed(1)} 個月。`,
                timestamp: new Date().toISOString()
            });
        }

        // 2. Check Operational Risks
        const ops = await this.opsCalculator.calculateHealthScore(userId);
        if (ops.status === 'needs_attention') {
            risks.push({
                level: 'medium',
                category: 'operational',
                title: '檢測到活動低落',
                description: '部門活動顯著低於平均水平。',
                timestamp: new Date().toISOString()
            });
        }

        // 3. Check External Intelligence Risks
        const { data: externalRisks } = await supabase
            .from('external_intelligence')
            .select('*')
            .eq('user_id', userId)
            .or('risk_level.eq.high,risk_level.eq.critical,risk_level.eq.medium')
            .eq('status', 'pending')
            .order('published_at', { ascending: false })
            .limit(10);

        if (externalRisks) {
            interface ExternalRiskRow {
                risk_level: 'critical' | 'high' | 'medium' | 'low';
                title: string;
                ai_summary: string;
                published_at: string;
            }

            externalRisks.forEach((r: ExternalRiskRow) => {
                risks.push({
                    level: r.risk_level,
                    category: 'external',
                    title: r.title,
                    description: r.ai_summary,
                    timestamp: r.published_at
                });
            });
        }

        // 4. Sort by severity
        const severityMap: Record<string, number> = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        risks.sort((a, b) => severityMap[b.level] - severityMap[a.level]);

        return {
            total_risks: risks.length,
            critical_count: risks.filter(r => r.level === 'critical').length,
            high_count: risks.filter(r => r.level === 'high').length,
            risks: risks
        };
    }
}

export interface RiskItem {
    level: 'critical' | 'high' | 'medium' | 'low';
    category: 'financial' | 'operational' | 'external' | 'compliance';
    title: string;
    description: string;
    timestamp: string;
}

export interface RiskReport {
    total_risks: number;
    critical_count: number;
    high_count: number;
    risks: RiskItem[];
}
