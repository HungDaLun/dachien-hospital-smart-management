
/**
 * 偵錯：測試知識圖譜 API 資料
 * 執行方法：npx tsx scripts/debug-graph-api.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// 載入環境變數
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // 使用 Service Role 繞過 RLS 來檢查資料

async function debugGraph() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- 正在檢查 Files 表 ---');
    const { data: files, error: fError } = await supabase
        .from('files')
        .select('id, filename, gemini_state, department_id, is_active')
        .eq('is_active', true);

    if (fError) console.error('Files Error:', fError);
    else console.log(`找到 ${files?.length} 個有效檔案。`, files?.map(f => `${f.filename} (${f.gemini_state}) Dept: ${f.department_id}`));

    console.log('\n--- 正在檢查 Knowledge Instances 表 ---');
    const { data: instances, error: iError } = await supabase
        .from('knowledge_instances')
        .select('id, title, department_id, source_file_ids');

    if (iError) console.error('Instances Error:', iError);
    else console.log(`找到 ${instances?.length} 個知識實例。`, instances?.map(i => `${i.title} Dept: ${i.department_id}`));

    console.log('\n--- 正在檢查使用者權限 ---');
    // 這裡隨機抓一個 profile 來看（模擬 admin）
    const { data: profile } = await supabase.from('user_profiles').select('*').limit(1).single();
    console.log('測試 Profile 部門 ID:', profile?.department_id);
}

debugGraph();
