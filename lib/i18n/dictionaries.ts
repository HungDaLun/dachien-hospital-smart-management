import 'server-only';

// 定義支援的語系
export type Locale = 'zh-TW' | 'en';

// 預設語系
export const defaultLocale: Locale = 'zh-TW';

// 字典介面定義
import type zhTW from './locales/zh-TW.json';

// 自動推斷字典型別
export type Dictionary = typeof zhTW;

// 字典載入器
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    'zh-TW': () => import('./locales/zh-TW.json').then((module) => module.default),
    'en': () => import('./locales/en.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
    return dictionaries[locale]();
};
