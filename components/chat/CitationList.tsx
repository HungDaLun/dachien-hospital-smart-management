/**
 * 引用來源列表元件
 * 顯示 AI 回應所參考的資料來源
 */
'use client';

import { useState } from 'react';

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
}

export default function CitationList({ citations }: CitationListProps) {
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

    return (
        <div className="mt-3 pt-3 border-t border-gray-200/50">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary-600 transition-colors"
            >
                <span className="flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 text-[10px]">
                    i
                </span>
                <span>參考了 {uniqueCitations.length} 個來源</span>
                <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            {isExpanded && (
                <div className="mt-2 text-xs space-y-2">
                    {uniqueCitations.map((citation, idx) => (
                        <div key={idx} className="bg-white/50 p-2 rounded border border-gray-200">
                            <div className="font-medium text-gray-700 truncate" title={citation.title}>
                                {idx + 1}. {citation.title || '未命名文件'}
                            </div>
                            {citation.uri && (
                                <div className="text-gray-400 mt-1 truncate max-w-full text-[10px]">
                                    {citation.uri}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
