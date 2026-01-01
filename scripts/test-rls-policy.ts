/**
 * 測試 RLS 政策
 * 檢查 user_profiles 的 RLS 政策是否正確運作
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

const ADMIN_EMAIL = 'siriue0@gmail.com';
const ADMIN_PASSWORD = '1q2w3e4r5t';

async function testRLS() {
    console.log('🔍 測試 RLS 政策...\n');

    // 使用 service role 檢查資料是否存在
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: users } = await adminClient.auth.admin.listUsers();
    const user = users.users.find(u => u.email === ADMIN_EMAIL);

    if (!user) {
        console.error('❌ 找不到使用者');
        process.exit(1);
    }

    console.log(`✅ 找到使用者: ${user.email} (ID: ${user.id})\n`);

    // 檢查 user_profiles（使用 service role，繞過 RLS）
    const { data: profile } = await adminClient
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) {
        console.error('❌ user_profiles 中沒有記錄');
        process.exit(1);
    }

    console.log(`✅ user_profiles 記錄存在: ${profile.role}\n`);

    // 使用 anon key 登入（模擬應用程式）
    const anonClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    
    console.log('🔐 使用 anon key 登入...');
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });

    if (signInError || !signInData.user) {
        console.error('❌ 登入失敗:', signInError?.message);
        process.exit(1);
    }

    console.log(`✅ 登入成功\n`);

    // 測試查詢（會受到 RLS 限制）
    console.log('📊 測試查詢（受 RLS 限制）...');
    const { data: queryResult, error: queryError } = await anonClient
        .from('user_profiles')
        .select('*')
        .eq('id', signInData.user.id)
        .maybeSingle();

    if (queryError) {
        console.error('❌ 查詢失敗:', queryError);
        console.error('   錯誤代碼:', queryError.code);
        console.error('   錯誤訊息:', queryError.message);
    } else if (!queryResult) {
        console.error('❌ 查詢返回 null（可能是 RLS 政策阻止）');
    } else {
        console.log('✅ 查詢成功:', queryResult.role);
    }

    // 檢查 session
    console.log('\n🔐 檢查 session...');
    const { data: { session } } = await anonClient.auth.getSession();
    if (session) {
        console.log('✅ Session 存在');
        console.log(`   User ID: ${session.user.id}`);
        console.log(`   Access Token: ${session.access_token.substring(0, 20)}...`);
    } else {
        console.error('❌ Session 不存在');
    }

    // 檢查 auth.uid()
    console.log('\n🔍 檢查 auth.uid()...');
    const { data: { user: currentUser } } = await anonClient.auth.getUser();
    if (currentUser) {
        console.log(`✅ auth.getUser() 成功: ${currentUser.id}`);
    } else {
        console.error('❌ auth.getUser() 失敗');
    }
}

testRLS().catch(err => {
    console.error('❌ 執行失敗:', err);
    process.exit(1);
});
