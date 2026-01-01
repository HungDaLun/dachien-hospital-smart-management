/**
 * 修復 SUPER_ADMIN 帳號
 * 建立或重置管理員帳號
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
const ADMIN_DISPLAY_NAME = '系統管理員';

async function fixAdminAccount() {
    console.log('🔧 開始修復 SUPER_ADMIN 帳號...\n');

    // 1. 檢查使用者是否存在
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existingUser = listData.users.find(u => u.email === ADMIN_EMAIL);

    let userId: string;

    if (existingUser) {
        console.log(`ℹ️  找到現有使用者: ${ADMIN_EMAIL}`);
        userId = existingUser.id;

        // 更新密碼和確認 email
        console.log('   - 更新密碼...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: ADMIN_PASSWORD,
            email_confirm: true, // 確認 email
        });

        if (updateError) {
            console.error(`   ❌ 更新失敗: ${updateError.message}`);
            process.exit(1);
        }
        console.log('   ✅ 密碼已更新，Email 已確認');
    } else {
        console.log(`➕ 建立新使用者: ${ADMIN_EMAIL}`);
        const { data: authData, error: createError } = await supabase.auth.admin.createUser({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            email_confirm: true, // 建立時就確認 email
        });

        if (createError) {
            console.error(`❌ 建立失敗: ${createError.message}`);
            process.exit(1);
        }

        userId = authData.user.id;
        console.log(`✅ 使用者已建立 (ID: ${userId})`);
    }

    // 2. 確保 user_profiles 存在且角色正確
    console.log('\n📝 檢查 user_profiles 記錄...');
    const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (existingProfile) {
        console.log('   - 找到現有 profile，更新角色...');
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
                role: 'SUPER_ADMIN',
                email: ADMIN_EMAIL,
                display_name: ADMIN_DISPLAY_NAME,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

        if (updateError) {
            console.error(`   ❌ 更新失敗: ${updateError.message}`);
            process.exit(1);
        }
        console.log('   ✅ Profile 已更新');
    } else {
        console.log('   - 建立新的 profile...');
        const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
                id: userId,
                email: ADMIN_EMAIL,
                display_name: ADMIN_DISPLAY_NAME,
                role: 'SUPER_ADMIN',
            });

        if (insertError) {
            console.error(`   ❌ 建立失敗: ${insertError.message}`);
            process.exit(1);
        }
        console.log('   ✅ Profile 已建立');
    }

    // 3. 驗證登入
    console.log('\n🔐 驗證更新結果...');
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey || !SUPABASE_URL) {
        console.error('❌ 缺少環境變數: NEXT_PUBLIC_SUPABASE_ANON_KEY 或 NEXT_PUBLIC_SUPABASE_URL');
        process.exit(1);
    }
    const testSupabase = createClient(SUPABASE_URL, anonKey);
    const { data: signInData, error: signInError } = await testSupabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });

    if (signInError) {
        console.error(`❌ 登入測試失敗: ${signInError.message}`);
        console.log('\n⚠️  帳號已修復，但登入測試失敗。請檢查：');
        console.log('   1. 環境變數 NEXT_PUBLIC_SUPABASE_ANON_KEY 是否正確');
        console.log('   2. Supabase 專案設定是否正確');
        process.exit(1);
    }

    console.log('✅ 登入測試成功！');
    console.log(`   - Session Token: ${signInData.session?.access_token.substring(0, 30)}...`);

    // 4. 驗證角色
    console.log('\n👤 驗證角色設定...');
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, display_name')
        .eq('id', userId)
        .single();

    if (profile?.role === 'SUPER_ADMIN') {
        console.log(`✅ 角色設定正確: ${profile.role}`);
        console.log(`   - 顯示名稱: ${profile.display_name}`);
    } else {
        console.error(`❌ 角色設定不正確: ${profile?.role || '未找到'}`);
        process.exit(1);
    }

    console.log('\n✨ SUPER_ADMIN 帳號修復完成！');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 密碼: ${ADMIN_PASSWORD}`);
    console.log(`\n現在您可以使用此帳號登入系統了。`);
}

fixAdminAccount().catch(err => {
    console.error('❌ 修復過程發生錯誤:', err);
    process.exit(1);
});
