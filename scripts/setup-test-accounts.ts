
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

const TEST_PASSWORD = 'TestPassword123!';

async function setupTestData() {
    console.log('🚀 開始建立測試資料...');

    // 1. 建立測試部門
    console.log('\n🏢 正在建立測試部門...');
    const departments = [
        { name: '部門 A', description: '測試部門 A' },
        { name: '部門 B', description: '測試部門 B' }
    ];

    const deptMap: Record<string, string> = {};

    for (const dept of departments) {
        const { data, error } = await supabase
            .from('departments')
            .upsert({ name: dept.name, description: dept.description }, { onConflict: 'name' })
            .select()
            .single();

        if (error) {
            console.error(`❌ 建立部門 ${dept.name} 失敗:`, error.message);
        } else {
            console.log(`✅ 部門 ${dept.name} 已建立 (ID: ${data.id})`);
            deptMap[dept.name] = data.id;
        }
    }

    // 2. 建立測試使用者
    console.log('\n👤 正在建立測試使用者...');
    const testUsers = [
        { email: 'deptadmin-a@test.com', role: 'DEPT_ADMIN', department: '部門 A', displayName: '部門 A 管理員' },
        { email: 'deptadmin-b@test.com', role: 'DEPT_ADMIN', department: '部門 B', displayName: '部門 B 管理員' },
        { email: 'editor-a@test.com', role: 'EDITOR', department: '部門 A', displayName: '部門 A 編輯者' },
        { email: 'editor-b@test.com', role: 'EDITOR', department: '部門 B', displayName: '部門 B 編輯者' },
        { email: 'user-a@test.com', role: 'USER', department: '部門 A', displayName: '部門 A 使用者' },
        { email: 'user-b@test.com', role: 'USER', department: '部門 B', displayName: '部門 B 使用者' }
    ];

    for (const user of testUsers) {
        let currentUserId: string | undefined;

        // 建立 Auth 使用者
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: TEST_PASSWORD,
            email_confirm: true
        });

        if (authError) {
            if (authError.message.toLowerCase().includes('already') || authError.message.toLowerCase().includes('registered')) {
                console.log(`ℹ️ 使用者 ${user.email} 已存在，正在獲取 ID...`);
                // 取得現有使用者 ID
                const { data: listData } = await supabase.auth.admin.listUsers();
                const existingUser = listData.users.find(u => u.email === user.email);
                if (existingUser) {
                    currentUserId = existingUser.id;
                }
            } else {
                console.error(`❌ 建立使用者 ${user.email} 失敗:`, authError.message);
            }
        } else {
            console.log(`✅ 使用者 ${user.email} 已建立`);
            currentUserId = authData.user.id;
        }

        if (currentUserId) {
            // 確保密碼也是最新的
            await supabase.auth.admin.updateUserById(currentUserId, { password: TEST_PASSWORD });
            await updateProfile(currentUserId, user, deptMap[user.department]);
        }
    }

    // 確保 SUPER_ADMIN 角色與密碼一致
    console.log('\n🔑 確保 SUPER_ADMIN 角色與密碼...');
    const superAdminEmail = 'siriue0@gmail.com';

    // 查找 Auth 使用者
    const { data: listData } = await supabase.auth.admin.listUsers();
    const superAdminAuth = listData.users.find(u => u.email === superAdminEmail);

    if (superAdminAuth) {
        // 更新密碼
        const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
            superAdminAuth.id,
            { password: TEST_PASSWORD }
        );

        if (authUpdateError) {
            console.error(`❌ 更新 SUPER_ADMIN 密碼失敗:`, authUpdateError.message);
        } else {
            console.log(`✅ SUPER_ADMIN 密碼已更新`);
        }

        // 更新 Profile 角色
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ role: 'SUPER_ADMIN' })
            .eq('id', superAdminAuth.id);

        if (updateError) {
            console.error(`❌ 更新 SUPER_ADMIN 角色失敗:`, updateError.message);
        } else {
            console.log(`✅ SUPER_ADMIN 角色已確認`);
        }
    } else {
        console.log(`⚠️ 找不到 SUPER_ADMIN (${superAdminEmail})，正在建立...`);
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: superAdminEmail,
            password: TEST_PASSWORD,
            email_confirm: true
        });

        if (authError) {
            console.error(`❌ 建立 SUPER_ADMIN 失敗:`, authError.message);
        } else {
            console.log(`✅ SUPER_ADMIN 已建立`);
            await updateProfile(authData.user.id, { email: superAdminEmail, displayName: '超級管理員', role: 'SUPER_ADMIN', department: '' }, '');
        }
    }

    console.log('\n✨ 測試環境準備完成！');
    console.log(`🔑 測試帳號密碼皆為: ${TEST_PASSWORD}`);
}

async function updateProfile(userId: string, user: any, deptId: string) {
    const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
            id: userId,
            email: user.email,
            display_name: user.displayName,
            role: user.role,
            department_id: deptId
        });

    if (profileError) {
        console.error(`❌ 更新 ${user.email} Profile 失敗:`, profileError.message);
    } else {
        console.log(`✅ ${user.email} Profile 已更新 (角色: ${user.role}, 部門: ${user.department})`);
    }
}

setupTestData().catch(err => {
    console.error('❌ 執行失敗:', err);
    process.exit(1);
});
