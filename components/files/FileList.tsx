/**
 * 檔案列表元件
 * 顯示檔案列表，支援分頁、搜尋、篩選
 * 遵循 EAKAP 設計系統規範
 */
// ...existing code...
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Input, Select, Button, Card, Spinner, Progress, Checkbox, Badge, Modal, TableHeader, ConfirmDialog } from '@/components/ui';
import { Trash2, Sparkles, Download, FileText, Search } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { FileData } from './FileCard';
// ...existing code...
import ReviewMetadataModal from './ReviewMetadataModal';
import FilePreviewModal from './FilePreviewModal';
import { getCategories } from '@/lib/actions/taxonomy';
import { DocumentCategory } from '@/types';
import HierarchicalCategorySelect from './HierarchicalCategorySelect';

/**
 * 檔案列表屬性
 */
interface FileListProps {
    canManage: boolean;
    dict: Dictionary;
    refreshTrigger?: number;
    initialFiles?: FileData[];
    initialTotal?: number;
    onFileSelect?: (fileId: string) => void;
    headerActions?: React.ReactNode;
}

/**
 * 狀態選項
 */
const getStatusOptions = (dict: Dictionary) => {
    if (!dict?.knowledge) return [];
    return [
        { value: '', label: (dict.knowledge.filter_files || 'All Status').replace('...', '') },
        { value: 'PENDING', label: dict.knowledge.status_pending || 'Pending' },
        { value: 'PROCESSING', label: dict.knowledge.status_processing || 'Processing' },
        { value: 'SYNCED', label: dict.knowledge.status_synced || 'Synced' },
        { value: 'NEEDS_REVIEW', label: dict.knowledge.status_needs_review || 'Needs Review' },
        { value: 'FAILED', label: dict.knowledge.status_failed || 'Failed' },
    ];
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
    });
}

/**
 * 狀態 Badge 配置
 */
const getStatusConfig = (state: string, dict: Dictionary) => {
    const map: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'default'; label: string; dot?: boolean }> = {
        PENDING: { variant: 'default', label: dict.knowledge.status_pending },
        PROCESSING: { variant: 'info', label: dict.knowledge.status_processing, dot: true },
        SYNCED: { variant: 'success', label: dict.knowledge.status_synced },
        NEEDS_REVIEW: { variant: 'warning', label: dict.knowledge.status_needs_review || 'Needs Review' },
        REJECTED: { variant: 'error', label: 'Rejected' },
        FAILED: { variant: 'error', label: dict.knowledge.status_failed },
    };
    return map[state] || map.PENDING;
};

/**
 * File processing progress component
 * Simulates progress based on elapsed time since creation
 */
