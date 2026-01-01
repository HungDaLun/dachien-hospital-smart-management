/**
 * Agent 列表元件
 * 顯示 Agent 列表，支援新增、編輯、刪除
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Spinner } from '@/components/ui';
import AgentCard, { AgentData } from './AgentCard';
import AgentForm from './AgentForm';
import { useRouter } from 'next/navigation';

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

    // 表單狀態
    const [showForm, setShowForm] = useState(false);
    const [editingAgent, setEditingAgent] = useState<AgentData | null>(null);

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
        setEditingAgent(agent);
        setShowForm(true);
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

    /**
     * 處理建立成功
     */
    const handleFormSuccess = () => {
        fetchAgents();
        setShowForm(false);
        setEditingAgent(null);
    };

    /**
     * 關閉表單
     */
    const handleCloseForm = () => {
        setShowForm(false);
        setEditingAgent(null);
    };

    return (
        <>
            <Card>
                <div className="space-y-4">
                    {/* 標題與新增按鈕 */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Agent 列表</h2>
                            <p className="text-sm text-gray-500">共 {agents.length} 個 Agent</p>
                        </div>

                        {canManage && (
                            <Button onClick={() => setShowForm(true)}>
                                建立 Agent
                            </Button>
                        )}
                    </div>

                    {/* 載入中 */}
                    {loading && (
                        <div className="flex justify-center py-12">
                            <Spinner size="lg" />
                        </div>
                    )}

                    {/* 錯誤訊息 */}
                    {error && (
                        <div className="text-center py-12 text-error-500">
                            <p>{error}</p>
                            <Button variant="outline" size="sm" onClick={fetchAgents} className="mt-4">
                                重試
                            </Button>
                        </div>
                    )}

                    {/* Agent 列表 */}
                    {!loading && !error && (
                        <>
                            {agents.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-3xl">
                                        🤖
                                    </div>
                                    <p>尚無 Agent</p>
                                    {canManage && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => setShowForm(true)}
                                            className="mt-4"
                                        >
                                            建立第一個 Agent
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                        </>
                    )}
                </div>
            </Card>

            {/* Agent 表單 */}
            <AgentForm
                isOpen={showForm}
                onClose={handleCloseForm}
                agent={editingAgent}
                onSuccess={handleFormSuccess}
            />
        </>
    );
}
