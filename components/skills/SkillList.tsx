
'use client';

import { useState } from 'react';
import { ConfirmDialog, Checkbox, Badge, Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { Skill } from '@/lib/skills/types';
import { Trash2 } from 'lucide-react';

interface SkillListProps {
    skills: Skill[];
    selectedIds: Set<string>;
    onSelectionChange: (newSelection: Set<string>) => void;
    onSkillClick?: (skill: Skill) => void;
    // Optional props for actions
    onDelete?: (skillId: string) => Promise<void>;
    isSuperAdmin?: boolean;
}

// Category translation mapping (reused from SkillCard)
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

export default function SkillList({
    skills,
    selectedIds,
    onSelectionChange,
    onSkillClick,
    onDelete,
    isSuperAdmin
}: SkillListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange(new Set(skills.map(s => s.id)));
        } else {
            onSelectionChange(new Set());
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        const newSet = new Set(selectedIds);
        if (checked) newSet.add(id);
        else newSet.delete(id);
        onSelectionChange(newSet);
    };

    const handleDeleteClick = (id: string) => {
        setConfirmDeleteId(id);
    };

    const handleDeleteConfirm = async () => {
        if (!onDelete || !confirmDeleteId) return;
        setDeletingId(confirmDeleteId);
        try {
            await onDelete(confirmDeleteId);
            toast.success('技能已刪除');
        } catch (error) {
            toast.error('刪除失敗');
        } finally {
            setDeletingId(null);
            setConfirmDeleteId(null);
        }
    };

    return (
        <div className="w-full flex flex-col h-full bg-background-primary/50 rounded-xl border border-white/5 overflow-hidden">
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-background-primary/95 backdrop-blur-md border-b border-white/5 shadow-md">
                        <tr className="text-sm font-black text-white uppercase tracking-[0.2em] h-14 border-b border-white/10">
                            <th className="px-6 w-[35%] text-center">技能概覽</th>
                            <th className="px-4 w-[15%] text-center">類別</th>
                            <th className="px-4 w-[40%] text-center">功能描述</th>
                            <th className="px-4 w-[10%] text-right pr-6">
                                <div className="flex items-center justify-end gap-3">
                                    <span className="text-[10px] opacity-50">全選</span>
                                    <Checkbox
                                        variant="white-circle"
                                        checked={skills.length > 0 && selectedIds.size === skills.length}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                        {skills.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-20 text-center opacity-40">
                                    <p className="text-sm font-black uppercase tracking-widest text-text-tertiary">沒有符合的技能</p>
                                </td>
                            </tr>
                        ) : (
                            skills.map(skill => {
                                const isSelected = selectedIds.has(skill.id);
                                const categoryName = categoryMap[skill.category.toLowerCase()] || skill.category;

                                return (
                                    <tr
                                        key={skill.id}
                                        className={`group transition-colors duration-200 cursor-pointer ${isSelected ? 'bg-primary-500/5' : 'hover:bg-white/[0.02]'}`}
                                        onClick={() => onSkillClick?.(skill)}
                                    >
                                        <td className="px-6 py-4">
                                            {/* Centered block with fixed width to keep icons aligned vertically */}
                                            <div className="flex justify-center">
                                                <div className="flex items-center gap-4 text-left w-[260px]">
                                                    <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 shadow-inner transition-transform group-hover:scale-105 ${isSelected ? 'border-primary-500/30' : ''}`}>
                                                        {skill.icon || '⚡️'}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className={`font-bold text-base truncate ${isSelected ? 'text-primary-400' : 'text-text-primary'}`}>
                                                                {skill.display_name}
                                                            </h3>
                                                            {skill.is_official && (
                                                                <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase leading-none flex-shrink-0">
                                                                    OFFICIAL
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary">
                                                            <span>v{skill.version}</span>
                                                            <span>•</span>
                                                            <span>{skill.author || 'EAKAP'}</span>
                                                            {(() => {
                                                                const starsTag = skill.tags?.find(t => t.startsWith('stars:'));
                                                                const stars = skill.metadata?.stars ?? (starsTag ? parseInt(starsTag.split(':')[1]) : undefined);
                                                                if (stars === undefined) return null;
                                                                return (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1 text-yellow-500/80">
                                                                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                                            </svg>
                                                                            {stars}
                                                                        </span>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-text-secondary border-transparent py-1 px-3">
                                                {categoryName}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            {/* Centered block with fixed width for description alignment */}
                                            <div className="flex justify-center">
                                                <p className="text-sm text-text-tertiary leading-relaxed w-[450px] font-medium text-left">
                                                    {skill.description}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-4 h-full">
                                                {isSuperAdmin && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-text-tertiary hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(skill.id);
                                                        }}
                                                        loading={deletingId === skill.id}
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                )}
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onChange={(e) => handleSelectRow(skill.id, e.target.checked)}
                                                        variant="white-circle"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <ConfirmDialog
                open={!!confirmDeleteId}
                title="刪除技能"
                description="確定要刪除此技能嗎？"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirmDeleteId(null)}
                confirmText="確認刪除"
                variant="danger"
                loading={!!deletingId}
            />
        </div>
    );
}

