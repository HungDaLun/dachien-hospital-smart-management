import { cookies } from 'next/headers';
import { defaultLocale, Locale } from './dictionaries';

const COOKIE_NAME = 'NEXT_LOCALE';

export async function getLocale(): Promise<Locale> {
    const cookieStore = cookies();
    const locale = cookieStore.get(COOKIE_NAME)?.value;

    if (locale === 'en' || locale === 'zh-TW') {
        return locale as Locale;
    }

    return defaultLocale;
}

export async function setLocale(locale: Locale) {
    // Note: Cookies can only be set in Server Actions or Middleware in Next.js
    // This function might be useful if we switch to Server Actions for locale switching
    const cookieStore = cookies();
    cookieStore.set(COOKIE_NAME, locale);
}
