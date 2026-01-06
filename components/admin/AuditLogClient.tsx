'use client';

/**
 * 系統稽核日誌客戶端元件
 * 提供日誌篩選、分頁與概覽功能
 * 遵循 EAKAP 科技戰情室設計系統規範
 */
import React, { useState, useEffect, useCallback } from 'react';
import { AuditLogTable } from '@/components/admin/AuditLogTable';
import { Dictionary } from '@/lib/i18n/dictionaries';
import {
    RotateCw,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Info,
    ArrowUpRight,
    ShieldCheck
} from 'lucide-react';
import { Button, Input, Select, Card, Badge } from '@/components/ui';
import Link from 'next/link';

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
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary-500/10 border border-secondary-500/20 flex items-center justify-center text-secondary-400">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight">{dict.admin.audit.title}</h1>
                        <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-1 opacity-60">{dict.admin.audit.subtitle}</p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={() => fetchLogs()}
                    className="h-11 px-6 rounded-xl border-white/10 hover:bg-white/5"
                >
                    <RotateCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{dict.common.refresh}</span>
                </Button>
            </div>

            {/* Hint Box: User Management Redirect */}
            <div className="p-6 bg-primary-500/[0.03] border border-primary-500/10 rounded-[28px] flex flex-col sm:flex-row items-center justify-between gap-6 group">
                <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400">
                        <Info size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-text-primary uppercase tracking-tight">正在尋找使用者註冊審核？</p>
                        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest opacity-60">使用者權限審核與角色管理位於「使用者管理」控制台。</p>
                    </div>
                </div>
                <Link
                    href="/dashboard/admin/users"
                    className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 hover:border-primary-500/30 rounded-2xl text-[10px] font-black text-primary-400 uppercase tracking-widest transition-all shadow-inner"
                >
                    前往使用者管理
                    <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
            </div>

            {/* Filters Console */}
            <Card variant="glass" className="p-8 border-white/5">
                <div className="flex items-center gap-3 mb-8">
                    <Filter size={14} className="text-text-tertiary" />
                    <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">CONSOLE_FILTERS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Select
                        label={dict.admin.audit.action}
                        value={actionType}
                        onChange={(e) => { setActionType(e.target.value); setPage(1); }}
                        className="bg-black/20"
                        options={[
                            { value: "", label: dict.admin.audit.all_types },
                            { value: "LOGIN", label: dict.admin.audit.action_types.login },
                            { value: "LOGOUT", label: dict.admin.audit.action_types.logout },
                            { value: "CREATE_AGENT", label: dict.admin.audit.action_types.create_agent },
                            { value: "UPDATE_AGENT", label: dict.admin.audit.action_types.update_agent },
                            { value: "DELETE_AGENT", label: dict.admin.audit.action_types.delete_agent },
                            { value: "UPLOAD_FILE", label: dict.admin.audit.action_types.upload_file },
                            { value: "DELETE_FILE", label: dict.admin.audit.action_types.delete_file },
                            { value: "CREATE_USER", label: dict.admin.audit.action_types.create_user },
                        ]}
                    />

                    <Input
                        label={dict.admin.audit.user_id_label}
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        onBlur={() => setPage(1)}
                        placeholder={dict.admin.audit.user_id_placeholder}
                        className="bg-black/20"
                        leftElement={<Search size={14} />}
                    />
                </div>
            </Card>

            {/* Table Area */}
            <AuditLogTable logs={logs} isLoading={loading} dict={dict} />

            {/* Pagination Remote */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px] font-mono border-white/5 opacity-40">
                        PAGE::{page.toString().padStart(2, '0')}
                    </Badge>
                    <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-20">OF</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-white/5 opacity-40">
                        TOTAL::{totalPages.toString().padStart(2, '0')}
                    </Badge>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1 || loading}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="h-10 px-6 rounded-xl border-white/10 text-[10px] font-black uppercase tracking-widest"
                    >
                        <ChevronLeft size={16} className="mr-2" />
                        {dict.common.back}
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        disabled={page >= totalPages || loading}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="h-10 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                        {dict.common.view}
                        <ChevronRight size={16} className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
