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
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
