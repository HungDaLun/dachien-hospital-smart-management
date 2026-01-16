'use client';

import { useState } from 'react';
import { updateUserProfile } from '../actions';
import { Button, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { Dictionary } from '@/lib/i18n/dictionaries';

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
    };
    departments: Department[];
    dict: Dictionary;
}

export default function UserRow({ user, departments, dict }: UserRowProps) {
    const [role, setRole] = useState(user.role);
    const [deptId, setDeptId] = useState(user.department_id || '');
    const [isLoading, setIsLoading] = useState(false);
    const isPending = user.status === 'PENDING';
    const { toast } = useToast();

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
                    departmentId: approve && deptId ? deptId : undefined,
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
            const actualDeptId = deptId === '' ? null : deptId;
            const res = await updateUserProfile(user.id, role, actualDeptId);
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

    const hasChanged = role !== user.role || (deptId || '') !== (user.department_id || '');

    return (
        <tr className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${isPending ? 'bg-semantic-warning/5' : ''}`}>
            <td className="py-4 px-6">
                <div className="font-bold text-text-primary">{user.display_name || dict.admin.users.unnamed}</div>
                <div className="text-sm text-text-tertiary">{user.email}</div>
                {isPending && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-semantic-warning/10 text-semantic-warning text-xs font-bold rounded border border-semantic-warning/20">
                        待審核
                    </span>
                )}
            </td>
            <td className="py-4 px-6">
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border border-white/10 rounded-lg px-3 py-2 text-sm bg-background-secondary text-text-primary focus:border-primary-500 focus:outline-none"
                    disabled={isLoading}
                >
                    <option value="USER">{dict.admin.users.roles.user}</option>
                    <option value="EDITOR">{dict.admin.users.roles.editor}</option>
                    <option value="DEPT_ADMIN">{dict.admin.users.roles.dept_admin}</option>
                    <option value="SUPER_ADMIN">{dict.admin.users.roles.super_admin}</option>
                </select>
            </td>
            <td className="py-4 px-6">
                <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="border border-white/10 rounded-lg px-3 py-2 text-sm bg-background-secondary text-text-primary focus:border-primary-500 focus:outline-none max-w-[150px]"
                    disabled={isLoading}
                >
                    <option value="">{dict.admin.users.no_dept}</option>
                    {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </td>
            <td className="py-4 px-6 text-right">
                {isPending ? (
                    // 待審核：顯示審核按鈕
                    <div className="flex gap-2 justify-end">
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
                    </div>
                ) : (
                    // 已審核：顯示儲存按鈕（如果有變更）
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
            </td>
        </tr>
    );
}
