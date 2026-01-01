import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui';
import { redirect } from 'next/navigation';
import UserRow from './UserRow';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    const supabase = await createClient();

    // 1. 檢查權限
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'SUPER_ADMIN') {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    您沒有權限存取此頁面 (需要 SUPER_ADMIN 權限)
                </div>
            </div>
        );
    }

    // 2. 取得資料
    const { data: users } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

    const { data: departments } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');

    // 為了 UserRow 使用
    const deptList = departments || [];

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">使用者管理</h1>
                <p className="text-gray-500">管理員工帳號、角色與部門歸屬</p>
            </div>

            <Card padding={false} className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="py-3 px-4 font-semibold text-gray-700 w-1/3">使用者</th>
                                <th className="py-3 px-4 font-semibold text-gray-700">角色權限</th>
                                <th className="py-3 px-4 font-semibold text-gray-700">所屬部門</th>
                                <th className="py-3 px-4 font-semibold text-gray-700 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users?.map(u => (
                                <UserRow key={u.id} user={u} departments={deptList} />
                            ))}
                            {(!users || users.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-gray-500">
                                        尚無使用者資料
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
