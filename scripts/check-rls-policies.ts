/**
 * 檢查 RLS 政策設定
 * 詳細檢查 user_profiles 表的 RLS 機制
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

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

async function checkRLS() {
    console.log('🔍 檢查 RLS 機制...\n');

    // 1. 檢查 user_profiles 表是否啟用 RLS
    console.log('1️⃣ 檢查 user_profiles 表是否啟用 RLS...');
    const { data: tableInfo, error: tableError } = await supabase.rpc('exec_sql', {
        query: `
            SELECT 
                schemaname,
                tablename,
                rowsecurity
            FROM pg_tables
            WHERE schemaname = 'public' AND tablename = 'user_profiles';
        `
    }).then(r => r.data).catch(() => null);

    // 使用 SQL 查詢
    const { data: rlsStatus, error: rlsError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(0);

    console.log('   RLS 狀態: 已啟用（使用 Service Role 可以查詢）\n');

    // 2. 檢查 RLS 政策（需要直接執行 SQL）
    console.log('2️⃣ 檢查 RLS 政策...');
    console.log('   由於無法直接執行 SQL，請在 Supabase Dashboard 中執行以下查詢：');
    console.log(`
    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE tablename = 'user_profiles'
    ORDER BY policyname;
    \n`);

    // 3. 檢查輔助函式
    console.log('3️⃣ 檢查輔助函式...');
    const { data: functions, error: funcError } = await supabase.rpc('exec_sql', {
        query: `
            SELECT 
                routine_name,
                routine_type
            FROM information_schema.routines
            WHERE routine_schema = 'public' 
              AND routine_name IN ('get_user_role', 'get_user_dept', 'is_admin', 'is_super_admin')
            ORDER BY routine_name;
        `
    }).then(r => r.data).catch(() => null);

    console.log('   請在 Supabase Dashboard 中檢查以下函式是否存在：');
    console.log('   - get_user_role()');
    console.log('   - get_user_dept()');
    console.log('   - is_admin()');
    console.log('   - is_super_admin()\n');

    // 4. 檢查資料是否存在
    console.log('4️⃣ 檢查資料是否存在...');
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', 'siriue0@gmail.com')
        .single();

    if (profile) {
        console.log(`   ✅ 找到記錄:`);
        console.log(`      ID: ${profile.id}`);
        console.log(`      Email: ${profile.email}`);
        console.log(`      角色: ${profile.role}`);
        console.log(`      顯示名稱: ${profile.display_name}\n`);
    } else {
        console.log('   ❌ 找不到記錄\n');
    }

    // 5. 測試使用 anon key 查詢（模擬實際應用）
    console.log('5️⃣ 測試使用 anon key 查詢（模擬實際應用）...');
    const anonClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    const ADMIN_EMAIL = 'siriue0@gmail.com';
    const ADMIN_PASSWORD = '1q2w3e4r5t';

    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });

    if (signInError || !signInData.user) {
        console.error('   ❌ 登入失敗:', signInError?.message);
        return;
    }

    console.log(`   ✅ 登入成功: ${signInData.user.email} (ID: ${signInData.user.id})`);

    // 嘗試查詢 user_profiles
    const { data: testProfile, error: testError } = await anonClient
        .from('user_profiles')
        .select('*')
        .eq('id', signInData.user.id)
        .single();

    if (testError) {
        console.error(`   ❌ 查詢失敗:`);
        console.error(`      錯誤代碼: ${testError.code}`);
        console.error(`      錯誤訊息: ${testError.message}`);
        console.error(`      詳細資訊: ${testError.details || '無'}`);
        console.error(`      提示: ${testError.hint || '無'}\n`);
    } else if (testProfile) {
        console.log(`   ✅ 查詢成功:`);
        console.log(`      角色: ${testProfile.role}`);
        console.log(`      顯示名稱: ${testProfile.display_name}\n`);
    } else {
        console.log('   ❌ 查詢返回 null\n');
    }

    console.log('📋 總結：');
    console.log('   如果使用 anon key 查詢失敗，可能是 RLS 政策的問題。');
    console.log('   請檢查 Supabase Dashboard → Authentication → Policies 中的設定。\n');
}

checkRLS().catch(err => {
    console.error('❌ 執行失敗:', err);
    process.exit(1);
});
