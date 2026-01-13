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
        source: '/((?!_next|static|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
