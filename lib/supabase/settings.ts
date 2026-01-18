/**
 * 系統設定查詢工具 (Server-side)
 * 提供對 system_settings 資料表的存取，並支援環境變數 fallback
 */

import { createAdminClient } from './admin';

/**
 * 取得單個系統設定
 * @param key 設定金鑰
 * @param envFallback 選填，對應的環境變數名稱
 */
export async function getSystemSetting(key: string, envFallback?: string): Promise<string | null> {
    try {
        const supabase = createAdminClient();

        // 優先從資料庫讀取
        const { data: setting } = await supabase
            .from('system_settings')
            .select('setting_value')
            .eq('setting_key', key)
            .single();

        if (setting?.setting_value) {
            return setting.setting_value;
        }

        // 若資料庫無設定，則使用環境變數
        if (envFallback) {
            return process.env[envFallback] || null;
        }

        return null;
    } catch (error) {
        console.error(`[getSystemSetting] Error fetching key "${key}":`, error);
        // 發生錯誤時嘗試回退到環境變數
        if (envFallback) {
            return process.env[envFallback] || null;
        }
        return null;
    }
}

/**
 * 批次取得系統設定
 * @param keysMap 金鑰對應集 { [dbKey]: envFallbackKey }
 */
export async function getSystemSettings(keysMap: Record<string, string | undefined>): Promise<Record<string, string | null>> {
    const dbKeys = Object.keys(keysMap);
    const results: Record<string, string | null> = {};

    try {
        const supabase = createAdminClient();
        const { data } = await supabase
            .from('system_settings')
            .select('setting_key, setting_value')
            .in('setting_key', dbKeys);

        const dbValues: Record<string, string> = {};
        data?.forEach(row => {
            if (row.setting_value) {
                dbValues[row.setting_key] = row.setting_value;
            }
        });

        for (const dbKey of dbKeys) {
            const envKey = keysMap[dbKey];
            results[dbKey] = dbValues[dbKey] || (envKey ? process.env[envKey] || null : null);
        }
    } catch (error) {
        console.error('[getSystemSettings] Error fetching settings:', error);
        // 發生錯誤時全部回退到環境變數
        for (const dbKey of dbKeys) {
            const envKey = keysMap[dbKey];
            results[dbKey] = envKey ? process.env[envKey] || null : null;
        }
    }

    return results;
}
