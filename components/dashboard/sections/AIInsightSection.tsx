/**
 * Dashboard AI 洞察區塊 - 獨立 Server Component
 * 用於 Suspense Streaming SSR
 */
import React from 'react';
import { CorporateStrategyAnalyzer } from '@/lib/war-room/kpi/corporate-strategy';
import { Cpu } from 'lucide-react';
import InsightRefreshButton from '@/components/war-room/InsightRefreshButton';

interface AIInsightSectionProps {
    userId: string;
}

export async function AIInsightSection({ userId }: AIInsightSectionProps) {
    const strategyAnalyzer = new CorporateStrategyAnalyzer();
    const aiInsight = await strategyAnalyzer.getLatestInsight(userId);

    return (
        <div
            className="glass-ai p-8 rounded-3xl flex flex-col lg:flex-row items-stretch gap-8 transition-all hover:shadow-glow-purple overflow-hidden relative"
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
                    <div className="text-text-secondary leading-relaxed space-y-4 whitespace-pre-wrap text-sm md:text-base font-medium italic">
                        {aiInsight}
                    </div>
                </div>
            </div>
        </div>
    );
}
