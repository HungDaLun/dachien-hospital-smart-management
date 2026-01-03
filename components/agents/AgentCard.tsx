/**
 * Agent 卡片元件
 * 顯示單一 Agent 資訊與操作
 * 遵循 EAKAP 設計系統規範 v1.5
 */
'use client';

import { Badge, Button, Modal, Card } from '@/components/ui';
import { useState } from 'react';

/**
 * Agent 資料介面
 */
export interface AgentData {
    id: string;
    name: string;
    description: string | null;
    system_prompt: string;
    model_version: string;
    temperature: number;
    department_id: string | null;
    created_at: string;
    departments?: {
        name: string;
    } | null;
}

/**
 * Agent 卡片屬性
 */
interface AgentCardProps {
    agent: AgentData;
    canManage: boolean;
    onEdit?: (agent: AgentData) => void;
    onDelete?: (id: string) => void;
    onChat?: (id: string) => void;
}

/**
 * 模型版本顯示名稱
 */
const modelLabels: Record<string, string> = {
    'gemini-3-flash': 'Gemini 3 Flash',
    'gemini-3-pro': 'Gemini 3 Pro',
};

export default function AgentCard({ agent, canManage, onEdit, onDelete, onChat }: AgentCardProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showPromptModal, setShowPromptModal] = useState(false);

    /**
     * 處理刪除
     */
    const handleDelete = async () => {
        if (isDeleting) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/agents/${agent.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                onDelete?.(agent.id);
                setShowDeleteModal(false);
            }
        } catch (error) {
            console.error('刪除失敗:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Card
                interactive
                className="group relative overflow-hidden"
            >
                {/* 裝飾性漸變背景 */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-accent-violet/10 to-transparent rounded-full blur-2xl -mr-12 -mt-12 transition-opacity group-hover:opacity-100 opacity-0" />

                <div className="relative">
                    {/* 標題列 */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {/* Agent 圖示 - Neumorphism */}
                            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-violet rounded-xl flex items-center justify-center text-white text-2xl shadow-neu-light group-hover:shadow-neu-hover transition-shadow">
                                🤖
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-accent-violet transition-colors">
                                    {agent.name}
                                </h3>
                                {agent.departments?.name && (
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        🏢 {agent.departments.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 模型版本 Badge */}
                        <Badge variant="primary" size="sm">
                            {modelLabels[agent.model_version] || agent.model_version}
                        </Badge>
                    </div>

                    {/* 描述 */}
                    {agent.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                            {agent.description}
                        </p>
                    )}

                    {/* System Prompt 預覽 */}
                    <div className="mb-4">
                        <button
                            type="button"
                            onClick={() => setShowPromptModal(true)}
                            className="w-full text-left"
                        >
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 text-sm text-gray-600 line-clamp-2 hover:from-gray-100 hover:to-gray-200 transition-all border border-gray-200">
                                <span className="text-accent-violet font-mono text-xs font-bold">📝 System Prompt: </span>
                                {agent.system_prompt}
                            </div>
                        </button>
                    </div>

                    {/* 參數資訊 */}
                    <div className="flex items-center gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                            <span className="text-gray-500">🌡️ Temperature:</span>
                            <span className="font-bold text-primary-600">{agent.temperature}</span>
                        </div>
                    </div>

                    {/* 操作按鈕 */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                        <Button
                            variant="cta"
                            size="sm"
                            onClick={() => onChat?.(agent.id)}
                            className="flex-1"
                        >
                            💬 開始對話
                        </Button>

                        {canManage && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit?.(agent)}
                                >
                                    ⚙️
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDeleteModal(true)}
                                    className="text-error-500 hover:text-error-600 hover:bg-error-50"
                                >
                                    🗑️
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Card>

            {/* System Prompt 檢視 Modal */}
            <Modal
                isOpen={showPromptModal}
                onClose={() => setShowPromptModal(false)}
                title={`${agent.name} - System Prompt`}
                size="lg"
            >
                <div className="bg-gray-50 rounded-md p-4 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {agent.system_prompt}
                </div>
            </Modal>

            {/* 刪除確認 Modal - 使用 critical 風格 */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="⚠️ 確認刪除"
                critical
                footer={
                    <>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            取消
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            loading={isDeleting}
                            disabled={isDeleting}
                        >
                            🗑️ 確認刪除
                        </Button>
                    </>
                }
            >
                <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                    <p className="text-gray-700">
                        確定要刪除 Agent <strong className="text-error-600">{agent.name}</strong> 嗎？
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                        ⚠️ 此操作無法復原，所有相關對話記錄也會被移除。
                    </p>
                </div>
            </Modal>
        </>
    );
}
