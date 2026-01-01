'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AuditLogTable } from '@/components/admin/AuditLogTable';

export default function AuditLogPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [actionType, setActionType] = useState('');
    const [userId, setUserId] = useState('');

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
            });

            if (actionType) params.append('action_type', actionType);
            if (userId) params.append('user_id', userId);

            const response = await fetch(`/api/audit-logs?${params.toString()}`);
            const result = await response.json();

            if (result.success) {
                setLogs(result.data);
                setTotalPages(result.meta.totalPages);
            } else {
                console.error('Failed to fetch logs:', result.error);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    }, [page, actionType, userId]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">系統稽核日誌</h1>
                    <p className="text-gray-500 mt-1">檢視系統中的所有重要操作記錄</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => fetchLogs()}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        🔄 重新整理
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
                <div className="w-full sm:w-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-1">操作類型</label>
                    <select
                        value={actionType}
                        onChange={(e) => { setActionType(e.target.value); setPage(1); }}
                        className="w-full sm:w-64 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                    >
                        <option value="">所有類型</option>
                        <option value="LOGIN">登入 (LOGIN)</option>
                        <option value="LOGOUT">登出 (LOGOUT)</option>
                        <option value="CREATE_AGENT">建立 Agent</option>
                        <option value="UPDATE_AGENT">更新 Agent</option>
                        <option value="DELETE_AGENT">刪除 Agent</option>
                        <option value="UPLOAD_FILE">上傳檔案</option>
                        <option value="DELETE_FILE">刪除檔案</option>
                        <option value="CREATE_USER">建立使用者</option>
                    </select>
                </div>

                {/* Note: User ID search is basic for now. In a full implementation, we'd want a user search dropdown */}
                <div className="w-full sm:w-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-1">使用者 ID (UUID)</label>
                    <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        onBlur={() => setPage(1)} // Trigger refresh on blur
                        placeholder="輸入 UUID..."
                        className="w-full sm:w-64 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                    />
                </div>
            </div>

            <AuditLogTable logs={logs} isLoading={loading} />

            <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    頁次 {page} / {totalPages}
                </div>
                <div className="flex gap-2">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        上一頁
                    </button>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        下一頁
                    </button>
                </div>
            </div>
        </div>
    );
}
