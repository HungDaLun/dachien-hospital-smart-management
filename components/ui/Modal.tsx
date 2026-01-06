/**
 * Modal 元件
 * 模態對話框元件，用於確認、表單等場景
 * 遵循 EAKAP 科技戰情室設計規範
 */
'use client';

import { ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Modal 尺寸類型
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full' | '6xl';

/**
 * Modal 屬性介面
 */
export interface ModalProps {
    /** 是否開啟 */
    isOpen: boolean;
    /** 關閉回調 */
    onClose: () => void;
    /** 標題 */
    title?: string;
    /** 內容 */
    children: ReactNode;
    /** 尺寸 */
    size?: ModalSize;
    /** 是否顯示關閉按鈕 */
    showCloseButton?: boolean;
    /** 點擊遮罩是否關閉 */
    closeOnOverlayClick?: boolean;
    /** 按 ESC 是否關閉 */
    closeOnEsc?: boolean;
    /** 頁尾操作區 */
    footer?: ReactNode;
    /** 是否為關鍵 Modal（使用更高對比度的 Glassmorphism） */
    critical?: boolean;
}

/**
 * 尺寸樣式對照
 */
const sizeStyles: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
    '6xl': 'max-w-6xl',
};

/**
 * Modal 元件
 */
export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEsc = true,
    footer,
    critical = false,
}: ModalProps) {
    // ESC 鍵關閉
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (closeOnEsc && event.key === 'Escape') {
                onClose();
            }
        },
        [closeOnEsc, onClose]
    );

    // 監聽 ESC 鍵
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // 防止背景滾動
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleKeyDown]);

    // 點擊遮罩關閉
    const handleOverlayClick = () => {
        if (closeOnOverlayClick) {
            onClose();
        }
    };

    // 阻止內容區點擊冒泡
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    if (!isOpen) return null;

    // 使用 Portal 渲染到 body
    if (typeof window === 'undefined') return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-6 animate-in fade-in duration-300"
            role="dialog"
            aria-modal="true"
        >
            {/* 遮罩層 */}
            <div
                className="absolute inset-0 bg-background-primary/80 backdrop-blur-md"
                onClick={handleOverlayClick}
            />

            {/* Modal 內容 */}
            <div
                className={`
                    relative w-full overflow-hidden
                    flex flex-col
                    bg-background-secondary/90
                    backdrop-blur-xl
                    border border-white/10
                    shadow-floating
                    rounded-[32px]
                    animate-in zoom-in-95 slide-in-from-bottom-2 duration-400
                    ${sizeStyles[size]}
                    ${critical ? 'ring-2 ring-primary-500/30' : ''}
                `}
                onClick={handleContentClick}
            >
                {/* 裝飾線 */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

                {/* 標題列 */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                        {title && (
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                <h2
                                    id="modal-title"
                                    className="text-lg font-black text-text-primary uppercase tracking-tight"
                                >
                                    {title}
                                </h2>
                            </div>
                        )}
                        {showCloseButton && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-text-tertiary hover:text-text-primary hover:bg-white/10 border border-white/5 transition-all"
                                aria-label="關閉"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* 內容區 */}
                <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                    <div className="text-text-secondary leading-relaxed font-medium">
                        {children}
                    </div>
                </div>

                {/* 頁尾 */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-white/5 bg-white/[0.02]">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

export default Modal;
