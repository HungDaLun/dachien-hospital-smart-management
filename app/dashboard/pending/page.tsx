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
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-semantic-warning/5 blur-[100px] rounded-full" />
        <div className="war-room-grid absolute inset-0 opacity-10" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-warning rounded-3xl p-10 text-center border border-semantic-warning/20 shadow-glow-yellow">
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 bg-semantic-warning/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-semantic-warning/20">
              <svg
                className="w-10 h-10 text-semantic-warning animate-pulse-slow"
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
            <h1 className="text-3xl font-black text-text-primary mb-3 uppercase tracking-tight">
              帳號審核中
            </h1>
            <p className="text-text-secondary font-medium">
              您的帳號已成功註冊，目前正在等待管理員審核。
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
            <p className="text-sm text-text-primary font-bold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(0,217,255,1)]" />
              審核通過後，您將可以：
            </p>
            <ul className="text-xs text-text-secondary space-y-3 font-medium uppercase tracking-wide">
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span> 使用系統的所有功能
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span> 上傳和管理知識庫檔案
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span> 與 AI Agent 進行對話
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span> 執行權限範圍內的操作
              </li>
            </ul>
          </div>

          <div className="text-xs text-text-tertiary font-medium mb-8">
            <p>如有任何問題，請聯絡系統管理員。</p>
            <p className="mt-2 text-text-secondary font-mono">
              {user.email}
            </p>
          </div>

          <div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-xs font-bold text-text-secondary hover:text-text-primary uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                🚪 登出系統
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
