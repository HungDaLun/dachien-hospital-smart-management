'use client';

import { Card, Button, Badge, ConfirmDialog } from '@/components/ui';
import { useState } from 'react';
import { Star, Download, Check, Trash2 } from 'lucide-react';
import { Skill } from '@/lib/skills/types';

interface SkillCardProps {
    skill: Skill;
    onInstall?: (skill: Skill) => void;
    isInstalled?: boolean;
    onClick?: () => void;
    isSuperAdmin?: boolean;
    onDelete?: (skill: Skill) => void;
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
    'communication': '溝通',
    'general': '通用工具',
    'development': '開發'
};

export function SkillCard({ skill, onInstall, isInstalled = false, onClick, isSuperAdmin, onDelete }: SkillCardProps) {
    const categoryName = categoryMap[skill.category.toLowerCase()] || skill.category;
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    return (
        <Card
            variant="glass"
            className="group relative overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:shadow-glow-purple/30 cursor-pointer h-[88px] border-white/5 bg-gradient-to-r from-white/[0.03] to-white/[0.01]"
            onClick={onClick}
        >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-4 flex items-center h-full gap-4">
                {/* Icon Section */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 group-hover:border-purple-500/30 transition-all duration-300 flex-shrink-0">
                    {skill.icon || '⚡️'}
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-bold text-base text-text-primary group-hover:text-purple-300 transition-colors truncate">
                                {skill.display_name}
                            </h3>
                            {skill.is_official && (
                                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-1.5 py-0 text-[9px] h-4 leading-none hidden sm:inline-flex">
                                    OFFICIAL
                                </Badge>
                            )}
                        </div>

                        {/* Rating (Hidden on very small screens, visible on hover/large) */}
                        <div className="flex items-center gap-1 text-yellow-500 text-xs font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                            <Star className="w-3 h-3 fill-current" />
                            <span>4.9</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-text-tertiary">
                        <span className="px-1.5 py-0.5 roundedElement bg-white/5 border border-white/5 uppercase tracking-wider text-[9px]">
                            {categoryName}
                        </span>
                        <p className="truncate opacity-70 group-hover:opacity-100 transition-opacity">
                            {skill.description}
                        </p>
                    </div>
                </div>

                {/* Action Section (Install Button) */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 flex flex-col gap-2">
                    <Button
                        size="sm"
                        variant={isInstalled ? "outline" : "cta"}
                        className={`h-8 px-3 text-xs font-bold rounded-lg transition-all ${isInstalled
                            ? 'border-green-500/30 text-green-400 bg-green-500/10 cursor-default'
                            : 'shadow-glow-purple/20 bg-purple-600 hover:bg-purple-500 text-white'
                            }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isInstalled) onInstall?.(skill);
                        }}
                    >
                        {isInstalled ? (
                            <Check className="w-3.5 h-3.5" />
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <Download className="w-3.5 h-3.5" />
                                <span>安裝</span>
                            </div>
                        )}
                    </Button>

                    {isSuperAdmin && (
                        <Button
                            size="sm"
                            variant="danger"
                            className="h-8 px-3 text-xs font-bold rounded-lg transition-all bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(true);
                            }}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            </div>
            {/* Local Confirm Dialog */}
            <ConfirmDialog
                open={showDeleteConfirm}
                title="刪除技能"
                description="確定要刪除此技能嗎？此操作無法復原。"
                onConfirm={() => {
                    onDelete?.(skill);
                    setShowDeleteConfirm(false);
                }}
                onCancel={() => setShowDeleteConfirm(false)}
                confirmText="確認刪除"
                variant="danger"
            />
        </Card>
    );
}
