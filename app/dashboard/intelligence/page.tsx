import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import WatchTopicManager from '@/components/war-room/intelligence/WatchTopicManager';
import { RiskAlertSystem } from '@/lib/war-room/kpi/risk-alerts';
import { AlertTriangle, ChevronLeft } from 'lucide-react';
import SyncIntelligenceButton from '@/components/war-room/intelligence/SyncIntelligenceButton';
import IntelligenceList from '@/components/war-room/intelligence/IntelligenceList';

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
                <div className="mb-6">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-text-tertiary hover:text-primary-400 transition-colors group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold tracking-widest uppercase">返回控制面板</span>
                    </Link>
                </div>

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
                            {internalRisks.risks.map((risk: { level: string; title: string; description: string; category: string }, i: number) => (
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
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(0,217,255,0.5)]" />
                            <h2 className="text-xl font-bold tracking-widest uppercase">最新情報動態</h2>
                        </div>
                        <SyncIntelligenceButton />
                    </div>

                    <IntelligenceList items={intelligence || []} />
                </div>
            </div>
        </div>
    );
}
