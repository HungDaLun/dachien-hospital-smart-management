'use client';

import { useState, useEffect } from 'react';
import { Spinner, Button } from '@/components/ui';
import { BrainCircuit, ArrowLeft, Download, Trash2, Sparkles, Search } from 'lucide-react';
import Link from 'next/link';
import SkillList from '@/components/skills/SkillList';
import { SkillDetailModal } from '@/components/skills/SkillDetailModal';
import { SkillInstallModal } from '@/components/skills/SkillInstallModal';
import { SkillBulkInstallModal } from '@/components/skills/SkillBulkInstallModal';
import { SkillsMPSearchModal } from '@/components/skills/SkillsMPSearchModal';
import { Skill } from '@/lib/skills/types';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';

export default function SkillsMarketplace() {
    const { toast } = useToast();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    // const [selectedCategory, setSelectedCategory] = useState<string>('all'); // Not currently used in toolbar
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [installSkill, setInstallSkill] = useState<Skill | null>(null);
    const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    // Selection & Bulk Actions
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showBulkInstallModal, setShowBulkInstallModal] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);

    const handleSeedTop50 = async () => {
        try {
            setIsSeeding(true);
            const response = await fetch('/api/skills/marketplace/seed', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                toast.success(`成功同步 ${data.data.total} 個熱門技能！`);
                fetchSkills();
            } else {
                toast.error('同步失敗：' + (data.error?.message || '未知錯誤'));
            }
        } catch (err) {
            toast.error('同步過程發生錯誤');
        } finally {
            setIsSeeding(false);
        }
    };

    const handleTranslateAll = async () => {
        try {
            setIsTranslating(true);
            const response = await fetch('/api/skills/translate', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                toast.success(`成功翻譯 ${data.translatedCount} 個技能！`);
                fetchSkills();
            } else {
                toast.error('翻譯失敗：' + (data.error?.message || '未知錯誤'));
            }
        } catch (err) {
            toast.error('翻譯過程發生錯誤');
        } finally {
            setIsTranslating(false);
        }
    };

    const fetchSkills = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/skills');
            const data = await res.json();
            if (data.success) {
                setSkills(data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();

        // Check permissions
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (profile?.role === 'SUPER_ADMIN') {
                    setIsSuperAdmin(true);
                }
            }
        };
        checkUser();
    }, []);

    const handleDeleteSkill = async (skill: Skill) => {
        try {
            const res = await fetch(`/api/skills/${skill.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('技能已刪除');
                fetchSkills();
            } else {
                console.error('Failed to delete skill');
                toast.error('刪除失敗');
            }
        } catch (e) {
            console.error(e);
            toast.error('刪除發生錯誤');
        }
    };

    const handleBulkDelete = async () => {
        if (!isSuperAdmin) return;
        if (selectedIds.size === 0) return;
        if (!confirm(`確定要刪除選取的 ${selectedIds.size} 個技能嗎？此操作無法復原。`)) return;

        setIsBulkDeleting(true);
        try {
            const promises = Array.from(selectedIds).map(id =>
                fetch(`/api/skills/${id}`, { method: 'DELETE' })
            );
            await Promise.all(promises);
            toast.success(`成功刪除 ${selectedIds.size} 個技能`);
            setSelectedIds(new Set());
            fetchSkills();
        } catch (e) {
            console.error(e);
            toast.error('批次刪除發生錯誤');
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const getSelectedSkills = () => {
        return skills.filter(s => selectedIds.has(s.id));
    };

    const filteredSkills = skills.filter(s => {
        const matchesSearch = s.display_name.toLowerCase().includes(search.toLowerCase()) ||
            s.description.toLowerCase().includes(search.toLowerCase());
        // const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
        return matchesSearch;
    });

    return (
        <div className="w-full h-[calc(100vh-65px)] flex flex-col overflow-hidden bg-background-primary p-6 xl:p-10 space-y-6">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 shrink-0">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <Link href="/dashboard/agents">
                            <Button variant="ghost" size="sm" className="pl-0 text-text-tertiary hover:text-white hover:bg-transparent group">
                                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                                返回智能代理
                            </Button>
                        </Link>
                    </div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <BrainCircuit className="text-purple-500" size={32} />
                        技能市集 <span className="text-purple-500">.</span>
                    </h1>
                    <p className="text-text-tertiary mt-2 text-sm font-bold tracking-wide uppercase opacity-60">
                        整合全球市集，為您的智能代理賦予專業能力
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleSeedTop50}
                        loading={isSeeding}
                        className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                    >
                        <Sparkles size={16} className="mr-2" />
                        同步全球 Top 50
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleTranslateAll}
                        loading={isTranslating}
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                    >
                        <Sparkles size={16} className="mr-2" />
                        自動翻譯中文
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowMarketplaceModal(true)}
                        className="flex items-center gap-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                    >
                        <Download size={16} />
                        探索全球市集
                    </Button>
                </div>
            </div>

            {/* Main Content Area (List + Toolbar) */}
            <div className="flex-1 flex flex-col min-h-0 bg-background-secondary/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">

                {/* Toolbar */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between gap-4 bg-white/[0.02]">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                            <input
                                type="text"
                                placeholder="搜尋技能..."
                                className="w-full bg-white/5 border-none text-text-primary placeholder:text-text-tertiary/50 pl-10 h-10 rounded-lg focus:ring-1 focus:ring-purple-500/50 text-sm transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {selectedIds.size > 0 && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                <div className="h-6 w-[1px] bg-white/10 mx-2" />
                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{selectedIds.size} SELECTED</span>

                                <Button
                                    size="sm"
                                    variant="cta"
                                    className="h-8 text-xs font-bold"
                                    onClick={() => setShowBulkInstallModal(true)}
                                >
                                    <Sparkles size={14} className="mr-1.5" />
                                    安裝到 Agent
                                </Button>

                                {isSuperAdmin && (
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        className="h-8 text-xs font-bold bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                                        onClick={handleBulkDelete}
                                        loading={isBulkDeleting}
                                    >
                                        <Trash2 size={14} className="mr-1.5" />
                                        刪除
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* List View */}
                {loading ? (
                    <div className="flex justify-center items-center flex-1">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    <SkillList
                        skills={filteredSkills}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onSkillClick={setSelectedSkill}
                        onDelete={async (id) => {
                            const skill = skills.find(s => s.id === id);
                            if (skill) await handleDeleteSkill(skill);
                        }}
                        isSuperAdmin={isSuperAdmin}
                    />
                )}
            </div>

            {/* Modals */}
            <SkillDetailModal
                isOpen={!!selectedSkill}
                onClose={() => setSelectedSkill(null)}
                skill={selectedSkill}
                onInstall={() => {
                    if (selectedSkill) {
                        setInstallSkill(selectedSkill);
                        setSelectedSkill(null);
                    }
                }}
                isSuperAdmin={isSuperAdmin}
                onDelete={() => selectedSkill && handleDeleteSkill(selectedSkill)}
            />

            <SkillInstallModal
                isOpen={!!installSkill}
                onClose={() => setInstallSkill(null)}
                skill={installSkill}
            />

            <SkillBulkInstallModal
                isOpen={showBulkInstallModal}
                onClose={() => setShowBulkInstallModal(false)}
                skills={getSelectedSkills()}
                onSuccess={() => {
                    setSelectedIds(new Set()); // Create new Set to clear selection
                }}
            />

            <SkillsMPSearchModal
                isOpen={showMarketplaceModal}
                onClose={() => setShowMarketplaceModal(false)}
                onImportSuccess={fetchSkills}
            />
        </div>
    );
}

// Helper to remove SkillCard import if no longer used? No, I replaced it.
// I should remove SkillCard unused import if I'm diligent, but I kept it in imports above just in case.
// Actually, I should remove it to be clean.

