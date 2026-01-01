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

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
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

    // 取得當前使用者
    const { data: { user } } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // 檢查是否為公開路由
    const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // 如果是 API 路由（除了 health），需要驗證
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/health')) {
        if (!user) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: '請先登入' } },
                { status: 401 }
            );
        }
        return response;
    }

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

    // 檢查管理員路由
    if (user && adminRoutes.some((route) => pathname.startsWith(route))) {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['SUPER_ADMIN', 'DEPT_ADMIN'].includes(profile.role)) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
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
