import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, Badge } from '@/components/ui';
import { redirect } from 'next/navigation';
import CreateDepartmentForm from './CreateDepartmentForm';
import DeleteDepartmentButton from './DeleteDepartmentButton';
import EditDepartmentButton from './EditDepartmentButton';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getCachedUserProfile } from '@/lib/cache/user-profile';


export const dynamic = 'force-dynamic';

export default async function DepartmentsPage() {
    const supabase = await createClient();
    const locale = await getLocale();
    const dict = await getDictionary(locale);

    // 1. 檢查權限（直接依賴 RLS 政策）
    // 使用 getCachedUserProfile 來查詢自己的資料（可能需要自動建立記錄）
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const profile = await getCachedUserProfile(user.id);

    // 檢查是否為 SUPER_ADMIN（RLS 會確保只有 SUPER_ADMIN 可以查詢所有使用者）
    if (!profile || profile.role !== 'SUPER_ADMIN') {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {dict.common.error}: {!profile ? '無法取得使用者資料' : '需要 SUPER_ADMIN 權限'}
                </div>
            </div>
        );
    }

    // 2. 取得部門列表與成員數
    // 先取得所有部門
    const { data: departments, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .order('created_at', { ascending: false });

    if (deptError) {
        console.error('取得部門列表失敗:', deptError);
    }

    // 批次查詢所有使用者的部門歸屬（效能優化）
    const { data: allUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('department_id');

    if (usersError) {
        console.error('取得使用者列表失敗:', usersError);
    }

    // 計算每個部門的成員數
    const departmentCountMap = new Map<string, number>();
    (allUsers || []).forEach((user) => {
        if (user.department_id) {
            const count = departmentCountMap.get(user.department_id) || 0;
            departmentCountMap.set(user.department_id, count + 1);
        }
    });

    // 合併部門資料與成員數
    const departmentsWithCounts = (departments || []).map((dept) => ({
        ...dept,
        member_count: departmentCountMap.get(dept.id) || 0,
    }));

    return (
        <div className="p-6 w-full text-text-primary">
            {/* 返回按鈕 */}
            <div className="flex justify-between items-center mb-6">
                <Link
                    href="/dashboard/admin"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-text-tertiary hover:text-text-primary transition-colors"
                >
                    <span>←</span>
                    <span>返回系統管理</span>
                </Link>
                <CreateDepartmentForm dict={dict} />
            </div>


            <div className="grid gap-6">
                {departmentsWithCounts.map((dept) => (
                    <Card key={dept.id} variant="glass" padding className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg text-text-primary">{dept.name}</h3>
                                {dept.code && (
                                    <Badge variant="secondary" size="sm">
                                        {dept.code}
                                    </Badge>
                                )}
                                <Badge variant="outline">
                                    {dept.member_count} {dict.admin.departments.people}
                                </Badge>
                            </div>
                            <p className="text-text-secondary text-sm mt-2 leading-relaxed">
                                {dept.description || dict.admin.departments.no_desc}
                            </p>
                            <p className="text-[10px] text-text-tertiary font-mono mt-3 uppercase tracking-wider">
                                ID: {dept.id}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <EditDepartmentButton department={dept} dict={dict} />
                            <DeleteDepartmentButton id={dept.id} dict={dict} />
                        </div>
                    </Card>
                ))}

                {(!departmentsWithCounts || departmentsWithCounts.length === 0) && (
                    <div className="text-center py-20 text-text-tertiary bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                        <div className="text-4xl mb-4 opacity-20">🏢</div>
                        <p>{dict.admin.departments.no_data}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
