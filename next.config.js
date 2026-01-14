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

  // 強制停用頁面快取，解決 Safari 載入舊 Chunk 問題
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // 快取控制
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
          // 防止 MIME 類型嗅探
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // 防止點擊劫持
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // XSS 過濾器
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // 強制 HTTPS (上線後啟用)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Referrer 政策
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // 權限政策
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // CSP (內容安全政策)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://*.supabase.co",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
