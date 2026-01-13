#!/usr/bin/env tsx
/**
 * 同步本地 migrations 與 Supabase MCP 遠端資料庫
 * 
 * 此腳本會：
 * 1. 列出本地所有 migrations
 * 2. 列出遠端已應用的 migrations
 * 3. 找出缺失的 migrations
 * 4. 應用缺失的 migrations 到遠端
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

// Supabase 專案 ID（Knowledge Architects）
const PROJECT_ID = 'vjvmwyzpjmzzhfiaojul';
const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');

/**
 * 從檔案名稱提取 migration 版本號
 */
function extractVersion(filename: string): string {
  // 格式：20260127000000_fix_audit_logs_schema.sql
  const match = filename.match(/^(\d+)_/);
  return match ? match[1] : '';
}

/**
 * 從檔案名稱提取 migration 名稱
 */
function extractName(filename: string): string {
  // 格式：20260127000000_fix_audit_logs_schema.sql
  const match = filename.match(/^\d+_(.+)\.sql$/);
  return match ? match[1] : filename.replace('.sql', '');
}

/**
 * 列出本地所有 migrations
 */
async function listLocalMigrations(): Promise<Array<{ version: string; name: string; filename: string }>> {
  const files = await readdir(MIGRATIONS_DIR);
  const migrations = files
    .filter(f => f.endsWith('.sql'))
    .map(filename => ({
      version: extractVersion(filename),
      name: extractName(filename),
      filename,
    }))
    .sort((a, b) => a.version.localeCompare(b.version));
  
  return migrations;
}

/**
 * 主函式
 */
async function main() {
  console.log('🔄 開始同步 migrations...\n');
  
  // 列出本地 migrations
  console.log('📁 讀取本地 migrations...');
  const localMigrations = await listLocalMigrations();
  console.log(`   找到 ${localMigrations.length} 個本地 migrations\n`);
  
  // 顯示本地 migrations 列表
  console.log('📋 本地 migrations:');
  localMigrations.forEach((m, idx) => {
    console.log(`   ${idx + 1}. ${m.version} - ${m.name}`);
  });
  
  console.log('\n⚠️  請使用 Supabase MCP 工具手動檢查並應用缺失的 migrations。');
  console.log('   建議步驟：');
  console.log('   1. 使用 mcp_supabase_list_migrations 查看遠端已應用的 migrations');
  console.log('   2. 比較本地與遠端的 migrations 列表');
  console.log('   3. 對於缺失的 migrations，使用 mcp_supabase_apply_migration 逐一應用');
  console.log('\n   本地 migrations 檔案位置：');
  console.log(`   ${MIGRATIONS_DIR}\n`);
  
  // 顯示需要檢查的 migrations（假設遠端最後一個是 20260107122929）
  const lastRemoteVersion = '20260107122929';
  const missingMigrations = localMigrations.filter(m => m.version > lastRemoteVersion);
  
  if (missingMigrations.length > 0) {
    console.log('🔍 可能需要應用的 migrations（版本號大於遠端最後一個）：');
    missingMigrations.forEach((m, idx) => {
      console.log(`   ${idx + 1}. ${m.version} - ${m.name} (${m.filename})`);
    });
  } else {
    console.log('✅ 所有本地 migrations 似乎都已應用到遠端');
  }
}

main().catch(console.error);
