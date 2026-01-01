/**
 * 全面診斷 RLS 問題
 * 檢查 user_profiles 表的 RLS 政策狀態、資料完整性，以及查詢行為
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

async function diagnoseRLS() {
  console.log('🔍 開始全面診斷 RLS 問題...\n');

  // 1. 檢查 RLS 是否啟用
  console.log('1️⃣ 檢查 user_profiles 表的 RLS 狀態...');
  const { data: rlsStatus, error: rlsError } = await adminClient.rpc('exec_sql', {
    query: `
      SELECT 
        tablename,
        rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'user_profiles';
    `
  }).then(r => r.data).catch(() => null);

  if (rlsStatus && rlsStatus.length > 0) {
    console.log(`   ✅ RLS 已啟用: ${rlsStatus[0].rowsecurity}`);
  } else {
    console.log('   ⚠️  無法確認 RLS 狀態（需要直接查詢資料庫）');
  }

  // 2. 檢查所有 RLS 政策
  console.log('\n2️⃣ 檢查 user_profiles 表的 RLS 政策...');
  const { data: policies, error: policiesError } = await adminClient.rpc('exec_sql', {
    query: `
      SELECT 
        policyname,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'user_profiles'
      ORDER BY policyname;
    `
  }).then(r => r.data).catch(() => null);

  if (policies && policies.length > 0) {
    console.log(`   ✅ 找到 ${policies.length} 個政策:\n`);
    policies.forEach((policy: any) => {
      console.log(`   📋 ${policy.policyname}`);
      console.log(`      操作: ${policy.cmd}`);
      console.log(`      條件: ${policy.qual || '(無)'}`);
      console.log(`      WITH CHECK: ${policy.with_check || '(無)'}\n`);
    });

    // 檢查關鍵政策是否存在
    const hasSelfReadPolicy = policies.some((p: any) => 
      p.policyname === '使用者可讀取自己的資料' && p.cmd === 'SELECT'
    );
    const hasSuperAdminPolicy = policies.some((p: any) => 
      p.policyname === '超級管理員可讀取所有使用者' && p.cmd === 'SELECT'
    );
    const hasDeptAdminPolicy = policies.some((p: any) => 
      p.policyname === '部門管理員可讀取部門成員' && p.cmd === 'SELECT'
    );

    console.log('   📊 關鍵政策檢查:');
    console.log(`      ${hasSelfReadPolicy ? '✅' : '❌'} 使用者可讀取自己的資料`);
    console.log(`      ${hasSuperAdminPolicy ? '✅' : '❌'} 超級管理員可讀取所有使用者`);
    console.log(`      ${hasDeptAdminPolicy ? '✅' : '❌'} 部門管理員可讀取部門成員`);
  } else {
    console.log('   ⚠️  無法查詢政策（需要直接查詢資料庫）');
    console.log('   請在 Supabase Dashboard 執行以下 SQL:');
    console.log(`
      SELECT 
        policyname,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'user_profiles'
      ORDER BY policyname;
    `);
  }

  // 3. 檢查輔助函式
  console.log('\n3️⃣ 檢查輔助函式...');
  const { data: functions, error: funcError } = await adminClient.rpc('exec_sql', {
    query: `
      SELECT 
        routine_name,
        routine_type,
        data_type as return_type
      FROM information_schema.routines
      WHERE routine_schema = 'public' 
        AND routine_name IN ('get_user_role', 'get_user_dept', 'is_admin', 'is_super_admin')
      ORDER BY routine_name;
    `
  }).then(r => r.data).catch(() => null);

  if (functions && functions.length > 0) {
    console.log(`   ✅ 找到 ${functions.length} 個輔助函式:\n`);
    functions.forEach((func: any) => {
      console.log(`   📋 ${func.routine_name}() -> ${func.return_type}`);
    });
  } else {
    console.log('   ⚠️  無法查詢函式（需要直接查詢資料庫）');
  }

  // 4. 檢查資料完整性（重複記錄）
  console.log('\n4️⃣ 檢查資料完整性...');
  const { data: duplicateCheck, error: dupError } = await adminClient.rpc('exec_sql', {
    query: `
      SELECT 
        id,
        COUNT(*) as count
      FROM user_profiles
      GROUP BY id
      HAVING COUNT(*) > 1;
    `
  }).then(r => r.data).catch(() => null);

  if (duplicateCheck && duplicateCheck.length > 0) {
    console.log(`   ❌ 發現 ${duplicateCheck.length} 個重複的 user_id:`);
    duplicateCheck.forEach((dup: any) => {
      console.log(`      - ${dup.id} (${dup.count} 筆記錄)`);
    });
  } else {
    console.log('   ✅ 沒有發現重複的 user_id');
  }

  // 5. 檢查特定使用者的記錄
  console.log('\n5️⃣ 檢查測試使用者記錄...');
  const testUserId = '82eb6660-cc05-44f2-aa57-61ab33511d15';
  const { data: userRecords, error: userError } = await adminClient
    .from('user_profiles')
    .select('*')
    .eq('id', testUserId);

  if (userRecords && userRecords.length > 0) {
    console.log(`   ✅ 找到 ${userRecords.length} 筆記錄:`);
    userRecords.forEach((record: any, index: number) => {
      console.log(`      ${index + 1}. ID: ${record.id}`);
      console.log(`          Email: ${record.email}`);
      console.log(`          Role: ${record.role}`);
      console.log(`          Department: ${record.department_id || '(無)'}\n`);
    });

    if (userRecords.length > 1) {
      console.log('   ⚠️  警告：發現多筆記錄！這會導致 .single() 失敗');
    }
  } else {
    console.log('   ⚠️  沒有找到該使用者的記錄');
  }

  // 6. 測試 RLS 政策（使用 Service Role 模擬）
  console.log('\n6️⃣ 測試 RLS 政策邏輯...');
  console.log('   注意：此測試使用 Service Role，會繞過 RLS');
  console.log('   實際的 RLS 行為需要在應用層測試\n');

  // 7. 檢查 migration 狀態
  console.log('7️⃣ 檢查 migration 檔案...');
  const migrations = [
    '20240101000001_enable_rls.sql',
    '20240101000002_fix_rls_recursion.sql',
    '20260102000000_fix_user_profiles_select_policy.sql',
    '20260102030000_fix_rls_security_definer_functions.sql'
  ];

  console.log('   關鍵 migration 檔案:');
  migrations.forEach(migration => {
    console.log(`      - ${migration}`);
  });

  console.log('\n📋 診斷總結:');
  console.log('   1. 如果「使用者可讀取自己的資料」政策不存在，請執行 migration');
  console.log('   2. 如果有重複記錄，需要清理資料');
  console.log('   3. 如果政策存在但仍有問題，可能是 auth.uid() 未正確設定');
  console.log('   4. 檢查 middleware 是否正確設定 Supabase session\n');
}

diagnoseRLS().catch(console.error);
