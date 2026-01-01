/**
 * Next.js Middleware
 * 處理身份驗證與路由保護
 * 遵循 EAKAP 安全規範
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * 公開路由（不需要登入）
 */
const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/api/health',
];

/**
 * 管理員路由（需要 SUPER_ADMIN 或 DEPT_ADMIN）
 */
const adminRoutes = [
    '/dashboard/admin',
];

/**
 * 超級管理員專屬路由（僅 SUPER_ADMIN）
 */
const superAdminRoutes = [
    '/dashboard/admin/system',
    '/api/system/config',
];



export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

    const pathname = request.nextUrl.pathname;

    // 檢查是否為公開路由（優先檢查，避免不必要的認證查詢）
    const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // 對於公開路由且不是登入/註冊頁，直接返回（不需要認證）
    if (isPublicRoute && pathname !== '/login' && pathname !== '/register') {
        return response;
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: {
                    Authorization: request.headers.get('Authorization') || '',
                },
            },
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // 取得當前使用者（僅在需要時執行）
    const { data: { user } } = await supabase.auth.getUser();

    // API 路由處理
    if (pathname.startsWith('/api/')) {
        // 健康檢查端點不需要驗證
        if (pathname.startsWith('/api/health')) {
            return response;
        }

        // 其他 API 路由需要身份驗證
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: '請先登入'
                    }
                },
                { status: 401 }
            );
        }

        // 檢查是否需要特定角色權限（只查詢一次）
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, status')
            .eq('id', user.id)
            .single();

        if (profile) {
            // 檢查使用者狀態：待審核使用者無法使用 API（除了登出）
            if (profile.status === 'PENDING' && !pathname.startsWith('/api/auth/logout')) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'PENDING_APPROVAL',
                            message: '您的帳號正在等待管理員審核，審核通過後即可使用系統功能。'
                        }
                    },
                    { status: 403 }
                );
            }

            const userRole = profile.role;

            // 檢查超級管理員專屬 API
            if (superAdminRoutes.some(route => pathname.startsWith(route))) {
                if (userRole !== 'SUPER_ADMIN') {
                    return NextResponse.json(
                        {
                            success: false,
                            error: {
                                code: 'PERMISSION_DENIED',
                                message: '此操作需要超級管理員權限'
                            }
                        },
                        { status: 403 }
                    );
                }
            }

            // 檢查管理員專屬 API
            if (pathname.startsWith('/api/users') && request.method === 'POST') {
                // 建立使用者需要 SUPER_ADMIN
                if (userRole !== 'SUPER_ADMIN') {
                    return NextResponse.json(
                        {
                            success: false,
                            error: {
                                code: 'PERMISSION_DENIED',
                                message: '此操作需要超級管理員權限'
                            }
                        },
                        { status: 403 }
                    );
                }
            }
        }

        return response;
    }

    // 頁面路由處理
    // 如果是公開路由且已登入，導向儀表板
    if (isPublicRoute && user && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 如果不是公開路由且未登入，導向登入頁
    if (!isPublicRoute && !user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 檢查管理員路由（合併查詢，避免重複）
    const needsAdminCheck = user && (
        adminRoutes.some((route) => pathname.startsWith(route)) ||
        superAdminRoutes.some((route) => pathname.startsWith(route))
    );

    if (needsAdminCheck) {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, status')
            .eq('id', user.id)
            .single();

        if (profile) {
            // 檢查使用者狀態：待審核使用者無法存取管理員頁面
            if (profile.status === 'PENDING') {
                return NextResponse.redirect(new URL('/dashboard/pending', request.url));
            }

            // 檢查管理員路由
            if (adminRoutes.some((route) => pathname.startsWith(route))) {
                if (!['SUPER_ADMIN', 'DEPT_ADMIN'].includes(profile.role)) {
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }
            }

            // 檢查超級管理員專屬路由
            if (superAdminRoutes.some((route) => pathname.startsWith(route))) {
                if (profile.role !== 'SUPER_ADMIN') {
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }
            }
        }
    }

    // 檢查一般頁面路由：待審核使用者只能看到待審核頁面
    if (user && !isPublicRoute && !pathname.startsWith('/dashboard/pending')) {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('status')
            .eq('id', user.id)
            .single();

        if (profile && profile.status === 'PENDING') {
            return NextResponse.redirect(new URL('/dashboard/pending', request.url));
        }
    }

    return response;
}

/**
 * 設定 Middleware 匹配路徑
 */
export const config = {
    matcher: [
        /*
         * 匹配所有請求路徑，除了：
         * - _next/static (靜態資源)
         * - _next/image (圖片最佳化)
         * - favicon.ico (網站圖示)
         * - 公開資源
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
