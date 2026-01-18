/** @type {import('next').NextConfig} */
const nextConfig = {
  // 啟用 React 嚴格模式
  reactStrictMode: true,

  // 圖片最佳化設定
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // 實驗性功能
  experimental: {
    // 啟用 Server Actions
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // 環境變數驗證
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // 強制每次 Build 生成唯一的 ID，防止 manifest 快取問題
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },

  // 分層快取策略：靜態資源長期快取、動態內容需驗證
  async headers() {
    // 共用的安全 headers
    const securityHeaders = [
      // 防止 MIME 類型嗅探
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // 防止點擊劫持
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      // XSS 過濾器
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      // 強制 HTTPS
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      // Referrer 政策
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // 權限政策
      // 允許麥克風使用，以支援超級管家語音功能
      { key: 'Permissions-Policy', value: 'camera=(), microphone=*' },
    ];

    // CSP 設定
    const cspHeader = {
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https://*.supabase.co",
        "font-src 'self'",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://*.livekit.cloud wss://*.livekit.cloud https://api.vapi.ai wss://*.vapi.ai https://*.daily.co wss://*.daily.co",
        "frame-ancestors 'self'",
      ].join('; '),
    };

    return [
      // 1. 靜態資源：長期快取（1 年，immutable）
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          ...securityHeaders,
        ],
      },
      // 2. 圖片最佳化：長期快取
      {
        source: '/_next/image/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          ...securityHeaders,
        ],
      },
      // 3. 字體檔案：長期快取
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          ...securityHeaders,
        ],
      },
      // 4. API 路由：私有快取，需重新驗證
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-cache, must-revalidate' },
          ...securityHeaders,
          cspHeader,
        ],
      },
      // 5. 一般頁面：私有快取，需驗證（解決 Safari Chunk 問題同時保留效能）
      {
        source: '/((?!api|_next/static|_next/image|fonts|favicon.ico).*)',
        headers: [
          { key: 'Cache-Control', value: 'private, no-cache' },
          ...securityHeaders,
          cspHeader,
        ],
      },
    ];
  },
};

module.exports = nextConfig;
