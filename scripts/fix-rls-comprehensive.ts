/**
 * 全面修復 RLS 問題
 * 檢查並修復 user_profiles 表的 RLS 政策
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 缺少必要的環境變數');
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fixRLS() {
  console.log('🔧 開始全面修復 RLS 問題...\n');

  // 1. 檢查並修復「使用者可讀取自己的資料」政策
  console.log('1️⃣ 檢查「使用者可讀取自己的資料」政策...');
  
  const checkPolicySQL = `
    SELECT 
      policyname,
      cmd,
      qual
    FROM pg_policies
    WHERE schemaname = 'public' 
      AND tablename = 'user_profiles'
      AND policyname = '使用者可讀取自己的資料'
      AND cmd = 'SELECT';
  `;

  const { data: existingPolicy, error: policyError } = await adminClient.rpc('exec_sql', {
    query: checkPolicySQL
  }).then(r => r.data).catch(() => null);

  if (existingPolicy && existingPolicy.length > 0) {
    const policy = existingPolicy[0];
    console.log(`   ✅ 政策已存在`);
    console.log(`      條件: ${policy.qual}`);
    
    // 檢查條件是否正確
    if (policy.qual && policy.qual.includes('auth.uid() = id')) {
      console.log('   ✅ 政策條件正確\n');
    } else {
      console.log('   ⚠️  政策條件可能不正確，建議重新建立\n');
    }
  } else {
    console.log('   ❌ 政策不存在，需要建立\n');
  }

  // 2. 檢查是否有重複記錄
  console.log('2️⃣ 檢查重複記錄...');
  const { data: duplicates, error: dupError } = await adminClient
    .from('user_profiles')
    .select('id')
    .then(async (result) => {
      // 使用 Service Role 查詢所有記錄，然後檢查重複
      const allUsers = result.data || [];
      const idCounts = new Map<string, number>();
      allUsers.forEach((user: any) => {
        idCounts.set(user.id, (idCounts.get(user.id) || 0) + 1);
      });
      
      const duplicates: string[] = [];
      idCounts.forEach((count, id) => {
        if (count > 1) {
          duplicates.push(id);
        }
      });
      
      return { data: duplicates, error: null };
    })
    .catch((err) => ({ data: null, error: err }));

  if (duplicates && duplicates.length > 0) {
    console.log(`   ❌ 發現 ${duplicates.length} 個重複的 user_id:`);
    duplicates.forEach(id => console.log(`      - ${id}`));
    console.log('   ⚠️  需要清理重複記錄\n');
  } else {
    console.log('   ✅ 沒有發現重複記錄\n');
  }

  // 3. 生成修復 SQL
  console.log('3️⃣ 生成修復 SQL...\n');
  
  const fixSQL = `
-- ============================================
-- 全面修復 user_profiles RLS 政策
-- 執行日期: ${new Date().toISOString()}
-- ============================================

-- 1. 刪除可能存在的舊政策（避免衝突）
DROP POLICY IF EXISTS "使用者可讀取自己的資料" ON user_profiles;

-- 2. 重新建立「使用者可讀取自己的資料」政策
-- 這是基礎政策，必須存在，讓使用者可以讀取自己的資料
CREATE POLICY "使用者可讀取自己的資料" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 3. 確認其他關鍵政策存在
-- 如果不存在，會由其他 migration 建立

-- 4. 驗證政策
-- 執行以下查詢來驗證政策是否正確建立：
-- SELECT policyname, cmd, qual FROM pg_policies 
-- WHERE schemaname = 'public' AND tablename = 'user_profiles' 
-- ORDER BY policyname;
  `;

  console.log('📋 請在 Supabase Dashboard 的 SQL Editor 中執行以下 SQL:\n');
  console.log('─'.repeat(80));
  console.log(fixSQL);
  console.log('─'.repeat(80));
  console.log('\n');

  // 4. 檢查輔助函式
  console.log('4️⃣ 檢查輔助函式...');
  const functions = ['is_super_admin', 'get_user_role', 'get_user_dept', 'is_admin'];
  
  for (const funcName of functions) {
    const { data: funcExists, error: funcError } = await adminClient.rpc('exec_sql', {
      query: `
        SELECT routine_name
        FROM information_schema.routines
        WHERE routine_schema = 'public' 
          AND routine_name = '${funcName}';
      `
    }).then(r => r.data).catch(() => null);

    if (funcExists && funcExists.length > 0) {
      console.log(`   ✅ ${funcName}() 存在`);
    } else {
      console.log(`   ❌ ${funcName}() 不存在`);
    }
  }
  console.log('');

  // 5. 測試查詢（使用 Service Role，會繞過 RLS）
  console.log('5️⃣ 測試查詢（使用 Service Role）...');
  const testUserId = '82eb6660-cc05-44f2-aa57-61ab33511d15';
  const { data: testUser, error: testError } = await adminClient
    .from('user_profiles')
    .select('*')
    .eq('id', testUserId);

  if (testUser && testUser.length > 0) {
    console.log(`   ✅ 找到 ${testUser.length} 筆記錄（使用 Service Role）`);
    if (testUser.length === 1) {
      console.log(`      Email: ${testUser[0].email}`);
      console.log(`      Role: ${testUser[0].role}`);
    } else {
      console.log('   ⚠️  警告：發現多筆記錄！');
    }
  } else {
    console.log('   ⚠️  沒有找到該使用者的記錄');
  }
  console.log('');

  // 6. 總結
  console.log('📊 修復總結:');
  console.log('   1. 如果「使用者可讀取自己的資料」政策不存在，請執行上面的 SQL');
  console.log('   2. 如果有重複記錄，需要手動清理');
  console.log('   3. 修復後，請重新測試應用程式');
  console.log('   4. 如果問題持續，請檢查：');
  console.log('      - auth.uid() 是否正確設定（檢查 middleware 和 session）');
  console.log('      - Supabase client 是否正確初始化');
  console.log('      - 是否有其他 RLS 政策衝突\n');
}

fixRLS().catch(console.error);
