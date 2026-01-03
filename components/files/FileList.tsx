/**
 * 檔案列表元件
 * 顯示檔案列表，支援分頁、搜尋、篩選
 * 遵循 EAKAP 設計系統規範
 */
// ...existing code...
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input, Select, Button, Card, Spinner, Progress, Checkbox, Badge } from '@/components/ui';
import { Trash2, Sparkles, Download, FileText, Search } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { FileData } from './FileCard';
// ...existing code...
import ReviewMetadataModal from './ReviewMetadataModal';
import FilePreviewModal from './FilePreviewModal';

/**
 * 文件類型對照表 (遵循 MECE 原則：相互獨立，完全窮盡)
 */
const typeMap: Record<string, string> = {
    'Policy': '規章與策略',
    'Guideline': '流程與指南',
    'Spec': '技術規格',
    'Report': '洞察與報告',
    'Minutes': '紀錄與紀要',
    'Template': '範本與工具',
};

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
 * 檔案清單元件
 */
export default function FileList({ canManage, dict, refreshTrigger = 0 }: FileListProps) {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(false);

    // 篩選條件
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    // 動態資料
    const [actualDepartments, setActualDepartments] = useState<{ id: string; name: string; code?: string }[]>([]);

    // 批次操作狀態
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [analysisTotal, setAnalysisTotal] = useState(0);
    const [isBatchDeleting, setIsBatchDeleting] = useState(false);

    // Review Modal State
    const [reviewFile, setReviewFile] = useState<FileData | null>(null);

    const { toast } = useToast();

    // 分頁
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 50; // Increased density means we can show more

    // Last selected ID for shift-click range selection
    const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

    // 預覽與排序狀態
    const [previewFile, setPreviewFile] = useState<FileData | null>(null);
    const [sortByExt, setSortByExt] = useState(false);

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
                limit: pageSize.toString(),
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
                throw new Error(result.error?.message || dict.common.error);
            }

            setFiles(result.data);
            setTotalPages(result.meta?.totalPages || 1);
            setTotal(result.meta?.total || 0);
            setSelectedIds(new Set()); // Reset selection on refresh/page change
            setLastSelectedId(null);
        } catch (err) {
            if (!silent) {
                toast.error(err instanceof Error ? err.message : dict.common.error);
            } else {
                console.error('[Background Poll Failed]', err);
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, [page, search, statusFilter, deptFilter, typeFilter, dict.common.error]);

    // Initial load & Refresh
    useEffect(() => {
        fetchFiles(false);
        // 取得真實部門列表
        fetch('/api/departments')
            .then(res => res.json())
            .then(res => {
                if (res.success) setActualDepartments(res.data);
            });
    }, [fetchFiles, refreshTrigger]);

    // Polling for active states
    useEffect(() => {
        const hasTransientFiles = files.some(f => ['PENDING', 'PROCESSING'].includes(f.gemini_state));
        if (hasTransientFiles) {
            const pollTimer = setInterval(() => fetchFiles(true), 3000);
            return () => clearInterval(pollTimer);
        }
        return undefined;
    }, [files, fetchFiles]);

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

    const handleBatchDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(dict.knowledge.delete_confirm?.replace('{{filename}}', `selected ${selectedIds.size} files`) || `Delete ${selectedIds.size} files?`)) return;

        setIsBatchDeleting(true);
        try {
            // Parallel delete requests (or build a batch API)
            // For now, simple parallel fetch
            const promises = Array.from(selectedIds).map(id =>
                fetch(`/api/files/${id}`, { method: 'DELETE' })
            );
            await Promise.all(promises);

            toast.success(`Deleted ${selectedIds.size} files`);
            fetchFiles(true);
        } catch (e) {
            console.error(e);
            toast.error(dict.common.error);
        } finally {
            setIsBatchDeleting(false);
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

    // --- Single Row Actions ---
    const handleReviewConfirm = async (data: { filename: string; tags: string[]; categoryId?: string }) => {
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

    const typeOptions = [
        { value: '', label: '所有類型' },
        { value: 'Policy', label: '規章與策略' },
        { value: 'Guideline', label: '流程與指南' },
        { value: 'Spec', label: '技術規格' },
        { value: 'Report', label: '洞察與報告' },
        { value: 'Minutes', label: '紀錄與紀要' },
        { value: 'Template', label: '範本與工具' },
    ];


    return (
        <Card className="shadow-sm border-gray-200 overflow-hidden">
            {/* Header Controls */}
            <div className="p-4 border-b border-gray-100 bg-white space-y-4">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">

                    {/* Title & Count */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 tracking-tight">檔案管理</h2>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">Total files: {total}</p>
                    </div>

                    {/* Action Bar / Batch Actions */}
                    <div className="flex-1 w-full xl:w-auto flex flex-col sm:flex-row gap-3 items-center justify-end">
                        {selectedIds.size > 0 ? (
                            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100 animate-in fade-in slide-in-from-top-1">
                                <span className="text-sm font-bold text-indigo-700 mr-2">已選取 {selectedIds.size} 個項目</span>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={handleBatchDelete}
                                    loading={isBatchDeleting}
                                    leftIcon={<Trash2 size={16} />}
                                    className="shadow-sm border border-red-600/20"
                                >
                                    刪除
                                </Button>
                                <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={handleAnalyzeSelected}
                                    loading={isAnalyzingAll}
                                    leftIcon={<Sparkles size={16} />}
                                    className="shadow-sm border border-indigo-600/20"
                                >
                                    智慧分析
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleBatchDownload}
                                    leftIcon={<Download size={16} />}
                                    className="shadow-sm border border-gray-300"
                                >
                                    下載檔案
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none min-w-[200px]">
                                    <Input
                                        placeholder="搜尋檔名, 部門, 關鍵字..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        inputSize="sm"
                                        fullWidth
                                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                        leftElement={<Search size={16} className="text-gray-400" />}
                                    />
                                </div>
                                <Select
                                    options={deptOptions}
                                    value={deptFilter}
                                    onChange={(e) => setDeptFilter(e.target.value)}
                                    selectSize="sm"
                                    className="w-32 bg-gray-50 border-gray-200"
                                />
                                <Select
                                    options={typeOptions}
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    selectSize="sm"
                                    className="w-32 bg-gray-50 border-gray-200"
                                />
                                <Select
                                    options={getStatusOptions(dict)}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    selectSize="sm"
                                    className="w-32 bg-gray-50 border-gray-200"
                                />
                            </div>
                        )}
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
            <div className="overflow-x-auto min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="p-4 w-10">
                                    <Checkbox
                                        checked={selectedIds.size === files.length && files.length > 0}
                                        indeterminate={selectedIds.size > 0 && selectedIds.size < files.length}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </th>
                                <th
                                    className="p-4 cursor-pointer hover:text-indigo-600 transition-colors group"
                                    onClick={() => setSortByExt(!sortByExt)}
                                >
                                    <div className="flex items-center gap-1">
                                        檔案名稱
                                        {sortByExt && <span className="text-xs text-indigo-500 font-mono">(按副檔名歸類)</span>}
                                        <span className="opacity-0 group-hover:opacity-100 text-[10px] ml-1">⇅</span>
                                    </div>
                                </th>
                                <th className="p-4 w-28">管理部門</th>
                                <th className="p-4 w-28">文件型態</th>
                                <th className="p-4 hidden md:table-cell">AI 智能摘要</th>
                                <th className="p-4 hidden lg:table-cell w-48">治理標籤/元數據</th>
                                <th className="p-4 w-24">狀態</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {files.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-gray-400">
                                        No files found. Try adjusting filters.
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
                                    const typeName = typeCode ? (typeMap[typeCode] || typeCode) : '-';

                                    // Safely access metadata_analysis
                                    const summary = file.metadata_analysis?.summary || '-';

                                    return (
                                        <tr
                                            key={file.id}
                                            className={`
                                                group transition-colors duration-150 text-sm
                                                ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}
                                            `}
                                            onClick={(e) => {
                                                // Allow clicking row to select (unless clicking button/link)
                                                if ((e.target as HTMLElement).closest('button, a, input, .file-preview-link')) return;
                                                handleSelectRow(file.id, !isSelected, e.shiftKey);
                                            }}
                                        >
                                            <td className="p-4">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={(e) => handleSelectRow(file.id, e.target.checked, (e.nativeEvent as any).shiftKey)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <FileText size={20} className={`opacity-70 group-hover:opacity-100 transition-opacity ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                                                    <div className="flex flex-col min-w-0">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPreviewFile(file);
                                                            }}
                                                            className="file-preview-link text-left font-medium truncate max-w-[200px] xl:max-w-[400px] text-gray-900 hover:text-primary-600 hover:underline transition-all"
                                                        >
                                                            {file.filename}
                                                        </button>
                                                        <span className="text-xs text-gray-400">
                                                            {formatFileSize(file.size_bytes)} • {formatDate(file.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-700">{deptName}</span>
                                                    {deptCodeFromFilename && <span className="text-[10px] text-gray-400 font-mono uppercase">{deptCodeFromFilename}</span>}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium text-gray-600">{typeName}</span>
                                                    {typeCode && <span className="text-[10px] text-gray-400 font-mono italic">{typeCode}</span>}
                                                </div>
                                            </td>
                                            <td className="p-4 hidden md:table-cell">
                                                <p className="text-gray-500 line-clamp-2 text-xs leading-relaxed max-w-[300px]" title={summary}>
                                                    {summary}
                                                </p>
                                            </td>
                                            <td className="p-4 hidden lg:table-cell">
                                                <div className="flex flex-col gap-1.5">
                                                    {file.metadata_analysis?.governance ? (
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded border border-indigo-100 uppercase tracking-tighter">
                                                                    {file.metadata_analysis.governance.domain || 'N/A'}
                                                                </span>
                                                                <span className="text-[10px] font-mono text-gray-400">
                                                                    {file.metadata_analysis.governance.version || '-'}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] text-gray-500 italic font-medium px-1">
                                                                {file.metadata_analysis.governance.artifact || '-'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1">
                                                            {(file.file_tags || []).slice(0, 2).map((t: any) => (
                                                                <span key={t.id} className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 bg-white text-gray-500">
                                                                    {t.tag_value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={statusStart.variant} dot={statusStart.dot} size="sm">
                                                        {statusStart.label}
                                                    </Badge>
                                                    {file.gemini_state === 'NEEDS_REVIEW' && canManage && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setReviewFile(file);
                                                            }}
                                                            className="text-amber-500 hover:text-amber-600 transition-colors p-1 rounded-full hover:bg-amber-50"
                                                            title="審核元數據"
                                                        >
                                                            <Search size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                                {file.gemini_state === 'FAILED' && (
                                                    <div className="text-[10px] text-red-500 mt-1 truncate max-w-[100px]" title={(file.metadata_analysis as any)?.error}>
                                                        點擊查看錯誤
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
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="text-xs text-gray-500">
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
                    <span className="text-sm font-medium text-gray-700 flex items-center px-2">Page {page}</span>
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
        </Card>
    );
}
