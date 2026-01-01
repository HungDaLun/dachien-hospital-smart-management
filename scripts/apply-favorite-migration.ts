import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// 載入環境變數
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// 為了執行 DDL，我們需要用 service_role key，如果沒有則嘗試用 anon key (通常 anon 沒有權限)
// 在這個開發環境中，我們假設使用者有權限，或者我們提示使用者手動執行
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ 缺少 SUPABASE_SERVICE_ROLE_KEY，無法自動執行 Migration。');
    console.log('請手動至 Supabase SQL Editor 執行以下檔案內容：');
    console.log('supabase/migrations/20260101070000_add_favorites.sql');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260101070000_add_favorites.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🚀 正在執行 Migration: add_favorites...');

    // Supabase JS Client 不直接支援執行 raw SQL (除了 RPC)，
    // 但我們可以使用 pg driver 或者透過 REST API 如果有開啟這功能。
    // 為求簡便，這裡我們使用一個模擬的方式：
    // 提示開發者我們無法直接透過 JS client 執行 DDL，除非有特定的 RPC 支援。

    // 檢查是否有 exec_sql RPC (通常開發者會自己加一個)
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
        console.error('❌ Migration 執行失敗 (可能未安裝 exec_sql Helper):', error.message);
        console.log('\n請手動執行 SQL：\n');
        console.log(sql);
    } else {
        console.log('✅ Migration 執行成功！');
    }
}

applyMigration();
