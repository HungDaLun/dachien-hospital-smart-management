/**
 * 引用來源列表元件
 * 顯示 AI 回應所參考的資料來源
 * 遵循 EAKAP 科技戰情室設計系統規範
 */
'use client';

import { useState } from 'react';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { BookOpen, ChevronDown, ExternalLink, Hash } from 'lucide-react';

export interface Citation {
    startIndex?: number;
    endIndex?: number;
    uri?: string;
    title?: string;
    content?: string;
    [key: string]: any;
}

interface CitationListProps {
    citations: Citation[];
    dict: Dictionary;
}

export default function CitationList({ citations, dict }: CitationListProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!citations || citations.length === 0) {
        return null;
    }

    // 過濾掉重複的來源 (根據 title 或 uri)
    const uniqueCitations = citations.filter((citation, index, self) =>
        index === self.findIndex((c) => (
            (c.uri && c.uri === citation.uri) ||
            (c.title && c.title === citation.title)
        ))
    );

    // 如果過濾後沒有引用來源，則不顯示
    if (uniqueCitations.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 pt-6 border-t border-white/5">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="group/btn flex items-center gap-3 text-[10px] font-black text-text-tertiary hover:text-primary-400 transition-all uppercase tracking-widest"
            >
                <div className={`p-1 rounded-md border transition-all ${isExpanded ? 'bg-primary-500/20 border-primary-500/30 text-primary-400' : 'bg-white/5 border-white/5 group-hover/btn:border-primary-500/20'}`}>
                    <BookOpen size={12} />
                </div>
                <span>{dict.chat.citations.ref_count.replace('{{count}}', uniqueCitations.length.toString())}</span>
                <ChevronDown size={14} className={`transform transition-transform duration-300 opacity-40 ${isExpanded ? 'rotate-180 text-primary-400' : ''}`} />
            </button>

            {isExpanded && (
                <div className="mt-4 grid grid-cols-1 gap-2 animate-in slide-in-from-top-2 duration-300">
                    {uniqueCitations.map((citation, idx) => (
                        <div
                            key={idx}
                            className="group/item flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.04] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-default"
                        >
                            <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-[10px] font-mono text-text-tertiary">
                                {idx + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-bold text-text-secondary truncate group-hover/item:text-text-primary transition-colors" title={citation.title}>
                                    {citation.title || dict.chat.citations.untitled}
                                </div>
                                {citation.uri && (
                                    <div className="flex items-center gap-1.5 text-[9px] font-medium text-text-tertiary mt-1 opacity-40 group-hover/item:opacity-60 transition-opacity truncate">
                                        <Hash size={10} />
                                        {citation.uri}
                                    </div>
                                )}
                            </div>

                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity text-primary-400">
                                <ExternalLink size={12} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
