/**
 * Button 元件
 * 企業戰情室設計系統 - 通用按鈕元件
 * 
 * 變體說明：
 * - primary: 電光藍主要按鈕（主要 CTA）
 * - secondary: AI 紫光按鈕（AI 功能）
 * - glass: 毛玻璃按鈕（一般操作）
 * - danger: 霓虹紅危險按鈕
 * - ghost: 透明幽靈按鈕
 * - outline: 邊框按鈕
 * - icon: 圓形圖示按鈕
 */
'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Spinner } from './Spinner';

/**
 * Button 變體定義（使用 CVA）
 */
const buttonVariants = cva(
  // 基礎樣式
  `inline-flex items-center justify-center font-medium 
   transition-all duration-250 ease-smooth cursor-pointer
   disabled:opacity-50 disabled:cursor-not-allowed
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`,
  {
    variants: {
      variant: {
        // 主要按鈕（電光藍）
        primary: `
          bg-primary-500 text-text-inverse
          hover:bg-primary-600 active:bg-primary-700
          shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50
          focus-visible:ring-primary-500 focus-visible:ring-offset-background-primary
        `,

        // 次要按鈕（AI 紫光）
        secondary: `
          bg-secondary-400 text-white
          hover:bg-secondary-500 active:bg-secondary-600
          shadow-lg shadow-secondary-400/30 hover:shadow-secondary-400/50
          focus-visible:ring-secondary-400 focus-visible:ring-offset-background-primary
        `,

        // 毛玻璃按鈕
        glass: `
          glass-card text-text-primary
          hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/20
          focus-visible:ring-primary-500 focus-visible:ring-offset-background-primary
        `,

        // 危險按鈕（霓虹紅）
        danger: `
          bg-semantic-danger text-white
          hover:bg-red-600 active:bg-red-700
          shadow-lg shadow-semantic-danger/30 hover:shadow-semantic-danger/50
          focus-visible:ring-semantic-danger focus-visible:ring-offset-background-primary
        `,

        // 幽靈按鈕
        ghost: `
          text-text-primary bg-transparent
          hover:bg-white/5 active:bg-white/10
          focus-visible:ring-primary-500 focus-visible:ring-offset-background-primary
        `,

        // 邊框按鈕
        outline: `
          bg-transparent text-primary-500 
          border-2 border-primary-500
          hover:bg-primary-500/10 active:bg-primary-500/20
          focus-visible:ring-primary-500 focus-visible:ring-offset-background-primary
        `,

        // 圖示按鈕
        icon: `
          text-text-primary bg-transparent
          hover:bg-white/5 active:bg-white/10
          focus-visible:ring-primary-500 focus-visible:ring-offset-background-primary
        `,

        // CTA 按鈕（Neumorphism - 用於重要行動呼籲）
        cta: `
          bg-gradient-cta text-white
          shadow-neu-light
          hover:shadow-neu-hover hover:-translate-y-0.5
          active:translate-y-0
          focus-visible:ring-primary-500 focus-visible:ring-offset-background-primary
        `,
      },

      size: {
        sm: 'text-sm px-4 py-2 gap-1.5 rounded-lg',
        md: 'text-base px-6 py-3 gap-2 rounded-lg',
        lg: 'text-lg px-8 py-4 gap-2.5 rounded-xl',
        icon: 'p-2 rounded-full',
      },
    },

    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

/**
 * Button 屬性介面
 */
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
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
 * Button 元件
 * 
 * @example
 * ```tsx
 * // 主要按鈕
 * <Button variant="primary" onClick={handleClick}>確認</Button>
 * 
 * // AI 功能按鈕
 * <Button variant="secondary" leftIcon={<SparklesIcon />}>AI 分析</Button>
 * 
 * // 毛玻璃按鈕
 * <Button variant="glass">操作</Button>
 * 
 * // 載入狀態
 * <Button variant="primary" loading>處理中</Button>
 * 
 * // 圖示按鈕
 * <Button variant="icon" size="icon"><MenuIcon /></Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size,
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
          ${buttonVariants({ variant, size })}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <Spinner size="sm" className="mr-2" />
        )}
        {!loading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// 導出變體定義供其他組件使用
export { buttonVariants };
export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;

export default Button;
