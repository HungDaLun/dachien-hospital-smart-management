'use client';

import { useState, useEffect } from 'react';
import TemplateCard, { AgentTemplate } from './TemplateCard';
import { Button } from '@/components/ui';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface TemplateSelectorProps {
    onSelect: (template: AgentTemplate) => void;
    onSkip: () => void;
}

export default function TemplateSelector({ onSelect, onSkip }: TemplateSelectorProps) {
    const [templates, setTemplates] = useState<AgentTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string>('All');
    const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/agents/templates');
            const data = await res.json();
            if (data.success) {
                setTemplates(data.data);
            }
        } catch (e) {
            console.error('Failed to fetch templates', e);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'All' || t.category === category;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">選擇 Agent 模板</h2>
                <p className="text-gray-500">從我們精心設計的模板開始，或從頭建立您的專屬 Agent</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${category === cat
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="搜尋模板..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto p-1">
                    {filteredTemplates.map(template => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            selected={selectedTemplate?.id === template.id}
                            onSelect={setSelectedTemplate}
                        />
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <button
                    onClick={onSkip}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2"
                >
                    跳過，從空白開始
                </button>
                <Button
                    disabled={!selectedTemplate}
                    onClick={() => selectedTemplate && onSelect(selectedTemplate)}
                    variant="primary"
                    className="px-8"
                >
                    使用此模板
                </Button>
            </div>
        </div>
    );
}
