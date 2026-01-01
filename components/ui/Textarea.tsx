/**
 * Textarea 元件
 * 多行文字輸入元件
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';

/**
 * Textarea 屬性介面
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** 標籤文字 */
    label?: string;
    /** 錯誤訊息 */
    error?: string;
    /** 提示文字 */
    hint?: string;
    /** 是否全寬 */
    fullWidth?: boolean;
}

/**
 * Textarea 元件
 * 
 * @example
 * ```tsx
 * <Textarea 
 *   label="System Prompt" 
 *   placeholder="輸入 Agent 的系統提示詞..."
 *   rows={6}
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            label,
            error,
            hint,
            fullWidth = false,
            disabled,
            className = '',
            id,
            ...props
        },
        ref
    ) => {
        // 自動產生 ID（如果未提供）
        const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

        const hasError = !!error;

        return (
            <div className={`${fullWidth ? 'w-full' : ''}`}>
                {/* 標籤 */}
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                        {label}
                    </label>
                )}

                {/* 文字區域 */}
                <textarea
                    ref={ref}
                    id={textareaId}
                    disabled={disabled}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
                    className={`
            w-full
            px-4 py-3
            bg-white
            border rounded-md
            transition-all duration-150
            resize-y
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

                {/* 錯誤訊息 */}
                {error && (
                    <p
                        id={`${textareaId}-error`}
                        className="mt-1.5 text-sm text-error-500"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {/* 提示文字 */}
                {hint && !error && (
                    <p
                        id={`${textareaId}-hint`}
                        className="mt-1.5 text-sm text-gray-500"
                    >
                        {hint}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
