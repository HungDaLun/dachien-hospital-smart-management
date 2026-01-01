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
        create: string;
        search: string;
        subtitle: string;
        back_to_home: string;
        enter_dashboard: string;
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
        logining: string;
        login_failed: string;
        no_account: string;
        register_now: string;
        register_success: string;
    };
    navigation: {
        overview: string;
        knowledge: string;
        agents: string;
        chat: string;
        system_admin: string;
        departments: string;
        users: string;
    };
    dashboard_home: {
        welcome: string;
        role: string;
        knowledge_card_desc: string;
        knowledge_card_btn: string;
        agent_card_desc: string;
        agent_card_btn: string;
        chat_card_desc: string;
        chat_card_btn: string;
        system_status: string;
        db_connection: string;
        gemini_api: string;
        status_normal: string;
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
