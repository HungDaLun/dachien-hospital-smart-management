/**
 * Dashboard KPI 區塊 - 獨立 Server Component
 * 用於 Suspense Streaming SSR
 */
import React from 'react';
import Link from 'next/link';
import { StrategyExecutionCalculator } from '@/lib/war-room/kpi/strategy-execution';
import { OperationalHealthCalculator } from '@/lib/war-room/kpi/operational-health';
import { FinancialStatusAnalyzer } from '@/lib/war-room/kpi/financial-status';
import { RiskAlertSystem } from '@/lib/war-room/kpi/risk-alerts';
import KPICard from '@/components/war-room/kpi-cards/KPICard';

interface KPISectionProps {
    userId: string;
}

export async function KPISection({ userId }: KPISectionProps) {
    // 並行獲取所有 KPI 資料
    const strategyCalc = new StrategyExecutionCalculator();
    const opsCalc = new OperationalHealthCalculator();
    const financeCalc = new FinancialStatusAnalyzer();
    const riskCalc = new RiskAlertSystem();

    const [strategy, ops, finance, risks] = await Promise.all([
        strategyCalc.calculateExecutionRate(userId),
        opsCalc.calculateHealthScore(userId),
        financeCalc.analyzeFinancials(userId),
        riskCalc.detectRisks(userId),
    ]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard
                title="戰略執行率"
                value={`${strategy.execution_rate.toFixed(0)}%`}
                subValue="完成度"
                status={strategy.status === 'critical' ? 'danger' : (strategy.status === 'at_risk' ? 'warning' : 'success')}
                trend="up"
                infoKey="strategyExecution"
            />
            <KPICard
                title="營運健康度"
                value={`${(ops.overall_health * 100).toFixed(0)}`}
                subValue="/ 100"
                status={ops.status === 'needs_attention' ? 'danger' : 'success'}
                infoKey="operationalHealth"
            />
            <KPICard
                title="財務跑道"
                value={`${finance.runway_months.toFixed(1)}`}
                subValue="月"
                status={finance.runway_months < 6 ? 'danger' : 'success'}
                infoKey="financialRunway"
            />
            <Link href="/dashboard/intelligence" className="block hover:opacity-90 transition-opacity">
                <KPICard
                    title="活躍風險"
                    value={risks.total_risks}
                    subValue={`${risks.critical_count} 重大`}
                    status={risks.critical_count > 0 ? 'danger' : (risks.high_count > 0 ? 'warning' : 'success')}
                    trend={risks.high_count > 0 ? 'down' : 'up'}
                    infoKey="activeRisks"
                />
            </Link>
        </div>
    );
}
