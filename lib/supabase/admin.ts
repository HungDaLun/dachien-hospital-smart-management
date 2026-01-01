/**
 * Supabase Admin 客戶端
 * 用於背景任務與系統級操作 (繞過 RLS)
 */
import { createClient } from '@supabase/supabase-js';

// 確保環境變數存在
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('缺少 Supabase Admin 環境變數');
}

/**
 * 建立 Supabase Admin 客戶端 (Service Role)
 * 注意：此客戶端擁有最高權限，請謹慎使用
 */
export function createAdminClient() {
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
