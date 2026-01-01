/**
 * 驗證 RLS 完整性
 * 檢查所有必要的 RLS 政策是否都存在
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

// 預期的 RLS 政策（根據 migration 檔案）
const expectedPolicies: Record<string, string[]> = {
    'user_profiles': [
        '使用者可讀取自己的資料',
        '使用者可更新自己的資料',
        '超級管理員可讀取所有使用者',
        '部門管理員可讀取部門成員'
    ],
    'departments': [
        '使用者可讀取部門',
        '超級管理員可管理部門'
    ],
    'files': [
        '使用者可上傳檔案',
        '上傳者可更新自己的檔案',
        '上傳者可刪除自己的檔案',
        '超級管理員可看所有檔案',
        '部門管理員可看部門檔案',
        '編輯者可看授權檔案'
    ],
    'file_tags': [
        '使用者可讀取標籤',
        '管理員可管理標籤',
        '上傳者可管理標籤'
    ],
    'user_tag_permissions': [
        '使用者可讀取自己的標籤權限',
        '管理員可讀取所有標籤權限',
        '管理員可管理標籤權限'
    ],
    'agents': [
        '使用者可看授權的 Agent',
        '建立者可更新自己的 Agent',
        '管理員可建立 Agent'
    ],
    'agent_prompt_versions': [
        '使用者可讀取授權 Agent 的版本歷史',
        '管理員可建立版本歷史'
    ],
    'agent_knowledge_rules': [
        '使用者可讀取 Agent 規則',
        '管理員可管理 Agent 規則'
    ],
    'agent_access_control': [
        '管理員可管理存取控制'
    ],
    'chat_sessions': [
        '使用者可看自己的對話',
        '使用者可建立自己的對話',
        '使用者可更新自己的對話',
        '使用者可刪除自己的對話'
    ],
    'chat_messages': [
        '使用者可看自己對話的訊息',
        '使用者可建立訊息'
    ],
    'chat_feedback': [
        '使用者可讀取自己的回饋',
        '使用者可建立自己的回饋',
        '使用者可更新自己的回饋',
        '管理員可讀取所有回饋'
    ],
    'audit_logs': [
        '管理員可看稽核日誌'
    ],
    'user_favorites': [
        'Users can view own favorites',
        'Users can add own favorites',
        'Users can remove own favorites'
    ]
};

async function verifyRLS() {
    console.log('🔍 驗證 RLS 完整性...\n');

    // 取得所有 RLS 政策
    const { data: policies, error } = await supabase.rpc('exec_sql', {
        query: `
            SELECT 
                tablename,
                policyname,
                cmd
            FROM pg_policies
            WHERE schemaname = 'public'
            ORDER BY tablename, cmd, policyname;
        `
    }).then(r => r.data).catch(() => null);

    if (!policies) {
        console.log('⚠️  無法直接查詢 policies，請使用 Supabase Dashboard SQL Editor：');
        console.log(`
        SELECT 
            tablename,
            policyname,
            cmd
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, cmd, policyname;
        `);
        return;
    }

    // 按表分組
    const actualPolicies: Record<string, Set<string>> = {};
    for (const policy of policies) {
        if (!actualPolicies[policy.tablename]) {
            actualPolicies[policy.tablename] = new Set();
        }
        actualPolicies[policy.tablename].add(policy.policyname);
    }

    // 對比預期和實際
    let allMatch = true;
    for (const [table, expected] of Object.entries(expectedPolicies)) {
        const actual = actualPolicies[table] || new Set();
        const missing = expected.filter(p => !actual.has(p));
        const extra = Array.from(actual).filter(p => !expected.includes(p));

        if (missing.length > 0 || extra.length > 0) {
            allMatch = false;
            console.log(`\n📊 ${table}:`);
            if (missing.length > 0) {
                console.log(`   ❌ 缺少政策: ${missing.join(', ')}`);
            }
            if (extra.length > 0) {
                console.log(`   ⚠️  額外政策: ${extra.join(', ')}`);
            }
        } else {
            console.log(`✅ ${table}: 所有政策都存在`);
        }
    }

    if (allMatch) {
        console.log('\n✅ 所有 RLS 政策都完整！');
    } else {
        console.log('\n⚠️  發現差異，請檢查上述內容');
    }
}

verifyRLS().catch(err => {
    console.error('❌ 執行失敗:', err);
    process.exit(1);
});
