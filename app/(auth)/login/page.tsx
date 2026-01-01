'use client';

/**
 * 登入頁面
 * 使用 Supabase Auth 進行身份驗證
 */
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  // 檢查是否有註冊成功的參數
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setRegistered(true);
      // 3 秒後自動隱藏提示
      setTimeout(() => setRegistered(false), 3000);
    }
  }, [searchParams]);

  /**
   * 處理登入表單提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // 登入成功，導向儀表板
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '登入失敗，請稍後再試');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo 與標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EAKAP</h1>
          <p className="text-gray-600">企業 AI 知識庫平台</p>
        </div>

        {/* 登入表單 */}
        <div className="bg-white rounded-lg shadow-soft p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">登入</h2>

          {registered && (
            <div className="mb-4 p-3 bg-success-50 border border-success-500 rounded-md">
              <p className="text-sm text-success-500">註冊成功！請使用您的帳號登入</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-error-50 border border-error-500 rounded-md">
              <p className="text-sm text-error-500">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email 輸入 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                電子郵件
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            {/* 密碼輸入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {/* 登入按鈕 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '登入中...' : '登入'}
            </button>
          </form>

          {/* 其他選項 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              還沒有帳號？{' '}
              <Link href="/register" className="text-primary-500 hover:text-primary-600 font-medium">
                立即註冊
              </Link>
            </p>
          </div>
        </div>

        {/* 返回首頁 */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← 返回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
