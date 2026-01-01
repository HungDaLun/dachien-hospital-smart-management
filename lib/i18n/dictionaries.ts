import 'server-only';

// 定義支援的語系
export type Locale = 'zh-TW' | 'en';

// 預設語系
export const defaultLocale: Locale = 'zh-TW';

// 字典介面定義
export interface Dictionary {
    common: {
        dashboard: string;
        settings: string;
        profile: string;
        logout: string;
        loading: string;
        error: string;
        save: string;
        cancel: string;
        delete: string;
        edit: string;
        create: string;
        search: string;
    };
    agents: {
        title: string;
        create_new: string;
        my_agents: string;
        system_prompt: string;
        model: string;
    };
    auth: {
        login_title: string;
        email_label: string;
        password_label: string;
        sign_in: string;
    };
}

// 字典載入器
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    'zh-TW': () => import('./locales/zh-TW.json').then((module) => module.default),
    'en': () => import('./locales/en.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
    return dictionaries[locale]();
};
