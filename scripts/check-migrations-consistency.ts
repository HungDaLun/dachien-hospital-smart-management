#!/usr/bin/env tsx
/**
 * 檢查 migrations 目錄與資料庫中已應用的 migrations 是否一致
 */

import { readdir } from 'fs/promises';
import { join } from 'path';

const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');

// 從檔案名稱提取版本號
function extractVersion(filename: string): string | null {
  const match = filename.match(/^(\d{14})_/);
  return match ? match[1] : null;
}

// 從檔案名稱提取 migration 名稱
function extractName(filename: string): string {
  const match = filename.match(/^\d{14}_(.+)\.sql$/);
  return match ? match[1] : filename.replace(/\.sql$/, '');
}

async function main() {
  console.log('📋 檢查 migrations 一致性...\n');

  // 讀取 migrations 目錄中的所有檔案
  const files = await readdir(MIGRATIONS_DIR);
  const migrationFiles = files
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`📁 找到 ${migrationFiles.length} 個 migration 檔案\n`);

  // 檢查是否有重複的時間戳
  const versionMap = new Map<string, string[]>();
  for (const file of migrationFiles) {
    const version = extractVersion(file);
    if (version) {
      if (!versionMap.has(version)) {
        versionMap.set(version, []);
      }
      versionMap.get(version)!.push(file);
    }
  }

  const duplicates = Array.from(versionMap.entries()).filter(([_, files]) => files.length > 1);
  if (duplicates.length > 0) {
    console.log('⚠️  發現重複的時間戳：');
    for (const [version, files] of duplicates) {
      console.log(`   ${version}:`);
      for (const file of files) {
        console.log(`     - ${file}`);
      }
    }
    console.log('');
  }

  // 列出所有 migrations
  console.log('📝 Migration 檔案列表：');
  for (const file of migrationFiles) {
    const version = extractVersion(file);
    const name = extractName(file);
    console.log(`   ${version || 'N/A'} - ${name}`);
  }

  console.log('\n✅ 檢查完成！');
  console.log('\n💡 提示：請使用 Supabase MCP 工具檢查資料庫中已應用的 migrations');
}

main().catch(console.error);
