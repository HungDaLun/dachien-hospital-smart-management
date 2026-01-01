/**
 * 診斷 SUPER_ADMIN 登入問題
 * 檢查帳號狀態並提供修復建議
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// 載入環境變數
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ 缺少必要的環境變數：NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const ADMIN_EMAIL = 'siriue0@gmail.com';
const ADMIN_PASSWORD = '1q2w3e4r5t';

async function diagnoseAdminAccount() {
    console.log('🔍 開始診斷 SUPER_ADMIN 帳號狀態...\n');

    // 1. 檢查 Auth 使用者是否存在
    console.log('1️⃣ 檢查 Auth 使用者是否存在...');
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
        console.error('❌ 無法查詢使用者列表:', listError.message);
        return;
    }

    const adminUser = listData.users.find(u => u.email === ADMIN_EMAIL);

    if (!adminUser) {
        console.log(`❌ 找不到使用者 ${ADMIN_EMAIL} 在 auth.users 表中`);
        console.log('\n💡 解決方案：需要建立使用者帳號');
        console.log('   執行以下命令來建立帳號：');
        console.log(`   npx ts-node scripts/create-admin-account.ts`);
        return;
    }

    console.log(`✅ 找到使用者: ${ADMIN_EMAIL}`);
    console.log(`   - 使用者 ID: ${adminUser.id}`);
    console.log(`   - Email 確認狀態: ${adminUser.email_confirmed_at ? '✅ 已確認' : '❌ 未確認'}`);
    console.log(`   - 建立時間: ${adminUser.created_at}`);
    console.log(`   - 最後登入: ${adminUser.last_sign_in_at || '從未登入'}`);

    // 2. 檢查 user_profiles 中的角色
    console.log('\n2️⃣ 檢查 user_profiles 角色設定...');
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', adminUser.id)
        .single();

    if (profileError) {
        console.error('❌ 查詢 user_profiles 失敗:', profileError.message);
        console.log('\n💡 解決方案：需要建立 user_profiles 記錄');
    } else {
        console.log(`✅ 找到 user_profiles 記錄`);
        console.log(`   - 角色: ${profile.role}`);
        console.log(`   - 顯示名稱: ${profile.display_name || '未設定'}`);
        if (profile.role !== 'SUPER_ADMIN') {
            console.log(`   ⚠️  警告：角色不是 SUPER_ADMIN，需要更新`);
        }
    }

    // 3. 測試登入（使用提供的密碼）
    console.log('\n3️⃣ 測試登入（使用提供的密碼）...');
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey || !SUPABASE_URL) {
        console.error('❌ 缺少環境變數: NEXT_PUBLIC_SUPABASE_ANON_KEY 或 NEXT_PUBLIC_SUPABASE_URL');
        return;
    }
    const testSupabase = createClient(SUPABASE_URL, anonKey);
    const { data: signInData, error: signInError } = await testSupabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });

    if (signInError) {
        console.log(`❌ 登入失敗: ${signInError.message}`);
        console.log(`\n💡 可能的原因：`);
        console.log(`   1. 密碼不正確`);
        console.log(`   2. Email 未確認（${adminUser.email_confirmed_at ? '已確認' : '未確認'}）`);
        
        if (!adminUser.email_confirmed_at) {
            console.log(`\n   建議：需要確認 email 或使用 Service Role 建立帳號時設定 email_confirm: true`);
        }
    } else {
        console.log(`✅ 登入成功！`);
        console.log(`   - Session Token: ${signInData.session?.access_token.substring(0, 20)}...`);
    }

    // 4. 提供修復建議
    console.log('\n📋 診斷總結：');
    
    const issues: string[] = [];
    if (!adminUser.email_confirmed_at) {
        issues.push('Email 未確認');
    }
    if (!profile || profile.role !== 'SUPER_ADMIN') {
        issues.push('user_profiles 角色設定不正確');
    }
    if (signInError) {
        issues.push('無法使用提供的密碼登入');
    }

    if (issues.length === 0) {
        console.log('✅ 所有檢查都通過！如果仍無法登入，請檢查：');
        console.log('   1. 環境變數 NEXT_PUBLIC_SUPABASE_URL 是否正確');
        console.log('   2. 瀏覽器是否清除了 cookies');
        console.log('   3. 是否有其他中間件或防火牆阻擋');
    } else {
        console.log('⚠️  發現以下問題：');
        issues.forEach((issue, idx) => {
            console.log(`   ${idx + 1}. ${issue}`);
        });
        console.log('\n💡 建議執行修復腳本：');
        console.log('   npx ts-node scripts/fix-admin-account.ts');
    }
}

diagnoseAdminAccount().catch(err => {
    console.error('❌ 診斷過程發生錯誤:', err);
    process.exit(1);
});
