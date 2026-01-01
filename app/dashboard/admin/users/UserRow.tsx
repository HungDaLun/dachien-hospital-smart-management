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
        last_sign_in_at?: string;
    };
    departments: Department[];
    dict: Dictionary;
}

export default function UserRow({ user, departments, dict }: UserRowProps) {
    const [role, setRole] = useState(user.role);
    const [deptId, setDeptId] = useState(user.department_id || '');
    const [isLoading, setIsLoading] = useState(false);

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
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="py-3 px-4">
                <div className="font-medium text-gray-900">{user.display_name || dict.admin.users.unnamed}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
            </td>
            <td className="py-3 px-4">
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border rounded px-2 py-1 text-sm bg-white"
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
                >
                    <option value="">{dict.admin.users.no_dept}</option>
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
                        {isLoading ? <Spinner size="sm" /> : dict.common.save}
                    </Button>
                )}
            </td>
        </tr>
    );
}
