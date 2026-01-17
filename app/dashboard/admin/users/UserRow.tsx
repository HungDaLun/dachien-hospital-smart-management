'use client';

import { useState } from 'react';
import { updateUserProfile, getUserFiles } from '../actions';
import { Button, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { ChevronDown, ChevronUp, FileText, HardDrive } from 'lucide-react';

interface Department {
    id: string;
    name: string;
}

interface UserRowProps {
    user: {
        id: string;
        email: string;
        display_name: string | null;
        role: string;
        department_id: string | null;
        status?: string;
        last_sign_in_at?: string;

        // Extended fields
        job_title?: string | null;
        employee_id?: string | null;
        phone?: string | null;
        mobile?: string | null;
        extension?: string | null;
    };
    departments: Department[];
    dict: Dictionary;
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function UserRow({ user, departments, dict }: UserRowProps) {
    const [role, setRole] = useState(user.role);
    // Department is now fixed/read-only
    const userDept = departments.find(d => d.id === user.department_id);

    const [isLoading, setIsLoading] = useState(false);

    // File view state
    const [isFilesExpanded, setIsFilesExpanded] = useState(false);
    interface UserFile {
        id: string;
        filename: string;
        size_bytes: number;
        created_at: string;
    }
    const [files, setFiles] = useState<UserFile[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [hasLoadedFiles, setHasLoadedFiles] = useState(false);

    const isPending = user.status === 'PENDING';
    const { toast } = useToast();

    // Toggle files visibility
    const toggleFiles = async () => {
        if (!isFilesExpanded && !hasLoadedFiles) {
            setIsLoadingFiles(true);
            try {
                const res = await getUserFiles(user.id);
                if (res.error) {
                    toast.error(`無法取得檔案列表: ${res.error}`);
                } else {
                    setFiles(res.files || []);
                    setHasLoadedFiles(true);
                }
            } catch (error) {
                console.error('Fetch files error:', error);
                toast.error('取得檔案列表發生錯誤');
            } finally {
                setIsLoadingFiles(false);
            }
        }
        setIsFilesExpanded(!isFilesExpanded);
    };

    // 處理審核（通過或拒絕）
    const handleApprove = async (approve: boolean) => {
        if (!approve) {
            // 拒絕 - 使用確認對話框 (待實作 ConfirmDialog，暫用 confirm)
            if (!confirm('確定要拒絕此使用者的申請嗎？')) {
                return;
            }
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/users/approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    status: approve ? 'APPROVED' : 'REJECTED',
                    role: approve ? role : undefined,
                    departmentId: approve && user.department_id ? user.department_id : undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(`${dict.common.error}: ${data.error?.message || '操作失敗'}`);
                return;
            }

            if (data.success) {
                toast.success(approve ? '使用者已審核通過' : '使用者已拒絕');
                // Allow toast to show before reload
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (e) {
            console.error(e);
            toast.error(dict.common.error);
        } finally {
            setIsLoading(false);
        }
    };

    // 處理更新（已審核使用者的角色/部門變更）
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await updateUserProfile(user.id, role, user.department_id);
            if (res?.error) {
                toast.error(`${dict.common.error}: ${res.error}`);
            } else {
                toast.success(dict.common.success || 'Update successful');
            }
        } catch (e) {
            console.error(e);
            toast.error(dict.common.error);
        } finally {
            setIsLoading(false);
        }
    };

    const hasChanged = role !== user.role;

    return (
        <>
            <tr className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${isPending ? 'bg-semantic-warning/5' : ''}`}>
                <td className="py-4 px-6 align-top">
                    <div className="font-bold text-text-primary">{user.display_name || dict.admin.users.unnamed}</div>
                    <div className="text-sm text-text-tertiary">{user.email}</div>
                    {isPending && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-semantic-warning/10 text-semantic-warning text-xs font-bold rounded border border-semantic-warning/20">
                            待審核
                        </span>
                    )}
                </td>
                <td className="py-4 px-6 align-top">
                    <div className="flex flex-col gap-1">
                        {user.job_title && (
                            <span className="text-sm text-text-primary font-medium">{user.job_title}</span>
                        )}
                        {user.employee_id && (
                            <span className="text-xs text-text-tertiary font-mono bg-white/5 px-1.5 py-0.5 rounded w-fit">
                                {user.employee_id}
                            </span>
                        )}
                        {!user.job_title && !user.employee_id && (
                            <span className="text-xs text-text-tertiary opacity-50">-</span>
                        )}
                    </div>
                </td>
                <td className="py-4 px-6 align-top">
                    <div className="flex flex-col gap-1 text-sm">
                        {user.mobile && (
                            <div className="flex items-center gap-1.5 text-text-secondary" title="手機">
                                📱 <span className="font-mono">{user.mobile}</span>
                            </div>
                        )}
                        {user.phone && (
                            <div className="flex items-center gap-1.5 text-text-tertiary" title="分機">
                                ☎️ <span className="font-mono">{user.phone} {user.extension ? `#${user.extension}` : ''}</span>
                            </div>
                        )}
                        {!user.mobile && !user.phone && (
                            <span className="text-xs text-text-tertiary opacity-50">-</span>
                        )}
                    </div>
                </td>
                <td className="py-4 px-6 align-top">
                    {userDept ? (
                        <span className="px-2.5 py-1 rounded-md bg-primary-500/10 text-primary-400 border border-primary-500/20 text-sm font-medium">
                            {userDept.name}
                        </span>
                    ) : (
                        <span className="text-text-tertiary italic text-sm">{dict.admin.users.no_dept}</span>
                    )}
                </td>
                <td className="py-4 px-6 align-top">
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm bg-background-secondary text-text-primary focus:border-primary-500 focus:outline-none"
                        disabled={isLoading}
                    >
                        <option value="USER">{dict.admin.users.roles.user}</option>
                        <option value="EDITOR">{dict.admin.users.roles.editor}</option>
                        <option value="DEPT_ADMIN">{dict.admin.users.roles.dept_admin}</option>
                        <option value="SUPER_ADMIN">{dict.admin.users.roles.super_admin}</option>
                    </select>
                </td>
                <td className="py-4 px-6 text-right align-top">
                    <div className="flex gap-2 justify-end items-center h-full">
                        {!isPending && (
                            <Button
                                size="sm"
                                onClick={toggleFiles}
                                className={`text-xs gap-1 ${isFilesExpanded ? 'bg-white/10 text-text-primary' : 'bg-transparent text-text-tertiary hover:text-text-primary hover:bg-white/5'}`}
                            >
                                {isFilesExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {isFilesExpanded ? '隱藏檔案' : '查看檔案'}
                            </Button>
                        )}

                        {isPending ? (
                            <>
                                <Button
                                    size="sm"
                                    onClick={() => handleApprove(false)}
                                    disabled={isLoading}
                                    className="bg-semantic-danger hover:bg-semantic-danger/80 text-white"
                                >
                                    {isLoading ? <Spinner size="sm" /> : '拒絕'}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleApprove(true)}
                                    disabled={isLoading}
                                    className="bg-semantic-success hover:bg-semantic-success/80 text-white"
                                >
                                    {isLoading ? <Spinner size="sm" /> : '通過'}
                                </Button>
                            </>
                        ) : (
                            hasChanged && (
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Spinner size="sm" /> : dict.common.save}
                                </Button>
                            )
                        )}
                    </div>
                </td>
            </tr>
            {isFilesExpanded && (
                <tr className="bg-background-secondary/50 border-b border-white/5 animate-fade-in">
                    <td colSpan={6} className="p-0">
                        <div className="p-4 pl-14 pr-8 border-l-2 border-primary-500/30 ml-6 my-2">
                            <h4 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-primary-400" />
                                使用者檔案列表
                                {files.length > 0 && <span className="text-xs font-normal text-text-tertiary">({files.length})</span>}
                            </h4>

                            {isLoadingFiles ? (
                                <div className="flex justify-center py-4 text-text-tertiary">
                                    <Spinner size="sm" className="mr-2" /> 載入中...
                                </div>
                            ) : files.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {files.map((file) => (
                                        <div key={file.id} className="flex items-start gap-3 p-3 rounded-lg bg-background-primary border border-white/5 hover:border-primary-500/30 transition-colors group">
                                            <div className="mt-1 p-2 rounded bg-primary-500/10 text-primary-400">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-text-primary truncate" title={file.filename}>
                                                    {file.filename}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary">
                                                    <span>{formatBytes(file.size_bytes)}</span>
                                                    <span>•</span>
                                                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-4 text-sm text-text-tertiary italic">
                                    此使用者尚未上傳任何檔案
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
