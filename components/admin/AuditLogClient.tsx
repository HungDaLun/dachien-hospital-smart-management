'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AuditLogTable } from '@/components/admin/AuditLogTable';
import { Dictionary } from '@/lib/i18n/dictionaries';

interface AuditLogClientProps {
    dict: Dictionary;
}

export default function AuditLogClient({ dict }: AuditLogClientProps) {
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
                    <h1 className="text-2xl font-bold text-gray-900">{dict.admin.audit.title}</h1>
                    <p className="text-gray-500 mt-1">{dict.admin.audit.subtitle}</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => fetchLogs()}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        🔄 {dict.common.refresh}
                    </button>
                </div>
            </div>

            {/* 提示：如果是在找使用者審核 */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                        <p className="font-medium text-blue-900">正在尋找使用者註冊審核？</p>
                        <p className="text-sm text-blue-700">使用者權限審核與角色管理位於「使用者管理」頁面。</p>
                    </div>
                </div>
                <a
                    href="/dashboard/admin/users"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                    前往使用者管理 →
                </a>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
                <div className="w-full sm:w-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{dict.admin.audit.action}</label>
                    <select
                        value={actionType}
                        onChange={(e) => { setActionType(e.target.value); setPage(1); }}
                        className="w-full sm:w-64 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                    >
                        <option value="">{dict.admin.audit.all_types}</option>
                        <option value="LOGIN">{dict.admin.audit.action_types.login}</option>
                        <option value="LOGOUT">{dict.admin.audit.action_types.logout}</option>
                        <option value="CREATE_AGENT">{dict.admin.audit.action_types.create_agent}</option>
                        <option value="UPDATE_AGENT">{dict.admin.audit.action_types.update_agent}</option>
                        <option value="DELETE_AGENT">{dict.admin.audit.action_types.delete_agent}</option>
                        <option value="UPLOAD_FILE">{dict.admin.audit.action_types.upload_file}</option>
                        <option value="DELETE_FILE">{dict.admin.audit.action_types.delete_file}</option>
                        <option value="CREATE_USER">{dict.admin.audit.action_types.create_user}</option>
                    </select>
                </div>

                {/* Note: User ID search is basic for now. In a full implementation, we'd want a user search dropdown */}
                <div className="w-full sm:w-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{dict.admin.audit.user_id_label}</label>
                    <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        onBlur={() => setPage(1)} // Trigger refresh on blur
                        placeholder={dict.admin.audit.user_id_placeholder}
                        className="w-full sm:w-64 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                    />
                </div>
            </div>

            <AuditLogTable logs={logs} isLoading={loading} dict={dict} />

            <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    {dict.common.dashboard}: {page} / {totalPages}
                </div>
                <div className="flex gap-2">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        {dict.common.back}
                    </button>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        {dict.common.view}
                    </button>
                </div>
            </div>
        </div>
    );
}
