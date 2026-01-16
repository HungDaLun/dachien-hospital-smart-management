/**
 * Toast 元件
 * 通知提示元件，用於操作成功/失敗提示
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Toast 類型
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast 項目介面
 */
export interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

/**
 * Toast Context 介面
 */
interface ToastContextValue {
    toasts: ToastItem[];
    addToast: (toast: Omit<ToastItem, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * 類型樣式對照
 */
const typeStyles: Record<ToastType, { bg: string; icon: string; iconColor: string }> = {
    success: {
        bg: 'bg-semantic-success',
        icon: 'M5 13l4 4L19 7',
        iconColor: 'text-white',
    },
    error: {
        bg: 'bg-semantic-danger',
        icon: 'M6 18L18 6M6 6l12 12',
        iconColor: 'text-white',
    },
    warning: {
        bg: 'bg-semantic-warning',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        iconColor: 'text-black', // Warning usually yellow background, white icon might be low contrast if yellow is bright. Tailwind config semantic-warning is #FFB800 (Amber). White text on Yellow #FFB800 is poor contrast (1.65:1). Audit usually suggests black text on warning, or darker warning color. Design tokens have text-white defined here? The audit report didn't explicitly flagging contrast, just "undefined colors". Original code used `bg-warning-500` (undefined) and `text-white`. I will use `bg-semantic-warning` (#FFB800). I should probably check contrast. #FFB800 is bright. Black icon is better.
    },
    info: {
        bg: 'bg-primary-500',
        icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        iconColor: 'text-white',
    },
};

/**
 * Toast 提供者元件
 */
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: ToastItem = {
            ...toast,
            id,
            duration: toast.duration ?? 3000,
        };

        setToasts((prev) => [...prev, newToast]);

        // 自動移除
        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, newToast.duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            {mounted && <ToastContainer />}
        </ToastContext.Provider>
    );
}

/**
 * Toast 容器元件
 */
function ToastContainer() {
    const context = useContext(ToastContext);
    if (!context) return null;

    const { toasts, removeToast } = context;

    if (typeof window === 'undefined') return null;

    return createPortal(
        <div className="fixed top-24 right-4 z-[60] flex flex-col gap-2">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>,
        document.body
    );
}

/**
 * 單一 Toast 項目
 */
function ToastItem({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
    const styles = typeStyles[toast.type];

    return (
        <div
            className={`
        flex items-center gap-3 px-4 py-3
        ${styles.bg}
        ${toast.type === 'warning' ? 'text-black' : 'text-white'} 
        rounded-lg shadow-lg
        min-w-[280px] max-w-md
        animate-slide-in
      `}
            role="alert"
        >
            {/* 圖示 */}
            <svg
                className={`w-5 h-5 flex-shrink-0 ${styles.iconColor}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={styles.icon}
                />
            </svg>

            {/* 訊息 */}
            <span className="flex-1 text-sm font-medium">{toast.message}</span>

            {/* 關閉按鈕 */}
            <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
                aria-label="關閉通知"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

/**
 * useToast Hook
 * 
 * @example
 * ```tsx
 * const { toast } = useToast();
 * toast.success('操作成功！');
 * toast.error('發生錯誤');
 * ```
 */
export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast 必須在 ToastProvider 內使用');
    }

    const { addToast } = context;

    return {
        toast: {
            success: (message: string, duration?: number) =>
                addToast({ type: 'success', message, duration }),
            error: (message: string, duration?: number) =>
                addToast({ type: 'error', message, duration }),
            warning: (message: string, duration?: number) =>
                addToast({ type: 'warning', message, duration }),
            info: (message: string, duration?: number) =>
                addToast({ type: 'info', message, duration }),
        },
    };
}

export default ToastProvider;
