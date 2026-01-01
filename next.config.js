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
};

module.exports = nextConfig;
