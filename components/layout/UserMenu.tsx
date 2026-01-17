'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

interface UserMenuProps {
    email?: string;
    displayName?: string;
    role?: string;
    avatarUrl?: string | null;
    logoutText?: string;
}

export default function UserMenu({ email, displayName, role, avatarUrl, logoutText = '登出' }: UserMenuProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleLogout = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (response.ok) {
                await supabase.auth.signOut();
                router.push('/login');
                router.refresh();
            } else {
                console.error('Logout failed');
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

    const initial = (displayName?.[0] || email?.[0] || 'U').toUpperCase();

    return (
        <Menu as="div" className="relative ml-3">
            <div>
                <Menu.Button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                    <span className="sr-only">Open user menu</span>

                    {avatarUrl ? (
                        <Image
                            className="rounded-full object-cover border border-gray-200"
                            src={avatarUrl}
                            alt={displayName || 'User avatar'}
                            width={40}
                            height={40}
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                            {initial}
                        </div>
                    )}
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl bg-background-tertiary border border-white/10 shadow-floating focus:outline-none overflow-hidden backdrop-blur-xl">
                    <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                        <p className="text-sm text-text-primary font-bold truncate">
                            {displayName || 'User'}
                        </p>
                        <p className="text-[10px] text-text-tertiary truncate font-mono mt-0.5">{email}</p>
                        <div className="mt-2.5">
                            <span className="inline-flex items-center rounded-lg bg-primary-500/10 px-2 py-0.5 text-[10px] font-black text-primary-400 border border-primary-500/20 uppercase tracking-wider">
                                {role || 'USER'}
                            </span>
                        </div>
                    </div>

                    <div className="p-1.5">
                        <Menu.Item>
                            {({ active }) => (
                                <Link
                                    href="/dashboard/settings"
                                    className={`
                                        ${active ? 'bg-white/5 text-primary-400' : 'text-text-secondary'}
                                        group flex w-full items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all
                                    `}
                                >
                                    <span className="mr-3 filter grayscale group-hover:grayscale-0 transition-all">⚙️</span>
                                    個人設定
                                </Link>
                            )}
                        </Menu.Item>
                    </div>

                    <div className="p-1.5 border-t border-white/5">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={handleLogout}
                                    disabled={loading}
                                    className={`
                                        ${active ? 'bg-semantic-danger/10 text-semantic-danger' : 'text-text-tertiary'}
                                        group flex w-full items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all
                                    `}
                                >
                                    <span className="mr-3">{loading ? '⌛' : '🚪'}</span>
                                    {logoutText}
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
