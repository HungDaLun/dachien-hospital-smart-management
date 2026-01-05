'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import { createClient } from '@/lib/supabase/client';

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
                        <img
                            className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            src={avatarUrl}
                            alt={displayName || 'User avatar'}
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
                <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm text-gray-900 font-medium truncate">
                            {displayName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{email}</p>
                        <span className="mt-1 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {role || 'USER'}
                        </span>
                    </div>

                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <Link
                                    href="/dashboard/settings"
                                    className={`
                                        ${active ? 'bg-gray-50' : ''}
                                        group flex w-full items-center px-4 py-2 text-sm text-gray-700
                                    `}
                                >
                                    <span className="mr-3">⚙️</span>
                                    個人設定
                                </Link>
                            )}
                        </Menu.Item>
                    </div>

                    <div className="py-1 border-t border-gray-100">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={handleLogout}
                                    disabled={loading}
                                    className={`
                                        ${active ? 'bg-red-50' : ''}
                                        group flex w-full items-center px-4 py-2 text-sm text-red-600
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
