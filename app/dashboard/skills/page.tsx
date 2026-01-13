'use client';

import { useState, useEffect } from 'react';
import { Card, Spinner, Button } from '@/components/ui';
import { Search, BrainCircuit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SkillCard } from '@/components/skills/SkillCard';
import { SkillDetailModal } from '@/components/skills/SkillDetailModal';
import { SkillInstallModal } from '@/components/skills/SkillInstallModal';
import { Skill } from '@/lib/skills/types';

// Category translation mapping
const categoryMap: Record<string, string> = {
    'all': '全部',
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

export default function SkillsMarketplace() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [installSkill, setInstallSkill] = useState<Skill | null>(null);

    useEffect(() => {
        async function fetchSkills() {
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
        }
        fetchSkills();
    }, []);

    const categories = ['all', ...Array.from(new Set(skills.map(s => s.category)))];

    const filteredSkills = skills.filter(s => {
        const matchesSearch = s.display_name.toLowerCase().includes(search.toLowerCase()) ||
            s.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="w-full p-6 xl:p-10 space-y-8">
            {/* Back Button */}
            <div>
                <Link href="/dashboard/agents">
                    <Button variant="ghost" size="sm" className="pl-0 text-text-tertiary hover:text-white hover:bg-transparent group">
                        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        返回智能代理
                    </Button>
                </Link>
            </div>

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <BrainCircuit className="text-purple-500" size={32} />
                        技能市集 <span className="text-purple-500">.</span>
                    </h1>
                    <p className="text-text-tertiary mt-2 text-sm font-bold tracking-wide uppercase opacity-60">
                        為您的智能代理賦予專業行為模組
                    </p>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <Card variant="glass" className="p-2 border-white/5 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                    <input
                        type="text"
                        placeholder="搜尋技能、描述或標籤..."
                        className="w-full bg-transparent border-none text-text-primary placeholder:text-text-tertiary/50 pl-12 h-12 focus:ring-0 text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="h-8 w-[1px] bg-white/10 hidden md:block" />

                <div className="flex gap-2 px-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`
                            px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                            ${selectedCategory === cat
                                    ? 'bg-purple-500 text-white shadow-glow-purple/20'
                                    : 'bg-white/5 text-text-tertiary hover:bg-white/10 hover:text-white'}
                        `}
                        >
                            {categoryMap[cat.toLowerCase()] || cat}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSkills.map(skill => (
                        <SkillCard
                            key={skill.id}
                            skill={skill}
                            onClick={() => setSelectedSkill(skill)}
                            onInstall={() => setInstallSkill(skill)}
                        />
                    ))}

                    {filteredSkills.length === 0 && (
                        <div className="col-span-full py-20 text-center opacity-40">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BrainCircuit size={32} />
                            </div>
                            <p className="text-sm font-black uppercase tracking-widest text-text-tertiary">沒有符合的技能</p>
                        </div>
                    )}
                </div>
            )}

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
            />

            <SkillInstallModal
                isOpen={!!installSkill}
                onClose={() => setInstallSkill(null)}
                skill={installSkill}
            />
        </div>
    );
}
