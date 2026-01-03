'use client';

import React, { useEffect, useState } from 'react';
import { getSystemStats, SystemStats } from '@/lib/actions/analytics';
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
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

export default function AdminDashboardStats({ dict }: AdminDashboardStatsProps) {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const result = await getSystemStats();
            if (result.success && result.data) {
                setStats(result.data);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
    }

    if (!stats) {
        return <div className="p-8 text-center text-red-500">Failed to load analytics</div>;
    }

    return (
        <div className="space-y-6">
            {/* 1. Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={dict.common?.users || "Users"}
                    value={stats.totalUsers}
                    icon="👥"
                    trend="+2 this week"
                />
                <StatCard
                    title={dict.common?.files || "Files"}
                    value={stats.totalFiles}
                    icon="📄"
                    trend="+15 this week"
                />
                <StatCard
                    title={dict.admin?.agents?.title || "Agents"}
                    value={stats.totalAgents}
                    icon="🤖"
                    trend="Stable"
                />
                <StatCard
                    title={dict.admin?.departments?.title || "Departments"}
                    value={stats.totalDepartments}
                    icon="🏢"
                    trend="No change"
                />
            </div>

            {/* 2. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* File Growth Chart */}
                <Card padding className="h-80">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Growth (7 Days)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.filesGrowth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Agent Distribution Chart */}
                <Card padding className="h-80">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Model Distribution</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.agentDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.agentDistribution.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 text-xs text-gray-500 mt-2">
                            {stats.agentDistribution.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* 3. Recent Activity List */}
            <Card padding>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent System Activity</h3>
                    <a href="/dashboard/admin/audit" className="text-sm text-primary-600 hover:text-primary-700">View All</a>
                </div>
                <div className="space-y-4">
                    {stats.recentActivity.map(log => (
                        <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                    ${log.action.includes('DELETE') ? 'bg-red-100 text-red-600' :
                                        log.action.includes('CREATE') ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}
                                `}>
                                    {log.action.substring(0, 1)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                    <p className="text-xs text-gray-500">by {log.user}</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">
                                {new Date(log.time).toLocaleString()}
                            </span>
                        </div>
                    ))}
                    {stats.recentActivity.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                    )}
                </div>
            </Card>
        </div>
    );
}

function StatCard({ title, value, icon, trend }: { title: string; value: number; icon: string; trend?: string }) {
    return (
        <Card padding className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
                </div>
                <span className="text-2xl p-2 bg-gray-50 rounded-lg">{icon}</span>
            </div>
            {trend && (
                <div className="mt-2 flex items-center text-xs">
                    <span className="text-green-600 font-medium">{trend}</span>
                    {/* <span className="text-gray-400 ml-1">vs last week</span> */}
                </div>
            )}
        </Card>
    );
}
