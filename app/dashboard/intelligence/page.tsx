import React from 'react';
import { createClient } from '@/lib/supabase/server';
import WatchTopicManager from '@/components/war-room/intelligence/WatchTopicManager';
import { RiskAlertSystem } from '@/lib/war-room/kpi/risk-alerts';
import { WAR_ROOM_THEME } from '@/styles/war-room-theme';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

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
        <div
            className="min-h-full p-8"
            style={{
                backgroundColor: WAR_ROOM_THEME.background.primary,
                color: WAR_ROOM_THEME.text.primary,
                minHeight: 'calc(100vh - 64px)'
            }}
        >
            <div className="max-w-[1600px] mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">戰情預警與情報中心</h1>
                    <p style={{ color: WAR_ROOM_THEME.text.secondary }}>
                        整合企業內部風險警報與全球外部情報監控，提供全方位決策支援。
                    </p>
                </div>

                {/* Internal Risks Section */}
                {internalRisks.risks.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-400">
                            <ShieldAlert size={24} />
                            內部緊急風險警報
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {internalRisks.risks.map((risk: any, i: number) => (
                                <div
                                    key={i}
                                    className="p-5 rounded-lg border border-red-500/20 bg-red-500/5 flex gap-4"
                                >
                                    <div className={`mt-1 ${risk.level === 'critical' ? 'text-red-500' : 'text-orange-500'}`}>
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-1">{risk.title}</h3>
                                        <p className="text-sm opacity-70 mb-2">{risk.description}</p>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 uppercase tracking-wider">
                                            {risk.category}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <WatchTopicManager initialTopics={watchTopics} userId={user.id} />

                <h2 className="text-xl font-bold mb-6">最新情報動態</h2>

                <div className="space-y-4">
                    {intelligence && intelligence.length > 0 ? (
                        intelligence.map((item: any) => (
                            <div
                                key={item.id}
                                className="p-6 rounded-lg border-l-4 mb-4"
                                style={{
                                    backgroundColor: WAR_ROOM_THEME.background.secondary,
                                    borderLeftColor: item.risk_level === 'critical' ? WAR_ROOM_THEME.semantic.danger :
                                        (item.risk_level === 'high' ? WAR_ROOM_THEME.semantic.danger :
                                            (item.risk_level === 'medium' ? WAR_ROOM_THEME.semantic.warning : WAR_ROOM_THEME.semantic.success))
                                }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className={`text-xs font-bold uppercase tracking-wide mb-1 block ${item.risk_level === 'critical' || item.risk_level === 'high' ? 'text-red-500' :
                                            (item.risk_level === 'medium' ? 'text-yellow-500' : 'text-green-500')
                                            }`}>
                                            {item.risk_level === 'critical' ? '重大風險' :
                                                (item.risk_level === 'high' ? '高度風險' :
                                                    (item.risk_level === 'medium' ? '中度風險' : '一般情報'))} • {item.tags?.[0] || '未分類'}
                                        </span>
                                        <h3 className="text-lg font-bold">{item.title}</h3>
                                    </div>
                                    <span className="text-sm text-gray-500">{new Date(item.published_at).toLocaleString()}</span>
                                </div>
                                <p className="text-gray-300 mb-4">
                                    AI 摘要：{item.ai_summary}
                                </p>
                                <div className="flex gap-4 text-sm">
                                    {item.url && <a href={item.url} target="_blank" className="text-blue-400 hover:underline">查看來源 ({item.source})</a>}
                                    <button className="text-purple-400 hover:underline">詢問 AI Agent</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500 bg-gray-900/50 rounded-lg border border-gray-800">
                            <p>尚無情報動態</p>
                            <p className="text-sm mt-2">請新增監控主題以開始接收即時情報。</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
