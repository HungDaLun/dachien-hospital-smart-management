/**
 * Card 元件
 * 通用卡片容器元件
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { HTMLAttributes, ReactNode, forwardRef } from 'react';

/**
 * Card 屬性介面
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /** 是否可互動（顯示 hover 效果） */
    interactive?: boolean;
    /** 是否有內距 */
    padding?: boolean;
    /** 是否有圓角 */
    rounded?: boolean;
    /** 是否有陰影 */
    shadow?: boolean;
    /** 是否有邊框 */
    bordered?: boolean;
}

/**
 * Card 元件
 * 
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>標題</CardHeader>
 *   <CardBody>內容</CardBody>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            interactive = false,
            padding = true,
            rounded = true,
            shadow = true,
            bordered = false,
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={`
          bg-white
          ${rounded ? 'rounded-lg' : ''}
          ${shadow ? 'shadow-soft' : ''}
          ${bordered ? 'border border-gray-200' : ''}
          ${padding ? 'p-6' : ''}
          ${interactive ? 'hover:shadow-md transition-shadow duration-200 cursor-pointer' : ''}
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
 * CardHeader 元件
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
            className={`flex items-start justify-between mb-4 ${className}`}
            {...props}
        >
            <div>
                {title && (
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                )}
                {subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                )}
                {children}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
    );
}

/**
 * CardBody 屬性介面
 */
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> { }

/**
 * CardBody 元件
 */
export function CardBody({ children, className = '', ...props }: CardBodyProps) {
    return (
        <div className={className} {...props}>
            {children}
        </div>
    );
}

/**
 * CardFooter 屬性介面
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    /** 是否有分隔線 */
    divider?: boolean;
}

/**
 * CardFooter 元件
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
        ${divider ? 'border-t border-gray-200' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
}

export default Card;
