'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Badge } from '@/components/ui';
import SkillImporter from './SkillImporter';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Check if available, package.json says yes

interface Skill {
    id: string;
    name: string;
    display_name: string; // skills_library 使用 display_name
    description: string;
    category: string;
    author?: string;
    tags?: string[];
    is_official: boolean;
    // ... other fields
}

interface SkillsMarketplaceProps {
    onSelectSkill: (skill: Skill) => void;
}

export default function SkillsMarketplace({ onSelectSkill }: SkillsMarketplaceProps) {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');

    // Categories for filter - could be dynamic later
    const categories = ['All', 'Marketing', 'Sales', 'HR', 'Legal', 'R&D', 'Support', 'Custom'];

    const fetchSkills = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (categoryFilter !== 'All') params.append('category', categoryFilter);

            // 修正：使用正確的 Skills API 端點
            const res = await fetch(`/api/skills?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setSkills(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch skills', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, categoryFilter]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchSkills();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, categoryFilter, fetchSkills]);

    const handleImportComplete = () => {
        fetchSkills(); // Refresh list
        // Optionally auto-select: onSelectSkill(newSkill);
    };

    return (
        <div className="space-y-6">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="搜尋 Skill..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${categoryFilter === cat
                                    ? 'bg-primary-100 text-primary-700 font-medium'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <SkillImporter onImportComplete={handleImportComplete} />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {skills.length > 0 ? (
                        skills.map(skill => (
                            <Card
                                key={skill.id}
                                interactive
                                onClick={() => onSelectSkill(skill)}
                                className="group cursor-pointer hover:border-primary-200 transition-all hover:-translate-y-1"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-white rounded-lg flex items-center justify-center text-xl shadow-sm">
                                        {/* Icon based on category? */}
                                        {skill.category === 'Marketing' ? '📢' :
                                            skill.category === 'Sales' ? '💰' :
                                                skill.category === 'HR' ? '👥' : '🧩'}
                                    </div>
                                    {skill.is_official && (
                                        <Badge variant="success" size="sm">Official</Badge>
                                    )}
                                </div>

                                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                                    {skill.display_name || skill.name}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                                    {skill.description || 'No description provided.'}
                                </p>

                                <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                                    <span>by {skill.author || 'Unknown'}</span>
                                    <div className="flex gap-1">
                                        {skill.tags?.slice(0, 2).map(tag => (
                                            <span key={tag} className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            沒有找到符合的 Skills
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
