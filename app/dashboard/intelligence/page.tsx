import React from 'react';
import { createClient } from '@/lib/supabase/server';
import WatchTopicManager from '@/components/war-room/intelligence/WatchTopicManager';
import { RiskAlertSystem } from '@/lib/war-room/kpi/risk-alerts';
import { AlertTriangle } from 'lucide-react';


export default async function ExternalIntelligencePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div className="p-8 text-white">請先登入以查看情報。</div>;
    }

    // 1. Fetch Watch Topics (from war_room_config)
    let watchTopics = [];
    const { data: config } = await supabase
        .from('war_room_config')
        .select('watch_topics')
        .eq('user_id', user.id)
        .single();

    if (config && config.watch_topics) {
        watchTopics = config.watch_topics;
    }

    // 2. Fetch Internal Risks
    const riskSystem = new RiskAlertSystem();
    const internalRisks = await riskSystem.detectRisks(user.id);

    // 3. Fetch External Intelligence (Risks/News)
    const { data: intelligence } = await supabase
        .from('external_intelligence')
        .select('*')
        .eq('user_id', user.id)
        .order('published_at', { ascending: false })
        .limit(20);

    return (
        <div className="min-h-full p-8 bg-background-primary text-text-primary">
            {/* 背景網格效果 */}
            <div className="war-room-grid fixed inset-0 pointer-events-none z-0 opacity-30" />

            <div className="max-w-7xl mx-auto relative z-10">


                {/* Internal Risks Section */}
                {internalRisks.risks.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-2 w-2 rounded-full bg-semantic-danger shadow-[0_0_10px_rgba(255,51,102,0.5)]" />
                            <h2 className="text-xl font-bold tracking-widest uppercase text-semantic-danger">
                                內部緊急風險警報
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {internalRisks.risks.map((risk: any, i: number) => (
                                <div
                                    key={i}
                                    className="p-6 rounded-2xl border border-semantic-danger/20 bg-semantic-danger/5 backdrop-blur-sm flex gap-4 transition-all hover:bg-semantic-danger/10"
                                >
                                    <div className={`mt-1 ${risk.level === 'critical' ? 'text-semantic-danger' : 'text-semantic-warning'}`}>
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-primary mb-1 text-lg">{risk.title}</h3>
                                        <p className="text-sm text-text-secondary mb-3 leading-relaxed">{risk.description}</p>
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-white font-black uppercase tracking-[0.2em]">
                                            {risk.category}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-12">
                    <WatchTopicManager initialTopics={watchTopics} userId={user.id} />
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="h-2 w-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(0,217,255,0.5)]" />
                        <h2 className="text-xl font-bold tracking-widest uppercase">最新情報動態</h2>
                    </div>

                    <div className="space-y-4">
                        {intelligence && intelligence.length > 0 ? (
                            intelligence.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="p-6 rounded-2xl border border-white/5 bg-background-secondary/50 backdrop-blur-sm transition-all hover:border-white/10"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 block ${item.risk_level === 'critical' || item.risk_level === 'high' ? 'text-semantic-danger' :
                                                (item.risk_level === 'medium' ? 'text-semantic-warning' : 'text-semantic-success')
                                                }`}>
                                                {item.risk_level === 'critical' ? '重大風險' :
                                                    (item.risk_level === 'high' ? '高度風險' :
                                                        (item.risk_level === 'medium' ? '中度風險' : '一般情報'))} • {item.tags?.[0] || '未分類'}
                                            </span>
                                            <h3 className="text-xl font-bold text-text-primary">{item.title}</h3>
                                        </div>
                                        <span className="text-xs text-text-tertiary font-mono">{new Date(item.published_at).toLocaleString()}</span>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-6">
                                        <p className="text-text-secondary text-sm leading-relaxed">
                                            <span className="text-primary-400 font-bold mr-2">AI 摘要:</span>
                                            {item.ai_summary}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm font-bold tracking-wide">
                                        {item.url && (
                                            <a href={item.url} target="_blank" className="text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-2 group">
                                                查看來源 <span className="opacity-40 group-hover:opacity-100 font-normal">({item.source})</span>
                                            </a>
                                        )}
                                        <button className="text-secondary-400 hover:text-secondary-300 transition-colors flex items-center gap-2">
                                            詢問 AI AGENT
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-text-tertiary bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                                <div className="text-4xl mb-4 opacity-20">📡</div>
                                <h3 className="text-xl font-bold text-text-secondary mb-2">尚無情報動態</h3>
                                <p className="text-sm">請新增監控主題以開始接收即時情報。</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
