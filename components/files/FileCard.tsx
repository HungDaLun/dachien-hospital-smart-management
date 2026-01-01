/**
 * 檔案卡片元件
 * 顯示單一檔案資訊與操作按鈕
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { Badge, Button, Modal } from '@/components/ui';
import { useState } from 'react';
import type { GeminiState } from '@/types';

/**
 * 檔案資料介面
 */
export interface FileData {
    id: string;
    filename: string;
    mime_type: string;
    size_bytes: number;
    gemini_state: GeminiState;
    gemini_sync_at: string | null;
    quality_score: number | null;
    created_at: string;
    uploaded_by: string;
    file_tags?: Array<{ id: string; tag_key: string; tag_value: string }>;
    user_profiles?: {
        display_name: string | null;
        email: string;
    };
}

/**
 * 檔案卡片屬性
 */
interface FileCardProps {
    file: FileData;
    canManage: boolean;
    onSync?: (id: string) => void;
    onDelete?: (id: string) => void;
    onUpdateTags?: (id: string, tags: any[]) => void;
}

/**
 * 狀態 Badge 配置
 */
const statusConfig: Record<GeminiState, { variant: 'success' | 'warning' | 'error' | 'info' | 'default'; label: string; dot?: boolean }> = {
    PENDING: { variant: 'default', label: '待處理' },
    PROCESSING: { variant: 'info', label: '處理中', dot: true },
    SYNCED: { variant: 'success', label: '已同步' },
    NEEDS_REVIEW: { variant: 'warning', label: '需審核' },
    REJECTED: { variant: 'error', label: '已拒絕' },
    FAILED: { variant: 'error', label: '失敗' },
};

/**
 * 檔案類型圖示配置
 */
const mimeTypeIcons: Record<string, string> = {
    'application/pdf': '📄',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️',
    'text/csv': '📈',
    'text/plain': '📃',
    'text/markdown': '📋',
    'text/html': '🌐',
};

