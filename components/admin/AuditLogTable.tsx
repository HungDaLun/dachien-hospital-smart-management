'use client';

import React from 'react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Dictionary } from '@/lib/i18n/dictionaries';

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
    dict: Dictionary;
}

export function AuditLogTable({ logs, isLoading, dict }: AuditLogTableProps) {
    if (isLoading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center text-text-tertiary gap-3">
                <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">{dict.common.loading}</span>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center text-text-tertiary bg-white/[0.01] rounded-3xl border border-white/5">
                <div className="text-3xl opacity-20 mb-4">📜</div>
                <span className="text-sm font-black uppercase tracking-widest">{dict.admin.audit.no_logs}</span>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-white/5 shadow-floating bg-background-secondary/30 backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-white/[0.03]">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-black text-white uppercase tracking-[0.2em]">
                                {dict.admin.audit.timestamp}
                            </th>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-black text-white uppercase tracking-[0.2em]">
                                {dict.admin.audit.user}
                            </th>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-black text-white uppercase tracking-[0.2em]">
                                {dict.admin.audit.action}
                            </th>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-black text-white uppercase tracking-[0.2em]">
                                {dict.admin.audit.resource}
                            </th>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-black text-white uppercase tracking-[0.2em] min-w-[400px]">
                                {dict.admin.audit.details}
                            </th>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-black text-white uppercase tracking-[0.2em]">
                                {dict.admin.audit.ip}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-5 whitespace-nowrap text-xs font-mono text-text-tertiary tabular-nums">
                                    {format(new Date(log.created_at), 'yyyy/MM/dd HH:mm:ss', { locale: zhTW })}
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-text-primary tracking-tight group-hover:text-primary-400 transition-colors">
                                            {log.user_profiles?.display_name || dict.admin.users.unnamed}
                                        </span>
                                        <span className="text-[10px] font-mono text-text-tertiary opacity-70">
                                            {log.user_profiles?.email || log.user_id}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 inline-flex text-[10px] font-black rounded-lg border uppercase tracking-widest ${getActionColor(log.action_type)}`}>
                                        {log.action_type}
                                    </span>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap text-xs font-bold text-text-secondary uppercase tracking-tight">
                                    {log.resource_type}
                                    {log.resource_id && <span className="block text-[9px] font-mono text-text-tertiary opacity-50 truncate max-w-[120px] mt-1">{log.resource_id}</span>}
                                </td>
                                <td className="px-6 py-5 text-xs text-text-secondary font-medium min-w-[400px] max-w-2xl">
                                    <div className="whitespace-normal break-words leading-relaxed">
                                        {formatDetails(log.details)}
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap text-xs font-mono text-text-tertiary">
                                    {log.ip_address ? (
                                        <span className="text-text-secondary">{log.ip_address}</span>
                                    ) : (
                                        <span className="opacity-50 italic">歷史記錄</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function getActionColor(action: string): string {
    if (action.includes('DELETE')) return 'bg-semantic-danger/10 text-semantic-danger border-semantic-danger/20';
    if (action.includes('CREATE') || action.includes('UPLOAD')) return 'bg-semantic-success/10 text-semantic-success border-semantic-success/20';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
    return 'bg-white/5 text-text-tertiary border-white/10';
}

/**
 * 格式化詳情為友好的文字格式
 */
function formatDetails(details: any): string {
    if (!details) return '-';
    if (typeof details === 'string') return details;
    
    // 如果是物件，根據內容格式化為友好的文字
    if (typeof details === 'object') {
        const parts: string[] = [];
        
        // 優先處理檔案相關的詳情（檔案名稱最重要）
        if (details.filename) {
            parts.push(`檔案：${details.filename}`);
            // 如果有檔案大小，顯示在檔案名稱後面
            if (details.size_bytes) {
                const sizeMB = (details.size_bytes / 1024 / 1024).toFixed(2);
                parts.push(`大小：${sizeMB} MB`);
            }
            // 如果有 MIME 類型，也顯示
            if (details.mime_type) {
                parts.push(`類型：${details.mime_type}`);
            }
        } else {
            // 如果不是檔案，處理其他類型的名稱
            if (details.name) {
                // 如果是部門且有描述
                if (details.description) {
                    parts.push(`${details.name} - ${details.description}`);
                } else {
                    // Agent 或其他類型
                    parts.push(details.name);
                }
            }
        }
        
        // 處理使用者相關的詳情（只有在不是檔案的情況下）
        if (!details.filename) {
            if (details.email) {
                parts.push(`Email：${details.email}`);
            }
            if (details.display_name && !details.name) {
                parts.push(`名稱：${details.display_name}`);
            }
            if (details.role) {
                parts.push(`角色：${details.role}`);
            }
        }
        
        // 處理模型版本（Agent 相關）
        if (details.model_version) {
            parts.push(`模型：${details.model_version}`);
        }
        
        // 處理部門 ID（如果有）
        if (details.department_id) {
            parts.push(`部門 ID：${details.department_id}`);
        }
        
        // 如果有 note，顯示在最後（用括號標示）
        if (details.note) {
            parts.push(`（${details.note}）`);
        }
        
        return parts.length > 0 ? parts.join(' | ') : '-';
    }
    
    return '-';
}
