/**
 * 儀表板頁面佈局
 * 提供側邊欄、導航等共用元件
 */
import Link from 'next/link';
import { ToastProvider } from '@/components/ui/Toast';
import UserMenu from '@/components/layout/UserMenu';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { getCachedUserProfile } from '@/lib/cache/user-profile';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 使用快取的查詢（在同一個請求中，如果其他地方也查詢相同資料，會重用結果）
  const profile = await getCachedUserProfile(user.id);

  const locale = await getLocale();
  const dict = await getDictionary(locale);

  /**
   * 導航項目
   */
  const navItems = [
    { href: '/dashboard', label: dict.navigation.overview, icon: '🏠' },
    { href: '/dashboard/knowledge', label: dict.navigation.knowledge, icon: '📚' },
    { href: '/dashboard/agents', label: dict.navigation.agents, icon: '🤖' },
    { href: '/dashboard/chat', label: dict.navigation.chat, icon: '💬' },
  ];

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* 頂部導航列 */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40 shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <span className="text-xl font-bold text-primary-600">EAKAP</span>
            </Link>

            {/* 導航連結 */}
            <div className="flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all font-medium"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="hidden md:inline text-sm">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />

              {/* 使用者選單 */}
              <UserMenu
                email={user.email}
                displayName={profile?.display_name}
                role={profile?.role}
                logoutText={dict.common.logout}
              />
            </div>
          </div>
        </nav>

        {/* 次級導航 (僅管理員顯示) */}
        {profile?.role === 'SUPER_ADMIN' && (
          <div className="bg-gray-100 border-b border-gray-200 px-6 py-2">
            <div className="max-w-7xl mx-auto flex gap-4 text-sm">
              <span className="font-bold text-gray-500 flex items-center">🛠 {dict.navigation.system_admin}:</span>
              <Link href="/dashboard/admin/departments" className="hover:text-primary-600 text-gray-600">{dict.navigation.departments}</Link>
              <Link href="/dashboard/admin/users" className="hover:text-primary-600 text-gray-600">{dict.navigation.users}</Link>
            </div>
          </div>
        )}

        {/* 主內容區 */}
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
