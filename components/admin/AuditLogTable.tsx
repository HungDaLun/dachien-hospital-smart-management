'use client';

import React from 'react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface AuditLog {
    id: string;
    user_id: string;
    action_type: string;
    resource_type: string;
    resource_id: string;
    details: any;
    ip_address: string;
    created_at: string;
    user_profiles?: {
        email: string;
        display_name: string;
    };
}

interface AuditLogTableProps {
    logs: AuditLog[];
    isLoading: boolean;
}

export function AuditLogTable({ logs, isLoading }: AuditLogTableProps) {
    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center text-gray-500">
                載入中...
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center text-gray-500 bg-white rounded-lg border border-gray-200">
                無稽核記錄
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            時間
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            使用者
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            操作類型
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            資源
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            詳情
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            IP
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss', { locale: zhTW })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">
                                        {log.user_profiles?.display_name || '未命名'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {log.user_profiles?.email || log.user_id}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action_type)}`}>
                                    {log.action_type}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {log.resource_type}
                                {log.resource_id && <span className="block text-xs text-gray-400 truncate max-w-[100px]">{log.resource_id}</span>}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                {formatDetails(log.details)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {log.ip_address || '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function getActionColor(action: string): string {
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    if (action.includes('CREATE') || action.includes('UPLOAD')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
}

function formatDetails(details: any): string {
    if (!details) return '-';
    if (typeof details === 'string') return details;
    return JSON.stringify(details);
}