/**
 * 格式化檔案大小
 */
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * 格式化日期
 */
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function FileCard({ file, canManage, onSync, onDelete, onUpdateTags }: FileCardProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showTagModal, setShowTagModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSavingTags, setIsSavingTags] = useState(false);

    // 標籤狀態
    const [tags, setTags] = useState(file.file_tags || []);
    const [newTagKey, setNewTagKey] = useState('');
    const [newTagValue, setNewTagValue] = useState('');
    const [syncError, setSyncError] = useState<string | null>(null);

    const status = statusConfig[file.gemini_state] || statusConfig.PENDING;
    const icon = mimeTypeIcons[file.mime_type] || '📄';

    /**
     * 處理同步
     */
    const handleSync = async () => {
        if (isSyncing) return;

        setIsSyncing(true);
        setSyncError(null);
        try {
            const response = await fetch(`/api/files/${file.id}/sync`, {
                method: 'POST',
            });

            const result = await response.json();
            if (response.ok) {
                onSync?.(file.id);
            } else {
                setSyncError(result.error?.message || '同步失敗，請檢查存儲服務');
                setTimeout(() => setSyncError(null), 5000);
            }
        } catch (error) {
            console.error('同步失敗:', error);
            setSyncError('連線錯誤，請稍後再試');
            setTimeout(() => setSyncError(null), 5000);
        } finally {
            setIsSyncing(false);
        }
    };

    /**
     * 處理刪除
     */
    const handleDelete = async () => {
        if (isDeleting) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/files/${file.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                onDelete?.(file.id);
                setShowDeleteModal(false);
            }
        } catch (error) {
            console.error('刪除失敗:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    /**
     * 處理標籤更新
     */
    const handleSaveTags = async () => {
        setIsSavingTags(true);
        try {
            const response = await fetch(`/api/files/${file.id}/tags`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags }),
            });

            if (response.ok) {
                const result = await response.json();
                onUpdateTags?.(file.id, tags);
                setShowTagModal(false);
            } else {
                alert('儲存標籤失敗');
            }
        } catch (error) {
            console.error('標籤更新失敗:', error);
        } finally {
            setIsSavingTags(false);
        }
    };

    const addTag = () => {
        if (!newTagKey || !newTagValue) return;
        if (tags.some(t => t.tag_key === newTagKey && t.tag_value === newTagValue)) return;

        setTags([...tags, { id: Math.random().toString(), tag_key: newTagKey, tag_value: newTagValue }]);
        setNewTagKey('');
        setNewTagValue('');
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    return (
        <>
            <div className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${syncError ? 'border-error-200 bg-error-50/10' : 'border-gray-200'}`}>
                <div className="flex items-start gap-4">
                    {/* 檔案圖示 */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                        {icon}
                    </div>

                    {/* 檔案資訊 */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-bold text-gray-900 truncate" title={file.filename}>
                                    {file.filename}
                                </h3>
                                <p className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wider">
                                    {formatFileSize(file.size_bytes)} • {formatDate(file.created_at)}
                                </p>
                            </div>

                            {/* 狀態 Badge */}
                            <Badge variant={status.variant} dot={status.dot} size="sm">
                                {status.label}
                            </Badge>
                        </div>

                        {/* 標籤顯示 */}
                        <div className="flex flex-wrap gap-1 mt-2">
                            {file.file_tags && file.file_tags.length > 0 ? (
                                file.file_tags.map((tag) => (
                                    <span key={tag.id} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                        {tag.tag_key}:{tag.tag_value}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[10px] text-gray-300 italic">無標籤</span>
                            )}
                            {canManage && (
                                <button
                                    onClick={() => setShowTagModal(true)}
                                    className="text-[10px] text-primary-500 hover:text-primary-700 font-bold"
                                >
                                    + 編輯標籤
                                </button>
                            )}
                        </div>

                        {/* 同步錯誤提示 */}
                        {syncError && (
                            <div className="mt-2 p-2 bg-error-50 rounded border border-error-100">
                                <p className="text-[10px] text-error-600 font-medium">⚠️ {syncError}</p>
                            </div>
                        )}

                        {/* 操作按鈕 */}
                        {canManage && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                                {/* 同步按鈕 */}
                                {['PENDING', 'FAILED', 'NEEDS_REVIEW'].includes(file.gemini_state) && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleSync}
                                        loading={isSyncing}
                                        disabled={isSyncing}
                                    >
                                        同步至 AI
                                    </Button>
                                )}

                                {/* 刪除按鈕 */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDeleteModal(true)}
                                    className="text-gray-400 hover:text-error-500"
                                >
                                    刪除
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 標籤編輯 Modal */}
            <Modal
                isOpen={showTagModal}
                onClose={() => setShowTagModal(false)}
                title="編輯檔案標籤"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowTagModal(false)}>
                            取消
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSaveTags}
                            loading={isSavingTags}
                            disabled={isSavingTags}
                        >
                            確認儲存
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <input
                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-sm outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="Key (e.g. dept)"
                            value={newTagKey}
                            onChange={(e) => setNewTagKey(e.target.value)}
                        />
                        <input
                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-sm outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="Value (e.g. HR)"
                            value={newTagValue}
                            onChange={(e) => setNewTagValue(e.target.value)}
                        />
                        <Button size="sm" onClick={addTag}>增加</Button>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg min-h-[100px] border border-dashed border-gray-200">
                        <div className="flex flex-wrap gap-2">
                            {tags.length > 0 ? tags.map((tag, i) => (
                                <span key={i} className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200 text-xs font-medium text-gray-700">
                                    {tag.tag_key}:{tag.tag_value}
                                    <button onClick={() => removeTag(i)} className="text-gray-400 hover:text-error-500">×</button>
                                </span>
                            )) : (
                                <p className="text-gray-400 text-xs text-center w-full py-8">目前尚無標籤，請於上方輸入後點擊增加</p>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* 刪除確認 Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="確認刪除"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                            取消
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            loading={isDeleting}
                            disabled={isDeleting}
                        >
                            確認刪除
                        </Button>
                    </>
                }
            >
                <p className="text-gray-600">
                    確定要刪除 <strong>{file.filename}</strong> 嗎？此操作無法復原。
                </p>
            </Modal>
        </>
    );
}
