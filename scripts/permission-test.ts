/**
 * 權限測試腳本
 * 自動測試所有 API 端點的權限保護
 * 
 * 使用方式：
 * 1. 確保應用程式正在運行 (npm run dev)
 * 2. 執行: npx tsx scripts/permission-test.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// 載入環境變數
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// 從環境變數讀取配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ 請設定環境變數：NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// 測試結果介面
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  statusCode?: number;
  response?: unknown;
}

const results: TestResult[] = [];

/**
 * 執行 API 測試
 */
async function testApi(
  name: string,
  method: string,
  endpoint: string,
  token: string | null,
  body?: unknown,
  expectedStatus: number = 200
): Promise<TestResult> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${APP_URL}${endpoint}`, options);
    const data = await response.json().catch(() => ({}));

    const passed = response.status === expectedStatus;

    return {
      name,
      passed,
      statusCode: response.status,
      response: data,
      error: passed ? undefined : `預期狀態碼 ${expectedStatus}，實際為 ${response.status}`,
    };
  } catch (error) {
    return {
      name,
      passed: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    };
  }
}

/**
 * 取得使用者 Token
 */
async function getUserToken(email: string, password: string): Promise<string | null> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      console.error(`❌ 無法登入 ${email}:`, error?.message);
      return null;
    }

    return data.session.access_token;
  } catch (error) {
    console.error(`❌ 登入錯誤 ${email}:`, error);
    return null;
  }
}

/**
 * 執行測試套件
 */
async function runTests() {
  console.log('🚀 開始執行權限測試...\n');
  console.log(`📡 API URL: ${APP_URL}`);
  console.log(`🔗 Supabase URL: ${SUPABASE_URL}\n`);

  // 注意：這些測試帳號需要在資料庫中預先建立
  // 請根據您的實際測試帳號修改以下資訊
  const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

  const testAccounts = {
    superAdmin: {
      email: process.env.SUPER_ADMIN_EMAIL || 'siriue0@gmail.com',
      password: process.env.SUPER_ADMIN_PASSWORD || TEST_PASSWORD,
    },
    deptAdmin: {
      email: 'deptadmin-a@test.com',
      password: TEST_PASSWORD,
    },
    editor: {
      email: 'editor-a@test.com',
      password: TEST_PASSWORD,
    },
    user: {
      email: 'user-a@test.com',
      password: TEST_PASSWORD,
    },
  };

  // 取得各角色的 Token
  console.log('🔐 正在取得測試帳號 Token...\n');
  const tokens = {
    superAdmin: await getUserToken(testAccounts.superAdmin.email, testAccounts.superAdmin.password),
    deptAdmin: await getUserToken(testAccounts.deptAdmin.email, testAccounts.deptAdmin.password),
    editor: await getUserToken(testAccounts.editor.email, testAccounts.editor.password),
    user: await getUserToken(testAccounts.user.email, testAccounts.user.password),
  };

  // 檢查是否有 Token 取得失敗
  const missingTokens = Object.entries(tokens)
    .filter(([_, token]) => !token)
    .map(([role]) => role);

  if (missingTokens.length > 0) {
    console.error(`❌ 以下角色的 Token 取得失敗：${missingTokens.join(', ')}`);
    console.error('   請確認測試帳號已建立且密碼正確\n');
    return;
  }

  console.log('✅ 所有測試帳號 Token 已取得\n');
  console.log('='.repeat(60));
  console.log('開始執行測試案例...\n');

  // ============================================
  // 1. 系統設定 API 測試（僅 SUPER_ADMIN）
  // ============================================
  console.log('\n📋 測試 1: 系統設定 API');
  console.log('-'.repeat(60));

  // SUPER_ADMIN 應該可以存取
  results.push(
    await testApi(
      'SUPER_ADMIN 存取 /api/system/config',
      'GET',
      '/api/system/config',
      tokens.superAdmin,
      undefined,
      200
    )
  );

  // DEPT_ADMIN 應該被拒絕
  results.push(
    await testApi(
      'DEPT_ADMIN 存取 /api/system/config (應被拒絕)',
      'GET',
      '/api/system/config',
      tokens.deptAdmin,
      undefined,
      403
    )
  );

  // EDITOR 應該被拒絕
  results.push(
    await testApi(
      'EDITOR 存取 /api/system/config (應被拒絕)',
      'GET',
      '/api/system/config',
      tokens.editor,
      undefined,
      403
    )
  );

  // USER 應該被拒絕
  results.push(
    await testApi(
      'USER 存取 /api/system/config (應被拒絕)',
      'GET',
      '/api/system/config',
      tokens.user,
      undefined,
      403
    )
  );

  // ============================================
  // 2. Agent 管理 API 測試
  // ============================================
  console.log('\n📋 測試 2: Agent 管理 API');
  console.log('-'.repeat(60));

  // 所有角色都應該可以查看 Agent 列表
  results.push(
    await testApi(
      'SUPER_ADMIN 查看 Agent 列表',
      'GET',
      '/api/agents',
      tokens.superAdmin,
      undefined,
      200
    )
  );

  results.push(
    await testApi(
      'USER 查看 Agent 列表',
      'GET',
      '/api/agents',
      tokens.user,
      undefined,
      200
    )
  );

  // 只有管理員可以建立 Agent
  results.push(
    await testApi(
      'SUPER_ADMIN 建立 Agent',
      'POST',
      '/api/agents',
      tokens.superAdmin,
      {
        name: '測試 Agent',
        system_prompt: '你是一個測試 Agent',
        model_version: 'gemini-2.5-flash',
      },
      201
    )
  );

  results.push(
    await testApi(
      'DEPT_ADMIN 建立 Agent',
      'POST',
      '/api/agents',
      tokens.deptAdmin,
      {
        name: '測試 Agent 2',
        system_prompt: '你是一個測試 Agent',
        model_version: 'gemini-2.5-flash',
      },
      201
    )
  );

  results.push(
    await testApi(
      'EDITOR 建立 Agent (應被拒絕)',
      'POST',
      '/api/agents',
      tokens.editor,
      {
        name: '測試 Agent 3',
        system_prompt: '你是一個測試 Agent',
        model_version: 'gemini-2.5-flash',
      },
      403
    )
  );

  results.push(
    await testApi(
      'USER 建立 Agent (應被拒絕)',
      'POST',
      '/api/agents',
      tokens.user,
      {
        name: '測試 Agent 4',
        system_prompt: '你是一個測試 Agent',
        model_version: 'gemini-2.5-flash',
      },
      403
    )
  );

  // ============================================
  // 3. 檔案管理 API 測試
  // ============================================
  console.log('\n📋 測試 3: 檔案管理 API');
  console.log('-'.repeat(60));

  // 只有 EDITOR 以上可以上傳檔案
  results.push(
    await testApi(
      'EDITOR 查看檔案列表',
      'GET',
      '/api/files',
      tokens.editor,
      undefined,
      200
    )
  );

  results.push(
    await testApi(
      'USER 查看檔案列表 (應被拒絕或僅看到自己的)',
      'GET',
      '/api/files',
      tokens.user,
      undefined,
      200 // 或 403，取決於實作
    )
  );

  // ============================================
  // 4. 未登入測試
  // ============================================
  console.log('\n📋 測試 4: 未登入保護');
  console.log('-'.repeat(60));

  results.push(
    await testApi(
      '未登入存取 /api/agents (應被拒絕)',
      'GET',
      '/api/agents',
      null,
      undefined,
      401
    )
  );

  results.push(
    await testApi(
      '未登入存取 /api/system/config (應被拒絕)',
      'GET',
      '/api/system/config',
      null,
      undefined,
      401
    )
  );

  // ============================================
  // 5. 健康檢查端點（應該公開）
  // ============================================
  console.log('\n📋 測試 5: 公開端點');
  console.log('-'.repeat(60));

  results.push(
    await testApi(
      '未登入存取 /api/health (應成功)',
      'GET',
      '/api/health',
      null,
      undefined,
      200
    )
  );

  // ============================================
  // 輸出測試結果
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 測試結果總結');
  console.log('='.repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`\n總測試數: ${total}`);
  console.log(`✅ 通過: ${passed}`);
  console.log(`❌ 失敗: ${failed}`);
  console.log(`📈 通過率: ${((passed / total) * 100).toFixed(1)}%\n`);

  // 顯示失敗的測試
  if (failed > 0) {
    console.log('❌ 失敗的測試案例：\n');
    results
      .filter((r) => !r.passed)
      .forEach((result) => {
        console.log(`  - ${result.name}`);
        console.log(`    錯誤: ${result.error}`);
        if (result.statusCode) {
          console.log(`    狀態碼: ${result.statusCode}`);
        }
        if (result.statusCode === 500 && result.response) {
          console.log(`    回應內容: ${JSON.stringify(result.response, null, 2)}`);
        }
        console.log('');
      });
  }

  // 顯示所有測試詳情
  console.log('\n📋 詳細測試結果：\n');
  results.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${index + 1}. ${icon} ${result.name}`);
    if (result.statusCode) {
      console.log(`   狀態碼: ${result.statusCode}`);
    }
    if (result.error) {
      console.log(`   錯誤: ${result.error}`);
    }
  });

  // 返回退出碼
  process.exit(failed > 0 ? 1 : 0);
}

// 執行測試
runTests().catch((error) => {
  console.error('❌ 測試執行失敗:', error);
  process.exit(1);
});
