/**
 * 測試 RLS 修復是否生效
 * 檢查應用程式查詢是否正常工作
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ 缺少必要的環境變數');
  process.exit(1);
}

async function testRLSFix() {
  console.log('🧪 測試 RLS 修復是否生效...\n');

  // 注意：這個測試腳本使用 Anon Key，會受到 RLS 限制
  // 實際測試需要在應用程式中進行，因為需要有效的 session

  console.log('📋 測試說明:');
  console.log('   1. 此腳本使用 Anon Key，會受到 RLS 限制');
  console.log('   2. 實際測試需要在應用程式中進行（需要有效的 session）');
  console.log('   3. 請重新啟動應用程式並檢查日誌\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // 測試 1: 檢查是否可以連接到 Supabase
  console.log('1️⃣ 測試 Supabase 連接...');
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(0);
    
    if (error) {
      console.log(`   ⚠️  連接測試失敗: ${error.message}`);
      console.log('   這是正常的，因為沒有有效的 session，RLS 會阻擋查詢\n');
    } else {
      console.log('   ✅ 可以連接到 Supabase\n');
    }
  } catch (err) {
    console.log(`   ❌ 連接錯誤: ${err}\n`);
  }

  // 測試 2: 檢查環境變數
  console.log('2️⃣ 檢查環境變數...');
  console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✅ 已設定' : '❌ 未設定'}`);
  console.log(`   SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✅ 已設定' : '❌ 未設定'}\n`);

  console.log('📝 下一步:');
  console.log('   1. 重新啟動應用程式: npm run dev');
  console.log('   2. 登入並檢查日誌');
  console.log('   3. 確認是否還有 PGRST116 錯誤');
  console.log('   4. 檢查新的調試資訊（sessionUserId, authUidMatch 等）\n');
}

testRLSFix().catch(console.error);
