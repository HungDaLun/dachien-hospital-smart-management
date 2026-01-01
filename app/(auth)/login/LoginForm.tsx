'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Dictionary } from '@/lib/i18n/dictionaries';

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
    }, [searchParams]);

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
                // 檢查使用者狀態，決定導向哪個頁面
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('status')
                    .eq('id', data.user.id)
                    .single();

                // 如果狀態為 PENDING，導向待審核頁面
                if (profile?.status === 'PENDING') {
                    router.push('/dashboard/pending');
                } else {
                    router.push('/dashboard');
                }
                router.refresh();
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">EAKAP</h1>
                    <p className="text-gray-600">{dict.common.subtitle}</p>
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
                        <div className="mb-4 p-3 bg-error-50 border border-error-500 rounded-md">
                            <p className="text-sm text-error-500">{error}</p>
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
                                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
