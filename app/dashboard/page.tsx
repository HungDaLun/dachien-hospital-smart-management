/**
 * 儀表板首頁
 * 顯示平台概覽與快速操作
 */
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  // 檢查使用者是否已登入
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // 取得使用者資料
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-7xl mx-auto">
      {/* 歡迎區塊 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          歡迎回來，{profile?.display_name || user.email}！
        </h1>
        <p className="text-gray-600">
          您的角色：<span className="font-semibold">{profile?.role || 'USER'}</span>
        </p>
      </div>

      {/* 快速操作卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">知識庫</h2>
          <p className="text-gray-600 text-sm mb-4">管理您的知識庫檔案</p>
          <Link
            href="/dashboard/knowledge"
            className="inline-block px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors text-sm"
          >
            查看檔案
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Agent</h2>
          <p className="text-gray-600 text-sm mb-4">建立和管理 AI Agent</p>
          <Link
            href="/dashboard/agents"
            className="inline-block px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors text-sm"
          >
            管理 Agent
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">對話</h2>
          <p className="text-gray-600 text-sm mb-4">與 AI Agent 對話</p>
          <Link
            href="/dashboard/chat"
            className="inline-block px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors text-sm"
          >
            開始對話
          </Link>
        </div>
      </div>

      {/* 系統狀態 */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">系統狀態</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">資料庫連線</span>
            <span className="text-success-500 font-medium">正常</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Gemini API</span>
            <span className="text-success-500 font-medium">正常</span>
          </div>
        </div>
      </div>
    </div>
  );
}
