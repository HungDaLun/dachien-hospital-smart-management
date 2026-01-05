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
import AdminDashboardStats from '@/components/admin/AdminDashboardStats';
import { getSystemStats } from '@/lib/actions/analytics';

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

  // Server-side fetch data
  const statsResult = await getSystemStats();
  const stats = statsResult.data;

  // 按鈕設定
  const quickActions = [
    {
      href: "/dashboard/admin/departments",
      icon: "🏢",
      title: dict.navigation.departments,
      subtitle: dict.admin.departments.subtitle
    },
    {
      href: "/dashboard/admin/taxonomy",
      icon: "📂",
      title: dict.admin.taxonomy.title,
      subtitle: dict.admin.taxonomy.subtitle
    },
    {
      href: "/dashboard/admin/users",
      icon: "👥",
      title: dict.navigation.users,
      subtitle: dict.admin.users.subtitle
    },
    {
      href: "/dashboard/admin/audit",
      icon: "📋",
      title: dict.navigation.audit_logs,
      subtitle: dict.admin.audit.subtitle
    },
    {
      href: "/dashboard/admin/system",
      icon: "⚙️",
      title: dict.admin.system.title,
      subtitle: dict.admin.system.subtitle
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* 頁面標題 */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{dict.navigation.system_admin}</h1>
          <p className="text-gray-600">管理系統設定、使用者與部門</p>
        </div>
      </div>

      {/* 1. 快速管理入口 (原管理控制台) */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          {dict.admin.management_console || "Quick Actions"}
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-gray-700">
                <span className="text-lg">{action.icon}</span>
                <span className="font-medium">{action.title}</span>
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. 平台分析與洞察 (SSR) */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>📊</span> {dict.admin.analytics.title || "Platform Analytics"}
        </h2>
        {stats ? (
          <AdminDashboardStats dict={dict} stats={stats} />
        ) : (
          <div className="p-8 text-center text-red-500 bg-white rounded-lg border border-red-100">
            {statsResult.error || "Failed to load system analytics"}
          </div>
        )}
      </div>
    </div>
  );
}
