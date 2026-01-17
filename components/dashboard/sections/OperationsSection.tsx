/**
 * Dashboard 部門矩陣與風險監控區塊 - 獨立 Server Component
 * 用於 Suspense Streaming SSR
 */
import React from 'react';
import Link from 'next/link';
import { OperationalHealthCalculator } from '@/lib/war-room/kpi/operational-health';
import { RiskAlertSystem } from '@/lib/war-room/kpi/risk-alerts';
import { Activity, ShieldAlert, ChevronRight } from 'lucide-react';

interface OperationsSectionProps {
    userId: string;
}

interface DepartmentScore {
    department_id: string;
    department_name: string;
    score: number;
    metrics: {
        totalFiles: number;
    };
}

interface RiskAlert {
    level: 'critical' | 'high' | 'medium' | 'low' | 'warning' | 'info';
    title: string;
    description: string;
    timestamp: string;
}

export async function OperationsSection({ userId }: OperationsSectionProps) {
    const opsCalc = new OperationalHealthCalculator();
    const riskCalc = new RiskAlertSystem();

    const [ops, risks] = await Promise.all([
        opsCalc.calculateHealthScore(userId),
        riskCalc.detectRisks(userId),
    ]);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* 部門營運矩陣 */}
            <div className="glass-card p-8 rounded-3xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-text-primary">部門營運矩陣</h3>
                        <p className="text-xs text-text-tertiary mt-1">即時同步各事業群 KPI 達成狀態</p>
                    </div>
                    <Activity size={24} className="text-blue-500 opacity-20" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ops.department_scores.map((dept: DepartmentScore) => (
                        <Link
                            key={dept.department_id}
                            href={`/dashboard/department/${dept.department_id}`}
                            className="group p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-blue-500/[0.05] hover:border-blue-500/30 transition-all"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-text-secondary group-hover:text-primary-400 transition-colors uppercase tracking-widest text-sm">{dept.department_name}</span>
                                <span className="font-mono text-xs text-blue-400 font-bold">{dept.metrics.totalFiles} 文件</span>
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

            {/* 全域風險監控牆 */}
            <Link href="/dashboard/intelligence" className="block group">
                <div className="glass-danger p-8 rounded-3xl h-full transition-all hover:shadow-glow-danger relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                        <ShieldAlert size={200} />
                    </div>

                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-text-primary">全域風險監控牆</h3>
                            <p className="text-xs text-text-tertiary mt-1">檢測到 {risks.total_risks} 個高度關注項目</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-blue-400 font-bold">
                            進入攔截中心 <ChevronRight size={14} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {risks.risks.slice(0, 5).map((risk: RiskAlert, i: number) => (
                            <div key={i} className="group/item flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-transparent hover:border-red-500/20 transition-all">
                                <div className={`mt-1 h-2 w-2 rounded-full ${risk.level === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-amber-500'}`} />
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <h4 className="font-bold text-[13px] text-text-primary group-hover/item:text-semantic-danger transition-colors uppercase tracking-tight">{risk.title}</h4>
                                        <span className="text-[10px] font-mono opacity-30">{new Date(risk.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-[11px] text-text-tertiary line-clamp-2 mt-1">{risk.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Link>
        </div>
    );
}
