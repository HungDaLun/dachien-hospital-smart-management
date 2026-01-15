#!/usr/bin/env tsx
/**
 * 驗證資料庫結構與 RLS 政策是否與 migrations 目錄一致
 */

import { readdir, readFile } from 'fs/promises';
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

interface MigrationInfo {
  version: string | null;
  name: string;
  filename: string;
  content: string;
}

async function main() {
  console.log('🔍 驗證資料庫結構與 RLS 政策一致性...\n');

  // 讀取 migrations 目錄中的所有檔案
  const files = await readdir(MIGRATIONS_DIR);
  const migrationFiles = files
    .filter(f => f.endsWith('.sql'))
    .sort();

  const migrations: MigrationInfo[] = [];
  for (const file of migrationFiles) {
    const version = extractVersion(file);
    const name = extractName(file);
    const content = await readFile(join(MIGRATIONS_DIR, file), 'utf-8');
    migrations.push({ version, name, filename: file, content });
  }

  console.log(`📁 找到 ${migrations.length} 個 migration 檔案\n`);

  // 檢查 RLS 相關的 migrations
  const rlsMigrations = migrations.filter(m => 
    m.content.includes('ENABLE ROW LEVEL SECURITY') ||
    m.content.includes('CREATE POLICY') ||
    m.content.includes('ALTER TABLE') && m.content.includes('ENABLE ROW LEVEL SECURITY')
  );

  console.log(`🔒 找到 ${rlsMigrations.length} 個與 RLS 相關的 migrations：`);
  for (const m of rlsMigrations) {
    console.log(`   - ${m.filename}`);
  }

  // 檢查表格建立相關的 migrations
  const tableMigrations = migrations.filter(m => 
    m.content.includes('CREATE TABLE')
  );

  console.log(`\n📊 找到 ${tableMigrations.length} 個建立表格的 migrations：`);
  const tables = new Set<string>();
  for (const m of tableMigrations) {
    const tableMatches = m.content.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(?:public\.)?(\w+)/gi);
    if (tableMatches) {
      for (const match of tableMatches) {
        const tableName = match.replace(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(?:public\.)?/i, '').trim();
        tables.add(tableName);
      }
    }
  }
  console.log(`   共建立 ${tables.size} 個表格：`);
  for (const table of Array.from(tables).sort()) {
    console.log(`     - ${table}`);
  }

  // 檢查重複的時間戳
  const versionMap = new Map<string, string[]>();
  for (const m of migrations) {
    if (m.version) {
      if (!versionMap.has(m.version)) {
        versionMap.set(m.version, []);
      }
      versionMap.get(m.version)!.push(m.filename);
    }
  }

  const duplicates = Array.from(versionMap.entries()).filter(([_, files]) => files.length > 1);
  if (duplicates.length > 0) {
    console.log(`\n⚠️  發現 ${duplicates.length} 組重複的時間戳：`);
    for (const [version, files] of duplicates) {
      console.log(`   ${version}:`);
      for (const file of files) {
        console.log(`     - ${file}`);
      }
    }
  }

  // 檢查格式不正確的檔案
  const invalidFiles = migrations.filter(m => !m.version);
  if (invalidFiles.length > 0) {
    console.log(`\n❌ 發現 ${invalidFiles.length} 個格式不正確的檔案：`);
    for (const m of invalidFiles) {
      console.log(`   - ${m.filename}`);
    }
  }

  console.log('\n✅ 檢查完成！');
  console.log('\n💡 下一步：');
  console.log('   1. 使用 Supabase MCP 工具檢查資料庫中已應用的 migrations');
  console.log('   2. 比較 migrations 目錄與資料庫中的版本');
  console.log('   3. 確認所有 RLS 政策都已正確應用');
}

main().catch(console.error);
