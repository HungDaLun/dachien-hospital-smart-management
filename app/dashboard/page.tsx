/**
 * 儀表板首頁
 * 顯示平台概覽與快速操作
 * 遵循 EAKAP 設計系統規範 v1.5
 */
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getCachedUserProfile } from '@/lib/cache/user-profile';
import { Card, Button } from '@/components/ui';

export default async function DashboardPage() {
  const supabase = await createClient();

  // 檢查使用者是否已登入
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // 使用快取的查詢（如果 layout 已經查詢過，會重用結果）
  const profile = await getCachedUserProfile(user.id);

  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* 歡迎區塊 - 增加漸變視覺 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-violet bg-clip-text text-transparent mb-3 animate-fade-in-up">
          {dict.dashboard_home.welcome}{profile?.display_name || user.email}！
        </h1>
        <p className="text-gray-600 text-lg">
          {dict.dashboard_home.role}
          <span className="font-semibold text-primary-600 ml-1">
            {profile?.role || 'USER'}
          </span>
        </p>
      </div>

      {/* 快速操作卡片 - 使用新設計系統 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 知識庫卡片 */}
        <Card
          interactive
          className="group relative overflow-hidden"
        >
          {/* 裝飾性漸變背景 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent-cyan/10 to-transparent rounded-full blur-2xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-0" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-sky flex items-center justify-center text-2xl shadow-lg">
                📚
              </div>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-accent-cyan transition-colors">
                {dict.navigation.knowledge}
              </h2>
            </div>

            <p className="text-gray-600 text-sm mb-6 min-h-[2.5rem]">
              {dict.dashboard_home.knowledge_card_desc}
            </p>

            <Link href="/dashboard/knowledge">
              <Button variant="cta" fullWidth>
                {dict.dashboard_home.knowledge_card_btn} →
              </Button>
            </Link>
          </div>
        </Card>

        {/* AI Agent 卡片 */}
        <Card
          interactive
          className="group relative overflow-hidden"
        >
          {/* 裝飾性漸變背景 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent-violet/10 to-transparent rounded-full blur-2xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-0" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center text-2xl shadow-lg">
                🤖
              </div>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-accent-violet transition-colors">
                {dict.navigation.agents}
              </h2>
            </div>

            <p className="text-gray-600 text-sm mb-6 min-h-[2.5rem]">
              {dict.dashboard_home.agent_card_desc}
            </p>

            <Link href="/dashboard/agents">
              <Button variant="cta" fullWidth>
                {dict.dashboard_home.agent_card_btn} →
              </Button>
            </Link>
          </div>
        </Card>

        {/* 對話卡片 */}
        <Card
          interactive
          className="group relative overflow-hidden"
        >
          {/* 裝飾性漸變背景 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent-emerald/10 to-transparent rounded-full blur-2xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-0" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-emerald to-accent-sky flex items-center justify-center text-2xl shadow-lg">
                💬
              </div>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-accent-emerald transition-colors">
                {dict.navigation.chat}
              </h2>
            </div>

            <p className="text-gray-600 text-sm mb-6 min-h-[2.5rem]">
              {dict.dashboard_home.chat_card_desc}
            </p>

            <Link href="/dashboard/chat">
              <Button variant="cta" fullWidth>
                {dict.dashboard_home.chat_card_btn} →
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* 系統狀態 - Neumorphism 統計卡片 */}
      <Card className="relative overflow-hidden">
        {/* 裝飾性背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />

        <div className="relative">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            {dict.dashboard_home.system_status}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 資料庫狀態 */}
            <div className="bg-white rounded-lg p-4 shadow-neu-light border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success-50 flex items-center justify-center">
                    <span className="text-success-600 text-xl">✓</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{dict.dashboard_home.db_connection}</p>
                    <p className="text-lg font-bold text-success-600">
                      {dict.dashboard_home.status_normal}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gemini API 狀態 */}
            <div className="bg-white rounded-lg p-4 shadow-neu-light border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success-50 flex items-center justify-center">
                    <span className="text-success-600 text-xl">✓</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{dict.dashboard_home.gemini_api}</p>
                    <p className="text-lg font-bold text-success-600">
                      {dict.dashboard_home.status_normal}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
