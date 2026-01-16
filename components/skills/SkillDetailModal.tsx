'use client';

import { Modal, Button, Badge, ConfirmDialog } from '@/components/ui';
import { Skill } from '@/lib/skills/types';
import { Terminal, Copy, Check, Star, Users, Clock } from 'lucide-react';
import { useState } from 'react';

interface SkillDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    skill: Skill | null;
    onInstall?: () => void;
    isInstalled?: boolean;
    isSuperAdmin?: boolean;
    onDelete?: () => void;
}

export function SkillDetailModal({ isOpen, onClose, skill, onInstall, isInstalled, isSuperAdmin, onDelete }: SkillDetailModalProps) {
    const [copied, setCopied] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!skill) return null;

    // 使用 skill_content 或 prompt_instruction（向後相容）
    const skillContent = (skill as any).skill_content || skill.prompt_instruction || '';

    const handleCopy = () => {
        navigator.clipboard.writeText(skillContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // 解析描述與技巧
    const fullDesc = skill.description || '';
    const [mainDesc, usageTip] = fullDesc.split('---TIPS---').map(s => s.trim());

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" title={skill.display_name}>
            <div className="space-y-8">
                {/* Hero Section */}
                <div className="flex items-start gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                        {skill.icon || '⚡️'}
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-white">{skill.display_name}</h2>
                            {skill.is_official && (
                                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                    官方認證
                                </Badge>
                            )}
                        </div>
                        <p className="text-text-secondary leading-relaxed text-base">
                            {mainDesc}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 pt-3 text-sm text-text-tertiary">
                            {/* 使用真實的 usage_count */}
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{(skill as any).usage_count || 0} 次使用</span>
                            </div>
                            {/* 官方認證技能顯示星號 */}
                            {skill.is_official && (
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span>官方推薦</span>
                                </div>
                            )}
                            {/* 使用真實的 updated_at */}
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>更新於 {skill.updated_at ? new Date(skill.updated_at).toLocaleDateString('zh-TW') : '未知'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[140px]">
                        <Button
                            variant={isInstalled ? "outline" : "cta"}
                            size="lg"
                            className="w-full font-black uppercase tracking-widest"
                            onClick={onInstall}
                        >
                            {isInstalled ? "已安裝" : "立即安裝"}
                        </Button>

                        {isSuperAdmin && (
                            <Button
                                variant="danger"
                                size="sm" // Use small size for delete
                                className="w-full font-black uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                刪除技能
                            </Button>
                        )}
                    </div>
                </div>

                {/* 核心邏輯預覽區塊 */}
                <div>
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Terminal size={16} className="text-purple-400" />
                        核心邏輯預覽
                    </h3>
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-black/80 rounded-2xl border border-white/10 p-6 font-mono text-sm leading-relaxed text-text-secondary overflow-hidden">
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={handleCopy}
                                    className="p-2 hover:bg-white/10 rounded-lg text-text-tertiary hover:text-white transition-colors"
                                >
                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                            <pre className="whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar">
                                {skillContent.split('---TIPS---')[0].trim() || <span className="text-text-tertiary italic">尚無內容</span>}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* 規格與使用技巧 - 由上而下排列 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 規格區塊 */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                        <h4 className="text-xs font-black text-text-tertiary uppercase tracking-widest mb-4">規格</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-text-tertiary text-xs mb-1">版本</span>
                                <span className="font-mono text-text-primary">{skill.version}</span>
                            </div>
                            <div>
                                <span className="block text-text-tertiary text-xs mb-1">Token 消耗</span>
                                <span className="font-mono text-text-primary">~1.2k / run</span>
                            </div>
                            <div>
                                <span className="block text-text-tertiary text-xs mb-1">類別</span>
                                <span className="font-bold text-text-primary uppercase">{skill.category}</span>
                            </div>
                            <div>
                                <span className="block text-text-tertiary text-xs mb-1">作者</span>
                                <span className="text-text-primary">{skill.author || 'EAKAP Official'}</span>
                            </div>
                        </div>
                    </div>

                    {/* 使用技巧區塊 */}
                    <div className="bg-yellow-500/5 rounded-2xl p-6 border border-yellow-500/10 h-full">
                        <h4 className="text-xs font-black text-yellow-500/80 uppercase tracking-widest mb-3">使用技巧</h4>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {usageTip || (
                                <>
                                    您可以將此技能與 <strong className="text-yellow-500/90">特定業務 Agent</strong> 結合使用，大幅提升該領域的作業效率。
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={showDeleteConfirm}
                title="刪除技能"
                description="確定要刪除此技能嗎？此操作無法復原。"
                onConfirm={() => {
                    onDelete?.();
                    onClose();
                    setShowDeleteConfirm(false);
                }}
                onCancel={() => setShowDeleteConfirm(false)}
                confirmText="確認刪除"
                variant="danger"
            />
        </Modal >
    );
}
