import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { StrategyExecutionCalculator } from '@/lib/war-room/kpi/strategy-execution';
import { OperationalHealthCalculator } from '@/lib/war-room/kpi/operational-health';
import { FinancialStatusAnalyzer } from '@/lib/war-room/kpi/financial-status';
import { RiskAlertSystem } from '@/lib/war-room/kpi/risk-alerts';
import KPICard from '@/components/war-room/kpi-cards/KPICard';
import { WAR_ROOM_THEME } from '@/styles/war-room-theme';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-10 text-center">拒絕訪問。請先登入。</div>;
  }

  // Instantiate Calculators
  const strategyCalc = new StrategyExecutionCalculator();
  const opsCalc = new OperationalHealthCalculator();
  const financeCalc = new FinancialStatusAnalyzer();
  const riskCalc = new RiskAlertSystem();

  // Fetch Data Parallelly
  const [strategy, ops, finance, risks] = await Promise.all([
    strategyCalc.calculateExecutionRate(user.id),
    opsCalc.calculateHealthScore(user.id),
    financeCalc.analyzeFinancials(user.id),
    riskCalc.detectRisks(user.id)
  ]);

  return (
    <div
      className="min-h-full p-8"
      style={{
        backgroundColor: WAR_ROOM_THEME.background.primary,
        color: WAR_ROOM_THEME.text.primary,
        minHeight: 'calc(100vh - 64px)' // Adjust for header height
      }}
    >
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">戰情指揮中心總覽</h1>
          <p style={{ color: WAR_ROOM_THEME.text.secondary }}>
            來自 {ops.department_scores?.length || 0} 個活躍部門的即時情報。
          </p>
        </div>

        {/* KPI Grid - Layer 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard
            title="戰略執行率"
            value={`${strategy.execution_rate.toFixed(0)}%`}
            subValue="完成度"
            status={strategy.status === 'critical' ? 'danger' : (strategy.status === 'at_risk' ? 'warning' : 'success')}
            trend="up"
          />
          <KPICard
            title="營運健康度"
            value={`${(ops.overall_health * 100).toFixed(0)}`}
            subValue="/ 100"
            status={ops.status === 'needs_attention' ? 'danger' : 'success'}
          />
          <KPICard
            title="財務跑道"
            value={`${finance.runway_months.toFixed(1)}`}
            subValue="月"
            status={finance.runway_months < 6 ? 'danger' : 'success'}
          />
          <Link href="/dashboard/intelligence" className="block hover:opacity-90 transition-opacity">
            <KPICard
              title="活躍風險"
              value={risks.total_risks}
              subValue={`${risks.critical_count} 重大`}
              status={risks.critical_count > 0 ? 'danger' : (risks.high_count > 0 ? 'warning' : 'success')}
              trend={risks.high_count > 0 ? 'down' : 'up'}
            />
          </Link>
        </div>

        {/* AI Insight Section */}
        <div
          className="p-6 rounded-lg border flex items-start gap-4"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderColor: WAR_ROOM_THEME.accent.secondary
          }}
        >
          <div className="text-2xl">🤖</div>
          <div>
            <h3 className="font-bold mb-1" style={{ color: WAR_ROOM_THEME.accent.secondary }}>AI 戰略洞察</h3>
            <p className="text-sm leading-relaxed" style={{ color: WAR_ROOM_THEME.text.secondary }}>
              {finance.ai_insight || "系統正在分析企業數據模式。目前未檢測到重大異常。"}
            </p>
          </div>
        </div>

        {/* Detailed Sections Placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="p-6 rounded-lg min-h-[300px]" style={{ backgroundColor: WAR_ROOM_THEME.background.secondary }}>
            <h3 className="font-bold mb-4">部門績效</h3>
            <div className="space-y-4">
              {ops.department_scores.map((dept: any) => (
                <Link
                  key={dept.department_id}
                  href={`/dashboard/department/${dept.department_id}`}
                  className="flex justify-between items-center p-3 rounded hover:bg-white/5 transition-colors cursor-pointer"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  <span>{dept.department_name}</span>
                  <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${dept.score * 100}%` }}
                    />
                  </div>
                </Link>
              ))}
              {ops.department_scores.length === 0 && <p className="text-gray-500 text-sm">無部門數據可用。</p>}
            </div>
          </div>

          <Link href="/dashboard/intelligence" className="block">
            <div className="p-6 rounded-lg min-h-[300px] hover:border-gray-600 transition-colors border border-transparent" style={{ backgroundColor: WAR_ROOM_THEME.background.secondary }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">緊急風險</h3>
                <span className="text-xs text-blue-400">查看全部 →</span>
              </div>
              <div className="space-y-4">
                {risks.risks.map((risk: any, i: number) => (
                  <div key={i} className="border-l-2 pl-4 py-1" style={{ borderColor: risk.level === 'critical' ? 'red' : 'orange' }}>
                    <div className="font-medium">{risk.title}</div>
                    <div className="text-xs text-gray-400">{risk.description}</div>
                  </div>
                ))}
                {risks.risks.length === 0 && <p className="text-gray-500 text-sm">未檢測到活躍風險。</p>}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
