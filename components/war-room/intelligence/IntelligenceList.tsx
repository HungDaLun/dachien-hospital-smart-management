'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, CheckSquare, Square } from 'lucide-react';

interface IntelligenceListProps {
    items: any[];
}

export default function IntelligenceList({ items }: IntelligenceListProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === items.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(items.map(item => item.id));
        }
    };

    const handleDeleteBatch = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`確定要刪除選中的 ${selectedIds.length} 則情報嗎？此操作不可恢復。`)) return;

        setIsDeleting(true);
        try {
            const response = await fetch('/api/dashboard/intelligence/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds }),
            });

            const data = await response.json();
            if (data.success) {
                setSelectedIds([]);
                router.refresh();
            } else {
                alert('刪除失敗：' + data.error);
            }
        } catch (error) {
            console.error('Batch delete failed:', error);
            alert('刪除過程中發生錯誤');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            {items.length > 0 && (
                <div className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSelectAll}
                            className="flex items-center gap-2 text-xs font-black text-text-tertiary hover:text-white transition-colors uppercase tracking-widest"
                        >
                            {selectedIds.length === items.length ? <CheckSquare size={14} className="text-primary-400" /> : <Square size={14} />}
                            全選 ({selectedIds.length}/{items.length})
                        </button>
                    </div>
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleDeleteBatch}
                            disabled={isDeleting}
                            className="flex items-center gap-2 text-xs font-black text-semantic-danger hover:text-white transition-all bg-semantic-danger/10 hover:bg-semantic-danger px-3 py-1.5 rounded-lg border border-semantic-danger/20 disabled:opacity-50"
                        >
                            <Trash2 size={12} />
                            批次刪除
                        </button>
                    )}
                </div>
            )}

            <div className="space-y-4">
                {items.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                        <div
                            key={item.id}
                            onClick={() => toggleSelect(item.id)}
                            className={`p-6 rounded-2xl border transition-all cursor-pointer group relative ${isSelected
                                ? 'border-primary-500/50 bg-primary-500/5 shadow-glow-cyan/5'
                                : 'border-white/5 bg-background-secondary/50 hover:border-white/10'
                                }`}
                        >
                            {/* Checkbox Indicator */}
                            <div className={`absolute top-6 left-4 transition-all z-20 ${isSelected ? 'opacity-100 scale-110' : 'opacity-30 group-hover:opacity-100'}`}>
                                {isSelected ? (
                                    <CheckSquare size={20} className="text-primary-400 shadow-glow-cyan/50" />
                                ) : (
                                    <Square size={20} className="text-white hover:text-primary-400" />
                                )}
                            </div>

                            <div className="flex justify-between items-start mb-4 pl-8">
                                <div className="flex-1 pr-4">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 block ${item.risk_level === 'critical' || item.risk_level === 'high' ? 'text-semantic-danger' :
                                        (item.risk_level === 'medium' ? 'text-semantic-warning' : 'text-semantic-success')
                                        }`}>
                                        {item.risk_level === 'critical' ? '重大風險' :
                                            (item.risk_level === 'high' ? '高度風險' :
                                                (item.risk_level === 'medium' ? '中度風險' : '一般情報'))} • {item.tags?.[0] || '未分類'}
                                    </span>
                                    {item.url && item.url !== '#' ? (
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            className="hover:text-primary-400 transition-colors group/link inline-block"
                                            onClick={(e) => e.stopPropagation()} // 點連結不觸發選取
                                        >
                                            <h3 className="text-xl font-bold text-text-primary group-hover/link:text-primary-400 decoration-primary-400/30 underline-offset-4 group-hover/link:underline inline">
                                                {item.title}
                                            </h3>
                                            <span className="ml-3 text-xs font-normal text-text-tertiary opacity-60 group-hover/link:opacity-100">
                                                ({item.source})
                                            </span>
                                        </a>
                                    ) : (
                                        <h3 className="text-xl font-bold text-text-primary">
                                            {item.title}
                                            <span className="ml-3 text-xs font-normal text-text-tertiary">({item.source})</span>
                                        </h3>
                                    )}
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <span className="text-xs text-text-tertiary font-mono">{new Date(item.published_at).toLocaleString()}</span>
                                    <button
                                        className="text-[10px] px-3 py-1.5 rounded-lg border border-secondary-400/30 text-secondary-400 hover:bg-secondary-400/10 transition-all font-black uppercase tracking-widest"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        詢問 AI AGENT
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 ml-8">
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    <span className="text-primary-400 font-bold mr-2">AI 摘要:</span>
                                    {item.ai_summary}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {items.length === 0 && (
                    <div className="text-center py-20 text-text-tertiary bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                        <div className="text-4xl mb-4 opacity-20">📡</div>
                        <h3 className="text-xl font-bold text-text-secondary mb-2">尚無情報動態</h3>
                        <p className="text-sm">請新增監控主題以開始接收即時情報。</p>
                    </div>
                )}
            </div>
        </div>
    );
}
