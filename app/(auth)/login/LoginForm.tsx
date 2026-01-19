'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Hexagon } from 'lucide-react';

interface LoginFormProps {
    dict: Dictionary;
}

function LoginFormContent({ dict }: LoginFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [registered, setRegistered] = useState(false);

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setRegistered(true);
            setTimeout(() => setRegistered(false), 3000);
        }

        // 移除自動清空 Session 的邏輯，這在行動裝置上可能會導致循環導向或快取問題
        // 當使用者在登入頁面進行登入時，signInWithPassword 會自動處理 Session 更新
    }, [searchParams]);

    const handleRedirect = (profileStatus: string | undefined) => {
        // 使用 window.location.href 作為最後手段，確保徹底重新整理頁面狀態
        const destination = profileStatus === 'PENDING' ? '/dashboard/pending' : '/dashboard';

        // 先嘗試 Next.js 路由
        router.push(destination);
        router.refresh();

        // 如果 2 秒後還沒跳轉，執行強制跳轉（處理行動裝置快取卡死）
        setTimeout(() => {
            if (window.location.pathname === '/login') {
                window.location.href = destination;
            }
        }, 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 驗證：確保 email 和 password 都有值
        if (!email || !password) {
            setError('請輸入電子郵件和密碼');
            return;
        }

        // 驗證：確保 email 格式正確
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('請輸入有效的電子郵件地址');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const supabase = createClient();

            // 直接進行登入，不再先進行 signOut 以避免網路波動導致的延遲
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim(),
            });

            if (signInError) {
                // ...
                let errorMessage = signInError.message;
                if (errorMessage === 'Invalid login credentials') {
                    errorMessage = '帳號或密碼錯誤，請檢查後重新輸入';
                } else if (errorMessage === 'Email not confirmed') {
                    errorMessage = '電子郵件尚未驗證，請檢查您的信箱';
                }

                setError(errorMessage);
                setLoading(false);
                return;
            }

            if (data.user) {
                // 檢查使用者狀態，決定導向哪個頁面
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('status')
                    .eq('id', data.user.id)
                    .single();

                handleRedirect(profile?.status);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : dict.auth.login_failed);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex items-center justify-center text-primary-600">
                            <Hexagon className="w-10 h-10" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <h1 className="text-4xl font-black text-gray-900 mb-1 tracking-tight font-heading">NEXUS</h1>
                        <span className="text-sm font-bold text-gray-500 tracking-widest mb-2">智樞</span>
                        <div className="text-xs font-mono text-primary-600 font-medium tracking-widest mb-1">ENTERPRISE DECISION COMMAND</div>
                        <div className="text-[10px] font-bold text-gray-400 tracking-wider">企業戰情智能決策系統</div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-soft p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">{dict.auth.sign_in}</h2>

                    {registered && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-500 rounded-md">
                            <p className="text-sm text-blue-700 font-medium mb-1">註冊成功！</p>
                            <p className="text-sm text-blue-600">
                                您的帳號已建立，請等待管理員審核通過後即可使用系統功能。
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md shadow-sm">
                            <p className="text-sm text-black font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                {dict.auth.email_label}
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="off"
                                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                                placeholder="your@email.com"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                {dict.auth.password_label}
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="off"
                                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                                placeholder="••••••••"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? dict.auth.logining : dict.auth.sign_in}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            {dict.auth.no_account}{' '}
                            <Link href="/register" className="text-primary-500 hover:text-primary-600 font-medium">
                                {dict.auth.register_now}
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <Link
                        href="/"
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← {dict.common.back_to_home}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function LoginForm({ dict }: LoginFormProps) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                    {/* Note: Loading text in fallback is hardcoded for now or need to pass dict if available, but dict is passed so use it if possible or hardcode 'Loading...' as generic fallback before hydration */}
                </div>
            </div>
        }>
            <LoginFormContent dict={dict} />
        </Suspense>
    );
}
