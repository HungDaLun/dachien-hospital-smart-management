/**
 * 儀表板頁面佈局
 * 提供側邊欄、導航等共用元件
 */
import Link from 'next/link';
import { ToastProvider } from '@/components/ui/Toast';
import UserMenu from '@/components/layout/UserMenu';
import { redirect } from 'next/navigation';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { getCachedUserProfile, getCachedUser } from '@/lib/cache/user-profile';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedUser();

  if (!user) {
    redirect('/login');
  }

  // 使用快取的查詢（在同一個請求中，如果其他地方也查詢相同資料，會重用結果）
  const profile = await getCachedUserProfile(user.id);

  // 如果使用者狀態為 PENDING，只渲染簡單的 layout（不顯示導航列）
  // 這樣 /dashboard/pending 頁面可以正常顯示，不會造成重定向循環
  if (profile && profile.status === 'PENDING') {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </ToastProvider>
    );
  }

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

  // 如果是 SUPER_ADMIN，在「AI 對話」後面加入「系統管理」
  if (profile?.role === 'SUPER_ADMIN') {
    navItems.push({
      href: '/dashboard/admin',
      label: dict.navigation.system_admin,
      icon: '🛠️',
    });
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* 頂部導航列 */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40 shrink-0">
          <div className="w-full flex items-center justify-between">
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

        {/* 主內容區 */}
        <main className="flex-1 w-full overflow-auto">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
