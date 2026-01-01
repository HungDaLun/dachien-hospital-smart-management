/**
 * 檔案上傳元件
 * 支援拖曳上傳、格式驗證、進度顯示
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { useState, useCallback, useRef } from 'react';
import { Button, Card, Spinner, Badge } from '@/components/ui';

/**
 * 支援的檔案格式
 */
const ACCEPTED_FORMATS = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'text/csv': '.csv',
    'text/plain': '.txt',
    'text/markdown': '.md',
    'text/html': '.html',
};

const ACCEPT_STRING = Object.values(ACCEPTED_FORMATS).join(',');
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * 上傳狀態類型
 */
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadFile {
    file: File;
    status: UploadStatus;
    progress: number;
    error?: string;
}

import { Dictionary } from '@/lib/i18n/dictionaries';

interface FileUploaderProps {
    dict: Dictionary;
}

export default function FileUploader({ dict }: FileUploaderProps) {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    /**
     * 處理檔案選擇
     */
    const handleFiles = useCallback((selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        const newFiles: UploadFile[] = [];

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];

            // 驗證檔案格式
            if (!Object.keys(ACCEPTED_FORMATS).includes(file.type)) {
                newFiles.push({
                    file,
                    status: 'error',
                    progress: 0,
                    error: `${dict.knowledge.file_list} ${file.type || 'unknown'}`, // Note: Ideally should have specific error keys
                });
                continue;
            }

            // 驗證檔案大小
            if (file.size > MAX_FILE_SIZE) {
                newFiles.push({
                    file,
                    status: 'error',
                    progress: 0,
                    error: `${dict.knowledge.file_list}: ${(file.size / 1024 / 1024).toFixed(2)} MB`, // Fallback for now
                });
                continue;
            }

            newFiles.push({
                file,
                status: 'idle',
                progress: 0,
            });
        }

        setFiles((prev) => [...prev, ...newFiles]);
    }, []);

    /**
     * 拖曳事件處理
     */
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    /**
     * 上傳單一檔案
     */
    const uploadFile = async (index: number) => {
        const uploadFile = files[index];
        if (!uploadFile || uploadFile.status !== 'idle') return;

        // 更新狀態為上傳中
        setFiles((prev) =>
            prev.map((f, i) =>
                i === index ? { ...f, status: 'uploading' as UploadStatus, progress: 0 } : f
            )
        );

        try {
            const formData = new FormData();
            formData.append('file', uploadFile.file);

            const response = await fetch('/api/files', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || dict.common.error);
            }

            // 更新狀態為成功
            setFiles((prev) =>
                prev.map((f, i) =>
                    i === index ? { ...f, status: 'success' as UploadStatus, progress: 100 } : f
                )
            );

            // 3 秒後移除成功項目
            setTimeout(() => {
                setFiles((prev) => prev.filter((_, i) => i !== index));
            }, 3000);

        } catch (error) {
            // 更新狀態為失敗
            setFiles((prev) =>
                prev.map((f, i) =>
                    i === index
                        ? {
                            ...f,
                            status: 'error' as UploadStatus,
                            progress: 0,
                            error: error instanceof Error ? error.message : dict.common.error,
                        }
                        : f
                )
            );
        }
    };

    /**
     * 上傳所有待上傳檔案
     */
    const uploadAll = async () => {
        const pendingIndexes = files
            .map((f, i) => (f.status === 'idle' ? i : -1))
            .filter((i) => i !== -1);

        for (const index of pendingIndexes) {
            await uploadFile(index);
        }
    };

    /**
     * 移除檔案
     */
    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    /**
     * 開啟檔案選擇器
     */
    const openFilePicker = () => {
        inputRef.current?.click();
    };

    const hasIdleFiles = files.some((f) => f.status === 'idle');

    return (
        <Card>
            <div className="space-y-4">
                {/* 標題 */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">{dict.knowledge.upload_file}</h2>
                    {hasIdleFiles && (
                        <Button onClick={uploadAll} size="sm">
                            {dict.common.upload}
                        </Button>
                    )}
                </div>

                {/* 拖曳區域 */}
                <div
                    className={`
            relative border-2 border-dashed rounded-lg p-8
            transition-colors duration-200 text-center
            ${isDragging
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }
          `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept={ACCEPT_STRING}
                        onChange={(e) => handleFiles(e.target.files)}
                        className="hidden"
                    />

                    <div className="space-y-2">
                        {/* 上傳圖示 */}
                        <svg
                            className="w-12 h-12 mx-auto text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>

                        <p className="text-gray-600">
                            {dict.knowledge.drag_drop.split('或')[0]} {dict.common.search === '搜尋' ? '或' : 'or'}{' '}
                            <button
                                type="button"
                                onClick={openFilePicker}
                                className="text-primary-500 hover:text-primary-600 font-medium"
                            >
                                {dict.knowledge.drag_drop.split('或')[1] || dict.knowledge.drag_drop}
                            </button>
                        </p>

                        <p className="text-sm text-gray-500">
                            {dict.knowledge.upload_description}
                        </p>
                    </div>
                </div>

                {/* 檔案列表 */}
                {files.length > 0 && (
                    <div className="space-y-2">
                        {files.map((fileItem, index) => (
                            <div
                                key={`${fileItem.file.name}-${index}`}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {/* 檔案圖示 */}
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                        <svg
                                            className="w-4 h-4 text-gray-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>

                                    {/* 檔案資訊 */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {fileItem.file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>

                                {/* 狀態與操作 */}
                                <div className="flex items-center gap-2">
                                    {fileItem.status === 'idle' && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => uploadFile(index)}
                                            >
                                                {dict.common.upload}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                            >
                                                <svg
                                                    className="w-4 h-4"
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
                                            </Button>
                                        </>
                                    )}

                                    {fileItem.status === 'uploading' && (
                                        <Spinner size="sm" />
                                    )}

                                    {fileItem.status === 'success' && (
                                        <Badge variant="success">{dict.knowledge.status_synced}</Badge>
                                    )}

                                    {fileItem.status === 'error' && (
                                        <div className="flex items-center gap-2">
                                            <Badge variant="error">{fileItem.error}</Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                            >
                                                <svg
                                                    className="w-4 h-4"
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
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}
