/**
 * Card 元件
 * 企業戰情室設計系統 - 通用卡片容器元件
 * 
 * 變體說明：
 * - glass: 標準毛玻璃卡片
 * - glow: 霓虹邊框發光卡片（強調）
 * - danger: 紅色邊框卡片（風險警報）
 * - success: 綠色邊框卡片（達成狀態）
 * - warning: 黃色邊框卡片（注意）
 * - ai: 紫色邊框卡片（AI 相關）
 * - solid: 實心淺色卡片（兼容淺色模式）
 */
'use client';

import { HTMLAttributes, ReactNode, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Card 變體定義
 */
const cardVariants = cva(
    // 基礎樣式
    'rounded-2xl transition-all duration-250 ease-smooth contain-layout',
    {
        variants: {
            variant: {
                // 標準毛玻璃卡片
                glass: 'glass-card hover:shadow-2xl hover:shadow-primary-500/10',

                // 霓虹發光卡片（強調）
                glow: 'glass-glow hover:shadow-2xl hover:shadow-primary-500/30',

                // 危險警報卡片
                danger: 'glass-danger hover:shadow-2xl hover:shadow-semantic-danger/20',

                // 成功狀態卡片
                success: 'glass-success hover:shadow-2xl hover:shadow-semantic-success/20',

                // 警告狀態卡片
                warning: 'glass-warning hover:shadow-2xl hover:shadow-semantic-warning/20',

                // AI 功能卡片
                ai: 'glass-ai hover:shadow-2xl hover:shadow-secondary-400/20',

                // 實心深色卡片（兼容舊版實體樣式）
                solid: 'bg-background-secondary border border-white/5 shadow-floating hover:border-white/10',
            },

            padding: {
                none: 'p-0',
                sm: 'p-4',
                md: 'p-6',
                lg: 'p-8',
            },

            clickable: {
                true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
                false: '',
            },
        },

        defaultVariants: {
            variant: 'glass',
            padding: 'md',
            clickable: false,
        },
    }
);

/**
 * Card 屬性介面
 */
export interface CardProps
    extends HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof cardVariants>, 'padding'> {
    /** 是否可互動（顯示 hover 效果）- 舊 API 兼容 */
    interactive?: boolean;
    /** 內距 - 支援 boolean（向後兼容）或 'none' | 'sm' | 'md' | 'lg' */
    padding?: boolean | 'none' | 'sm' | 'md' | 'lg';
    /** 是否有圓角 - 舊 API 兼容 */
    rounded?: boolean;
    /** 是否有陰影 - 舊 API 兼容 */
    shadow?: boolean;
    /** 是否有邊框 - 舊 API 兼容 */
    bordered?: boolean;
}

/**
 * Card 元件
 * 
 * @example
 * ```tsx
 * // 毛玻璃卡片
 * <Card>
 *   <CardHeader title="標題" />
 *   <CardContent>內容</CardContent>
 * </Card>
 * 
 * // 可點擊的發光卡片
 * <Card variant="glow" clickable>
 *   <CardContent>重要資訊</CardContent>
 * </Card>
 * 
 * // 警報卡片
 * <Card variant="danger">
 *   <CardContent>風險警告</CardContent>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            variant,
            padding = true,
            clickable,
            interactive, // 舊 API 兼容
            rounded = true, // 舊 API 兼容（預設有圓角）
            shadow: _shadow = true, // 舊 API 兼容（預設有陰影）
            bordered: _bordered = false, // 舊 API 兼容
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        // 將 interactive 轉換為 clickable（向後兼容）
        const isClickable = clickable ?? interactive ?? false;

        // 處理 padding 向後兼容：boolean -> enum
        const paddingValue = typeof padding === 'boolean'
            ? (padding ? 'md' : 'none')
            : padding;

        return (
            <div
                ref={ref}
                className={`
          ${cardVariants({ variant, padding: paddingValue, clickable: isClickable })}
          ${!rounded ? 'rounded-none' : ''}
          ${className}
        `}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

/**
 * CardHeader 屬性介面
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    /** 標題 */
    title?: string;
    /** 副標題 */
    subtitle?: string;
    /** 右側操作區 */
    action?: ReactNode;
}

/**
 * CardHeader 元件（戰情室風格）
 */
export function CardHeader({
    title,
    subtitle,
    action,
    children,
    className = '',
    ...props
}: CardHeaderProps) {
    return (
        <div
            className={`flex items-start justify-between pb-4 border-b border-border-default ${className}`}
            {...props}
        >
            <div className="flex flex-col space-y-1.5">
                {title && (
                    <h3 className="text-2xl font-heading font-semibold text-text-primary">
                        {title}
                    </h3>
                )}
                {subtitle && (
                    <p className="text-sm text-text-secondary">{subtitle}</p>
                )}
                {children}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
    );
}

/**
 * CardTitle 元件
 */
export const CardTitle = forwardRef<
    HTMLHeadingElement,
    HTMLAttributes<HTMLHeadingElement>
>(({ className = '', ...props }, ref) => (
    <h3
        ref={ref}
        className={`text-2xl font-heading font-semibold text-text-primary ${className}`}
        {...props}
    />
));
CardTitle.displayName = 'CardTitle';

/**
 * CardContent 屬性介面
 */
export type CardContentProps = HTMLAttributes<HTMLDivElement>;

/**
 * CardContent 元件（原 CardBody，保持向後兼容）
 */
export function CardContent({ children, className = '', ...props }: CardContentProps) {
    return (
        <div className={`pt-4 ${className}`} {...props}>
            {children}
        </div>
    );
}

// 保持向後兼容
export { CardContent as CardBody };
export type { CardContentProps as CardBodyProps };

/**
 * CardFooter 屬性介面
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    /** 是否有分隔線 */
    divider?: boolean;
}

/**
 * CardFooter 元件（戰情室風格）
 */
export function CardFooter({
    divider = true,
    children,
    className = '',
    ...props
}: CardFooterProps) {
    return (
        <div
            className={`
        mt-4 pt-4
        ${divider ? 'border-t border-border-default' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
}

// 導出變體定義
export { cardVariants };
export type CardVariant = NonNullable<VariantProps<typeof cardVariants>['variant']>;

export default Card;
