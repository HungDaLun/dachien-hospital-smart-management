/**
 * 檢查使用者 profile 是否存在
 * 如果不存在則建立
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

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const ADMIN_EMAIL = 'siriue0@gmail.com';

async function checkAndFixUserProfile() {
    console.log('🔍 檢查使用者 profile...\n');

    // 1. 查找 auth 使用者
    const { data: listData } = await supabase.auth.admin.listUsers();
    const user = listData?.users.find(u => u.email === ADMIN_EMAIL);

    if (!user) {
        console.error(`❌ 找不到使用者: ${ADMIN_EMAIL}`);
        process.exit(1);
    }

    console.log(`✅ 找到 auth 使用者: ${user.email} (ID: ${user.id})\n`);

    // 2. 檢查 user_profiles
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        if (profileError.code === 'PGRST116') {
            console.log('❌ user_profiles 中沒有對應的記錄');
            console.log('   正在建立 user_profiles 記錄...\n');

            // 建立 user_profiles 記錄
            const { data: newProfile, error: insertError } = await supabase
                .from('user_profiles')
                .insert({
                    id: user.id,
                    email: user.email || ADMIN_EMAIL,
                    display_name: '系統管理員',
                    role: 'SUPER_ADMIN',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (insertError) {
                console.error('❌ 建立 user_profiles 失敗:', insertError);
                process.exit(1);
            }

            console.log('✅ user_profiles 記錄已建立:');
            console.log(`   - ID: ${newProfile.id}`);
            console.log(`   - Email: ${newProfile.email}`);
            console.log(`   - 角色: ${newProfile.role}`);
            console.log(`   - 顯示名稱: ${newProfile.display_name}`);
        } else {
            console.error('❌ 查詢 user_profiles 失敗:', profileError);
            process.exit(1);
        }
    } else {
        console.log('✅ user_profiles 記錄已存在:');
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - Email: ${profile.email}`);
        console.log(`   - 角色: ${profile.role}`);
        console.log(`   - 顯示名稱: ${profile.display_name}`);

        // 檢查角色是否正確
        if (profile.role !== 'SUPER_ADMIN') {
            console.log('\n⚠️  角色不是 SUPER_ADMIN，正在更新...');
            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({ role: 'SUPER_ADMIN', updated_at: new Date().toISOString() })
                .eq('id', user.id);

            if (updateError) {
                console.error('❌ 更新角色失敗:', updateError);
                process.exit(1);
            }
            console.log('✅ 角色已更新為 SUPER_ADMIN');
        }
    }

    // 3. 最終驗證
    console.log('\n🔍 最終驗證...');
    const { data: finalProfile, error: finalError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (finalError || !finalProfile) {
        console.error('❌ 驗證失敗:', finalError);
        process.exit(1);
    }

    console.log('✅ 驗證通過！');
    console.log(`   帳號: ${finalProfile.email}`);
    console.log(`   角色: ${finalProfile.role}`);
    console.log(`   顯示名稱: ${finalProfile.display_name}`);
}

checkAndFixUserProfile().catch(err => {
    console.error('❌ 執行失敗:', err);
    process.exit(1);
});
