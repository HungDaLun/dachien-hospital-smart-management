import type { Metadata } from 'next';
import { Inter, Noto_Sans_TC } from 'next/font/google';
import '@/styles/globals.css';

// 字體設定
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

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
  title: 'EAKAP - 企業 AI 知識庫平台',
  description: 'Enterprise AI Knowledge Agent Platform',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * 根佈局元件
 * 提供全域樣式與字體設定
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-TW" className={`${inter.variable} ${notoSansTC.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
