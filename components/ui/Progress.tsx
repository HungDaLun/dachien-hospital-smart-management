/**
 * Progress 元件
 * 顯示任務進度條
 * 遵循 EAKAP 設計系統規範
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
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    }[size];

    return (
        <div className={`w-full ${className}`}>
            {(label || showValue) && (
                <div className="flex justify-between items-center mb-1.5">
                    {label && <span className="text-xs font-medium text-gray-700">{label}</span>}
                    {showValue && (
                        <span className="text-xs font-bold text-primary-600">
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${sizeHeight} shadow-inner`}>
                <div
                    className={`h-full transition-all duration-300 ease-out rounded-full ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export default Progress;
