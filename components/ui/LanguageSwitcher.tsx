'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LanguageSwitcher() {
    const router = useRouter();
    const [currentLocale, setCurrentLocale] = useState('zh-TW');

    useEffect(() => {
        // Read cookie to set initial state
        const match = document.cookie.match(new RegExp('(^| )NEXT_LOCALE=([^;]+)'));
        if (match) {
            setCurrentLocale(match[2]);
        }
    }, []);

    const changeLanguage = (locale: string) => {
        document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`; // 1 year
        setCurrentLocale(locale);
        router.refresh();
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => changeLanguage('zh-TW')}
                className={`px-2 py-1 text-xs rounded transition-colors ${currentLocale === 'zh-TW'
                        ? 'bg-primary-100 text-primary-700 font-bold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
            >
                中
            </button>
            <span className="text-gray-300">|</span>
            <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 text-xs rounded transition-colors ${currentLocale === 'en'
                        ? 'bg-primary-100 text-primary-700 font-bold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
            >
                EN
            </button>
        </div>
    );
}
