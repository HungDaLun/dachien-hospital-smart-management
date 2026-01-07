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
import PageHeader from '@/components/layout/PageHeader';
import { Settings } from 'lucide-react';


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
    <div className="w-full p-6 xl:p-10 space-y-10">
      {/* 頁面標題 */}
      <PageHeader
        title="系統管理"
        icon={Settings}
      />


      {/* 1. 快速管理入口 */}
      <div className="mb-12">
        <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] mb-4">
          {dict.admin.management_console || "QUICK MANAGEMENT CONSOLE"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="group">
              <div className="flex flex-col gap-3 p-5 rounded-2xl border border-white/5 bg-background-secondary/50 hover:bg-primary-500/5 hover:border-primary-500/30 transition-all h-full">
                <span className="text-3xl transition-transform group-hover:scale-110 duration-300">{action.icon}</span>
                <div>
                  <div className="font-bold text-text-primary mb-1 group-hover:text-primary-400 transition-colors">{action.title}</div>
                  <div className="text-[10px] text-text-tertiary uppercase tracking-wider">{action.subtitle}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. 平台分析與洞察 (SSR) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(0,217,255,0.5)]" />
          <h2 className="text-lg font-bold text-text-primary uppercase tracking-widest">
            {dict.admin.analytics.title || "Platform Analytics & Insights"}
          </h2>
        </div>

        {stats ? (
          <div className="animate-fade-in">
            <AdminDashboardStats dict={dict} stats={stats} />
          </div>
        ) : (
          <div className="p-10 text-center text-semantic-danger bg-semantic-danger/5 rounded-2xl border border-semantic-danger/20 backdrop-blur-sm">
            {statsResult.error || "Failed to load system analytics"}
          </div>
        )}
      </div>
    </div>
  );
}
