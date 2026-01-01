/**
 * 應用 RLS 修復 Migration
 * 確保「使用者可讀取自己的資料」政策存在
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ 缺少必要的環境變數');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function applyRLSFix() {
    console.log('🔧 應用 RLS 修復...\n');

    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260102000000_fix_user_profiles_select_policy.sql');
    
    if (!fs.existsSync(migrationPath)) {
        console.error(`❌ Migration 檔案不存在: ${migrationPath}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 Migration 內容：');
    console.log('─'.repeat(80));
    console.log(sql);
    console.log('─'.repeat(80));
    console.log('\n⚠️  注意：Supabase JS Client 無法直接執行 DDL 語句');
    console.log('   請手動在 Supabase Dashboard 的 SQL Editor 中執行上述 SQL\n');
    console.log('📍 步驟：');
    console.log('   1. 前往 Supabase Dashboard → SQL Editor');
    console.log('   2. 複製上面的 SQL 內容');
    console.log('   3. 貼上並執行\n');
    console.log('   或者使用 Supabase CLI：');
    console.log('   supabase db push\n');
}

applyRLSFix().catch(err => {
    console.error('❌ 執行失敗:', err);
    process.exit(1);
});
