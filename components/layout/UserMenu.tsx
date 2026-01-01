'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UserMenuProps {
    email?: string;
    displayName?: string;
    role?: string;
    logoutText?: string;
}

export default function UserMenu({ email, displayName, role, logoutText = '登出' }: UserMenuProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleLogout = async () => {
        if (loading) return;
        setLoading(true);

        try {
            // 呼叫 API 端點進行伺服器端登出 (清除 Cookie)
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (response.ok) {
                // 同步客戶端登出
                await supabase.auth.signOut();
                router.push('/login');
                router.refresh();
            } else {
                console.error('Logout failed');
                // 強制客戶端登出並導向
                await supabase.auth.signOut();
                router.push('/login');
            }
        } catch (error) {
            console.error('Logout error:', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-4 border-l border-gray-100 pl-4 ml-2">
            <div className="hidden lg:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-900 leading-tight">
                    {displayName || email?.split('@')[0] || 'User'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded font-bold uppercase tracking-wider">
                    {role || 'USER'}
                </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {(displayName?.[0] || email?.[0] || 'U').toUpperCase()}
            </div>

            <button
                onClick={handleLogout}
                disabled={loading}
                className="text-gray-400 hover:text-error-500 transition-colors tooltip flex items-center justify-center p-1.5 hover:bg-error-50 rounded-md disabled:opacity-50"
                title={logoutText}
            >
                <span className="text-xl">{loading ? '⌛' : '🚪'}</span>
            </button>
        </div>
    );
}
