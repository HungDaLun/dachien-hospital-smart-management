/**
 * Checkbox 元件
 * 通用複選框元件
 * 遵循 EAKAP 科技戰情室設計系統規範
 */
'use client';

import { forwardRef, InputHTMLAttributes, useId } from 'react';

/**
 * Checkbox 屬性介面
 */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    /** 標籤文字 */
    label?: string;
    /** 是否半選狀態 (Indeterminate) */
    indeterminate?: boolean;
    /** 樣式變體: 'default' | 'white-circle' | 'radio' */
    variant?: 'default' | 'white-circle' | 'radio';
}

/**
 * Checkbox 元件
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, indeterminate, variant = 'default', className = '', id, ...props }, ref) => {
        const generatedId = useId();
        const checkboxId = id || generatedId;

        return (
            <div className="flex items-center group">
                <div className="relative flex items-center justify-center">
                    <input
                        ref={(el) => {
                            if (el) {
                                el.indeterminate = indeterminate || false;
                                if (typeof ref === 'function') ref(el);
                                else if (ref) (ref as any).current = el;
                            }
                        }}
                        type="checkbox"
                        id={checkboxId}
                        className={`
                            peer
                            h-5 w-5
                            ${(variant === 'white-circle' || variant === 'radio') ? 'rounded-full' : 'rounded-md'}
                            ${variant === 'white-circle'
                                ? 'bg-white/10 border-white/40 checked:bg-white checked:border-white'
                                : 'bg-black/40 border border-white/30 checked:bg-primary-500 checked:border-primary-500'
                            }
                            text-primary-500
                            focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-0
                            transition-all duration-200
                            cursor-pointer
                            appearance-none
                            hover:border-white/60
                            disabled:opacity-40 disabled:cursor-not-allowed
                            ${className}
                        `}
                        {...props}
                    />
                    {/* Checkmark icon for custom appearance */}
                    <svg
                        className={`absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200 
                            ${variant === 'white-circle' ? 'text-background-primary' : 'text-black'}
                        `}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {/* Indeterminate state icon */}
                    {indeterminate && (
                        <div className={`absolute w-2.5 h-0.5 rounded-full pointer-events-none ${variant === 'white-circle' ? 'bg-background-primary' : 'bg-black'}`} />
                    )}
                </div>
                {label && (
                    <label
                        htmlFor={checkboxId}
                        className="ml-3 text-sm font-bold text-text-secondary group-hover:text-text-primary cursor-pointer select-none transition-colors uppercase tracking-tight"
                    >
                        {label}
                    </label>
                )}
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
