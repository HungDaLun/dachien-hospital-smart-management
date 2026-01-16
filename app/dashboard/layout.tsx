/**
 * 儀表板頁面佈局
 * 提供側邊欄、導航等共用元件
 */
import Link from 'next/link';
import { ToastProvider } from '@/components/ui/Toast';
import UserMenu from '@/components/layout/UserMenu';
import { PrefetchManager } from '@/components/layout/PrefetchManager';
import { redirect } from 'next/navigation';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { getCachedUserProfile, getCachedUser } from '@/lib/cache/user-profile';
import { Hexagon } from 'lucide-react';

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
        <div className="min-h-screen bg-background-primary text-text-primary">
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
      <PrefetchManager />
      <div className="min-h-screen bg-background-primary text-text-primary flex flex-col">
        {/* 頂部導航列 - 採用更明確的分隔與高品質玻璃效果 */}
        <nav className="bg-background-tertiary/90 backdrop-blur-xl border-b border-white/10 px-6 py-4 sticky top-0 z-40 shrink-0 shadow-2xl shadow-black/40">
          <div className="w-full flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 group-hover:bg-primary-500/20 group-hover:text-primary-300 transition-all shadow-lg shadow-primary-500/10">
                  <Hexagon className="w-6 h-6" />
                </div>
                <div className="flex flex-col -space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-widest text-white uppercase font-heading">NEXUS</span>
                    <span className="text-base font-bold text-white/90">智樞</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                    <span className="text-[0.6rem] tracking-[0.2em] text-primary-400/80 font-mono font-medium whitespace-nowrap">ENTERPRISE DECISION COMMAND</span>
                    <span className="hidden md:inline text-[0.6rem] text-primary-500/40">|</span>
                    <span className="text-[0.6rem] tracking-[0.1em] text-primary-400/60 font-bold whitespace-nowrap">企業戰情智能決策系統</span>
                  </div>
                </div>
              </Link>

              <div className="scale-90 origin-left ml-2">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Right Side: Navigation + User Menu */}
            <div className="flex items-center gap-4">
              {/* 導航連結 */}
              <div className="flex items-center gap-1 mr-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-text-secondary hover:text-primary-400 hover:bg-white/5 transition-all font-medium border border-transparent hover:border-white/5"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="hidden xl:inline text-sm tracking-wide">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* 使用者選單 */}
              <UserMenu
                email={user.email}
                displayName={profile?.display_name}
                role={profile?.role}
                avatarUrl={profile?.avatar_url}
                logoutText={dict.common.logout}
              />
            </div>
          </div>
        </nav>

        {/* 主內容區 */}
        <main className="flex-1 w-full overflow-auto relative">
          {/* 背景裝飾效果 - 增加深度感 */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-500/10 blur-[120px] rounded-full" />
          </div>

          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div >
    </ToastProvider >
  );
}
