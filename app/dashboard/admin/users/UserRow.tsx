'use client';

import { useState } from 'react';
import { updateUserProfile } from '../actions';
import { Button, Spinner } from '@/components/ui';

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
        last_sign_in_at?: string;
    };
    departments: Department[];
}

export default function UserRow({ user, departments }: UserRowProps) {
    const [role, setRole] = useState(user.role);
    const [deptId, setDeptId] = useState(user.department_id || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const actualDeptId = deptId === '' ? null : deptId;
            const res = await updateUserProfile(user.id, role, actualDeptId);
            if (res?.error) {
                alert(`更新失敗: ${res.error}`);
            } else {
                // Success feedback
            }
        } catch (e) {
            console.error(e);
            alert('發生錯誤');
        } finally {
            setIsLoading(false);
        }
    };

    const hasChanged = role !== user.role || (deptId || '') !== (user.department_id || '');

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="py-3 px-4">
                <div className="font-medium text-gray-900">{user.display_name || '未設定名稱'}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
            </td>
            <td className="py-3 px-4">
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border rounded px-2 py-1 text-sm bg-white"
                >
                    <option value="USER">USER (一般)</option>
                    <option value="EDITOR">EDITOR (編輯)</option>
                    <option value="DEPT_ADMIN">DEPT_ADMIN (部門管理)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (超級管理)</option>
                </select>
            </td>
            <td className="py-3 px-4">
                <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="border rounded px-2 py-1 text-sm bg-white max-w-[150px]"
                >
                    <option value="">(無部門)</option>
                    {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </td>
            <td className="py-3 px-4 text-right">
                {hasChanged && (
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner size="sm" /> : '儲存'}
                    </Button>
                )}
            </td>
        </tr>
    );
}
