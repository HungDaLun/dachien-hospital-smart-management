/**
 * Agent 列表元件
 * 顯示 Agent 列表，支援新增、編輯、刪除
 * 遵循 EAKAP 科技戰情室設計系統規範
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Spinner } from '@/components/ui';
import AgentCard, { AgentData } from './AgentCard';
import { useRouter } from 'next/navigation';
import { Plus, Bot, AlertTriangle, Layers } from 'lucide-react';

/**
 * Agent 列表屬性
 */
interface AgentListProps {
    canManage: boolean;
}

export default function AgentList({ canManage }: AgentListProps) {
    const router = useRouter();
    const [agents, setAgents] = useState<AgentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);



    /**
     * 取得 Agent 列表
     */
    const fetchAgents = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/agents');
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || '載入失敗');
            }

            setAgents(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '載入 Agent 列表失敗');
        } finally {
            setLoading(false);
        }
    }, []);

    // 初始載入
    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    /**
     * 處理編輯
     */
    const handleEdit = (agent: AgentData) => {
        // 這裡跳轉到 Agent 編輯頁面，而不是模態框
        router.push(`/dashboard/agents/${agent.id}`);
    };

    /**
     * 處理新增
     */
    const handleAdd = () => {
        router.push('/dashboard/agents/new');
    };

    /**
     * 處理刪除
     */
    const handleDelete = (id: string) => {
        setAgents((prev) => prev.filter((a) => a.id !== id));
    };

    /**
     * 處理對話
     */
    const handleChat = (id: string) => {
        router.push(`/dashboard/chat?agent=${id}`);
    };

    return (
        <div className="space-y-8">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                        <Layers size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">AGENT 智庫叢集 <span className="opacity-30">|</span> CLUSTER</h2>
                        <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">
                            DEPLOYED_NODES: <span className="text-primary-400 font-mono text-xs ml-1">{agents.length.toString().padStart(2, '0')}</span>
                        </p>
                    </div>
                </div>

                {canManage && (
                    <Button
                        onClick={handleAdd}
                        variant="cta"
                        className="h-11 px-6 rounded-xl shadow-glow-cyan/10"
                    >
                        <Plus size={16} className="mr-2" />
                        <span className="font-black uppercase tracking-widest text-[10px]">建立新部署節點</span>
                    </Button>
                )}
            </div>

            {/* 載入中 */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-30">
                    <Spinner size="lg" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse-slow">CALIBRATING_CLUSTER_SYNC...</p>
                </div>
            )}

            {/* 錯誤訊息 */}
            {error && (
                <Card variant="danger" className="p-12 flex flex-col items-center justify-center text-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-semantic-danger/10 border border-semantic-danger/20 flex items-center justify-center text-semantic-danger">
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-text-primary uppercase mb-2">同步失敗 :: SYNC_FAILED</h3>
                        <p className="text-xs font-bold text-text-tertiary opacity-80">{error}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchAgents} className="px-8 h-10 rounded-xl border-semantic-danger/20 text-semantic-danger">
                        重新嘗試連線
                    </Button>
                </Card>
            )}

            {/* Agent 列表內容 */}
            {!loading && !error && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {agents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-white/[0.01] rounded-[40px] border border-dashed border-white/5">
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-primary-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative w-20 h-20 bg-white/[0.03] border border-white/10 rounded-[24px] flex items-center justify-center text-text-tertiary">
                                    <Bot size={40} className="opacity-40" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-text-primary uppercase tracking-widest">目前尚無運作中的 Agent</h3>
                                <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest mt-2 opacity-60">WAITING_FOR_INITIAL_DEPLOYMENT</p>
                            </div>
                            {canManage && (
                                <Button
                                    variant="primary"
                                    onClick={handleAdd}
                                    className="px-10 h-11 rounded-xl shadow-glow-cyan/10"
                                >
                                    建立第一個分析節點
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {agents.map((agent) => (
                                <AgentCard
                                    key={agent.id}
                                    agent={agent}
                                    canManage={canManage}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onChat={handleChat}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
