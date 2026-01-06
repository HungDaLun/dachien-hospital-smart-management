/**
 * Progress 元件
 * 顯示任務進度條
 * 遵循 EAKAP 科技戰情室設計系統規範
 */
'use client';

import React from 'react';

interface ProgressProps {
    /** 目前進度 (0-100) */
    value: number;
    /** 最大值 (可選，預設 100) */
    max?: number;
    /** 尺寸 */
    size?: 'sm' | 'md' | 'lg';
    /** 是否顯示百分比文字 */
    showValue?: boolean;
    /** 顏色類名 */
    colorClass?: string;
    /** 額外的 className */
    className?: string;
    /** 標籤文字 (例如：正在分析...) */
    label?: string;
}

export function Progress({
    value,
    max = 100,
    size = 'md',
    showValue = false,
    colorClass = 'bg-primary-500',
    className = '',
    label,
}: ProgressProps) {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

    const sizeHeight = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3.5',
    }[size];

    return (
        <div className={`w-full ${className}`}>
            {(label || showValue) && (
                <div className="flex justify-between items-end mb-2">
                    {label && (
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3 bg-primary-500/50 rounded-full" />
                            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">{label}</span>
                        </div>
                    )}
                    {showValue && (
                        <span className="text-[11px] font-black text-primary-400 tabular-nums">
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full bg-white/[0.03] rounded-full overflow-hidden ${sizeHeight} border border-white/5 shadow-inner relative`}>
                <div
                    className={`h-full transition-all duration-700 ease-out rounded-full ${colorClass} shadow-glow-cyan/20 relative`}
                    style={{ width: `${percentage}%` }}
                >
                    {/* 微妙的光澤動畫 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer scale-x-[2]" />
                </div>
            </div>
        </div>
    );
}

export default Progress;
