/**
 * 檔案列表元件
 * 顯示檔案列表，支援分頁、搜尋、篩選
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input, Select, Button, Card, Spinner } from '@/components/ui';
import FileCard, { FileData } from './FileCard';

/**
 * 檔案列表屬性
 */
interface FileListProps {
    canManage: boolean;
}

/**
 * 狀態選項
 */
const statusOptions = [
    { value: '', label: '全部狀態' },
    { value: 'PENDING', label: '待處理' },
    { value: 'PROCESSING', label: '處理中' },
    { value: 'SYNCED', label: '已同步' },
    { value: 'NEEDS_REVIEW', label: '需審核' },
    { value: 'FAILED', label: '失敗' },
];

export default function FileList({ canManage }: FileListProps) {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 篩選條件
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    // 分頁
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    /**
     * 取得檔案列表
     */
    const fetchFiles = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
            });

            if (search) params.append('search', search);
            if (status) params.append('status', status);

            const response = await fetch(`/api/files?${params.toString()}`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || '載入失敗');
            }

            setFiles(result.data);
            setTotalPages(result.meta?.totalPages || 1);
            setTotal(result.meta?.total || 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : '載入檔案列表失敗');
        } finally {
            setLoading(false);
        }
    }, [page, search, status]);

    // 初始載入與篩選變更時重新載入
    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    /**
     * 搜尋防抖處理
     */
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1); // 重置頁碼
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    /**
     * 處理狀態篩選
     */
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value);
        setPage(1); // 重置頁碼
    };

    /**
     * 處理同步完成
     */
    const handleSync = (id: string) => {
        // 更新本地狀態
        setFiles((prev) =>
            prev.map((f) =>
                f.id === id ? { ...f, gemini_state: 'PROCESSING' as const } : f
            )
        );

        // 3 秒後重新載入
        setTimeout(() => {
            fetchFiles();
        }, 3000);
    };

    /**
     * 處理刪除完成
     */
    const handleDelete = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        setTotal((prev) => prev - 1);
    };

    return (
        <Card>
            <div className="space-y-4">
                {/* 標題與篩選 */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">檔案列表</h2>
                        <p className="text-sm text-gray-500">共 {total} 個檔案</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {/* 搜尋框 */}
                        <Input
                            placeholder="搜尋檔案名稱..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            inputSize="sm"
                            leftElement={
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
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            }
                        />

                        {/* 狀態篩選 */}
                        <Select
                            options={statusOptions}
                            value={status}
                            onChange={handleStatusChange}
                            selectSize="sm"
                        />
                    </div>
                </div>

                {/* 載入中 */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                )}

                {/* 錯誤訊息 */}
                {error && (
                    <div className="text-center py-12 text-error-500">
                        <p>{error}</p>
                        <Button variant="outline" size="sm" onClick={fetchFiles} className="mt-4">
                            重試
                        </Button>
                    </div>
                )}

                {/* 檔案列表 */}
                {!loading && !error && (
                    <>
                        {files.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <svg
                                    className="w-12 h-12 mx-auto mb-4 text-gray-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <p>尚無檔案</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {files.map((file) => (
                                    <FileCard
                                        key={file.id}
                                        file={file}
                                        canManage={canManage}
                                        onSync={handleSync}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}

                        {/* 分頁 */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    上一頁
                                </Button>
                                <span className="text-sm text-gray-600">
                                    第 {page} / {totalPages} 頁
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    下一頁
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
}
