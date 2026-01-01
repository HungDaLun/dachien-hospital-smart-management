/**
 * Agent 卡片元件
 * 顯示單一 Agent 資訊與操作
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { Badge, Button, Modal } from '@/components/ui';
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
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gemini-2.0-flash': 'Gemini 2.0 Flash',
    'gemini-2.0-flash-exp': 'Gemini 2.0 Flash Exp',
    // 保留舊版本以向後相容
    'gemini-1.5-pro': 'Gemini 1.5 Pro',
    'gemini-1.5-flash': 'Gemini 1.5 Flash',
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
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* 標題列 */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Agent 圖示 */}
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
                            🤖
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                            {agent.departments?.name && (
                                <p className="text-sm text-gray-500">{agent.departments.name}</p>
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
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
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
                        <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-600 line-clamp-2 hover:bg-gray-100 transition-colors">
                            <span className="text-gray-400 font-mono text-xs">System Prompt: </span>
                            {agent.system_prompt}
                        </div>
                    </button>
                </div>

                {/* 參數資訊 */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                        <span>Temperature:</span>
                        <span className="font-medium text-gray-700">{agent.temperature}</span>
                    </div>
                </div>

                {/* 操作按鈕 */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onChat?.(agent.id)}
                    >
                        開始對話
                    </Button>

                    {canManage && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit?.(agent)}
                            >
                                編輯
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                刪除
                            </Button>
                        </>
                    )}
                </div>
            </div>

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

            {/* 刪除確認 Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="確認刪除"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                            取消
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            loading={isDeleting}
                            disabled={isDeleting}
                        >
                            確認刪除
                        </Button>
                    </>
                }
            >
                <p className="text-gray-600">
                    確定要刪除 Agent <strong>{agent.name}</strong> 嗎？此操作無法復原。
                </p>
            </Modal>
        </>
    );
}
