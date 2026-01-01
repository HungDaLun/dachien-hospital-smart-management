'use client';

import { useState } from 'react';
import { updateUserProfile } from '../actions';
import { Button, Spinner } from '@/components/ui';
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

    // 處理審核（通過或拒絕）
    const handleApprove = async (approve: boolean) => {
        if (!approve) {
            // 拒絕
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
                alert(`${dict.common.error}: ${data.error?.message || '操作失敗'}`);
                return;
            }

            if (data.success) {
                alert(approve ? '使用者已審核通過' : '使用者已拒絕');
                window.location.reload();
            }
        } catch (e) {
            console.error(e);
            alert(dict.common.error);
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
                alert(`${dict.common.error}: ${res.error}`);
            } else {
                // Success feedback
            }
        } catch (e) {
            console.error(e);
            alert(dict.common.error);
        } finally {
            setIsLoading(false);
        }
    };

    const hasChanged = role !== user.role || (deptId || '') !== (user.department_id || '');

    return (
        <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isPending ? 'bg-yellow-50' : ''}`}>
            <td className="py-3 px-4">
                <div className="font-medium text-gray-900">{user.display_name || dict.admin.users.unnamed}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                {isPending && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        待審核
                    </span>
                )}
            </td>
            <td className="py-3 px-4">
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border rounded px-2 py-1 text-sm bg-white"
                    disabled={isLoading}
                >
                    <option value="USER">{dict.admin.users.roles.user}</option>
                    <option value="EDITOR">{dict.admin.users.roles.editor}</option>
                    <option value="DEPT_ADMIN">{dict.admin.users.roles.dept_admin}</option>
                    <option value="SUPER_ADMIN">{dict.admin.users.roles.super_admin}</option>
                </select>
            </td>
            <td className="py-3 px-4">
                <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="border rounded px-2 py-1 text-sm bg-white max-w-[150px]"
                    disabled={isLoading}
                >
                    <option value="">{dict.admin.users.no_dept}</option>
                    {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </td>
            <td className="py-3 px-4 text-right">
                {isPending ? (
                    // 待審核：顯示審核按鈕
                    <div className="flex gap-2 justify-end">
                        <Button
                            size="sm"
                            onClick={() => handleApprove(false)}
                            disabled={isLoading}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isLoading ? <Spinner size="sm" /> : '拒絕'}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleApprove(true)}
                            disabled={isLoading}
                            className="bg-green-500 hover:bg-green-600"
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
