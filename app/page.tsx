import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import Link from 'next/link';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

/**
 * 首頁元件
 * 顯示平台歡迎頁面或導向登入/儀表板
 */
export default async function HomePage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          EAKAP
        </h1>
        <p className="text-gray-600 mb-8">
          {dict.common.subtitle}
        </p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            {dict.auth.sign_in}
          </Link>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-white text-primary-500 border border-primary-500 rounded-lg hover:bg-primary-50 transition-colors"
          >
            {dict.common.enter_dashboard}
          </Link>
        </div>
      </div>
    </main>
  );
}
