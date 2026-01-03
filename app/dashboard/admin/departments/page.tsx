import { createClient } from '@/lib/supabase/server';
import { Card, Badge } from '@/components/ui';
import { redirect } from 'next/navigation';
import CreateDepartmentForm from './CreateDepartmentForm';
import DeleteDepartmentButton from './DeleteDepartmentButton';
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
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{dict.admin.departments.title}</h1>
                    <p className="text-gray-500">{dict.admin.departments.subtitle}</p>
                </div>

                {/* 新增部門表單 */}
                <CreateDepartmentForm dict={dict} />
            </div>

            <div className="grid gap-4">
                {departmentsWithCounts.map((dept) => (
                    <Card key={dept.id} padding className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">{dept.name}</h3>
                                {dept.code && (
                                    <Badge variant="primary" size="sm">
                                        {dept.code}
                                    </Badge>
                                )}
                                <Badge variant="default">
                                    {dept.member_count} {dict.admin.departments.people}
                                </Badge>
                            </div>
                            <p className="text-gray-500 text-sm mt-1">
                                {dept.description || dict.admin.departments.no_desc}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                ID: {dept.id}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <DeleteDepartmentButton id={dept.id} dict={dict} />
                        </div>
                    </Card>
                ))}

                {(!departmentsWithCounts || departmentsWithCounts.length === 0) && (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        {dict.admin.departments.no_data}
                    </div>
                )}
            </div>
        </div>
    );
}
