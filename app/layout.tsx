import type { Metadata } from 'next';
import { Space_Grotesk, DM_Sans, Noto_Sans_TC } from 'next/font/google';
import '@/styles/globals.css';
import { getLocale } from '@/lib/i18n/server';

// 戰情室設計系統字體設定
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
});

// 中文字體（保留）
const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-tc',
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'NEXUS 智樞 - 企業戰情智能決策系統',
  description: 'NEXUS Enterprise Decision Command - 企業戰情智能決策系統',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * 根佈局元件
 * 提供全域樣式與字體設定
 * 
 * 字體系統：
 * - Space Grotesk: 標題字體 (--font-heading)
 * - DM Sans: 內文字體 (--font-body)
 * - Noto Sans TC: 中文字體
 */
export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${notoSansTC.variable}`}
    >
      <head>
        {/* 徹底解決 Safari / Chrome 快取導致的 ChunkLoadError */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', (e) => {
                // 只處理真正的 ChunkLoadError，避免 Safari 誤判
                const message = (e.message || '').toLowerCase();
                const errorName = (e.error?.name || '').toLowerCase();
                
                // 更嚴格的判斷：必須是 ChunkLoadError 或明確的 chunk 載入失敗
                const isChunkError = errorName === 'chunkloaderror' ||
                                    message.includes('chunkloaderror') || 
                                    (message.includes('loading chunk') && message.includes('failed'));
                
                if (isChunkError) {
                  console.log('偵測到版本不一致，正在自動修復與重新整理...');
                  // 使用延遲避免無限循環
                  if (!window.__chunkErrorReloading) {
                    window.__chunkErrorReloading = true;
                    setTimeout(() => window.location.reload(), 100);
                  }
                }
              }, true);
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
