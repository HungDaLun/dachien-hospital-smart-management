/**
 * 深度診斷 RLS 查詢問題
 * 測試不同的查詢方式，找出問題根源
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ 缺少必要的環境變數');
  process.exit(1);
}

async function debugRLSQuery() {
  console.log('🔍 深度診斷 RLS 查詢問題...\n');

  const testUserId = '82eb6660-cc05-44f2-aa57-61ab33511d15';

  // 注意：這個腳本使用 Anon Key，會受到 RLS 限制
  // 實際測試需要在應用程式中進行（需要有效的 session）

  console.log('📋 診斷說明:');
  console.log('   此腳本無法完全模擬 Server Components 的環境');
  console.log('   實際問題可能出在：');
  console.log('   1. JWT token 沒有正確從 cookies 傳遞到資料庫');
  console.log('   2. createServerClient 的設定問題');
  console.log('   3. Next.js Server Components 的 cookies 處理問題\n');

  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // 測試 1: 不使用 .single()，看看返回什麼
  console.log('1️⃣ 測試查詢（不使用 .single()）...');
  try {
    const { data, error, count } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .eq('id', testUserId);

    console.log(`   返回記錄數: ${data?.length || 0}`);
    console.log(`   錯誤: ${error ? error.message : '無'}`);
    console.log(`   總數: ${count || 0}`);

    if (data && data.length === 0) {
      console.log('   ⚠️  返回 0 筆記錄，表示 RLS 阻擋了查詢');
      console.log('   原因：auth.uid() 在資料庫層面返回 NULL');
    } else if (data && data.length > 0) {
      console.log('   ✅ 查詢成功');
    }
  } catch (err) {
    console.log(`   ❌ 查詢錯誤: ${err}`);
  }

  console.log('\n📝 建議的解決方案:');
  console.log('   1. 檢查 createServerClient 的 cookies 處理');
  console.log('   2. 確保 JWT token 正確從 cookies 傳遞');
  console.log('   3. 考慮暫時使用 Admin client 作為主要查詢方式（僅用於診斷）');
  console.log('   4. 檢查 Supabase SSR 文件，確認設定正確\n');
}

debugRLSQuery().catch(console.error);
