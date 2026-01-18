/**
 * 系統設定頁面（重新設計版）
 * 僅 SUPER_ADMIN 可以存取
 * 統一設計語言、清晰分組、改善使用者體驗
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserProfile, requireSuperAdmin } from '@/lib/permissions';
import SystemSettingsClient from './SystemSettingsClient';
// import SystemSettingsClient from './SystemSettingsClientSimple';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';

export default async function SystemConfigPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  // 檢查權限
  try {
    const profile = await getCurrentUserProfile();
    requireSuperAdmin(profile);
  } catch {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-gray-900">
      {/* Header Section */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/admin"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-text-tertiary hover:text-text-primary transition-colors rounded-xl hover:bg-white/5"
              >
                <span>←</span>
                <span>返回系統管理</span>
              </Link>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight">
                  {dict.admin.system.title}
                </h1>
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-1 opacity-60">
                  {dict.admin.system.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <SystemSettingsClient dict={dict} />
      </div>
    </div>
  );
}
