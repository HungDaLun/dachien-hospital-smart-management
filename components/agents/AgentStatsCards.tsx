'use client';

/**
 * Agent 統計數據卡片元件
 * 遵循 EAKAP 科技戰情室設計系統規範
 */
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { Dictionary } from '@/lib/i18n/dictionaries';
import {
    MessageSquare,
    TrendingUp,
    BarChart3,
    Activity
} from 'lucide-react';

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

interface AgentStatsCardsProps {
    dict: Dictionary;
}

export function AgentStatsCards({ dict }: AgentStatsCardsProps) {
    const [stats, setStats] = useState<AgentStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/agents/stats', {
                    credentials: 'include',
                });
                const json = await res.json();
                if (json.success) {
                    setStats(json.data);
                } else {
                    console.error('Failed to fetch agent stats:', json.error);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} variant="glass" className="h-28 animate-pulse border-white/5 bg-white/[0.02]" />
                ))}
            </div>
        );
    }

    if (!stats) return null;

    const statItems = [
        {
            label: dict.agents.stats.title.replace("使用量統計", "總分析節點數"),
            value: stats.totalAgents,
            unit: dict.agents.form.stats_unit || 'UNIT',
            icon: BarChart3,
            color: 'text-primary-400',
            bg: 'bg-primary-500/10',
            border: 'border-primary-500/20',
            glow: 'shadow-glow-cyan/5'
        },
        {
            label: dict.agents.stats.active_users.replace("活躍使用者", "部署狀態：在線"),
            value: stats.activeAgents,
            unit: dict.agents.form.stats_unit || 'UNIT',
            icon: Activity,
            color: 'text-semantic-success',
            bg: 'bg-semantic-success/10',
            border: 'border-semantic-success/20',
            glow: 'shadow-glow-green/5'
        },
        {
            label: dict.agents.stats.total_chats,
            value: stats.totalSessions,
            unit: dict.agents.form.stats_times || 'VOL',
            icon: MessageSquare,
            color: 'text-secondary-400',
            bg: 'bg-secondary-500/10',
            border: 'border-secondary-500/20',
            glow: 'shadow-glow-purple/5'
        },
        {
            label: "戰力排行 :: 最熱門節點",
            value: stats.popularAgents[0]?.name || dict.common.no_data,
            unit: stats.popularAgents[0] ? `${stats.popularAgents[0].count} SEQ` : '',
            icon: TrendingUp,
            color: 'text-semantic-warning',
            bg: 'bg-semantic-warning/10',
            border: 'border-semantic-warning/20',
            glow: 'shadow-glow-yellow/5',
            isTextValue: true
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {statItems.map((item, idx) => (
                <Card
                    key={idx}
                    variant="glass"
                    className={`p-6 border-white/5 hover:border-white/10 transition-all duration-500 relative overflow-hidden group`}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />

                    <div className="flex flex-col h-full justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-60">
                                {item.label}
                            </span>
                            <div className={`p-2 rounded-xl ${item.bg} ${item.border} ${item.color} ${item.glow}`}>
                                <item.icon size={16} />
                            </div>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <div className={`text-2xl font-black ${item.isTextValue ? 'text-lg truncate max-w-[150px]' : 'text-3xl font-mono'} text-text-primary`}>
                                {item.value}
                            </div>
                            {item.unit && (
                                <span className={`text-[10px] font-black uppercase tracking-widest opacity-30 ${item.color}`}>
                                    {item.unit}
                                </span>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
