/**
 * Agent Skills 設定元件
 * 獨立管理 Agent Skills
 */
'use client';

import React, { useState, useEffect } from 'react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Card, Button, ConfirmDialog } from '@/components/ui';
import {
    Plus,
    Trash2,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    BrainCircuit,
    Globe,
    Lock
} from 'lucide-react';

interface Skill {
    id: string;
    name: string;
    display_name: string;
    description?: string;
    icon?: string;
    category: string;
    tags: string[];
    source: 'internal' | 'skillsmp' | 'enterprise';
    is_public: boolean;
    is_official: boolean;
    is_active: boolean;
    usage_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    dict: Dictionary;
}

export default function AgentSkillsSettings({ dict: _dict }: Props) {
    // Skills 狀態
    const [skills, setSkills] = useState<Skill[]>([]);
    const [skillsLoading, setSkillsLoading] = useState(true);
    const [skillsError, setSkillsError] = useState<string | null>(null);
    const [showSkillDeleteConfirm, setShowSkillDeleteConfirm] = useState<string | null>(null);

    // 成功訊息
    const [successMessage, setSuccessMessage] = useState<string | null>(null);


    // 載入 Skills
    useEffect(() => {
        loadSkills();
    }, []);

    const loadSkills = async () => {
        try {
            setSkillsLoading(true);
            setSkillsError(null);
            const response = await fetch('/api/skills');
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || '載入失敗');
            setSkills(data.data || []);
        } catch (err) {
            setSkillsError(err instanceof Error ? err.message : '發生錯誤');
        } finally {
            setSkillsLoading(false);
        }
    };

    const handleDeleteSkill = async (skillId: string) => {
        try {
            // setSaving(true);
            const response = await fetch(`/api/skills/${skillId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || '刪除失敗');
            setSuccessMessage('Skill 已成功刪除');
            await loadSkills();
            setShowSkillDeleteConfirm(null);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setSkillsError(err instanceof Error ? err.message : '發生錯誤');
        } finally {
            // setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                        Agent Skills 管理
                    </h3>
                    <p className="text-xs text-text-tertiary uppercase tracking-widest mt-1 opacity-60">
                        系統層級的 Skills 可供超級管家和 Agent 使用
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={loadSkills} disabled={skillsLoading}>
                        <RefreshCw size={16} className={skillsLoading ? 'animate-spin' : ''} />
                    </Button>
                    <Button variant="cta" size="sm" onClick={() => window.open('/dashboard/skills', '_blank')}>
                        <Plus size={16} className="mr-2" />
                        前往 Skills Marketplace
                    </Button>
                </div>
            </div>

            {successMessage && (
                <Card variant="glass" className="bg-semantic-success/10 border-semantic-success/20 p-4">
                    <div className="flex items-center gap-3 text-semantic-success">
                        <CheckCircle size={20} />
                        <p className="font-medium">{successMessage}</p>
                    </div>
                </Card>
            )}

            {skillsError && (
                <Card variant="glass" className="bg-semantic-danger/10 border-semantic-danger/20 p-4">
                    <div className="flex items-center gap-3 text-semantic-danger">
                        <AlertCircle size={20} />
                        <p className="font-medium">{skillsError}</p>
                    </div>
                </Card>
            )}

            {skillsLoading ? (
                <Card variant="glass" className="p-6">
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
                    </div>
                </Card>
            ) : skills.length === 0 ? (
                <Card variant="glass" className="p-6">
                    <div className="text-center py-8 text-text-tertiary">
                        <BrainCircuit className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>目前沒有安裝任何 Skills</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skills.map((skill) => (
                        <Card key={skill.id} variant="glass" className="p-4 border-white/10 flex flex-col h-full hover:bg-white/5 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{skill.icon || '🧠'}</div>
                                    <div>
                                        <h4 className="font-bold text-text-primary line-clamp-1">{skill.display_name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-text-tertiary">
                                            {skill.is_official && (
                                                <span className="flex items-center text-yellow-500" title="官方技能">
                                                    ⭐ Official
                                                </span>
                                            )}
                                            {skill.is_public ? (
                                                <span className="flex items-center gap-1 text-green-400" title="公開">
                                                    <Globe size={10} /> Public
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-orange-400" title="私有">
                                                    <Lock size={10} /> Private
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-text-tertiary hover:text-semantic-danger hover:bg-semantic-danger/10"
                                    onClick={() => setShowSkillDeleteConfirm(skill.id)}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>

                            <p className="text-xs text-text-tertiary mb-4 flex-grow line-clamp-3">
                                {skill.description || '無描述'}
                            </p>

                            <div className="flex flex-wrap gap-1 mt-auto pt-3 border-t border-white/5">
                                <span className={`px-2 py-0.5 text-[10px] rounded uppercase tracking-wider
                                    ${skill.category === 'knowledge' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                        skill.category === 'data' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                            'bg-white/5 text-text-tertiary border border-white/10'}
                                `}>
                                    {skill.category}
                                </span>
                                {skill.tags?.slice(0, 2).map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/10 text-text-tertiary text-[10px] rounded">
                                        #{tag}
                                    </span>
                                ))}
                                {skill.tags?.length > 2 && (
                                    <span className="px-1.5 py-0.5 text-[10px] text-text-tertiary opacity-50">
                                        +{skill.tags.length - 2}
                                    </span>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* 刪除確認 */}
            <ConfirmDialog
                open={!!showSkillDeleteConfirm}
                onCancel={() => setShowSkillDeleteConfirm(null)}
                onConfirm={() => showSkillDeleteConfirm && handleDeleteSkill(showSkillDeleteConfirm)}
                title="確認移除 Skill"
                description="確定要移除此 Skill 嗎？此操作將使所有依賴此 Skill 的 Agent 無法正常運作。"
                confirmText="移除"
                cancelText="取消"
                variant="danger"
            />
        </div>
    );
}
