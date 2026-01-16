/**
 * 階層式分類下拉選單元件 V2 - 科技戰情室版本
 * 使用 Portal 將次分類選單渲染到 body，避免 overflow 問題
 * 遵循 EAKAP 科技戰情室設計系統規範
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DocumentCategory } from '@/types';
import { ChevronDown, ChevronRight, Hash } from 'lucide-react';

interface HierarchicalCategorySelectProps {
    categories: DocumentCategory[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
    selectSize?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
};

export default function HierarchicalCategorySelect({
    categories,
    value,
    onChange,
    className = '',
    selectSize = 'sm',
}: HierarchicalCategorySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredParentId, setHoveredParentId] = useState<string | null>(null);
    const [submenuPosition, setSubmenuPosition] = useState<{ top: number; left: number } | null>(null);
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const parentItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 確保只在客戶端渲染 Portal
    useEffect(() => {
        setMounted(true);
    }, []);

    // 建立階層結構
    const buildTree = (cats: DocumentCategory[]) => {
        const parents = cats.filter(c => c.parent_id === null);
        const childrenMap = new Map<string, DocumentCategory[]>();

        cats.forEach(cat => {
            if (cat.parent_id) {
                if (!childrenMap.has(cat.parent_id)) {
                    childrenMap.set(cat.parent_id, []);
                }
                childrenMap.get(cat.parent_id)!.push(cat);
            }
        });

        return parents.map(parent => ({
            ...parent,
            children: childrenMap.get(parent.id) || [],
        }));
    };

    const tree = buildTree(categories);

    // 取得選中的分類名稱
    const selectedCategory = categories.find(c => c.id === value);
    const displayValue = selectedCategory ? selectedCategory.name : '所有類型';

    // 清除延遲計時器
    const clearHoverTimeout = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    };

    // 設置懸停的主分類
    const handleParentEnter = (parentId: string) => {
        clearHoverTimeout();
        setHoveredParentId(parentId);
    };

    // 離開主分類
    const handleParentLeave = () => {
        clearHoverTimeout();
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredParentId(null);
        }, 150);
    };

    // 更新子選單位置
    useEffect(() => {
        if (hoveredParentId) {
            const parentElement = parentItemRefs.current.get(hoveredParentId);
            if (parentElement) {
                const rect = parentElement.getBoundingClientRect();
                setSubmenuPosition({
                    top: rect.top,
                    left: rect.right + 4,
                });
            }
        } else {
            setSubmenuPosition(null);
        }
    }, [hoveredParentId]);

    // 點擊外部關閉
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setHoveredParentId(null);
                clearHoverTimeout();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (categoryId: string) => {
        onChange(categoryId);
        setIsOpen(false);
        setHoveredParentId(null);
        clearHoverTimeout();
    };

    const hoveredParent = hoveredParentId ? tree.find(p => p.id === hoveredParentId) : null;

    // 次分類選單元件
    const SubmenuPortal = () => {
        if (!mounted || !hoveredParent || !hoveredParent.children.length || !submenuPosition) {
            return null;
        }

        return createPortal(
            <div
                className="fixed w-56 bg-slate-800 border border-white/10 rounded-xl shadow-xl shadow-black/80 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-left-2 duration-200"
                style={{
                    top: `${submenuPosition.top}px`,
                    left: `${submenuPosition.left}px`,
                    zIndex: 99999,
                }}
                onMouseEnter={() => clearHoverTimeout()}
                onMouseLeave={handleSubmenuLeave}
            >
                <div className="p-1 space-y-0.5">
                    {hoveredParent.children.map((child) => (
                        <button
                            key={child.id}
                            type="button"
                            onClick={() => handleSelect(child.id)}
                            className={`
                                w-full px-4 py-2 text-left text-[11px] font-bold rounded-lg transition-all
                                hover:bg-white/5 uppercase tracking-widest
                                ${value === child.id ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-glow-cyan/5' : 'text-text-secondary border border-transparent'}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <Hash size={10} className="opacity-30" />
                                {child.name}
                            </div>
                        </button>
                    ))}
                </div>
            </div>,
            document.body
        );
    };

    const handleSubmenuLeave = () => {
        clearHoverTimeout();
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredParentId(null);
        }, 150);
    };

    return (
        <>
            <div ref={containerRef} className={`relative ${className}`}>
                {/* 觸發按鈕 */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        w-full
                        flex items-center justify-between
                        bg-white/[0.03] backdrop-blur-sm
                        border rounded-xl
                        transition-all duration-300
                        ${sizeStyles[selectSize]}
                        font-medium
                        ${isOpen
                            ? 'border-primary-500/50 ring-4 ring-primary-500/10 text-text-primary shadow-glow-cyan/5'
                            : 'border-white/10 text-text-primary hover:border-white/20'
                        }
                    `}
                >
                    <span className="text-left truncate">{displayValue}</span>
                    <ChevronDown
                        size={14}
                        className={`text-text-tertiary ml-2 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-400' : ''}`}
                    />
                </button>

                {/* 下拉選單 */}
                {isOpen && (
                    <div className="absolute z-50 w-64 mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl shadow-black/80 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* 所有類型選項 */}
                        <div className="p-1.5 border-b border-white/5">
                            <button
                                type="button"
                                onClick={() => handleSelect('')}
                                className={`
                                        w-full px-4 py-2 text-left text-sm font-medium rounded-xl transition-all
                                        hover:bg-white/5
                                        ${value === '' ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'text-text-secondary border border-transparent'}
                                    `}
                            >
                                所有類型
                            </button>
                        </div>

                        {/* 主分類列表 */}
                        <div className="p-1.5 space-y-0.5 max-h-96 overflow-y-auto custom-scrollbar">
                            {tree.map((parent) => (
                                <div
                                    key={parent.id}
                                    ref={(el) => {
                                        if (el) {
                                            parentItemRefs.current.set(parent.id, el);
                                        } else {
                                            parentItemRefs.current.delete(parent.id);
                                        }
                                    }}
                                    className="relative"
                                    onMouseEnter={() => handleParentEnter(parent.id)}
                                    onMouseLeave={handleParentLeave}
                                >
                                    {/* 主分類項目 */}
                                    <div
                                        className={`
                                            px-4 py-2 text-sm font-medium rounded-xl cursor-pointer transition-all
                                            ${hoveredParentId === parent.id ? 'bg-white/5 text-text-primary' : 'text-text-secondary'}
                                            ${value === parent.id ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'border border-transparent'}
                                        `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{parent.name}</span>
                                            {parent.children.length > 0 && (
                                                <ChevronRight size={12} className={`text-text-tertiary transition-transform ${hoveredParentId === parent.id ? 'translate-x-1 text-primary-400' : ''}`} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 次分類選單 - 使用 Portal 渲染到 body */}
            {isOpen && <SubmenuPortal />}
        </>
    );
}
