/**
 * Button 元件
 * 通用按鈕元件，支援多種變體與尺寸
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

/**
 * Button 變體類型
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

/**
 * Button 尺寸類型
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button 屬性介面
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** 按鈕變體 */
    variant?: ButtonVariant;
    /** 按鈕尺寸 */
    size?: ButtonSize;
    /** 是否載入中 */
    loading?: boolean;
    /** 左側圖示 */
    leftIcon?: ReactNode;
    /** 右側圖示 */
    rightIcon?: ReactNode;
    /** 是否全寬 */
    fullWidth?: boolean;
}

/**
 * 變體樣式對照
 */
const variantStyles: Record<ButtonVariant, string> = {
    primary: `
    bg-primary-500 text-white 
    hover:bg-primary-600 
    focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
    disabled:bg-gray-300 disabled:cursor-not-allowed
  `,
    secondary: `
    bg-gray-100 text-gray-800 
    hover:bg-gray-200 
    focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2
    disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
  `,
    outline: `
    bg-transparent text-primary-500 border-2 border-primary-500
    hover:bg-primary-50 
    focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
    disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed
  `,
    ghost: `
    bg-transparent text-gray-600
    hover:bg-gray-100 hover:text-gray-900
    focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2
    disabled:text-gray-400 disabled:cursor-not-allowed
  `,
    danger: `
    bg-error-500 text-white 
    hover:bg-red-600 
    focus-visible:ring-2 focus-visible:ring-error-500 focus-visible:ring-offset-2
    disabled:bg-gray-300 disabled:cursor-not-allowed
  `,
};

/**
 * 尺寸樣式對照
 */
const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
};

/**
 * Button 元件
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>確認</Button>
 * <Button variant="outline" loading>載入中</Button>
 * <Button variant="danger" leftIcon={<TrashIcon />}>刪除</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            disabled,
            children,
            className = '',
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || loading;

        return (
            <button
                ref={ref}
                disabled={isDisabled}
                className={`
          inline-flex items-center justify-center
          font-medium rounded-md
          transition-all duration-150 ease-in-out
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
                {...props}
            >
                {loading && <Spinner size="sm" />}
                {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                {children}
                {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
