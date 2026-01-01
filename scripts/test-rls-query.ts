/**
 * 測試 RLS 查詢行為
 * 模擬實際應用中的查詢邏輯
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ 缺少必要的環境變數');
    process.exit(1);
}

const ADMIN_EMAIL = 'siriue0@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1q2w3e4r5t';

async function testRLSQuery() {
    console.log('🔍 測試 RLS 查詢行為...\n');

    // 1. 使用 anon key 登入（模擬實際應用）
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: false
        }
    });

    console.log('1️⃣ 登入測試帳號...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });

    if (signInError || !signInData.user) {
        console.error('❌ 登入失敗:', signInError?.message);
        return;
    }

    console.log(`✅ 登入成功: ${signInData.user.email} (ID: ${signInData.user.id})\n`);

    // 2. 測試查詢自己的資料
    console.log('2️⃣ 測試查詢自己的資料...');
    const { data: myProfile, error: myProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', signInData.user.id)
        .single();

    if (myProfileError) {
        console.error('❌ 查詢自己的資料失敗:');
        console.error(`   錯誤代碼: ${myProfileError.code}`);
        console.error(`   錯誤訊息: ${myProfileError.message}`);
        console.error(`   詳細資訊: ${myProfileError.details || '無'}`);
        console.error(`   提示: ${myProfileError.hint || '無'}\n`);
    } else if (myProfile) {
        console.log('✅ 查詢自己的資料成功:');
        console.log(`   角色: ${myProfile.role}`);
        console.log(`   顯示名稱: ${myProfile.display_name}\n`);
    }

    // 3. 測試查詢所有使用者（SUPER_ADMIN 應該可以）
    console.log('3️⃣ 測試查詢所有使用者（SUPER_ADMIN 權限）...');
    const { data: allUsers, error: allUsersError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (allUsersError) {
        console.error('❌ 查詢所有使用者失敗:');
        console.error(`   錯誤代碼: ${allUsersError.code}`);
        console.error(`   錯誤訊息: ${allUsersError.message}`);
        console.error(`   詳細資訊: ${allUsersError.details || '無'}`);
        console.error(`   提示: ${allUsersError.hint || '無'}\n`);
    } else {
        console.log(`✅ 查詢所有使用者成功: 找到 ${allUsers?.length || 0} 個使用者`);
        if (allUsers && allUsers.length > 0) {
            console.log('   前 3 個使用者:');
            allUsers.slice(0, 3).forEach((u, i) => {
                console.log(`   ${i + 1}. ${u.email} (${u.role})`);
            });
        }
        console.log('');
    }

    // 4. 測試 is_super_admin() 函式
    console.log('4️⃣ 測試 is_super_admin() 函式...');
    const { data: functionTest, error: functionError } = await supabase.rpc('is_super_admin');

    if (functionError) {
        console.error('❌ 呼叫 is_super_admin() 失敗:', functionError.message);
    } else {
        console.log(`✅ is_super_admin() 結果: ${functionTest}`);
        if (myProfile?.role === 'SUPER_ADMIN' && !functionTest) {
            console.warn('⚠️  警告: 使用者角色是 SUPER_ADMIN，但 is_super_admin() 返回 false');
            console.warn('   這可能是 RLS 政策的問題！');
        }
    }

    console.log('\n📋 總結：');
    if (myProfileError) {
        console.log('   ❌ 查詢自己的資料失敗 - RLS 政策「使用者可讀取自己的資料」可能沒有匹配');
    }
    if (allUsersError || (allUsers && allUsers.length === 0)) {
        console.log('   ❌ 查詢所有使用者失敗或返回空陣列 - RLS 政策「超級管理員可讀取所有使用者」可能沒有匹配');
    }
    if (!myProfileError && !allUsersError && allUsers && allUsers.length > 0) {
        console.log('   ✅ 所有測試通過！RLS 政策運作正常');
    }
}

testRLSQuery().catch(err => {
    console.error('❌ 執行失敗:', err);
    process.exit(1);
});
