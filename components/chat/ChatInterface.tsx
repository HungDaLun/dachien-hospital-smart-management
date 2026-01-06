/**
 * 對話介面元件
 * 整合 Agent 選擇與對話視窗
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import ChatWindow from './ChatWindow';
import { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * Agent 基本資訊
 */
interface AgentInfo {
    id: string;
    name: string;
    description: string | null;
    avatar_url: string | null;
}

/**
 * 對話介面屬性
 */
interface ChatInterfaceProps {
    agents: AgentInfo[];
    initialAgentId: string | null;
    dict: Dictionary;
}

export default function ChatInterface({ agents, initialAgentId, dict }: ChatInterfaceProps) {
    const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);

    // 初始化選擇的 Agent
    useEffect(() => {
        if (initialAgentId && agents.length > 0) {
            const agent = agents.find((a) => a.id === initialAgentId);
            if (agent) {
                setSelectedAgent(agent);
            }
        }
    }, [initialAgentId, agents]);

    /**
     * 選擇 Agent
     */
    const handleSelectAgent = (agent: AgentInfo) => {
        console.log('選擇 Agent:', agent);
        setSelectedAgent(agent);
    };

    /**
     * 返回選擇器
     */
    const handleBackToSelector = () => {
        setSelectedAgent(null);
    };

    // 如果沒有選擇 Agent，顯示選擇器
    if (!selectedAgent) {
        return (
            <div className="h-full flex flex-col text-text-primary">
                {/* Agent 列表 */}

                {agents.length === 0 ? (
                    <Card variant="glass" className="py-20 border-dashed border-white/10">
                        <div className="text-center text-text-tertiary">
                            <div className="w-20 h-20 mx-auto mb-6 bg-white/[0.03] rounded-3xl flex items-center justify-center text-5xl shadow-inner border border-white/5">
                                🤖
                            </div>
                            <p className="font-bold tracking-widest uppercase">{dict.common.no_data}</p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {agents.map((agent) => (
                            <div
                                key={agent.id}
                                onClick={() => handleSelectAgent(agent)}
                                className="cursor-pointer group"
                            >
                                <Card variant="glass" interactive padding className="h-full hover:border-primary-500/30 transition-all duration-300">
                                    <div className="flex items-start gap-4">
                                        {/* Agent 圖示 */}
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10 text-white text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                                            🤖
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-lg text-text-primary group-hover:text-primary-400 transition-colors tracking-tight">{agent.name}</h3>
                                            {agent.description && (
                                                <p className="text-sm text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                                                    {agent.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // 顯示對話視窗
    return (
        <div className="h-full flex flex-col text-text-primary">
            {/* 頂部列 */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/5">
                <Button variant="outline" size="sm" onClick={handleBackToSelector} className="uppercase tracking-widest text-[10px] font-black">
                    ← {dict.common.back}
                </Button>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10 text-white text-2xl shadow-glow-cyan animate-pulse-slow">
                        🤖
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-text-primary tracking-tight">{selectedAgent.name}</h2>
                        {selectedAgent.description && (
                            <p className="text-xs text-text-secondary font-medium">{selectedAgent.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 對話視窗 */}
            <ChatWindow agent={selectedAgent} dict={dict} />
        </div>
    );
}
