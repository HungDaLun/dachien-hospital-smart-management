import { createClient } from '@/lib/supabase/server';
import { Card, Badge } from '@/components/ui';
import { redirect } from 'next/navigation';
import CreateDepartmentForm from './CreateDepartmentForm';
import DeleteDepartmentButton from './DeleteDepartmentButton';

export const dynamic = 'force-dynamic';

export default async function DepartmentsPage() {
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

    // 2. 取得部門列表與成員數
    const { data: departments } = await supabase
        .from('departments')
        .select(`
      *,
      user_profiles (count)
    `)
        .order('created_at', { ascending: false });

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">部門管理</h1>
                    <p className="text-gray-500">管理組織架構與權限邊界</p>
                </div>

                {/* 新增部門表單 */}
                <CreateDepartmentForm />
            </div>

            <div className="grid gap-4">
                {departments?.map((dept) => (
                    <Card key={dept.id} padding className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">{dept.name}</h3>
                                <Badge variant="default">
                                    {dept.user_profiles?.[0]?.count || 0} 人
                                </Badge>
                            </div>
                            <p className="text-gray-500 text-sm mt-1">
                                {dept.description || '無描述'}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                ID: {dept.id}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <DeleteDepartmentButton id={dept.id} />
                        </div>
                    </Card>
                ))}

                {(!departments || departments.length === 0) && (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        尚無部門資料
                    </div>
                )}
            </div>
        </div>
    );
}
