'use client';

import React from 'react';
import { SystemStats } from '@/lib/actions/analytics';
import { Card } from '@/components/ui';
import { Dictionary } from '@/lib/i18n/dictionaries';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';

interface AdminDashboardStatsProps {
    dict: Dictionary;
    stats: SystemStats;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

export default function AdminDashboardStats({ dict, stats }: AdminDashboardStatsProps) {
    if (!stats) {
        return (
            <div className="p-20 text-center glass-card border border-semantic-danger/20 rounded-3xl">
                <div className="text-4xl mb-4">⚠️</div>
                <div className="text-semantic-danger font-black uppercase tracking-widest">No analytics data available</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* 1. Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={dict.common?.users || "Users"}
                    value={stats.totalUsers}
                    icon="👥"
                    trend="+2 this week"
                    color="cyan"
                />
                <StatCard
                    title={dict.common?.files || "Files"}
                    value={stats.totalFiles}
                    icon="📄"
                    trend="+15 this week"
                    color="purple"
                />
                <StatCard
                    title={dict.admin?.agents?.title || "Agents"}
                    value={stats.totalAgents}
                    icon="🤖"
                    trend="Stable"
                    color="blue"
                />
                <StatCard
                    title={dict.admin?.departments?.title || "Departments"}
                    value={stats.totalDepartments}
                    icon="🏢"
                    trend="No change"
                    color="green"
                />
            </div>

            {/* 2. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* File Growth Chart */}
                <Card variant="glass" className="min-h-[400px] h-auto p-8 rounded-3xl border border-white/5 shadow-glow-cyan/5">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                        <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">{dict.admin.analytics.knowledge_growth || "Knowledge Growth (7 Days)"}</h3>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.filesGrowth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                    tick={{ fontSize: 10, fill: '#FFFFFF', fontWeight: 'bold' }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fontSize: 10, fill: '#FFFFFF', fontWeight: 'bold' }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(12px)',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                    }}
                                    itemStyle={{ color: '#22d3ee', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#22d3ee"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#22d3ee' }}
                                    activeDot={{ r: 6, fill: '#22d3ee', stroke: '#fff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Agent Distribution Chart */}
                <Card variant="glass" className="min-h-[400px] h-auto p-8 rounded-3xl border border-white/5 shadow-glow-purple/5">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                        <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">{dict.admin.analytics.agent_distribution || "Agent Model Distribution"}</h3>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.agentDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {stats.agentDistribution.map((_entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            className="drop-shadow-lg"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(12px)'
                                    }}
                                    itemStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-text-primary mt-4">
                            {stats.agentDistribution.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <span className="w-3 h-1 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* 3. Recent Activity List */}
            <Card variant="glass" className="p-8 rounded-3xl border border-white/5">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-secondary-500 rounded-full" />
                        <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">{dict.admin.analytics.recent_activity || "Recent System Activity"}</h3>
                    </div>
                    <a href="/dashboard/admin/audit" className="text-[10px] font-black text-primary-400 hover:text-primary-300 uppercase tracking-[0.2em] transition-colors">{dict.admin.analytics.view_all || "View All"} →</a>
                </div>
                <div className="space-y-2">
                    {stats.recentActivity.map(log => (
                        <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border group-hover:scale-110 transition-transform shadow-inner
                                    ${log.action.includes('DELETE') ? 'bg-semantic-danger/10 text-semantic-danger border-semantic-danger/20' :
                                        log.action.includes('CREATE') ? 'bg-semantic-success/10 text-semantic-success border-semantic-success/20' :
                                            'bg-primary-500/10 text-primary-400 border-primary-500/20'}
                                `}>
                                    {log.action.substring(0, 1)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-text-primary uppercase tracking-tight">{log.action}</p>
                                    <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest mt-0.5">OPERATOR ID: <span className="text-text-secondary">{log.user}</span></p>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-text-tertiary bg-white/5 px-3 py-1 rounded-full border border-white/10 group-hover:border-white/20 transition-colors">
                                {new Date(log.time).toLocaleString()}
                            </span>
                        </div>
                    ))}
                    {stats.recentActivity.length === 0 && (
                        <div className="text-center py-12 text-text-tertiary bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                            <p className="text-sm font-black uppercase tracking-[0.2em]">{dict.admin.analytics.no_activity || "No recent activity"}</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

function StatCard({ title, value, icon, trend, color }: { title: string; value: number; icon: string; trend?: string; color: string }) {
    const colorMap: Record<string, string> = {
        cyan: 'from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-500/20 text-cyan-400 shadow-glow-cyan/5',
        purple: 'from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20 text-purple-400 shadow-glow-purple/5',
        blue: 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20 text-blue-400 shadow-glow-blue/5',
        green: 'from-secondary-500/10 via-secondary-500/5 to-transparent border-secondary-500/20 text-secondary-400 shadow-glow-green/5',
    };

    return (
        <Card variant="glass" className={`p-6 rounded-3xl border border-white/5 bg-gradient-to-br transition-all duration-500 hover:scale-[1.02] group ${colorMap[color] || ''}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner group-hover:rotate-12 transition-transform">
                    {icon}
                </div>
                {trend && (
                    <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-text-primary uppercase tracking-widest">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em] mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h4 className="text-3xl font-black text-text-primary tracking-tighter">{value}</h4>
                    <span className="text-[10px] font-mono text-text-tertiary opacity-30">V2.4</span>
                </div>
            </div>
        </Card>
    );
}

