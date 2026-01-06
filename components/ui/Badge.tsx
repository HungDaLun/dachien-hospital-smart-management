/**
 * Badge 元件
 * 企業戰情室設計系統 - 標籤徽章元件
 * 
 * 變體說明：
 * - default: 電光藍（預設）
 * - success: 翠綠（正向狀態）
 * - warning: 琥珀黃（注意）
 * - danger: 霓虹紅（警告）
 * - secondary: AI 紫光
 * - outline: 僅邊框
 * - info: 資訊藍
 */
'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Badge 變體定義
 */
const badgeVariants = cva(
    // 基礎樣式：使用更小的字體、更重的字重、大寫與字距
    'inline-flex items-center rounded-lg font-black uppercase tracking-widest transition-all duration-300',
    {
        variants: {
            variant: {
                // 預設（電光藍） - 增加微妙發光
                default: 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-glow-cyan/5',

                // 主要（電光藍）
                primary: 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-glow-cyan/5',

                // 成功（翠綠）
                success: 'bg-semantic-success/10 text-semantic-success border border-semantic-success/20 shadow-glow-green/5',

                // 警告（琥珀黃）
                warning: 'bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20 shadow-glow-amber/5',

                // 危險（霓虹紅）
                danger: 'bg-semantic-danger/10 text-semantic-danger border border-semantic-danger/20 shadow-glow-red/5',

                // AI 功能（紫光）
                secondary: 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-glow-purple/5',

                // 僅邊框
                outline: 'text-text-tertiary border border-white/10 bg-transparent hover:border-white/20 hover:text-text-secondary',

                // 資訊（電光藍）
                info: 'bg-primary-500/10 text-primary-400 border border-primary-500/20',

                // 錯誤（霓虹紅）
                error: 'bg-semantic-danger/10 text-semantic-danger border border-semantic-danger/20',

                // 兼容性映射：將舊的淺色模式變體映射到深色戰情室風格
                'light-default': 'bg-white/5 text-text-tertiary border border-white/10',
                'light-primary': 'bg-primary-500/10 text-primary-400 border border-primary-500/20',
                'light-success': 'bg-semantic-success/10 text-semantic-success border border-semantic-success/20',
                'light-warning': 'bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20',
                'light-error': 'bg-semantic-danger/10 text-semantic-danger border border-semantic-danger/20',
            },

            size: {
                sm: 'px-1.5 py-0.5 text-[9px] gap-1',
                md: 'px-2 py-0.5 text-[10px] gap-1.5',
                lg: 'px-3 py-1 text-[11px] gap-2',
            },
        },

        defaultVariants: {
            variant: 'default',
            size: 'sm',
        },
    }
);

/**
 * 圓點顏色對照（用於 dot 模式）
 */
const dotColors: Record<string, string> = {
    default: 'bg-primary-500',
    primary: 'bg-primary-500',
    success: 'bg-semantic-success',
    warning: 'bg-semantic-warning',
    danger: 'bg-semantic-danger',
    error: 'bg-semantic-danger',
    secondary: 'bg-purple-500',
    outline: 'bg-white/20',
    info: 'bg-primary-500',
    'light-default': 'bg-white/20',
    'light-primary': 'bg-primary-500',
    'light-success': 'bg-semantic-success',
    'light-warning': 'bg-semantic-warning',
    'light-error': 'bg-semantic-danger',
};

/**
 * Badge 屬性介面
 */
export interface BadgeProps
    extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
    /** 是否顯示圓點 */
    dot?: boolean;
    /** 是否有脈衝動畫（用於即時狀態） */
    pulse?: boolean;
}

/**
 * Badge 元件
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    (
        {
            variant = 'default',
            size = 'sm',
            dot = false,
            pulse = false,
            children,
            className = '',
            ...props
        },
        ref
    ) => {
        const variantKey = variant ?? 'default';

        return (
            <span
                ref={ref}
                className={`
                    ${badgeVariants({ variant, size })}
                    ${pulse ? 'animate-pulse-slow' : ''}
                    ${className}
                `}
                {...props}
            >
                {dot && (
                    <span
                        className={`
                            rounded-full flex-shrink-0
                            ${size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5'}
                            ${dotColors[variantKey] || 'bg-current'}
                            ${pulse ? 'shadow-glow-cyan/50' : ''}
                        `}
                    />
                )}
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';

// 導出變體定義
export { badgeVariants };
export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;
export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>['size']>;

export default Badge;
