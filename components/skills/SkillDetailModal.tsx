'use client';

import { Modal, Button, Badge } from '@/components/ui';
import { Skill } from '@/lib/skills/types';
import { Terminal, Copy, Check, Star, Users, Clock } from 'lucide-react';
import { useState } from 'react';

interface SkillDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    skill: Skill | null;
    onInstall?: () => void;
    isInstalled?: boolean;
}

export function SkillDetailModal({ isOpen, onClose, skill, onInstall, isInstalled }: SkillDetailModalProps) {
    const [copied, setCopied] = useState(false);

    if (!skill) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(skill.prompt_instruction);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                            {skill.description}
                        </p>
                        <div className="flex items-center gap-6 pt-2 text-sm text-text-tertiary">
                            <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                <span>2.4k 使用者</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span>4.9 (128 評論)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>2天前更新</span>
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
                        {/* <Button variant="ghost" className="w-full text-text-tertiary">
                    View Docs
                </Button> */}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Content */}
                    <div className="lg:col-span-2 space-y-6">
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
                                        {skill.prompt_instruction}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                            <h4 className="text-xs font-black text-text-tertiary uppercase tracking-widest mb-4">規格</h4>
                            <ul className="space-y-4 text-sm">
                                <li className="flex justify-between">
                                    <span className="text-text-tertiary">版本</span>
                                    <span className="font-mono text-text-primary">{skill.version}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-text-tertiary">Token 消耗</span>
                                    <span className="font-mono text-text-primary">~1.2k / run</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-text-tertiary">類別</span>
                                    <span className="font-bold text-text-primary uppercase">{skill.category}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-text-tertiary">作者</span>
                                    <span className="text-text-primary">{skill.author || 'EAKAP Systems'}</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-yellow-500/5 rounded-2xl p-6 border border-yellow-500/10">
                            <h4 className="text-xs font-black text-yellow-500/80 uppercase tracking-widest mb-2">使用技巧</h4>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                您可以將此技能與 <strong>匯出 CSV</strong> 工具結合使用，根據分析邏輯自動產生月報。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
