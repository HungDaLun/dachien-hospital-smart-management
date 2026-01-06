/**
 * 系統設定頁面
 * 僅 SUPER_ADMIN 可以存取
 */
import { redirect } from 'next/navigation';
import { getCurrentUserProfile, requireSuperAdmin } from '@/lib/permissions';
import SystemConfigClient from './SystemConfigClient';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';

export default async function SystemConfigPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  // 檢查權限
  try {
    const profile = await getCurrentUserProfile();
    requireSuperAdmin(profile);
  } catch (error) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-6 py-10 text-text-primary">
      <div className="mb-10 border-b border-white/5 pb-8">
        <h1 className="text-4xl font-black text-text-primary mb-2 uppercase tracking-tight">{dict.admin.system.title}</h1>
        <p className="text-text-secondary font-medium tracking-wide">{dict.admin.system.subtitle}</p>
      </div>

      <SystemConfigClient dict={dict} />
    </div>
  );
}
