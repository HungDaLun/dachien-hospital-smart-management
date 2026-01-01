/**
 * Modal 元件
 * 模態對話框元件，用於確認、表單等場景
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { Fragment, ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal 尺寸類型
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

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
};

/**
 * Modal 元件
 * 
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="確認刪除"
 *   footer={
 *     <>
 *       <Button variant="ghost" onClick={handleClose}>取消</Button>
 *       <Button variant="danger" onClick={handleDelete}>刪除</Button>
 *     </>
 *   }
 * >
 *   確定要刪除這個項目嗎？此操作無法復原。
 * </Modal>
 * ```
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
        <Fragment>
            {/* 遮罩層 */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
                onClick={handleOverlayClick}
                aria-modal="true"
                role="dialog"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {/* Modal 內容 */}
                <div
                    className={`
            bg-white rounded-lg shadow-xl w-full
            ${sizeStyles[size]}
            animate-scale-in
          `}
                    onClick={handleContentClick}
                >
                    {/* 標題列 */}
                    {(title || showCloseButton) && (
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            {title && (
                                <h2
                                    id="modal-title"
                                    className="text-lg font-semibold text-gray-900"
                                >
                                    {title}
                                </h2>
                            )}
                            {showCloseButton && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                                    aria-label="關閉"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}

                    {/* 內容區 */}
                    <div className="px-6 py-4">{children}</div>

                    {/* 頁尾 */}
                    {footer && (
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </Fragment>,
        document.body
    );
}

export default Modal;
