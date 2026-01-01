'use client';

/**
 * 註冊頁面
 * 使用 Supabase Auth 進行使用者註冊
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * 處理註冊表單提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || '註冊失敗，請稍後再試');
        setLoading(false);
        return;
      }

      if (data.success) {
        setSuccess(true);
        // 註冊成功後，等待 3 秒後導向登入頁
        // 顯示需要審核的訊息
        setTimeout(() => {
          router.push('/login?registered=pending');
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '註冊失敗，請稍後再試');
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

        {/* 註冊表單 */}
        <div className="bg-white rounded-lg shadow-soft p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">註冊新帳號</h2>

          {error && (
            <div className="mb-4 p-3 bg-error-50 border border-error-500 rounded-md">
              <p className="text-sm text-error-500">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-500 rounded-md">
              <p className="text-sm text-blue-700 font-medium mb-2">
                ✅ 註冊成功！
              </p>
              <p className="text-sm text-blue-600">
                您的帳號已建立，但需要等待管理員審核通過後才能使用系統功能。
                <br />
                審核通過後，您將收到通知，即可開始使用。
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 顯示名稱輸入（選填） */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                顯示名稱（選填）
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="您的名稱"
                disabled={loading || success}
              />
            </div>

            {/* Email 輸入 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                電子郵件 <span className="text-error-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your@email.com"
                disabled={loading || success}
              />
            </div>

            {/* 密碼輸入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密碼 <span className="text-error-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="至少 6 個字元"
                disabled={loading || success}
              />
              <p className="mt-1 text-xs text-gray-500">
                密碼長度至少需要 6 個字元
              </p>
            </div>

            {/* 註冊按鈕 */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 px-4 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '註冊中...' : success ? '註冊成功！' : '註冊'}
            </button>
          </form>

          {/* 其他選項 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              已經有帳號？{' '}
              <Link href="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                立即登入
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
