/**
 * ConfirmDialog 元件
 * 用於取代 window.confirm 的確認對話框
 * 基於 Modal 元件實作
 */
'use client';

import { ReactNode } from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogProps {
    /** 是否開啟 */
    open: boolean;
    /** 標題 */
    title: string;
    /** 描述/內容 */
    description?: ReactNode;
    /** 確認按鈕文字 */
    confirmText?: string;
    /** 取消按鈕文字 */
    cancelText?: string;
    /** 確認回調 */
    onConfirm: () => void;
    /** 取消回調 */
    onCancel: () => void;
    /** 變體類型 */
    variant?: 'danger' | 'warning' | 'info' | 'success';
    /** 是否載入中 */
    loading?: boolean;
}

const variantConfig = {
    danger: {
        icon: AlertTriangle,
        iconColor: 'text-semantic-danger',
        buttonVariant: 'danger' as const,
    },
    warning: {
        icon: AlertTriangle,
        iconColor: 'text-semantic-warning',
        buttonVariant: 'primary' as const, // 或者新增 warning variant
    },
    info: {
        icon: Info,
        iconColor: 'text-primary-500',
        buttonVariant: 'primary' as const,
    },
    success: {
        icon: CheckCircle,
        iconColor: 'text-semantic-success',
        buttonVariant: 'primary' as const,
    }
};

export function ConfirmDialog({
    open,
    title,
    description,
    confirmText = '確認',
    cancelText = '取消',
    onConfirm,
    onCancel,
    variant = 'danger',
    loading = false,
}: ConfirmDialogProps) {
    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <Modal
            isOpen={open}
            onClose={onCancel}
            title={title}
            size="sm"
            closeOnEsc={!loading}
            closeOnOverlayClick={!loading}
            showCloseButton={!loading}
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={config.buttonVariant}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmText}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-4">
                {/* 只在內容區顯示詳細描述，標題已在 Modal Header */}
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full bg-white/5 border border-white/10 shrink-0 ${config.iconColor}`}>
                        <Icon size={24} />
                    </div>
                    <div className="text-text-secondary leading-relaxed">
                        {description}
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmDialog;
