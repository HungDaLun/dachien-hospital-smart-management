/**
 * Badge 元件
 * 標籤徽章元件，用於狀態顯示
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { HTMLAttributes } from 'react';

/**
 * Badge 變體類型
 */
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

/**
 * Badge 尺寸類型
 */
export type BadgeSize = 'sm' | 'md';

/**
 * Badge 屬性介面
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    /** 變體 */
    variant?: BadgeVariant;
    /** 尺寸 */
    size?: BadgeSize;
    /** 是否顯示圓點 */
    dot?: boolean;
}

/**
 * 變體樣式對照
 */
const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
};

/**
 * 圓點顏色對照
 */
const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-gray-400',
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
};

/**
 * 尺寸樣式對照
 */
const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
};

/**
 * Badge 元件
 * 
 * @example
 * ```tsx
 * <Badge variant="success">已同步</Badge>
 * <Badge variant="warning" dot>處理中</Badge>
 * <Badge variant="error">失敗</Badge>
 * ```
 */
export function Badge({
    variant = 'default',
    size = 'sm',
    dot = false,
    children,
    className = '',
    ...props
}: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center gap-1.5
        font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
            {...props}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
            )}
            {children}
        </span>
    );
}

export default Badge;
