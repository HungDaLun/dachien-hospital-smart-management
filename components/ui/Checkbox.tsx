/**
 * Checkbox 元件
 * 通用複選框元件
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { forwardRef, InputHTMLAttributes } from 'react';

/**
 * Checkbox 屬性介面
 */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    /** 標籤文字 */
    label?: string;
    /** 是否半選狀態 (Indeterminate) */
    indeterminate?: boolean;
}

/**
 * Checkbox 元件
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, indeterminate, className = '', id, ...props }, ref) => {
        const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="flex items-center">
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
            h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500
            transition duration-150 ease-in-out cursor-pointer
            ${className}
          `}
                    {...props}
                />
                {label && (
                    <label
                        htmlFor={checkboxId}
                        className="ml-2 block text-sm text-gray-900 cursor-pointer select-none"
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
