
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Spinner } from '@/components/ui';
import { Skill } from '@/lib/skills/types';
import { Check, Search, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';

interface Agent {
    id: string;
    name: string;
    description?: string;
    enabled_skills: string[];
}

interface SkillBulkInstallModalProps {
    isOpen: boolean;
    onClose: () => void;
    skills: Skill[];
    onSuccess?: () => void;
}

export function SkillBulkInstallModal({ isOpen, onClose, skills, onSuccess }: SkillBulkInstallModalProps) {
    const { toast } = useToast();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [installing, setInstalling] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [progress, setProgress] = useState(0);

    const fetchAgents = useCallback(async () => {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from('agents')
            .select('id, name, description, enabled_skills')
            .eq('is_active', true)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching agents:', error);
            toast.error('無法載入 Agent 列表');
        }

        if (data) {
            setAgents(data);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        if (isOpen) {
            fetchAgents();
        }
    }, [isOpen, fetchAgents]);

    const handleBulkInstall = async (agent: Agent) => {
        if (skills.length === 0) return;
        setInstalling(agent.id);
        setProgress(0);

        try {
            let successParams = 0;
            const total = skills.length;

            for (let i = 0; i < total; i++) {
                const skill = skills[i];
                // Check if already installed
                if (agent.enabled_skills?.includes(skill.id)) {
                    successParams++;
                    setProgress(Math.round(((i + 1) / total) * 100));
                    continue;
                }

                const res = await fetch(`/api/agents/${agent.id}/skills`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ skillId: skill.id })
                });

                if (res.ok) {
                    successParams++;
                }

                setProgress(Math.round(((i + 1) / total) * 100));
            }

            if (successParams === total) {
                toast.success(`成功將 ${total} 個技能安裝到 ${agent.name}`);
                setAgents(prev => prev.map(a =>
                    a.id === agent.id
                        ? { ...a, enabled_skills: [...(a.enabled_skills || []), ...skills.map(s => s.id)] }
                        : a
                ));
                if (onSuccess) onSuccess();
                onClose();
            } else {
                toast.warning(`部分安裝完成：${successParams}/${total} 成功`);
            }

        } catch (e) {
            console.error(e);
            toast.error('安裝發生錯誤');
        } finally {
            setInstalling(null);
            setProgress(0);
        }
    };

    const filteredAgents = agents.filter(a =>
        (a.name?.toLowerCase() || '').includes(search.toLowerCase())
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`批次安裝 ${skills.length} 個技能`} size="lg">
            <div className="space-y-4">
                <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary-400 mt-0.5" />
                    <div>
                        <p className="text-sm text-primary-200 font-bold mb-1">即將安裝以下技能：</p>
                        <p className="text-xs text-primary-300/80 line-clamp-2">
                            {skills.map(s => s.display_name).join(', ')}
                        </p>
                    </div>
                </div>

                <p className="text-sm text-text-secondary">
                    請選擇要安裝這些技能的目標智能代理 (Agent)。
                </p>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="搜尋智能代理..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* Agent List */}
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Spinner size="md" />
                        </div>
                    ) : filteredAgents.length === 0 ? (
                        <div className="text-center py-8 text-text-tertiary text-sm">
                            沒有找到符合的智能代理
                        </div>
                    ) : (
                        filteredAgents.map(agent => {
                            // Check overlap count
                            const installedCount = skills.filter(s => agent.enabled_skills?.includes(s.id)).length;
                            const isFullyInstalled = installedCount === skills.length;

                            return (
                                <div key={agent.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-white/10 flex items-center justify-center text-xl shadow-inner flex-shrink-0">
                                            🤖
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white text-sm truncate">{agent.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-text-tertiary">
                                                <span>已安裝 {agent.enabled_skills?.length || 0} 個技能</span>
                                                {installedCount > 0 && (
                                                    <span className="text-yellow-500 truncate">
                                                        ({installedCount} 重複)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 ml-4">
                                        <Button
                                            size="sm"
                                            variant={isFullyInstalled ? 'ghost' : 'cta'}
                                            className={`min-w-[100px] whitespace-nowrap ${isFullyInstalled ? 'text-green-500 bg-green-500/10 hover:bg-green-500/20 cursor-default' : ''}`}
                                            disabled={isFullyInstalled || installing === agent.id}
                                            onClick={() => handleBulkInstall(agent)}
                                        >
                                            {installing === agent.id ? (
                                                <div className="flex items-center gap-2">
                                                    <Spinner size="sm" />
                                                    <span>{progress}%</span>
                                                </div>
                                            ) : isFullyInstalled ? (
                                                <>
                                                    <Check size={14} className="mr-1" /> 全部已裝
                                                </>
                                            ) : (
                                                '安裝至此'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </Modal>
    );
}
