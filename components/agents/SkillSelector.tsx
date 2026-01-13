'use client';

import { useState, useEffect } from 'react';
import { Badge, Button } from '@/components/ui';
import { BrainCircuit, Star, ExternalLink, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface Skill {
    id: string;
    name: string;
    display_name: string;
    description: string;
    category: string;
    is_official: boolean;
    icon?: string;
}

interface SkillSelectorProps {
    selectedSkills: string[];
    onChange: (skills: string[]) => void;
    className?: string;
}

export function SkillSelector({ selectedSkills, onChange, className }: SkillSelectorProps) {
    const router = useRouter();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSkills() {
            try {
                const res = await fetch('/api/skills');
                const data = await res.json();
                if (data.success) {
                    setSkills(data.data);
                }
            } catch (e) {
                console.error('Failed to fetch skills', e);
            } finally {
                setLoading(false);
            }
        }
        fetchSkills();
    }, []);

    const handleToggle = (skillId: string) => {
        if (selectedSkills.includes(skillId)) {
            onChange(selectedSkills.filter(s => s !== skillId));
        } else {
            onChange([...selectedSkills, skillId]);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-purple-500/10 rounded-lg">
                    <BrainCircuit className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="font-bold text-sm text-text-secondary uppercase tracking-wider">載入技能包 (Skills)</h3>
                <Badge variant="secondary" className="ml-auto text-[10px] px-2 h-5 bg-purple-500/10 text-purple-300 border-purple-500/20">
                    PHASE 3
                </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {skills.length === 0 && (
                    <div className="text-center p-4 text-sm text-text-tertiary">
                        尚無可用技能。請確認資料庫種子資料。
                    </div>
                )}

                <TooltipProvider delayDuration={300}>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {skills.map(skill => {
                            const isSelected = selectedSkills.includes(skill.id);
                            return (
                                <Tooltip key={skill.id}>
                                    <TooltipTrigger asChild>
                                        <div
                                            onClick={() => handleToggle(skill.id)}
                                            className={`
                                                group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 select-none
                                                ${isSelected
                                                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-100 shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]'
                                                    : 'bg-white/[0.02] border-white/5 text-text-secondary hover:bg-white/[0.04] hover:border-white/10'}
                                            `}
                                        >
                                            <div className={`
                                                w-4 h-4 rounded flex items-center justify-center border transition-all duration-200 shrink-0
                                                ${isSelected
                                                    ? 'bg-purple-500 border-purple-500 text-black'
                                                    : 'bg-transparent border-white/20 group-hover:border-white/30'}
                                            `}>
                                                {isSelected && <Check size={10} strokeWidth={4} />}
                                            </div>

                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-xl shrink-0">{skill.icon || '⚡️'}</span>
                                                <span className={`text-xs font-medium truncate ${isSelected ? 'text-purple-100' : 'text-text-secondary'}`}>
                                                    {skill.display_name}
                                                </span>
                                                {skill.is_official && (
                                                    <Star size={10} className="text-yellow-500 fill-current ml-auto shrink-0 opacity-50" />
                                                )}
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="max-w-[250px] bg-zinc-900 border-white/10 text-xs text-zinc-400 p-3 leading-relaxed">
                                        <div className="flex items-center gap-2 mb-1">
                                            {skill.is_official && <Badge variant="secondary" className="text-[9px] px-1 h-4 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">官方</Badge>}
                                            <span className="font-bold text-white">{skill.display_name}</span>
                                        </div>
                                        <p>{skill.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                </TooltipProvider>

                <div className="flex items-center justify-between p-3 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                    <p className="text-xs text-text-tertiary">需要更多專業技能？</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2 text-xs hover:bg-white/5 hover:text-white text-text-tertiary"
                        onClick={(e) => {
                            e.preventDefault();
                            router.push('/dashboard/skills');
                        }}
                    >
                        前往 Skills 商店
                        <ExternalLink className="w-3 h-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

