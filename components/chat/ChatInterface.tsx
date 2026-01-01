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
            <div className="h-full flex flex-col">
                {/* 標題 */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">{dict.chat.title}</h1>
                    <p className="text-gray-600">{dict.chat.select_agent}</p>
                </div>

                {/* Agent 列表 */}
                {agents.length === 0 ? (
                    <Card>
                        <div className="text-center py-12 text-gray-500">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-3xl">
                                🤖
                            </div>
                            <p>{dict.common.no_data}</p>
                            <p className="text-sm mt-2">{dict.common.no_data}</p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {agents.map((agent) => (
                            <div
                                key={agent.id}
                                onClick={() => handleSelectAgent(agent)}
                                className="cursor-pointer"
                            >
                                <Card interactive padding className="h-full">
                                    <div className="flex items-start gap-4">
                                        {/* Agent 圖示 */}
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                                            🤖
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                                            {agent.description && (
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
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
        <div className="h-full flex flex-col">
            {/* 頂部列 */}
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="sm" onClick={handleBackToSelector}>
                    ← {dict.common.back}
                </Button>

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                        🤖
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">{selectedAgent.name}</h2>
                        {selectedAgent.description && (
                            <p className="text-sm text-gray-500">{selectedAgent.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 對話視窗 */}
            <ChatWindow agent={selectedAgent} dict={dict} />
        </div>
    );
}
