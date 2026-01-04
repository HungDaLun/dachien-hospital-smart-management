/**
 * 階層式分類下拉選單元件 V2
 * 使用 Portal 將次分類選單渲染到 body，避免 overflow 問題
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DocumentCategory } from '@/types';
import { ChevronDown } from 'lucide-react';

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

    // 設置懸停的主分類（立即生效）
    const handleParentEnter = (parentId: string) => {
        clearHoverTimeout();
        setHoveredParentId(parentId);
    };

    // 離開主分類（延遲清除）
    const handleParentLeave = () => {
        clearHoverTimeout();
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredParentId(null);
        }, 200); // 增加到 200ms
    };

    // 進入次分類選單（取消清除）
    const handleSubmenuEnter = () => {
        clearHoverTimeout();
    };

    // 離開次分類選單（延遲清除）
    const handleSubmenuLeave = () => {
        clearHoverTimeout();
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredParentId(null);
        }, 200);
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

    // 清理計時器（元件卸載時）
    useEffect(() => {
        return () => {
            clearHoverTimeout();
        };
    }, []);

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
                className="fixed w-56 bg-white border border-gray-200 rounded-md shadow-xl max-h-80 overflow-y-auto"
                style={{
                    top: `${submenuPosition.top}px`,
                    left: `${submenuPosition.left}px`,
                    zIndex: 99999,
                }}
                onMouseEnter={handleSubmenuEnter}
                onMouseLeave={handleSubmenuLeave}
            >
                {hoveredParent.children.map((child) => (
                    <button
                        key={child.id}
                        type="button"
                        onClick={() => handleSelect(child.id)}
                        className={`
                            w-full px-3 py-2 text-left text-sm
                            hover:bg-gray-50 transition-colors
                            ${value === child.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'}
                        `}
                    >
                        {child.name}
                    </button>
                ))}
            </div>,
            document.body
        );
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
                        bg-white border rounded-md
                        transition-all duration-150
                        ${sizeStyles[selectSize]}
                        border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                        hover:border-gray-400
                        ${isOpen ? 'ring-2 ring-primary-500 border-primary-500' : ''}
                    `}
                >
                    <span className="text-left truncate">{displayValue}</span>
                    <ChevronDown
                        size={16}
                        className={`text-gray-400 ml-2 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {/* 下拉選單 */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                        {/* 所有類型選項 */}
                        <button
                            type="button"
                            onClick={() => handleSelect('')}
                            className={`
                                w-full px-3 py-2 text-left text-sm
                                hover:bg-gray-50 transition-colors
                                ${value === '' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'}
                            `}
                        >
                            所有類型
                        </button>

                        {/* 主分類列表 */}
                        <div className="border-t border-gray-100 max-h-96 overflow-y-auto">
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
                                            px-3 py-2 text-sm font-medium cursor-pointer
                                            ${hoveredParentId === parent.id ? 'bg-gray-50' : ''}
                                            ${value === parent.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}
                                        `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{parent.name}</span>
                                            {parent.children.length > 0 && (
                                                <span className="text-gray-400 text-xs ml-2">▶</span>
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
