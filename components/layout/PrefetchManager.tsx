'use client';

/**
 * PrefetchManager - 路由預載入管理元件
 * 根據當前頁面預先載入相關路由，實現「瞬間切換」體驗
 */

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// 各頁面對應的預載入路由
const prefetchRoutes: Record<string, string[]> = {
    '/dashboard': [
        '/dashboard/knowledge',
        '/dashboard/agents',
        '/dashboard/chat',
        '/dashboard/meetings',
    ],
    '/dashboard/knowledge': [
        '/dashboard',
        '/dashboard/agents',
        '/dashboard/brain',
    ],
    '/dashboard/agents': [
        '/dashboard',
        '/dashboard/chat',
        '/dashboard/meetings',
    ],
    '/dashboard/chat': [
        '/dashboard',
        '/dashboard/agents',
    ],
    '/dashboard/meetings': [
        '/dashboard',
        '/dashboard/agents',
    ],
    '/dashboard/admin': [
        '/dashboard',
        '/dashboard/admin/users',
    ],
};

export function PrefetchManager() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // 取得當前頁面對應的預載入路由
        const routesToPrefetch = prefetchRoutes[pathname] || [];

        // 延遲預載入，避免影響當前頁面渲染
        const timeoutId = setTimeout(() => {
            routesToPrefetch.forEach(route => {
                router.prefetch(route);
            });
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [pathname, router]);

    // 此元件不渲染任何內容
    return null;
}
