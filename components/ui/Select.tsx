/**
 * Select 元件
 * 下拉選擇元件
 * 遵循 EAKAP 設計系統規範
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
    md: 'px-4 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
};

/**
 * Select 元件
 * 
 * @example
 * ```tsx
 * <Select
 *   label="模型版本"
 *   options={[
 *     { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
 *     { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
 *   ]}
 *   placeholder="選擇模型版本"
 * />
 * ```
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
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                        {label}
                    </label>
                )}

                {/* 下拉選擇 */}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        disabled={disabled}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
                        className={`
              w-full
              appearance-none
              bg-white
              border rounded-md
              transition-all duration-150
              pr-10
              ${sizeStyles[selectSize]}
              ${hasError
                                ? 'border-error-500 focus:ring-2 focus:ring-error-500 focus:border-error-500'
                                : 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                            }
              ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
              ${className}
            `}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* 下拉箭頭 */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </div>

                {/* 錯誤訊息 */}
                {error && (
                    <p
                        id={`${selectId}-error`}
                        className="mt-1.5 text-sm text-error-500"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {/* 提示文字 */}
                {hint && !error && (
                    <p
                        id={`${selectId}-hint`}
                        className="mt-1.5 text-sm text-gray-500"
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
