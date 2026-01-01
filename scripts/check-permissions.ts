/**
 * 權限保護靜態檢查腳本
 * 檢查所有 API 路由是否正確實作權限檢查
 * 
 * 使用方式: npx tsx scripts/check-permissions.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface RouteCheck {
  file: string;
  hasAuth: boolean;
  hasPermissionCheck: boolean;
  methods: string[];
  issues: string[];
}

const results: RouteCheck[] = [];

/**
 * 檢查檔案內容
 */
function checkFile(filePath: string): RouteCheck | null {
  const content = fs.readFileSync(filePath, 'utf-8');

  // 跳過非 API 路由檔案
  if (!filePath.includes('/api/') || !filePath.endsWith('route.ts')) {
    return null;
  }

  const check: RouteCheck = {
    file: filePath,
    hasAuth: false,
    hasPermissionCheck: false,
    methods: [],
    issues: [],
  };

  // 檢查是否有導出 HTTP 方法
  const hasGet = content.includes('export async function GET');
  const hasPost = content.includes('export async function POST');
  const hasPut = content.includes('export async function PUT');
  const hasDelete = content.includes('export async function DELETE');
  const hasPatch = content.includes('export async function PATCH');

  if (hasGet) check.methods.push('GET');
  if (hasPost) check.methods.push('POST');
  if (hasPut) check.methods.push('PUT');
  if (hasDelete) check.methods.push('DELETE');
  if (hasPatch) check.methods.push('PATCH');

  // 如果沒有 HTTP 方法，跳過
  if (check.methods.length === 0) {
    return null;
  }

  // 檢查是否有身份驗證
  const authPatterns = [
    /getCurrentUserProfile/,
    /supabase\.auth\.getUser/,
    /AuthenticationError/,
  ];

  check.hasAuth = authPatterns.some((pattern) => pattern.test(content));

  // 檢查是否有權限檢查
  const permissionPatterns = [
    /requireRole/,
    /requireAdmin/,
    /requireSuperAdmin/,
    /canAccessAgent/,
    /canDeleteFile/,
    /canModifyUser/,
    /hasRole/,
    /isAdmin/,
    /isSuperAdmin/,
  ];

  check.hasPermissionCheck = permissionPatterns.some((pattern) =>
    pattern.test(content)
  );

  // 檢查是否有從 permissions 模組匯入
  const hasPermissionImport = /from ['"]@\/lib\/permissions['"]/.test(content);

  // 特殊情況：健康檢查端點不需要驗證
  if (filePath.includes('/api/health')) {
    return null; // 跳過健康檢查
  }

  // 特殊情況：註冊和登入端點不需要權限檢查
  if (filePath.includes('/api/auth/register') || filePath.includes('/api/auth/login')) {
    return null;
  }

  // 檢查問題
  if (!check.hasAuth && check.methods.length > 0) {
    check.issues.push('缺少身份驗證檢查');
  }

  if (!check.hasPermissionCheck && check.hasAuth) {
    // 某些端點可能只需要身份驗證，不需要額外權限檢查
    // 但我們還是標記出來供審查
    if (!filePath.includes('/api/chat/feedback')) {
      check.issues.push('有身份驗證但缺少權限檢查（可能需要）');
    }
  }

  if (check.hasPermissionCheck && !hasPermissionImport) {
    check.issues.push('使用權限檢查但未從 @/lib/permissions 匯入');
  }

  return check;
}

/**
 * 遞迴讀取目錄
 */
function readDir(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 跳過 node_modules 和 .next
      if (!['node_modules', '.next', '.git'].includes(item)) {
        files.push(...readDir(fullPath));
      }
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 主函式
 */
function main() {
  console.log('🔍 開始檢查 API 路由的權限保護...\n');

  const apiDir = path.join(process.cwd(), 'app', 'api');
  const files = readDir(apiDir);

  console.log(`📁 找到 ${files.length} 個檔案\n`);

  for (const file of files) {
    const check = checkFile(file);
    if (check) {
      results.push(check);
    }
  }

  // 輸出結果
  console.log('='.repeat(80));
  console.log('📊 檢查結果');
  console.log('='.repeat(80));

  const routesWithIssues = results.filter((r) => r.issues.length > 0);
  const routesWithoutIssues = results.filter((r) => r.issues.length === 0);

  console.log(`\n✅ 無問題的路由: ${routesWithoutIssues.length}`);
  console.log(`⚠️  有問題的路由: ${routesWithIssues.length}`);
  console.log(`📋 總路由數: ${results.length}\n`);

  if (routesWithoutIssues.length > 0) {
    console.log('\n✅ 通過檢查的路由：\n');
    routesWithoutIssues.forEach((check) => {
      const relativePath = path.relative(process.cwd(), check.file);
      console.log(`  ✅ ${relativePath}`);
      console.log(`     方法: ${check.methods.join(', ')}`);
      console.log(`     身份驗證: ${check.hasAuth ? '✅' : '❌'}`);
      console.log(`     權限檢查: ${check.hasPermissionCheck ? '✅' : '⚠️'}`);
      console.log('');
    });
  }

  if (routesWithIssues.length > 0) {
    console.log('\n⚠️  需要檢查的路由：\n');
    routesWithIssues.forEach((check) => {
      const relativePath = path.relative(process.cwd(), check.file);
      console.log(`  ⚠️  ${relativePath}`);
      console.log(`     方法: ${check.methods.join(', ')}`);
      console.log(`     身份驗證: ${check.hasAuth ? '✅' : '❌'}`);
      console.log(`     權限檢查: ${check.hasPermissionCheck ? '✅' : '❌'}`);
      console.log(`     問題:`);
      check.issues.forEach((issue) => {
        console.log(`       - ${issue}`);
      });
      console.log('');
    });
  }

  // 總結
  console.log('='.repeat(80));
  if (routesWithIssues.length === 0) {
    console.log('✅ 所有路由都通過檢查！');
    process.exit(0);
  } else {
    console.log(`⚠️  發現 ${routesWithIssues.length} 個路由需要檢查`);
    console.log('   請根據上述問題進行修復');
    process.exit(1);
  }
}

main();
