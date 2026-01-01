/**
 * Input 元件
 * 通用輸入框元件，支援 label、錯誤訊息、disabled 狀態
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

/**
 * Input 屬性介面
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** 標籤文字 */
    label?: string;
    /** 錯誤訊息 */
    error?: string;
    /** 提示文字 */
    hint?: string;
    /** 左側元素（如圖示） */
    leftElement?: ReactNode;
    /** 右側元素（如圖示） */
    rightElement?: ReactNode;
    /** 是否全寬 */
    fullWidth?: boolean;
    /** 輸入框尺寸 */
    inputSize?: 'sm' | 'md' | 'lg';
}

/**
 * 尺寸樣式對照
 */
const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
};

/**
 * Input 元件
 * 
 * @example
 * ```tsx
 * <Input label="電子郵件" type="email" placeholder="輸入您的電子郵件" />
 * <Input label="密碼" type="password" error="密碼至少需要 8 個字元" />
 * <Input leftElement={<SearchIcon />} placeholder="搜尋..." />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            hint,
            leftElement,
            rightElement,
            fullWidth = false,
            inputSize = 'md',
            disabled,
            className = '',
            id,
            ...props
        },
        ref
    ) => {
        // 自動產生 ID（如果未提供）
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

        const hasError = !!error;

        return (
            <div className={`${fullWidth ? 'w-full' : ''}`}>
                {/* 標籤 */}
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                        {label}
                    </label>
                )}

                {/* 輸入框容器 */}
                <div className="relative">
                    {/* 左側元素 */}
                    {leftElement && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {leftElement}
                        </div>
                    )}

                    {/* 輸入框 */}
                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                        className={`
              w-full
              bg-white
              border rounded-md
              transition-all duration-150
              ${sizeStyles[inputSize]}
              ${leftElement ? 'pl-10' : ''}
              ${rightElement ? 'pr-10' : ''}
              ${hasError
                                ? 'border-error-500 focus:ring-2 focus:ring-error-500 focus:border-error-500'
                                : 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                            }
              ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
              placeholder:text-gray-400
              ${className}
            `}
                        {...props}
                    />

                    {/* 右側元素 */}
                    {rightElement && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {rightElement}
                        </div>
                    )}
                </div>

                {/* 錯誤訊息 */}
                {error && (
                    <p
                        id={`${inputId}-error`}
                        className="mt-1.5 text-sm text-error-500"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {/* 提示文字 */}
                {hint && !error && (
                    <p
                        id={`${inputId}-hint`}
                        className="mt-1.5 text-sm text-gray-500"
                    >
                        {hint}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
