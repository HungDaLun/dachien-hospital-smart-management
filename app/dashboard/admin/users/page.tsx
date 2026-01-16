import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { redirect } from 'next/navigation';
import UserRow from './UserRow';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getCachedUserProfile } from '@/lib/cache/user-profile';
import { PAGE_SPACING } from '@/lib/styles/design-constants';
import TableHeader from '@/components/ui/TableHeader';


export const dynamic = 'force-dynamic';

export default async function UsersPage() {
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

    // 2. 取得資料（直接依賴 RLS 政策：SUPER_ADMIN 可以查詢所有使用者）
    // RLS 政策 "超級管理員可讀取所有使用者" 會自動處理權限檢查
    // 注意：如果查詢返回空陣列，可能是 RLS 政策沒有匹配
    const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

    // 分離待審核和已審核的使用者
    const pendingUsers = users?.filter(u => u.status === 'PENDING') || [];
    const approvedUsers = users?.filter(u => u.status === 'APPROVED') || [];

    // 除錯：檢查查詢結果
    if (process.env.NODE_ENV === 'development') {
        console.log('🔍 使用者列表查詢結果:', {
            count: users?.length || 0,
            hasError: !!usersError,
            errorCode: usersError?.code,
            errorMessage: usersError?.message,
            currentUserId: user.id,
            currentUserRole: profile.role
        });
    }

    // 詳細的錯誤處理和日誌
    if (usersError) {
        console.error('取得使用者列表失敗:', {
            code: usersError.code,
            message: usersError.message,
            details: usersError.details,
            hint: usersError.hint,
            userId: user.id,
            userRole: profile.role
        });
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    <p className="font-semibold mb-2">{dict.common.error}: 無法取得使用者列表</p>
                    <p className="text-sm">{usersError.message}</p>
                    {usersError.code && <p className="text-xs mt-1">錯誤代碼: {usersError.code}</p>}
                </div>
            </div>
        );
    }

    // 除錯日誌（僅在開發環境）
    if (process.env.NODE_ENV === 'development') {
        console.log('✅ 成功取得使用者列表:', {
            count: users?.length || 0,
            users: users?.map(u => ({ email: u.email, role: u.role }))
        });
    }

    const { data: departments, error: deptError } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');

    if (deptError) {
        console.error('取得部門列表失敗:', deptError);
    }

    // 為了 UserRow 使用
    const deptList = departments || [];

    return (
        <div className={`w-full text-text-primary ${PAGE_SPACING.container}`}>
            {/* 返回按鈕 */}
            <div className="mb-6">
                <Link
                    href="/dashboard/admin"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-text-tertiary hover:text-text-primary transition-colors"
                >
                    <span>←</span>
                    <span>返回系統管理</span>
                </Link>
            </div>
            {/* 待審核使用者區塊 */}
            {pendingUsers.length > 0 && (
                <div className="mb-10 animate-fade-in">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-semantic-warning shadow-[0_0_10px_rgba(255,184,0,0.5)]" />
                        <h2 className="text-lg font-bold text-text-primary uppercase tracking-widest">待審核使用者</h2>
                        <span className="px-2 py-0.5 bg-semantic-warning/10 text-semantic-warning text-[10px] font-black rounded-full border border-semantic-warning/20">
                            {pendingUsers.length}
                        </span>
                    </div>
                    <Card variant="glass" padding={false} className="overflow-hidden border-semantic-warning/20 bg-semantic-warning/[0.02]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-semantic-warning/5 border-b border-white/5">
                                    <tr>
                                        <TableHeader className="w-[20%]">姓名</TableHeader>
                                        <TableHeader className="w-[15%]">職稱/工號</TableHeader>
                                        <TableHeader className="w-[15%]">聯絡資訊</TableHeader>
                                        <TableHeader className="w-[15%]">部門</TableHeader>
                                        <TableHeader className="w-[20%]">角色權限</TableHeader>
                                        <TableHeader className="text-right">操作</TableHeader>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.02]">
                                    {pendingUsers.map(u => (
                                        <UserRow key={u.id} user={u} departments={deptList} dict={dict} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}



            {/* 已審核使用者區塊 */}
            <div className="animate-fade-in">
                <div className="mb-4 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(0,217,255,0.5)]" />
                    <h2 className="text-lg font-bold text-text-primary uppercase tracking-widest">已審核使用者</h2>
                </div>
                <Card variant="glass" padding={false} className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] border-b border-white/5">
                                <tr>
                                    <TableHeader className="w-[20%]">{dict.admin.users.name}</TableHeader>
                                    <TableHeader className="w-[15%]">職稱/工號</TableHeader>
                                    <TableHeader className="w-[15%]">聯絡資訊</TableHeader>
                                    <TableHeader className="w-[15%]">{dict.admin.users.department}</TableHeader>
                                    <TableHeader className="w-[20%]">{dict.admin.users.role_permission}</TableHeader>
                                    <TableHeader className="text-right">{dict.common.actions}</TableHeader>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {approvedUsers.map(u => (
                                    <UserRow key={u.id} user={u} departments={deptList} dict={dict} />
                                ))}
                                {approvedUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center text-text-tertiary">
                                            <div className="flex flex-col items-center">
                                                <div className="text-4xl mb-4 opacity-20">👥</div>
                                                <p className="font-bold tracking-widest uppercase text-xs">{dict.common.no_data}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
