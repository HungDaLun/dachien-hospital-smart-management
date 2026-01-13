'use client';

import { Card, Button, Badge } from '@/components/ui';
import { Star, Download, Check } from 'lucide-react';
import { Skill } from '@/lib/skills/types';

interface SkillCardProps {
    skill: Skill;
    onInstall?: (skill: Skill) => void;
    isInstalled?: boolean;
    onClick?: () => void;
}

// Category translation mapping
const categoryMap: Record<string, string> = {
    'analytics': '資料分析',
    'finance': '財務',
    'hr': '人資',
    'legal': '法律',
    'marketing': '行銷',
    'operations': '營運',
    'sales': '銷售',
    'support': '客服',
    'productivity': '生產力',
    'communication': '溝通'
};

export function SkillCard({ skill, onInstall, isInstalled = false, onClick }: SkillCardProps) {
    const categoryName = categoryMap[skill.category.toLowerCase()] || skill.category;

    return (
        <Card
            variant="glass"
            className="group relative overflow-hidden transition-all duration-300 hover:border-purple-500/30 hover:shadow-glow-purple/20 cursor-pointer h-full border-white/5 bg-white/[0.02]"
            onClick={onClick}
        >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative p-6 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                            {skill.icon || '⚡️'}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-lg text-text-primary group-hover:text-purple-300 transition-colors leading-tight line-clamp-1 mb-1">
                                {skill.display_name}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap text-[11px] font-medium text-text-tertiary tracking-wider">
                                <span>{categoryName}</span>
                                {skill.is_official && (
                                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-1.5 py-0.5 h-auto text-[10px] leading-none">
                                        官方
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 mb-6 flex-grow min-h-[2.5rem]">
                    {skill.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold">4.9</span>
                        <span className="text-xs text-text-tertiary ml-0.5">(128)</span>
                    </div>

                    <Button
                        size="sm"
                        variant={isInstalled ? "outline" : "cta"}
                        className={`h-9 px-5 text-xs font-bold tracking-wide rounded-lg transition-all ${isInstalled
                            ? 'border-green-500/30 text-green-400 bg-green-500/10'
                            : 'shadow-glow-purple/20'
                            }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onInstall?.(skill);
                        }}
                    >
                        {isInstalled ? (
                            <>
                                <Check className="w-3.5 h-3.5 mr-1.5" />
                                已安裝
                            </>
                        ) : (
                            <>
                                <Download className="w-3.5 h-3.5 mr-1.5" />
                                安裝
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
