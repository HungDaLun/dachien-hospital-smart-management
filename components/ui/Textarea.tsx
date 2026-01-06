/**
 * Textarea 元件
 * 多行文字輸入元件
 * 遵循 EAKAP 科技戰情室設計系統規範
 */
'use client';

import { forwardRef, TextareaHTMLAttributes, useId } from 'react';
import { AlertCircle } from 'lucide-react';

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
        const generatedId = useId();
        const textareaId = id || generatedId;
        const hasError = !!error;

        return (
            <div className={`space-y-2 ${fullWidth ? 'w-full' : ''}`}>
                {/* 標籤 */}
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] ml-1 mb-1.5"
                    >
                        {label}
                    </label>
                )}

                {/* 容器與文字區域 */}
                <div className="relative group">
                    <textarea
                        ref={ref}
                        id={textareaId}
                        disabled={disabled}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
                        className={`
                            w-full
                            px-5 py-4
                            bg-black/20
                            backdrop-blur-sm
                            border
                            rounded-2xl
                            transition-all duration-300
                            resize-y
                            font-medium
                            text-sm
                            text-text-primary
                            placeholder:text-text-tertiary/20
                            outline-none
                            ${hasError
                                ? 'border-semantic-danger/50 focus:ring-4 focus:ring-semantic-danger/5 focus:border-semantic-danger shadow-glow-red/5'
                                : 'border-white/10 focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500/30'
                            }
                            ${disabled
                                ? 'bg-white/[0.02] text-text-tertiary cursor-not-allowed border-white/5 opacity-50'
                                : 'hover:border-white/20'
                            }
                            custom-scrollbar
                            shadow-inner
                            ${className}
                        `}
                        {...props}
                    />

                    {/* 裝飾性內陰影/邊框 (僅在非禁用狀態) */}
                    {!disabled && (
                        <div className="absolute inset-0 rounded-2xl pointer-events-none ring-1 ring-inset ring-white/[0.02] group-hover:ring-white/[0.05] transition-all" />
                    )}
                </div>

                {/* 錯誤訊息 */}
                {error && (
                    <div
                        id={`${textareaId}-error`}
                        className="flex items-center gap-2 mt-1.5 px-1 py-0.5 animate-in fade-in slide-in-from-top-1 duration-200"
                        role="alert"
                    >
                        <AlertCircle size={14} className="text-semantic-danger shrink-0" />
                        <span className="text-[11px] font-bold text-semantic-danger uppercase tracking-wider">
                            {error}
                        </span>
                    </div>
                )}

                {/* 提示文字 */}
                {hint && !error && (
                    <p
                        id={`${textareaId}-hint`}
                        className="mt-1.5 px-1 text-[10px] font-bold text-text-tertiary italic opacity-60 uppercase tracking-widest"
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
