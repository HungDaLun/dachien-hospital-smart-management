'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui';
import { Wrench, Check } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface Tool {
    name: string;
    display_name: string;
    description: string;
    category: string;
    icon?: string;
}

interface ToolSelectorProps {
    selectedTools: string[];
    onChange: (tools: string[]) => void;
    className?: string;
}

const CATEGORY_NAMES: Record<string, string> = {
    'knowledge': '知識與文件',
    'data': '數據與報表',
    'communication': '通訊與通知',
    'export': '匯出功能',
    'external': '外部服務',
    'task': '任務管理',
    'general': '一般工具'
};

export function ToolSelector({ selectedTools, onChange, className }: ToolSelectorProps) {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTools() {
            try {
                const res = await fetch('/api/tools');
                const data = await res.json();
                if (data.success) {
                    setTools(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch tools', err);
            } finally {
                setLoading(false);
            }
        }
        fetchTools();
    }, []);

    const handleToggle = (toolName: string) => {
        if (selectedTools.includes(toolName)) {
            onChange(selectedTools.filter(t => t !== toolName));
        } else {
            onChange([...selectedTools, toolName]);
        }
    };

    // Group tools by category
    const toolsByCategory = tools.reduce((acc, tool) => {
        if (!acc[tool.category]) acc[tool.category] = [];
        acc[tool.category].push(tool);
        return acc;
    }, {} as Record<string, Tool[]>);

    // Preferred order of categories
    const categoryOrder = ['knowledge', 'communication', 'task', 'data', 'export', 'external', 'general'];
    const sortedCategories = Object.keys(toolsByCategory).sort((a, b) => {
        const idxA = categoryOrder.indexOf(a);
        const idxB = categoryOrder.indexOf(b);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-6 w-32 bg-white/5 rounded" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-10 w-full bg-white/5 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <Wrench className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="font-bold text-sm text-text-secondary uppercase tracking-wider">啟用功能 (Tools)</h3>
                <Badge variant="secondary" className="ml-auto text-[10px] px-2 h-5 bg-white/5 text-text-tertiary">
                    已選 {selectedTools.length} / {tools.length}
                </Badge>
            </div>

            <div className="space-y-6">
                <TooltipProvider delayDuration={300}>
                    {sortedCategories.map(category => (
                        <div key={category} className="space-y-3">
                            <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest ml-1 opacity-60">
                                {CATEGORY_NAMES[category] || category}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {toolsByCategory[category].map(tool => {
                                    const isSelected = selectedTools.includes(tool.name);
                                    return (
                                        <Tooltip key={tool.name}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    onClick={() => handleToggle(tool.name)}
                                                    className={`
                                                        group flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all duration-200 select-none
                                                        ${isSelected
                                                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-100 shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]'
                                                            : 'bg-white/[0.02] border-white/5 text-text-secondary hover:bg-white/[0.04] hover:border-white/10'}
                                                    `}
                                                >
                                                    <div className={`
                                                        w-4 h-4 rounded flex items-center justify-center border transition-all duration-200 shrink-0
                                                        ${isSelected
                                                            ? 'bg-blue-500 border-blue-500 text-black'
                                                            : 'bg-transparent border-white/20 group-hover:border-white/30'}
                                                    `}>
                                                        {isSelected && <Check size={10} strokeWidth={4} />}
                                                    </div>

                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-sm opacity-80">{tool.icon || '🔧'}</span>
                                                        <span className={`text-xs font-medium truncate ${isSelected ? 'text-blue-100' : 'text-text-secondary'}`}>
                                                            {tool.display_name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" className="max-w-[250px] bg-zinc-900 border-white/10 text-xs text-zinc-400 p-3 leading-relaxed">
                                                <p>{tool.description}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </TooltipProvider>
            </div>
        </div>
    );
}

