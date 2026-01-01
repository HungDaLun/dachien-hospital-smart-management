/**
 * 測試使用者 profile 查詢
 * 模擬實際的查詢方式
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// 載入環境變數
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ 缺少必要的環境變數');
    process.exit(1);
}

const ADMIN_EMAIL = 'siriue0@gmail.com';
const ADMIN_PASSWORD = '1q2w3e4r5t';

async function testQuery() {
    console.log('🔍 測試使用者 profile 查詢...\n');

    // 1. 使用 anon key 登入（模擬實際應用）
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('1️⃣ 使用 anon key 登入...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });

    if (signInError || !signInData.user) {
        console.error('❌ 登入失敗:', signInError?.message);
        process.exit(1);
    }

    console.log(`✅ 登入成功: ${signInData.user.email} (ID: ${signInData.user.id})\n`);

    // 2. 查詢 user_profiles（使用與應用程式相同的方式）
    console.log('2️⃣ 查詢 user_profiles...');
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', signInData.user.id)
        .single();

    if (profileError) {
        console.error('❌ 查詢失敗:', profileError);
        console.error('   錯誤代碼:', profileError.code);
        console.error('   錯誤訊息:', profileError.message);
        console.error('   詳細資訊:', profileError.details);
        console.error('   提示:', profileError.hint);
        
        // 嘗試不使用 .single()
        console.log('\n3️⃣ 嘗試不使用 .single()...');
        const { data: profiles, error: listError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', signInData.user.id);
        
        if (listError) {
            console.error('❌ 列表查詢也失敗:', listError);
        } else {
            console.log('✅ 列表查詢成功，結果數量:', profiles?.length || 0);
            if (profiles && profiles.length > 0) {
                console.log('   結果:', profiles[0]);
            }
        }
    } else {
        console.log('✅ 查詢成功:');
        console.log(`   角色: ${profile.role}`);
        console.log(`   顯示名稱: ${profile.display_name}`);
        console.log(`   Email: ${profile.email}`);
    }
}

testQuery().catch(err => {
    console.error('❌ 執行失敗:', err);
    process.exit(1);
});
