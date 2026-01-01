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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{dict.admin.system.title}</h1>
        <p className="text-gray-600 mt-2">{dict.admin.system.subtitle}</p>
      </div>

      <SystemConfigClient dict={dict} />
    </div>
  );
}
