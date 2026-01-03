/**
 * 檔案列表元件
 * 顯示檔案列表，支援分頁、搜尋、篩選
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input, Select, Button, Card, Spinner, Progress } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import FileCard, { FileData } from './FileCard';
import { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * 檔案列表屬性
 */
interface FileListProps {
    canManage: boolean;
    dict: Dictionary;
    refreshTrigger?: number;
}

/**
 * 狀態選項
 */
const getStatusOptions = (dict: Dictionary) => {
    if (!dict?.knowledge) return [];
    return [
        { value: '', label: (dict.knowledge.filter_files || 'All').replace('...', '') },
        { value: 'PENDING', label: dict.knowledge.status_pending || 'Pending' },
        { value: 'PROCESSING', label: dict.knowledge.status_processing || 'Processing' },
        { value: 'SYNCED', label: dict.knowledge.status_synced || 'Synced' },
        { value: 'NEEDS_REVIEW', label: dict.knowledge.status_needs_review || 'Needs Review' },
        { value: 'FAILED', label: dict.knowledge.status_failed || 'Failed' },
    ];
};

export default function FileList({ canManage, dict, refreshTrigger = 0 }: FileListProps) {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 篩選條件
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [analysisTotal, setAnalysisTotal] = useState(0);
    const { toast } = useToast();

    // 分頁
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    /**
     * 取得檔案列表
     * @param silent 是否為靜默更新 (不觸發全螢幕載入動畫)
     */
    const fetchFiles = useCallback(async (silent = false) => {
        if (!silent) {
            setLoading(true);
        }
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
                throw new Error(result.error?.message || dict.common.error);
            }

            setFiles(result.data);
            setTotalPages(result.meta?.totalPages || 1);
            setTotal(result.meta?.total || 0);
        } catch (err) {
            // 靜默更新失敗時不顯示大錯誤畫面，避免打斷使用者
            if (!silent) {
                setError(err instanceof Error ? err.message : dict.common.error);
            } else {
                console.error('[Background Poll Failed]', err);
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, [page, search, status, dict.common.error]);

    // 初始載入與篩選變更時重新載入
    useEffect(() => {
        fetchFiles(false);
    }, [fetchFiles, refreshTrigger]);

    // 實時更新：如果有檔案在處理中或同步中，則自動輪詢
    useEffect(() => {
        const hasTransientFiles = files.some(f => ['PENDING', 'PROCESSING'].includes(f.gemini_state));

        if (hasTransientFiles) {
            const pollTimer = setInterval(() => {
                fetchFiles(true); // 使用靜默更新
            }, 3000); // 每 3 秒檢查一次

            return () => clearInterval(pollTimer);
        }
        return undefined;
    }, [files, fetchFiles]);

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
            fetchFiles(true); // 靜默更新以避免閃爍
        }, 3000);
    };

    /**
     * 處理一鍵分析
     */
    const handleAnalyzeAll = async () => {
        if (isAnalyzingAll) return;

        try {
            const confirmText = dict?.knowledge?.analyze_all || '一鍵分析';
            if (typeof window !== 'undefined' && !window.confirm(confirmText + '?')) return;

            // Step 1: Get the list of IDs
            const candidatesRes = await fetch('/api/files/analyze-candidates');
            const candidatesData = await candidatesRes.json();

            if (!candidatesRes.ok || !candidatesData.success) {
                throw new Error(candidatesData.error?.message || '無法取得待分析檔案');
            }

            const ids = candidatesData.data as string[];
            if (ids.length === 0) {
                toast.info('沒有需要分析的檔案');
                return;
            }

            setIsAnalyzingAll(true);
            setAnalysisTotal(ids.length);
            setAnalysisProgress(0);

            let successCount = 0;
            let failCount = 0;

            // Step 2: Loop and analyze one by one to show progress
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                try {
                    const res = await fetch(`/api/files/${id}/analyze`, { method: 'POST' });
                    const resData = await res.json();
                    if (res.ok && resData.success) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (e) {
                    console.error(`Analysis failed for file ${id}:`, e);
                    failCount++;
                }
                setAnalysisProgress(i + 1);
            }

            // Step 3: Final report
            const successMsg = (dict?.knowledge?.analyze_all_success || 'Success').replace('{{count}}', String(successCount));
            toast.success(successMsg);
            fetchFiles(true);

        } catch (error) {
            console.error('Batch analysis error:', error);
            const genericError = dict?.common?.error || '發生錯誤';
            toast.error(typeof error === 'string' ? error : (error as any).message || genericError);
        } finally {
            setIsAnalyzingAll(false);
            // Delay resetting progress to allow users to see 100%
            setTimeout(() => {
                setAnalysisProgress(0);
                setAnalysisTotal(0);
            }, 3000);
        }
    };

    /**
     * 處理刪除完成
     */
    const handleDelete = (id: string) => {
        setFiles((prev) => {
            const newFiles = prev.filter((f) => f.id !== id);

            // 如果當前頁面所有檔案都刪除了，且不是第一頁，則回到上一頁
            if (newFiles.length === 0 && page > 1) {
                setPage((p) => p - 1);
            }

            return newFiles;
        });

        setTotal((prev) => {
            const newTotal = Math.max(0, prev - 1);
            // 更新總頁數
            setTotalPages(Math.ceil(newTotal / 12) || 1);
            return newTotal;
        });
    };

    return (
        <Card>
            <div className="space-y-4">
                {/* 標題與篩選 */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{dict.knowledge.file_list}</h2>
                        <p className="text-sm text-gray-500">{dict.knowledge.file_list} {total}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {/* 搜尋框 */}
                        <Input
                            placeholder={dict.common.search + "..."}
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
                        <div className="flex gap-2">
                            <Select
                                options={getStatusOptions(dict)}
                                value={status}
                                onChange={handleStatusChange}
                                selectSize="sm"
                            />

                            {/* 一鍵分析按鈕 */}
                            {canManage && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleAnalyzeAll}
                                    loading={isAnalyzingAll}
                                    disabled={isAnalyzingAll}
                                    className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 border-none shadow-md"
                                    leftIcon={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    }
                                >
                                    {dict.knowledge.analyze_all}
                                </Button>
                            )}
                        </div>
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
                        <Button variant="outline" size="sm" onClick={() => fetchFiles(false)} className="mt-4">
                            {dict.common.refresh}
                        </Button>
                    </div>
                )}

                {/* 分析進度條 */}
                {analysisTotal > 0 && (
                    <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Progress
                            value={analysisProgress}
                            max={analysisTotal}
                            showValue
                            label={`${dict?.knowledge?.analyzing_all || '正在分析...'} (${analysisProgress}/${analysisTotal})`}
                            colorClass="bg-gradient-to-r from-indigo-500 to-violet-500"
                        />
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
                                <p>{dict.common.no_data}</p>
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
                                        dict={dict}
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
                                    {dict.common.back}
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
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
}
