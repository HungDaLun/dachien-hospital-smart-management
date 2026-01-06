/**
 * Select 元件
 * 下拉選擇元件
 * 遵循 EAKAP 科技戰情室設計系統規範
 */
'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';

/**
 * Select 選項介面
 */
export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

/**
 * Select 屬性介面
 */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    /** 標籤文字 */
    label?: string;
    /** 錯誤訊息 */
    error?: string;
    /** 提示文字 */
    hint?: string;
    /** 選項列表 */
    options: SelectOption[];
    /** 佔位文字 */
    placeholder?: string;
    /** 是否全寬 */
    fullWidth?: boolean;
    /** 輸入框尺寸 */
    selectSize?: 'sm' | 'md' | 'lg';
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
 * Select 元件
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            label,
            error,
            hint,
            options,
            placeholder,
            fullWidth = false,
            selectSize = 'md',
            disabled,
            className = '',
            id,
            ...props
        },
        ref
    ) => {
        // 自動產生 ID（如果未提供）
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

        const hasError = !!error;

        return (
            <div className={`${fullWidth ? 'w-full' : ''}`}>
                {/* 標籤 */}
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-[10px] font-black text-text-tertiary mb-2 uppercase tracking-widest"
                    >
                        {label}
                    </label>
                )}

                {/* 下拉選擇 */}
                <div className="relative group/select">
                    <select
                        ref={ref}
                        id={selectId}
                        disabled={disabled}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
                        className={`
                            w-full
                            appearance-none
                            bg-white/[0.03]
                            backdrop-blur-sm
                            border
                            rounded-xl
                            text-white
                            font-medium
                            transition-all duration-300
                            pr-12
                            ${sizeStyles[selectSize]}
                            ${hasError
                                ? 'border-semantic-danger/50 focus:ring-4 focus:ring-semantic-danger/10 focus:border-semantic-danger shadow-glow-red/5'
                                : 'border-white/10 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 shadow-glow-cyan/5'
                            }
                            ${disabled ? 'opacity-30 cursor-not-allowed bg-white/[0.01]' : 'hover:border-white/20'}
                            ${className}
                        `}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled className="bg-background-secondary text-text-tertiary">
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                                className="bg-background-secondary text-text-primary"
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* 下拉箭頭 */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary group-focus-within/select:text-primary-400 transition-colors">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </div>

                {/* 錯誤訊息 */}
                {error && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <span className="w-1 h-1 rounded-full bg-semantic-danger" />
                        <p
                            id={`${selectId}-error`}
                            className="text-[11px] font-bold text-semantic-danger/90 uppercase tracking-tight"
                            role="alert"
                        >
                            {error}
                        </p>
                    </div>
                )}

                {/* 提示文字 */}
                {hint && !error && (
                    <p
                        id={`${selectId}-hint`}
                        className="mt-2 text-[10px] font-bold text-text-tertiary uppercase tracking-tight opacity-70"
                    >
                        {hint}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
