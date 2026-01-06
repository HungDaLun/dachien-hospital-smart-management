import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { StrategyExecutionCalculator } from '@/lib/war-room/kpi/strategy-execution';
import { OperationalHealthCalculator } from '@/lib/war-room/kpi/operational-health';
import { FinancialStatusAnalyzer } from '@/lib/war-room/kpi/financial-status';
import { RiskAlertSystem } from '@/lib/war-room/kpi/risk-alerts';
import { CorporateStrategyAnalyzer } from '@/lib/war-room/kpi/corporate-strategy';
import { WarRoomDataProvider } from '@/lib/war-room/kpi/war-room-data-provider';
import KPICard from '@/components/war-room/kpi-cards/KPICard';
import DashboardCharts from '@/components/war-room/charts/DashboardCharts';
import InsightRefreshButton from '@/components/war-room/InsightRefreshButton';
import { ChevronRight, Cpu, Activity, ShieldAlert, Globe, Clock } from 'lucide-react';

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
  const strategyAnalyzer = new CorporateStrategyAnalyzer();
  const dataProvider = new WarRoomDataProvider();

  // Fetch Data Parallelly - 使用快取版本的 AI 分析
  const [strategy, ops, finance, risks, aiInsight, dashboardData] = await Promise.all([
    strategyCalc.calculateExecutionRate(user.id),
    opsCalc.calculateHealthScore(user.id),
    financeCalc.analyzeFinancials(user.id),
    riskCalc.detectRisks(user.id),
    strategyAnalyzer.getLatestInsight(user.id),  // 從快取讀取，不即時呼叫 AI
    dataProvider.fetchAllData(user.id)
  ]);

  return (
    <div
      className="min-h-screen p-6 xl:p-10 font-sans"
      style={{
        backgroundColor: '#020617',
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(30, 58, 138, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
        `,
        color: '#f8fafc',
      }}
    >
      <div className="w-full mx-auto space-y-10">
        {/* Header Section with System Status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Cpu size={24} />
              </div>
              <h1 className="text-4xl font-black tracking-tight uppercase">戰術指揮中心總覽</h1>
            </div>
            <p className="text-gray-400 font-medium">企業大腦實時數據監控系統 v2.5</p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              SYSTEM LIVE
            </div>
            <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold flex items-center gap-2">
              <Globe size={14} />
              GLOBAL SYNCED
            </div>
            <div className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold flex items-center gap-2">
              <Clock size={14} />
              每日 05:00 更新
            </div>
          </div>
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

        {/* AI Insight Section - Enhanced Glassmorphism */}
        <div
          className="p-8 rounded-3xl border border-white/10 flex flex-col lg:flex-row items-stretch gap-8 transition-all hover:shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden relative"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Cpu size={200} />
          </div>

          <div className="flex flex-col items-center justify-center lg:w-48 gap-4 border-r border-white/5 pr-8">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-4xl shadow-inner">
              🤖
            </div>
            <div className="text-center">
              <div className="text-[10px] font-black text-blue-400 tracking-tighter mb-1 uppercase">Strategic Core</div>
              <div className="text-xs font-mono opacity-40 mb-3">GEMINI-3 PRO</div>
              <InsightRefreshButton />
            </div>
          </div>

          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl font-bold text-white tracking-wide">AI 跨部門全域戰略分析系統</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-200 leading-relaxed space-y-4 whitespace-pre-wrap text-sm md:text-base">
                {aiInsight}
              </div>
            </div>
          </div>
        </div>

        {/* 部門營運矩陣 + 全域風險監控牆 - 調整至 AI 分析下方 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold">部門營運矩陣</h3>
                <p className="text-xs text-gray-500 mt-1">即時同步各事業群 KPI 達成狀態</p>
              </div>
              <Activity size={24} className="text-blue-500 opacity-20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ops.department_scores.map((dept: any) => (
                <Link
                  key={dept.department_id}
                  href={`/dashboard/department/${dept.department_id}`}
                  className="group p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-blue-500/[0.05] hover:border-blue-500/30 transition-all"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-300 group-hover:text-blue-400 transition-colors uppercase tracking-wider text-sm">{dept.department_name}</span>
                    <span className="font-mono text-xs text-blue-400 font-bold">{Math.round(dept.score * 100)}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-1000"
                      style={{ width: `${dept.score * 100}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <Link href="/dashboard/intelligence" className="block group">
            <div className="p-8 rounded-3xl h-full transition-all border border-white/5 hover:border-red-500/30 relative overflow-hidden" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
              <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <ShieldAlert size={200} />
              </div>

              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold">全域風險監控牆</h3>
                  <p className="text-xs text-gray-500 mt-1">檢測到 {risks.total_risks} 個高度關注項目</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-400 font-bold">
                  進入攔截中心 <ChevronRight size={14} />
                </div>
              </div>

              <div className="space-y-4">
                {risks.risks.slice(0, 5).map((risk: any, i: number) => (
                  <div key={i} className="group/item flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-transparent hover:border-red-500/20 transition-all">
                    <div className={`mt-1 h-2 w-2 rounded-full ${risk.level === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-amber-500'}`} />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-bold text-sm text-gray-300 group-hover/item:text-red-400 transition-colors">{risk.title}</h4>
                        <span className="text-[10px] font-mono opacity-30">{new Date(risk.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{risk.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        </div>

        {/* 全維度數據可視化中心 - 移至最後 */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Activity size={20} className="text-blue-400" />
            <h2 className="text-xl font-bold tracking-widest uppercase">全維度數據可視化中心</h2>
            <span className="text-xs text-gray-500 ml-4">30+ 核心監控指標</span>
          </div>
          <DashboardCharts data={dashboardData} />
        </div>
      </div>
    </div>
  );
}
