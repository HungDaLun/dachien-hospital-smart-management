/**
 * 系統管理主頁面
 * 僅 SUPER_ADMIN 可以存取
 * 作為系統管理功能的總覽與入口
 */
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getCachedUserProfile } from '@/lib/cache/user-profile';
import { Card } from '@/components/ui';
import AdminDashboardStats from '@/components/admin/AdminDashboardStats';

export default async function AdminPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  // 檢查權限
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await getCachedUserProfile(user.id);

  if (profile?.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{dict.navigation.system_admin}</h1>
        <p className="text-gray-600">管理系統設定、使用者與部門</p>
      </div>

      {/* 1. 儀表板數據 */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>📊</span> {dict.admin.analytics.title || "Platform Analytics"}
        </h2>
        <AdminDashboardStats dict={dict} />
      </div>

      <div className="border-t border-gray-200 my-8"></div>

      {/* 2. 系統管理功能卡片 */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>🛠️</span> {dict.admin.management_console || "Management Console"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 部門管理 */}
        <Link href="/dashboard/admin/departments">
          <Card padding className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🏢</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{dict.navigation.departments}</h2>
                <p className="text-gray-600 text-sm mb-4">{dict.admin.departments.subtitle}</p>
                <span className="text-primary-600 text-sm font-medium">前往管理 →</span>
              </div>
            </div>
          </Card>
        </Link>

        {/* 使用者管理 */}
        <Link href="/dashboard/admin/users">
          <Card padding className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="text-3xl">👥</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{dict.navigation.users}</h2>
                <p className="text-gray-600 text-sm mb-4">{dict.admin.users.subtitle}</p>
                <span className="text-primary-600 text-sm font-medium">前往管理 →</span>
              </div>
            </div>
          </Card>
        </Link>

        {/* 稽核日誌 */}
        <Link href="/dashboard/admin/audit">
          <Card padding className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="text-3xl">📋</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{dict.navigation.audit_logs}</h2>
                <p className="text-gray-600 text-sm mb-4">{dict.admin.audit.subtitle}</p>
                <span className="text-primary-600 text-sm font-medium">前往查看 →</span>
              </div>
            </div>
          </Card>
        </Link>

        {/* 系統設定 */}
        <Link href="/dashboard/admin/system">
          <Card padding className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚙️</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{dict.admin.system.title}</h2>
                <p className="text-gray-600 text-sm mb-4">{dict.admin.system.subtitle}</p>
                <span className="text-primary-600 text-sm font-medium">前往設定 →</span>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
