/**
 * Input 元件
 * 通用輸入框元件，支援 label、錯誤訊息、disabled 狀態
 * 遵循 EAKAP 科技戰情室設計規範
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
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
};

/**
 * Input 元件
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
                        className="block text-sm font-black text-white mb-2.5 uppercase tracking-widest"
                    >
                        {label}
                    </label>
                )}

                {/* 輸入框容器 */}
                <div className="relative group/input">
                    {/* 左側元素 */}
                    {leftElement && (
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within/input:text-primary-400 transition-colors">
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
                            bg-white/[0.03]
                            backdrop-blur-sm
                            border
                            rounded-xl
                            text-white
                            font-medium
                            transition-all duration-300
                            ${sizeStyles[inputSize]}
                            ${leftElement ? 'pl-11' : ''}
                            ${rightElement ? 'pr-11' : ''}
                            ${hasError
                                ? 'border-semantic-danger/50 focus:ring-4 focus:ring-semantic-danger/10 focus:border-semantic-danger shadow-glow-red/5'
                                : 'border-white/10 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 shadow-glow-cyan/5'
                            }
                            ${disabled ? 'opacity-30 cursor-not-allowed bg-white/[0.01]' : 'hover:border-white/20'}
                            placeholder:text-text-tertiary/50
                            placeholder:font-normal
                            ${className}
                        `}
                        {...props}
                    />

                    {/* 右側元素 */}
                    {rightElement && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within/input:text-primary-400 transition-colors">
                            {rightElement}
                        </div>
                    )}
                </div>

                {/* 錯誤訊息 */}
                {error && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <span className="w-1 h-1 rounded-full bg-semantic-danger" />
                        <p
                            id={`${inputId}-error`}
                            className="text-xs font-bold text-semantic-danger/90 uppercase tracking-tight"
                            role="alert"
                        >
                            {error}
                        </p>
                    </div>
                )}

                {/* 提示文字 */}
                {hint && !error && (
                    <p
                        id={`${inputId}-hint`}
                        className="mt-2.5 text-[13px] font-bold text-white/80 uppercase tracking-wide"
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