const ProcessingProgress = ({ createdAt, label }: { createdAt: string; label: string }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Calculate initial progress based on time elapsed
        // Assume typical processing takes ~20s for analysis + embedding
        const elapsed = Date.now() - new Date(createdAt).getTime();
        const startPercent = Math.min(90, Math.max(5, (elapsed / 20000) * 100));
        setProgress(startPercent);

        const interval = setInterval(() => {
            setProgress((p) => {
                if (p >= 95) return p;
                // Logarithmic-like slowdown
                const increment = p < 50 ? 5 : p < 80 ? 2 : 0.5;
                return Math.min(95, p + increment);
            });
        }, 800);

        return () => clearInterval(interval);
    }, [createdAt]);

    return (
        <div className="flex flex-col items-center justify-center w-28 gap-1.5">
            <div className="flex justify-between w-full px-1">
                <span className="text-[9px] font-black text-primary-400 animate-pulse uppercase tracking-widest">{label}</span>
                <span className="text-[9px] font-mono text-primary-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500 ease-out shadow-glow-cyan"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

const PAGE_SIZE = 50;

/**
 * 檔案清單元件
 */
export default function FileList({ canManage, dict, refreshTrigger = 0, initialFiles, initialTotal, onFileSelect, headerActions }: FileListProps) {
    const [files, setFiles] = useState<FileData[]>(initialFiles || []);
    // If we have initial data, we are not loading initially
    const [loading, setLoading] = useState(initialFiles ? false : true);

    // 篩選條件
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    // 動態資料
    const [actualDepartments, setActualDepartments] = useState<{ id: string; name: string; code?: string }[]>([]);
    const [categories, setCategories] = useState<DocumentCategory[]>([]);

    // 批次操作狀態
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [analysisTotal, setAnalysisTotal] = useState(0);
    const [isBatchDeleting, setIsBatchDeleting] = useState(false);
    const [confirmBatchDeleteOpen, setConfirmBatchDeleteOpen] = useState(false);

    // Review Modal State
    const [reviewFile, setReviewFile] = useState<FileData | null>(null);

    const { toast } = useToast();

    // 分頁
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(initialTotal ? Math.ceil(initialTotal / PAGE_SIZE) : 1);
    const [total, setTotal] = useState(initialTotal || 0);

    // Last selected ID for shift-click range selection
    const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

    // 預覽與排序狀態
    const [previewFile, setPreviewFile] = useState<FileData | null>(null);
    const [summaryModalText, setSummaryModalText] = useState<string | null>(null);
    const [sortByExt, setSortByExt] = useState(false);

    /**
     * 取得分類列表
     */
    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await getCategories();
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    /**
     * 取得檔案列表
     */
    const fetchFiles = useCallback(async (silent = false) => {
        if (!silent) {
            setLoading(true);
        }

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: PAGE_SIZE.toString(),
            });

            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);
            // API currently might not support dept/type filtering, client-side filtering logic could be added or API updated.
            // For now, let's assume API will be updated or we filter client side if the dataset is small enough, 
            // but for pagination correctness, API parameter is best. Let's send them, assuming API ignores if not implemented.
            if (deptFilter) params.append('dept', deptFilter);
            if (typeFilter) params.append('type', typeFilter);

            const response = await fetch(`/api/files?${params.toString()}`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || (dict?.common?.error || 'Error'));
            }

            setFiles(result.data);
            setTotalPages(result.meta?.totalPages || 1);
            setTotal(result.meta?.total || 0);
            setSelectedIds(new Set()); // Reset selection on refresh/page change
            setLastSelectedId(null);
        } catch (err) {
            if (!silent) {
                toast.error(err instanceof Error ? err.message : (dict?.common?.error || 'Error'));
            } else {
                console.error('[Background Poll Failed]', err);
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, search, statusFilter, deptFilter, typeFilter]); // Removed dict and PAGE_SIZE from deps

    // Initial load & Refresh
    // Initial load & Filter Changes
    useEffect(() => {
        // Initial state check - prevent refetching if we have SSR data
        const isInitialState = initialFiles && page === 1 && !search && !statusFilter && !deptFilter && !typeFilter && refreshTrigger === 0;

        if (isInitialState && files.length > 0) {
            // Do NOT fetch. We effectively "hydrated" the data.
        } else {
            // Standard fetch for page/filter changes (Shows loading spinner)
            fetchFiles(false);
        }

        // 取得真實部門列表 (Always fetch this as it is fast and small)
        fetch('/api/departments')
            .then(res => res.json())
            .then(res => {
                if (res.success) setActualDepartments(res.data);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, statusFilter, deptFilter, typeFilter, page, initialFiles]); // Removed fetchFiles to prevent infinite loop

    // Handle Refresh Trigger (Silent Update for Uploads/Actions)
    useEffect(() => {
        if (refreshTrigger > 0) {
            fetchFiles(true); // Silent fetch without spinner
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]); // Only depend on refreshTrigger, not fetchFiles

    // Realtime 訂閱替代輪詢：監聯檔案狀態變更
    // 當有檔案處於 PENDING/PROCESSING 狀態時，訂閱 Supabase Realtime
    const realtimeChannelRef = useRef<ReturnType<ReturnType<typeof import('@/lib/supabase/client').createClient>['channel']> | null>(null);
    // 輪詢備援計時器（僅在 Realtime 訂閱失敗時使用）
    const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const hasTransientFiles = files.some(f => ['PENDING', 'PROCESSING'].includes(f.gemini_state));

        // 動態載入 Supabase client 以避免 SSR 問題
        const setupRealtime = async () => {
            if (!hasTransientFiles) {
                // 清理現有訂閱
                if (realtimeChannelRef.current) {
                    const { createClient } = await import('@/lib/supabase/client');
                    const supabase = createClient();
                    supabase.removeChannel(realtimeChannelRef.current);
                    realtimeChannelRef.current = null;
                }
                return;
            }

            // 如果已有訂閱則跳過
            if (realtimeChannelRef.current) return;

            try {
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();

                // 建立 Realtime 訂閱
                const channel = supabase
                    .channel('file-status-updates')
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'files',
                        },
                        (payload) => {
                            // 當檔案狀態更新時，更新本地狀態
                            setFiles(prev => prev.map(f =>
                                f.id === payload.new.id
                                    ? { ...f, ...payload.new as Partial<FileData> }
                                    : f
                            ));
                        }
                    )
                    .subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            console.log('[Realtime] 已訂閱檔案狀態更新');
                        } else if (status === 'CHANNEL_ERROR') {
                            console.warn('[Realtime] 訂閱失敗，回退到輪詢模式');
                            // 訂閱失敗時回退到較長間隔的輪詢 (10 秒)
                            if (!pollTimerRef.current) {
                                pollTimerRef.current = setInterval(() => fetchFiles(true), 10000);
                            }
                        }
                    });

                realtimeChannelRef.current = channel;
            } catch (error) {
                console.error('[Realtime] 設定失敗:', error);
                // 回退到輪詢
                if (!pollTimerRef.current && hasTransientFiles) {
                    pollTimerRef.current = setInterval(() => fetchFiles(true), 10000);
                }
            }
        };

        setupRealtime();

        return () => {
            // 清理訂閱
            if (realtimeChannelRef.current) {
                import('@/lib/supabase/client').then(({ createClient }) => {
                    const supabase = createClient();
                    if (realtimeChannelRef.current) {
                        supabase.removeChannel(realtimeChannelRef.current);
                        realtimeChannelRef.current = null;
                    }
                });
            }
            // 清理輪詢備援
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [files]); // 依賴 files 陣列以偵測狀態變化

    // Search Debounce
    const [searchInput, setSearchInput] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);


    // --- Selection Logic ---

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(files.map(f => f.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: string, checked: boolean, shiftKey: boolean) => {
        const newSelected = new Set(selectedIds);

        if (checked) {
            newSelected.add(id);

            // Shift-select logic
            if (shiftKey && lastSelectedId) {
                const startIdx = files.findIndex(f => f.id === lastSelectedId);
                const endIdx = files.findIndex(f => f.id === id);
                if (startIdx !== -1 && endIdx !== -1) {
                    const low = Math.min(startIdx, endIdx);
                    const high = Math.max(startIdx, endIdx);
                    for (let i = low; i <= high; i++) {
                        newSelected.add(files[i].id);
                    }
                }
            }
            setLastSelectedId(id);
        } else {
            newSelected.delete(id);
            setLastSelectedId(null);
        }
        setSelectedIds(newSelected);
    };

    // --- Batch Actions ---

    const handleBatchDeleteClick = () => {
        if (selectedIds.size === 0) return;
        setConfirmBatchDeleteOpen(true);
    };

    const handleBatchDeleteConfirm = async () => {
        setIsBatchDeleting(true);
        try {
            // Parallel delete requests with proper error handling
            const deletePromises = Array.from(selectedIds).map(async (id) => {
                try {
                    const response = await fetch(`/api/files/${id}`, { method: 'DELETE' });
                    const result = await response.json();

                    if (!response.ok || !result.success) {
                        return {
                            id,
                            success: false,
                            error: result.error?.message || '刪除失敗',
                        };
                    }

                    return { id, success: true };
                } catch (error) {
                    return {
                        id,
                        success: false,
                        error: error instanceof Error ? error.message : '未知錯誤',
                    };
                }
            });

            const results = await Promise.all(deletePromises);
            const successCount = results.filter(r => r.success).length;
            const failedCount = results.filter(r => !r.success).length;

            if (failedCount === 0) {
                toast.success(`成功刪除 ${successCount} 個檔案`);
            } else if (successCount === 0) {
                toast.error(`刪除失敗：所有 ${failedCount} 個檔案都無法刪除`);
                console.error('刪除失敗的檔案:', results.filter(r => !r.success));
            } else {
                toast.warning(`部分成功：刪除 ${successCount} 個，失敗 ${failedCount} 個`);
                console.error('刪除失敗的檔案:', results.filter(r => !r.success));
            }

            fetchFiles(true);
        } catch (e) {
            console.error('批次刪除錯誤:', e);
            toast.error(dict.common.error);
        } finally {
            setIsBatchDeleting(false);
            setConfirmBatchDeleteOpen(false);
        }
    };

    const handleAnalyzeSelected = async () => {
        if (selectedIds.size === 0) return;
        if (isAnalyzingAll) return;

        setIsAnalyzingAll(true);
        setAnalysisTotal(selectedIds.size);
        setAnalysisProgress(0);

        try {
            let successCount = 0;
            const ids = Array.from(selectedIds);

            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                try {
                    const res = await fetch(`/api/files/${id}/analyze`, { method: 'POST' });
                    if (res.ok) successCount++;
                } catch (e) { console.error(e); }
                setAnalysisProgress(i + 1);
            }
            toast.success(`分析完成，成功：${successCount}`);
            fetchFiles(true);
        } catch (e) {
            console.error(e);
            toast.error(dict.common.error);
        } finally {
            setIsAnalyzingAll(false);
            setTimeout(() => {
                setAnalysisProgress(0);
                setAnalysisTotal(0);
            }, 3000);
        }
    };

    const handleBatchDownload = async () => {
        if (selectedIds.size === 0) return;

        // 如果只選一個，直接下載
        if (selectedIds.size === 1) {
            const fileId = Array.from(selectedIds)[0];
            const file = files.find(f => f.id === fileId);
            if (file) handleDownload(file);
            return;
        }

        // 多檔案下載：這裡示範逐一開啟視窗 (大量下載建議後端打包 zip)
        toast.info(`正在準備下載 ${selectedIds.size} 個檔案...`);
        for (const id of Array.from(selectedIds)) {
            const file = files.find(f => f.id === id);
            if (file) await handleDownload(file);
            // 稍微延遲避免瀏覽器阻擋
            await new Promise(r => setTimeout(r, 300));
        }
    };

    /**
     * 擴充功能歸類排序
     */
    const sortedFiles = useMemo(() => {
        if (!sortByExt) return files;

        return [...files].sort((a, b) => {
            const extA = a.filename.split('.').pop()?.toLowerCase() || '';
            const extB = b.filename.split('.').pop()?.toLowerCase() || '';

            if (extA !== extB) {
                return extA.localeCompare(extB);
            }
            // 相同副檔名按時間排序 (越新越前)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }, [files, sortByExt]);

    /**
     * 處理檔案下載
     */
    const handleDownload = async (file: FileData) => {
        try {
            const response = await fetch(`/api/files/${file.id}/download`);
            const result = await response.json();

            if (response.ok && result.success) {
                // 建立臨時連結觸發下載 (使用 _blank 讓瀏覽器處理檔案顯示或下載)
                window.open(result.data.url, '_blank');
            } else {
                toast.error(result.error?.message || 'Download failed');
            }
        } catch (e) {
            console.error(e);
            toast.error(dict.common.error);
        }
    };

    /**
     * 處理檔案開啟 (在新分頁瀏覽，不強制下載)
     */
    const handleOpenFile = async (file: FileData) => {
        try {
            // 加入 inline=true 參數以強制瀏覽器嘗試開啟而非下載
            const response = await fetch(`/api/files/${file.id}/download?inline=true`);
            const result = await response.json();

            if (response.ok && result.success) {
                window.open(result.data.url, '_blank');
            } else {
                toast.error(result.error?.message || 'Failed to open file');
            }
        } catch (e) {
            console.error(e);
            toast.error(dict.common.error);
        }
    };

    interface GovernanceData {
        sensitivity?: string;
        retention?: string;
        artifact?: string;
        [key: string]: unknown;
    }

    // --- Single Row Actions ---
    const handleReviewConfirm = async (data: {
        filename: string;
        tags: string[];
        categoryId?: string;
        governance?: GovernanceData;
    }) => {
        if (!reviewFile) return;
        try {
            const response = await fetch(`/api/files/${reviewFile.id}/metadata`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success('Updated successfully');
                fetchFiles(true);
                setReviewFile(null);
            } else {
                toast.error('Update failed');
            }
        } catch (e) {
            console.error(e);
            toast.error(dict.common.error);
        }
    };

    // 組合部門選單
    const deptOptions = [
        { value: '', label: '所有部門' },
        ...actualDepartments.map(d => ({ value: d.id, label: d.name })),
    ];

    // 不再需要 typeOptions，直接使用 HierarchicalCategorySelect


    return (
        <Card variant="glass" className="border-none shadow-none overflow-hidden h-full flex flex-col">
            {/* Header Controls: Compact Mode */}
            <div className="p-4 border-b border-white/5 bg-background-secondary/30 backdrop-blur-md space-y-4">
                <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3">

                    {/* Action Bar / Batch Actions */}
                    <div className="flex-1 w-full flex flex-col sm:flex-row gap-2 items-center justify-between">
                        {/* Search & Filters */}
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
                            <div className="relative flex-1 sm:flex-none min-w-[200px]">
                                <Input
                                    placeholder="搜尋檔名, 部門, 關鍵字..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    inputSize="sm"
                                    fullWidth
                                    className="bg-white/5 border-white/10 text-text-primary focus:bg-white/10 transition-colors"
                                    leftElement={<Search size={16} className="text-text-tertiary" />}
                                />
                            </div>
                            <Select
                                options={deptOptions}
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                selectSize="sm"
                                className="w-28"
                            />
                            <HierarchicalCategorySelect
                                categories={categories}
                                value={typeFilter}
                                onChange={(value) => setTypeFilter(value)}
                                selectSize="sm"
                                className="w-28"
                            />
                            <Select
                                options={getStatusOptions(dict)}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                selectSize="sm"
                                className="w-28"
                            />
                        </div>

                        {/* Right Area: Batch Actions OR Header Actions (Upload) */}
                        <div className="flex items-center gap-2">
                            {selectedIds.size > 0 ? (
                                <div className="flex items-center gap-2 bg-primary-500/10 px-3 py-1.5 rounded-xl border border-primary-500/20 animate-in fade-in slide-in-from-top-1">
                                    <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest mx-1">{selectedIds.size} SELECTED</span>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={handleBatchDeleteClick}
                                        loading={isBatchDeleting}
                                        className="h-8 px-2 shadow-sm border border-red-600/20"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={handleAnalyzeSelected}
                                        loading={isAnalyzingAll}
                                        className="h-8 px-2 shadow-sm border border-indigo-600/20"
                                    >
                                        <Sparkles size={14} />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={handleBatchDownload}
                                        className="h-8 px-2 shadow-sm border border-gray-300"
                                    >
                                        <Download size={14} />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {headerActions}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Analysis Progress */}
                {analysisTotal > 0 && (
                    <div className="w-full">
                        <Progress
                            value={analysisProgress}
                            max={analysisTotal}
                            showValue
                            label={`${dict?.knowledge?.analyzing_all || 'Analyzing...'} (${analysisProgress}/${analysisTotal})`}
                            colorClass="bg-gradient-to-r from-indigo-500 to-violet-500"
                            size="sm"
                        />
                    </div>
                )}
            </div>

            {/* Data Grid Table */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">

                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-4 py-4 w-10">
                                    <Checkbox
                                        variant="white-circle"
                                        checked={selectedIds.size === files.length && files.length > 0}
                                        indeterminate={selectedIds.size > 0 && selectedIds.size < files.length}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </th>
                                <TableHeader
                                    className="cursor-pointer hover:text-primary-400 transition-colors group w-[25%]"
                                    onClick={() => setSortByExt(!sortByExt)}
                                >
                                    <div className="flex items-center gap-1">
                                        檔案名稱 / 時效性
                                        {sortByExt && <span className="text-[10px] text-primary-400 font-mono mt-1">(按副檔名歸類)</span>}
                                        <span className="opacity-0 group-hover:opacity-100 text-[10px] ml-1">⇅</span>
                                    </div>
                                </TableHeader>
                                <TableHeader className="w-20 text-center">部門</TableHeader>
                                <TableHeader className="w-20 text-center">型態</TableHeader>
                                <TableHeader className="hidden md:table-cell w-[35%] text-center">AI 智能摘要</TableHeader>
                                <TableHeader className="hidden lg:table-cell w-[20%] text-center">治理標籤/元數據</TableHeader>
                                <TableHeader className="w-24 text-center">狀態</TableHeader>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02] bg-transparent">
                            {files.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="text-4xl opacity-20">📂</div>
                                            <p className="text-sm font-black text-text-tertiary uppercase tracking-widest">
                                                No intelligence assets found. Adjust parameters.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sortedFiles.map((file: FileData) => {
                                    const isSelected = selectedIds.has(file.id);
                                    const statusStart = getStatusConfig(file.gemini_state, dict);

                                    // Parse Filename for Badge: HR-Policy-XXX
                                    const nameParts = file.filename.split('-');
                                    const deptCodeFromFilename = nameParts.length > 1 ? nameParts[0] : null;
                                    const typeCode = nameParts.length > 2 ? nameParts[1] : null;

                                    // 優先尋找對照表 (比對 ID, 名稱或代碼)，若無則顯示原始代碼
                                    const matchedDept = actualDepartments.find(d =>
                                        d.id === file.department_id ||
                                        (deptCodeFromFilename && (d.code === deptCodeFromFilename || d.name.includes(deptCodeFromFilename)))
                                    );
                                    const deptName = matchedDept ? matchedDept.name : (deptCodeFromFilename || '-');

                                    // 從分類資料庫中尋找對應的分類名稱
                                    const matchedCategory = file.category_id
                                        ? categories.find(c => c.id === file.category_id)
                                        : (typeCode ? categories.find(c => c.name === typeCode) : null);
                                    const typeName = matchedCategory ? matchedCategory.name : (typeCode || '-');

                                    // Safely access metadata_analysis
                                    const summary = file.metadata_analysis?.summary || '-';

                                    return (
                                        <tr
                                            key={file.id}
                                            className={`
                                                group transition-all duration-300 text-sm border-b border-white/[0.02]
                                                ${isSelected ? 'bg-primary-500/10' : 'hover:bg-white/[0.02]'}
                                            `}
                                        >
                                            <td className="px-4 py-4 align-top">
                                                <div className="mt-1">
                                                    <Checkbox
                                                        variant="white-circle"
                                                        checked={isSelected}
                                                        onChange={(e) => handleSelectRow(file.id, e.target.checked, (e.nativeEvent as MouseEvent).shiftKey)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="flex items-start gap-2.5">
                                                    <FileText size={18} className={`mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity shrink-0 ${isSelected ? 'text-primary-400' : 'text-text-tertiary'}`} />
                                                    <div className="flex flex-col min-w-0">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (onFileSelect) {
                                                                    onFileSelect(file.id);
                                                                } else {
                                                                    // Only preview text-based files in the modal
                                                                    const isText = file.mime_type.startsWith('text/') ||
                                                                        file.mime_type === 'application/json' ||
                                                                        file.filename.endsWith('.md') ||
                                                                        file.filename.endsWith('.txt') ||
                                                                        file.filename.endsWith('.csv');

                                                                    if (isText) {
                                                                        setPreviewFile(file);
                                                                    } else {
                                                                        handleOpenFile(file);
                                                                    }
                                                                }
                                                            }}
                                                            className="file-preview-link text-left font-bold break-words text-text-primary group-hover:text-primary-400 hover:underline transition-all leading-tight tracking-tight"
                                                        >
                                                            {file.filename}
                                                        </button>
                                                        <span className="text-[11px] text-text-tertiary font-medium mt-1">
                                                            {formatFileSize(file.size_bytes)} • {formatDate(file.created_at)}
                                                            {file.decay_status && (
                                                                <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tight ${file.decay_status === 'expired' ? 'bg-semantic-danger/10 text-semantic-danger border border-semantic-danger/20' :
                                                                    file.decay_status === 'decaying' ? 'bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20' :
                                                                        'bg-semantic-success/10 text-semantic-success border border-semantic-success/20'
                                                                    }`}>
                                                                    {file.decay_status === 'expired' ? (dict.knowledge.status_expired || 'EXPIRED') :
                                                                        file.decay_status === 'decaying' ? (dict.knowledge.status_decaying || 'DECAYING') :
                                                                            (dict.knowledge.status_fresh || 'FRESH')}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-white/5 text-text-secondary border border-white/10 uppercase tracking-widest">
                                                        {deptName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20 whitespace-nowrap uppercase tracking-widest">
                                                        {typeName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 hidden md:table-cell align-top">
                                                <div className="flex flex-col">
                                                    <p className="text-text-secondary text-[11px] leading-relaxed whitespace-normal break-words font-medium">
                                                        {summary}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-4 hidden lg:table-cell align-top">
                                                <div className="flex flex-col gap-2">
                                                    {/* 治理標籤區塊 */}
                                                    {file.metadata_analysis?.governance && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            <div className="flex items-center gap-1.5 w-full flex-wrap">
                                                                <span className="text-[10px] font-black bg-primary-500/10 text-primary-400 px-1.5 py-0.5 rounded border border-primary-500/20 uppercase tracking-widest whitespace-nowrap" title="Domain">
                                                                    {file.metadata_analysis.governance.domain || 'N/A'}
                                                                </span>
                                                                <span className="text-[10px] font-mono text-text-tertiary bg-white/[0.03] px-1.5 rounded border border-white/5 whitespace-nowrap hover:bg-white/10 transition-colors" title="Version">
                                                                    {file.metadata_analysis.governance.version || 'v1.0'}
                                                                </span>
                                                                {file.metadata_analysis.governance.owner && (
                                                                    <span className="text-[10px] font-bold bg-secondary-500/10 text-secondary-300 px-1.5 py-0.5 rounded border border-secondary-500/20 whitespace-nowrap" title="Owner">
                                                                        @{file.metadata_analysis.governance.owner}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-text-tertiary italic font-medium px-2 py-0.5 bg-white/[0.02] rounded border border-dashed border-white/10 break-words w-full" title="Artifact Type">
                                                                {file.metadata_analysis.governance.artifact || '-'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* 通用標籤區塊 (原本被隱藏的內容) */}
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {(file.file_tags || []).map((t) => (
                                                            <span key={t.id} className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/5 bg-white/[0.03] text-text-tertiary whitespace-nowrap hover:bg-white/10 hover:text-primary-400 transition-all uppercase tracking-widest">
                                                                #{t.tag_value}
                                                            </span>
                                                        ))}
                                                        {/* 如果沒有治理標籤也沒有一般標籤 */}
                                                        {!file.metadata_analysis?.governance && (file.file_tags || []).length === 0 && (
                                                            <span className="text-[10px] text-text-tertiary italic uppercase tracking-widest font-bold px-2 py-0.5 bg-white/[0.02] rounded border border-dashed border-white/5">無元數據</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 align-top text-center">
                                                <div className="flex flex-col items-center gap-2">

                                                    {file.gemini_state === 'PROCESSING' ? (
                                                        <ProcessingProgress
                                                            createdAt={file.created_at}
                                                            label={dict?.knowledge?.status_processing || '處理中'}
                                                        />
                                                    ) : (
                                                        <Badge variant={statusStart.variant} dot={statusStart.dot} size="sm" className="whitespace-nowrap shrink-0">
                                                            {statusStart.label}
                                                        </Badge>
                                                    )}
                                                    {file.gemini_state === 'NEEDS_REVIEW' && canManage && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setReviewFile(file);
                                                            }}
                                                            className="text-semantic-warning hover:text-semantic-warning/80 transition-all p-1.5 rounded-xl hover:bg-semantic-warning/10 border border-semantic-warning/20 bg-background-tertiary shadow-glow-yellow/20"
                                                            title="審核元數據"
                                                        >
                                                            <Search size={14} className="animate-pulse-slow" />
                                                        </button>
                                                    )}
                                                </div>
                                                {file.gemini_state === 'FAILED' && (
                                                    <div className="text-[10px] text-red-500 mt-1 truncate" title={file.metadata_analysis?.error}>
                                                        錯誤
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                    Showing {files.length} of {total} items
                </span>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                        Prev
                    </Button>
                    <span className="text-xs font-black text-text-primary flex items-center px-4 uppercase tracking-[0.2em]">Page {page}</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Summary Detail Modal */}
            {summaryModalText && (
                <Modal
                    isOpen={!!summaryModalText}
                    onClose={() => setSummaryModalText(null)}
                    title="AI 智能摘要詳情"
                    size="lg"
                    footer={
                        <Button variant="primary" onClick={() => setSummaryModalText(null)}>
                            {dict.common.confirm}
                        </Button>
                    }
                >
                    <div className="bg-white/5 p-8 rounded-2xl border border-white/10 shadow-inner">
                        <div className="flex items-center gap-3 mb-6">
                            <Sparkles size={20} className="text-primary-400" />
                            <h4 className="text-lg font-black text-text-primary uppercase tracking-tight">完整摘要內容</h4>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap font-medium">
                            {summaryModalText}
                        </p>
                    </div>
                </Modal>
            )}

            {/* Review Modal */}
            {reviewFile && (
                <ReviewMetadataModal
                    isOpen={!!reviewFile}
                    onClose={() => setReviewFile(null)}
                    onConfirm={handleReviewConfirm}
                    originalFilename={reviewFile.filename}
                    metadata={reviewFile.metadata_analysis || {}}
                    dict={dict}
                />
            )}

            {/* Preview Modal */}
            {previewFile && (
                <FilePreviewModal
                    isOpen={!!previewFile}
                    onClose={() => setPreviewFile(null)}
                    file={previewFile}
                    dict={dict}
                />
            )}

            <ConfirmDialog
                open={confirmBatchDeleteOpen}
                title="批量刪除檔案"
                description={dict.knowledge.delete_confirm?.replace('{{filename}}', `selected ${selectedIds.size} files`) || `Delete ${selectedIds.size} files?`}
                onConfirm={handleBatchDeleteConfirm}
                onCancel={() => setConfirmBatchDeleteOpen(false)}
                confirmText="確認刪除"
                variant="danger"
                loading={isBatchDeleting}
            />
        </Card>
    );
}
