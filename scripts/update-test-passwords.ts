/**
 * 更新所有測試帳號的密碼（除了 SUPER_ADMIN）
 * 將所有測試帳號密碼改為 azsxdcfv
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

const NEW_PASSWORD = 'azsxdcfv';
const SUPER_ADMIN_EMAIL = 'siriue0@gmail.com';

// 測試帳號列表（除了 SUPER_ADMIN）
const TEST_ACCOUNTS = [
    'deptadmin-a@test.com',
    'deptadmin-b@test.com',
    'editor-a@test.com',
    'editor-b@test.com',
    'user-a@test.com',
    'user-b@test.com',
];

async function updateTestPasswords() {
    console.log('🔐 開始更新測試帳號密碼...\n');
    console.log(`📋 目標密碼: ${NEW_PASSWORD}`);
    console.log(`🚫 排除帳號: ${SUPER_ADMIN_EMAIL} (保持原密碼)\n`);

    // 取得所有使用者
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('❌ 無法查詢使用者列表:', listError.message);
        process.exit(1);
    }

    let successCount = 0;
    let failCount = 0;
    const results: Array<{ email: string; status: string; message: string }> = [];

    // 更新每個測試帳號的密碼
    for (const email of TEST_ACCOUNTS) {
        const user = listData.users.find(u => u.email === email);

        if (!user) {
            console.log(`⚠️  找不到帳號: ${email} (跳過)`);
            results.push({ email, status: '跳過', message: '帳號不存在' });
            continue;
        }

        console.log(`🔄 更新 ${email}...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            password: NEW_PASSWORD,
        });

        if (updateError) {
            console.error(`   ❌ 更新失敗: ${updateError.message}`);
            results.push({ email, status: '失敗', message: updateError.message });
            failCount++;
        } else {
            console.log(`   ✅ 密碼已更新`);
            results.push({ email, status: '成功', message: '' });
            successCount++;
        }
    }

    // 驗證更新結果
    console.log('\n🔍 驗證更新結果...\n');
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey || !SUPABASE_URL) {
        console.error('❌ 缺少環境變數: NEXT_PUBLIC_SUPABASE_ANON_KEY 或 NEXT_PUBLIC_SUPABASE_URL');
        process.exit(1);
    }
    const testSupabase = createClient(SUPABASE_URL, anonKey);
    
    for (const email of TEST_ACCOUNTS) {
        const { error: signInError } = await testSupabase.auth.signInWithPassword({
            email,
            password: NEW_PASSWORD,
        });

        if (signInError) {
            console.log(`❌ ${email}: 登入測試失敗 - ${signInError.message}`);
        } else {
            console.log(`✅ ${email}: 登入測試成功`);
        }
    }

    // 顯示總結
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 更新結果總結：\n');
    console.log(`✅ 成功更新: ${successCount} 個帳號`);
    console.log(`❌ 更新失敗: ${failCount} 個帳號`);
    console.log(`🚫 跳過 (不存在): ${results.filter(r => r.status === '跳過').length} 個帳號`);

    if (results.length > 0) {
        console.log('\n📋 詳細結果：');
        for (const result of results) {
            const icon = result.status === '成功' ? '✅' : result.status === '失敗' ? '❌' : '⚠️';
            console.log(`  ${icon} ${result.email}: ${result.status}${result.message ? ` - ${result.message}` : ''}`);
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✨ 密碼更新完成！');
    console.log(`\n📝 現在所有測試帳號（除了 ${SUPER_ADMIN_EMAIL}）的密碼都是: ${NEW_PASSWORD}`);
    console.log(`   您的管理員帳號密碼保持為: 1q2w3e4r5t\n`);
}

updateTestPasswords().catch(err => {
    console.error('❌ 執行失敗:', err);
    process.exit(1);
});
