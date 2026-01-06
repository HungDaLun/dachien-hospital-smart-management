/**
 * Agent 卡片元件
 * 顯示單一 Agent 資訊與操作
 * 遵循 EAKAP 科技戰情室設計系統規範
 */
'use client';

import { Badge, Button, Modal, Card } from '@/components/ui';
import { useState } from 'react';
import {
    Cpu,
    MessageSquare,
    Settings2,
    Trash2,
    Thermometer,
    Building2,
    ChevronRight,
    Terminal,
    Sparkles
} from 'lucide-react';

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
    knowledge_rules?: {
        rule_type: string;
        rule_value: string;
    }[];
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
    'gemini-3-flash-preview': 'GEMINI 3 FLASH',
    'gemini-3-pro-preview': 'GEMINI 3 PRO',
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
                variant="glass"
                clickable
                className="group relative overflow-hidden h-full border-white/5 hover:border-primary-500/30 transition-all duration-500"
            >
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/[0.03] blur-[60px] pointer-events-none -mr-16 -mt-16 group-hover:bg-primary-500/10 transition-all duration-700" />

                <div className="relative flex flex-col h-full space-y-6">
                    {/* Header: Identity & Specs */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            {/* Avatar/Icon Node */}
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-primary-400 group-hover:text-primary-300 transition-all duration-500 shadow-inner group-hover:shadow-glow-cyan/5">
                                <Cpu size={28} className="group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-text-primary tracking-tight group-hover:text-primary-400 transition-colors">
                                    {agent.name}
                                </h3>
                                {agent.departments?.name && (
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Building2 size={12} className="text-text-tertiary" />
                                        <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-60">
                                            {agent.departments.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Badge variant="primary" size="sm" className="bg-primary-500/10 border-primary-500/20 text-primary-400 font-black tracking-widest text-[9px]">
                            {modelLabels[agent.model_version] || agent.model_version}
                        </Badge>
                    </div>

                    {/* Description Layer */}
                    <div className="flex-1">
                        {agent.description ? (
                            <p className="text-xs font-bold text-text-secondary leading-relaxed line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                {agent.description}
                            </p>
                        ) : (
                            <div className="h-4 border-b border-dashed border-white/5 mb-4" />
                        )}
                    </div>

                    {/* Metadata Stream */}
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={() => setShowPromptModal(true)}
                            className="w-full group/prompt"
                        >
                            <div className="bg-black/40 rounded-2xl p-4 border border-white/5 text-left transition-all group-hover/prompt:border-primary-500/20 group-hover/prompt:bg-black/60 relative overflow-hidden">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Terminal size={12} className="text-primary-400 opacity-60" />
                                        <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">SYSTEM_DIRECTIVE</span>
                                    </div>
                                    <ChevronRight size={12} className="text-text-tertiary opacity-0 group-hover/prompt:opacity-100 translate-x-[-4px] group-hover/prompt:translate-x-0 transition-all" />
                                </div>
                                <p className="text-[11px] font-mono text-text-tertiary truncate opacity-60 group-hover/prompt:opacity-100">
                                    {agent.system_prompt}
                                </p>
                            </div>
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white/[0.02] px-3 py-2 rounded-xl border border-white/5">
                                <Thermometer size={14} className="text-primary-400/60" />
                                <span className="text-[10px] font-black text-text-tertiary uppercase tracking-tighter">TEMP: <span className="text-text-primary ml-1 font-mono">{agent.temperature}</span></span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/[0.02] px-3 py-2 rounded-xl border border-white/5">
                                <Sparkles size={14} className="text-secondary-400/60" />
                                <span className="text-[10px] font-black text-text-tertiary uppercase tracking-tighter">LOGIC: <span className="text-text-primary ml-1">v3.0</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Command Console */}
                    <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onChat?.(agent.id)}
                            className="flex-1 h-11 rounded-xl shadow-glow-cyan/5 group-hover:shadow-glow-cyan/10"
                        >
                            <MessageSquare size={16} className="mr-2" />
                            <span className="font-black uppercase tracking-widest text-[10px]">啟動對話</span>
                        </Button>

                        {canManage && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onEdit?.(agent)}
                                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-white/10 hover:border-white/10 transition-all"
                                >
                                    <Settings2 size={16} />
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-text-tertiary hover:text-semantic-danger hover:bg-semantic-danger/10 hover:border-semantic-danger/20 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* System Prompt 檢視 Modal */}
            <Modal
                isOpen={showPromptModal}
                onClose={() => setShowPromptModal(false)}
                title={`${agent.name} - 系統指令庫`}
                size="lg"
            >
                <div className="bg-black/40 rounded-3xl p-8 border border-white/5 font-mono text-sm leading-relaxed text-text-secondary whitespace-pre-wrap max-h-[60vh] overflow-y-auto custom-scrollbar shadow-inner">
                    {agent.system_prompt}
                </div>
            </Modal>

            {/* 刪除確認 Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="DESTRUCTION_CORE_CONFIRMATION"
                footer={
                    <div className="flex justify-end gap-3 w-full">
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="h-11 px-8 rounded-xl border-white/10 text-[10px] font-black uppercase tracking-widest">
                            取消行動
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            loading={isDeleting}
                            disabled={isDeleting}
                            className="h-11 px-8 rounded-xl shadow-glow-red/20 text-[10px] font-black uppercase tracking-widest"
                        >
                            確認執行刪除
                        </Button>
                    </div>
                }
            >
                <div className="bg-semantic-danger/10 border border-semantic-danger/20 rounded-[32px] p-8 space-y-4">
                    <div className="flex items-center gap-3 text-semantic-danger">
                        <Trash2 size={24} />
                        <h4 className="text-lg font-black uppercase tracking-tight">終止 Agent 生命週期</h4>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-bold text-text-secondary">
                            確定要刪除 Agent <strong className="text-text-primary">{agent.name}</strong> 嗎？
                        </p>
                        <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-widest opacity-60 leading-relaxed">
                            此操作將永久移除資料庫中的實體配置與所有關聯對話序列，且無法執行回溯。
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
}
