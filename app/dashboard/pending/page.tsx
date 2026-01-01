/**
 * 待審核頁面
 * 顯示給狀態為 PENDING 的使用者
 */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getCachedUserProfile } from '@/lib/cache/user-profile';

export const dynamic = 'force-dynamic';

export default async function PendingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getCachedUserProfile(user.id);

  // 如果已審核通過，導向主頁面
  if (profile && profile.status === 'APPROVED') {
    redirect('/dashboard');
  }

  // 如果狀態不是 PENDING，也導向主頁面
  if (profile && profile.status !== 'PENDING') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-soft p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              帳號審核中
            </h1>
            <p className="text-gray-600 mb-4">
              您的帳號已成功註冊，目前正在等待管理員審核。
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>審核通過後，您將可以：</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 text-left list-disc list-inside space-y-1">
              <li>使用系統的所有功能</li>
              <li>上傳和管理知識庫檔案</li>
              <li>與 AI Agent 進行對話</li>
              <li>根據您的角色權限執行相應操作</li>
            </ul>
          </div>

          <div className="text-sm text-gray-500">
            <p>如有任何問題，請聯絡系統管理員。</p>
            <p className="mt-2">
              電子郵件：{user.email}
            </p>
          </div>

          <div className="mt-6">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                登出
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
