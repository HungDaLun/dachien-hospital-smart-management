/**
 * 列出所有測試帳號與密碼一覽表
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

async function listTestAccounts() {
    console.log('📋 測試帳號與密碼一覽表\n');
    console.log('=' .repeat(80));

    // 取得所有使用者
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('❌ 無法查詢使用者列表:', listError.message);
        process.exit(1);
    }

    // 測試帳號列表（根據 setup-test-accounts.ts 定義）
    const testEmails = [
        'siriue0@gmail.com',
        'deptadmin-a@test.com',
        'deptadmin-b@test.com',
        'editor-a@test.com',
        'editor-b@test.com',
        'user-a@test.com',
        'user-b@test.com',
    ];

    // 取得 user_profiles 資料
    const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, email, display_name, role, department_id')
        .in('email', testEmails);

    if (profilesError) {
        console.error('❌ 無法查詢 user_profiles:', profilesError.message);
        process.exit(1);
    }

    // 建立 email -> profile 的對應
    const profileMap = new Map(profiles?.map(p => [p.email, p]) || []);

    // 建立 email -> department 的對應（需要查詢 departments）
    const deptIds = [...new Set(profiles?.map(p => p.department_id).filter(Boolean) || [])];
    let deptMap = new Map();
    if (deptIds.length > 0) {
        const { data: departments } = await supabase
            .from('departments')
            .select('id, name')
            .in('id', deptIds);
        deptMap = new Map(departments?.map(d => [d.id, d.name]) || []);
    }

    console.log('\n帳號類型說明：');
    console.log('  - SUPER_ADMIN: 超級管理員（您的帳號）');
    console.log('  - DEPT_ADMIN: 部門管理員');
    console.log('  - EDITOR: 知識維護者');
    console.log('  - USER: 一般使用者\n');

    console.log('=' .repeat(80));
    console.log('\n🔐 測試帳號列表：\n');

    // 先列出 SUPER_ADMIN（您的帳號）
    const superAdminEmail = 'siriue0@gmail.com';
    const superAdmin = listData.users.find(u => u.email === superAdminEmail);
    const superAdminProfile = profileMap.get(superAdminEmail);

    if (superAdmin) {
        console.log('【您的管理員帳號】');
        console.log(`  帳號: ${superAdminEmail}`);
        console.log(`  密碼: 1q2w3e4r5t`);
        console.log(`  角色: ${superAdminProfile?.role || '未設定'}`);
        console.log(`  顯示名稱: ${superAdminProfile?.display_name || '未設定'}`);
        console.log(`  Email 確認: ${superAdmin.email_confirmed_at ? '✅' : '❌'}`);
        console.log(`  建立時間: ${new Date(superAdmin.created_at).toLocaleString('zh-TW')}`);
        console.log('');
    }

    // 列出其他測試帳號
    const otherTestEmails = testEmails.filter(email => email !== superAdminEmail);
    const testAccounts = otherTestEmails.map(email => {
        const user = listData.users.find(u => u.email === email);
        const profile = profileMap.get(email);
        return { email, user, profile };
    });

    // 依角色分組顯示
    const roles = ['DEPT_ADMIN', 'EDITOR', 'USER'];
    const roleNames: Record<string, string> = {
        'DEPT_ADMIN': '部門管理員',
        'EDITOR': '知識維護者',
        'USER': '一般使用者',
    };

    for (const role of roles) {
        const accountsInRole = testAccounts.filter(a => a.profile?.role === role);
        if (accountsInRole.length === 0) continue;

        console.log(`【${roleNames[role]}】`);
        for (const { email, user, profile } of accountsInRole) {
            const deptName = profile?.department_id ? deptMap.get(profile.department_id) : '';
            console.log(`  帳號: ${email}`);
            console.log(`  密碼: azsxdcfv`);
            console.log(`  顯示名稱: ${profile?.display_name || '未設定'}`);
            if (deptName) {
                console.log(`  部門: ${deptName}`);
            }
            console.log(`  Email 確認: ${user?.email_confirmed_at ? '✅' : '❌'}`);
            console.log('');
        }
    }

    // 檢查是否有不在列表中的測試帳號
    const allTestUsers = listData.users.filter(u => 
        u.email && (testEmails.includes(u.email) || u.email.includes('@test.com'))
    );
    const unlistedTestUsers = allTestUsers.filter(u => u.email && !testEmails.includes(u.email));

    if (unlistedTestUsers.length > 0) {
        console.log('【其他測試帳號（未在標準列表中）】');
        for (const user of unlistedTestUsers) {
            if (!user.email) continue;
            const profile = profileMap.get(user.email);
            console.log(`  帳號: ${user.email}`);
            console.log(`  角色: ${profile?.role || '未設定'}`);
            console.log(`  Email 確認: ${user.email_confirmed_at ? '✅' : '❌'}`);
            console.log('');
        }
    }

    console.log('=' .repeat(80));
    console.log('\n📝 備註：');
    console.log('  - 您的管理員帳號 (siriue0@gmail.com) 密碼保持為: 1q2w3e4r5t');
    console.log('  - 其他測試帳號密碼皆為: azsxdcfv');
    console.log('');
}

listTestAccounts().catch(err => {
    console.error('❌ 執行失敗:', err);
    process.exit(1);
});
