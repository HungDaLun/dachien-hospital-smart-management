'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { Skill } from '@/lib/skills/types';
import { Check, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Agent {
    id: string;
    name: string;
    description?: string;
    enabled_skills: string[];
}

interface SkillInstallModalProps {
    isOpen: boolean;
    onClose: () => void;
    skill: Skill | null;
}

export function SkillInstallModal({ isOpen, onClose, skill }: SkillInstallModalProps) {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [installing, setInstalling] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            fetchAgents();
        }
    }, [isOpen]);

    const fetchAgents = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from('agents')
            .select('id, name, description, enabled_skills')
            .eq('is_active', true)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching agents:', error);
        }

        if (data) {
            setAgents(data);
        }
        setLoading(false);
    };

    const handleInstall = async (agent: Agent) => {
        if (!skill) return;
        setInstalling(agent.id);

        try {
            const res = await fetch(`/api/agents/${agent.id}/skills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skillId: skill.id })
            });

            if (res.ok) {
                // Update local state to show installed
                setAgents(prev => prev.map(a =>
                    a.id === agent.id
                        ? { ...a, enabled_skills: [...(a.enabled_skills || []), skill.id] }
                        : a
                ));
            } else {
                console.error('Failed to install skill');
                toast.error('安裝失敗，請稍後再試');
            }
        } catch (e) {
            console.error(e);
            toast.error('安裝發生錯誤');
        } finally {
            setInstalling(null);
        }
    };

    const filteredAgents = agents.filter(a =>
        (a.name?.toLowerCase() || '').includes(search.toLowerCase())
    );

    if (!skill) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`安裝技能：${skill.display_name}`} size="lg">
            <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                    請選擇要安裝此技能的智能代理。安裝後，該代理將獲得此技能的能力與知識。
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
                            const isInstalled = agent.enabled_skills?.includes(skill.id);
                            return (
                                <div key={agent.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-white/10 flex items-center justify-center text-xl shadow-inner">
                                            🤖
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{agent.name}</h4>
                                            <p className="text-xs text-text-tertiary line-clamp-1">{agent.description || '無描述'}</p>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant={isInstalled ? 'ghost' : 'cta'}
                                        className={isInstalled ? 'text-green-500 bg-green-500/10 hover:bg-green-500/20' : ''}
                                        disabled={isInstalled || installing === agent.id}
                                        onClick={() => handleInstall(agent)}
                                    >
                                        {installing === agent.id ? (
                                            <div className="flex items-center gap-2">
                                                <Spinner size="sm" /> 安裝中...
                                            </div>
                                        ) : isInstalled ? (
                                            <>
                                                <Check size={14} className="mr-1" /> 已安裝
                                            </>
                                        ) : (
                                            '安裝'
                                        )}
                                    </Button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </Modal>
    );
}
