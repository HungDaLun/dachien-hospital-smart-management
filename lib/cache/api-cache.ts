/**
 * API 層快取模組
 * 使用 Next.js unstable_cache 實現伺服器端資料快取
 * 減少資料庫查詢，提升回應速度
 */
import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * 快取部門列表
 * 部門資料變動頻率低，適合長期快取
 * 快取時間：1 小時
 */
export const getCachedDepartments = unstable_cache(
    async () => {
        const supabase = createAdminClient();
        const { data, error } = await supabase.from('departments').select('*').order('name');

        if (error) {
            console.error('[Cache] 獲取部門列表失敗:', error);
            return [];
        }

        return data || [];
    },
    ['departments'], // 快取 key
    {
        revalidate: 3600, // 1 小時後重新驗證
        tags: ['departments'] // 用於 on-demand revalidation
    }
);

/**
 * 快取分類列表（文件類型分類）
 * 分類資料變動頻率低，適合長期快取
 * 快取時間：1 小時
 */
export const getCachedCategories = unstable_cache(
    async () => {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('document_categories')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('[Cache] 獲取分類列表失敗:', error);
            return [];
        }

        return data || [];
    },
    ['categories'],
    {
        revalidate: 3600,
        tags: ['categories']
    }
);

/**
 * 快取知識框架列表
 * 框架資料變動頻率極低，適合長期快取
 * 快取時間：6 小時
 */
export const getCachedKnowledgeFrameworks = unstable_cache(
    async () => {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('knowledge_frameworks')
            .select('id, name, description, icon')
            .order('name');

        if (error) {
            console.error('[Cache] 獲取知識框架列表失敗:', error);
            return [];
        }

        return data || [];
    },
    ['knowledge-frameworks'],
    {
        revalidate: 21600, // 6 小時
        tags: ['knowledge-frameworks']
    }
);

/**
 * 快取系統設定
 * 系統設定變動頻率低，但需要快速響應變更
 * 快取時間：5 分鐘
 */
export const getCachedSystemSettings = unstable_cache(
    async () => {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('system_settings')
            .select('key, value')
            .limit(100);

        if (error) {
            console.error('[Cache] 獲取系統設定失敗:', error);
            return {};
        }

        // 轉換為 key-value 物件
        const settings: Record<string, string> = {};
        data?.forEach(item => {
            settings[item.key] = item.value;
        });

        return settings;
    },
    ['system-settings'],
    {
        revalidate: 300, // 5 分鐘
        tags: ['system-settings']
    }
);

// 注意：getCachedAgentTemplates 函式已移除
// 原因：
// 1. 查詢了不存在的欄位（icon, default_system_prompt）
// 2. 實際欄位為 system_prompt_template（不是 default_system_prompt）
// 3. 未被任何地方引用
// 如需快取 Agent 模板，請使用正確的欄位名稱並確保有實際使用場景
