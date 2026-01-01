'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui';

interface AgentStats {
    totalAgents: number;
    activeAgents: number;
    totalSessions: number;
    popularAgents: Array<{
        id: string;
        name: string;
        count: number;
    }>;
}

export function AgentStatsCards() {
    const [stats, setStats] = useState<AgentStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/agents/stats');
                const json = await res.json();
                if (json.success) {
                    setStats(json.data);
                }
            } catch (error) {
                console.error('Failed to fetch agent stats:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 flex flex-col justify-between border-l-4 border-l-blue-500">
                <span className="text-gray-500 text-sm font-medium">總 Agent 數</span>
                <div className="mt-2 flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">{stats.totalAgents}</span>
                    <span className="ml-2 text-sm text-gray-500">個</span>
                </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between border-l-4 border-l-green-500">
                <span className="text-gray-500 text-sm font-medium">活躍運行中</span>
                <div className="mt-2 flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">{stats.activeAgents}</span>
                    <span className="ml-2 text-sm text-gray-500">個</span>
                </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between border-l-4 border-l-purple-500">
                <span className="text-gray-500 text-sm font-medium">總對話次數</span>
                <div className="mt-2 flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">{stats.totalSessions}</span>
                    <span className="ml-2 text-sm text-gray-500">次</span>
                </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between border-l-4 border-l-orange-500">
                <span className="text-gray-500 text-sm font-medium">✨ 最熱門 Agent</span>
                <div className="mt-2">
                    {stats.popularAgents[0] ? (
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-gray-900 truncate" title={stats.popularAgents[0].name}>
                                {stats.popularAgents[0].name}
                            </span>
                            <span className="text-xs text-gray-500">
                                {stats.popularAgents[0].count} 次對話
                            </span>
                        </div>
                    ) : (
                        <span className="text-gray-400 text-sm">尚無數據</span>
                    )}
                </div>
            </Card>
        </div>
    );
}
