/**
 * 系統設定頁面
 * 僅 SUPER_ADMIN 可以存取
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserProfile, requireSuperAdmin } from '@/lib/permissions';
import SystemConfigClient from './SystemConfigClient';
import ToolApiKeysConfig from './ToolApiKeysConfig';
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
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      {/* 返回按鈕 */}
      <div>
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-text-tertiary hover:text-text-primary transition-colors"
        >
          <span>←</span>
          <span>返回系統管理</span>
        </Link>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight">{dict.admin.system.title}</h1>
          <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-1 opacity-60">{dict.admin.system.subtitle}</p>
        </div>
      </div>

      {/* 系統基礎設定 (Gemini, S3, Email, 新聞, 通知, App) */}
      <SystemConfigClient dict={dict} />

      {/* MCP 工具 API Key 設定 - 動態讀取需要 API Key 的工具 */}
      <ToolApiKeysConfig dict={dict} />
    </div>
  );
}
