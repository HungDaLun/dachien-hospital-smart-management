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
        <div className="flex items-center p-1 bg-white/[0.03] border border-white/5 rounded-xl backdrop-blur-sm">
            <button
                onClick={() => changeLanguage('zh-TW')}
                className={`px-3 py-1 text-[10px] rounded-lg font-black uppercase tracking-widest transition-all duration-300 ${currentLocale === 'zh-TW'
                    ? 'bg-primary-500/20 text-primary-400 shadow-glow-cyan/10'
                    : 'text-text-tertiary hover:text-text-secondary hover:bg-white/5'
                    }`}
            >
                中
            </button>
            <div className="w-px h-3 bg-white/10 mx-1" />
            <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 text-[10px] rounded-lg font-black uppercase tracking-widest transition-all duration-300 ${currentLocale === 'en'
                    ? 'bg-primary-500/20 text-primary-400 shadow-glow-cyan/10'
                    : 'text-text-tertiary hover:text-text-secondary hover:bg-white/5'
                    }`}
            >
                EN
            </button>
        </div>
    );
}
