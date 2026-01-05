/**
 * Migration 一致性檢查腳本
 * 比較資料夾中的 migrations 與資料庫中的 migrations 記錄
 */

import { readdir } from 'fs/promises';
import { join } from 'path';

interface MigrationFile {
  filename: string;
  version: string;
  name: string;
}



async function checkMigrationConsistency() {
  const migrationsDir = join(process.cwd(), 'supabase/migrations');

  // 讀取資料夾中的所有 migration 檔案
  const files = await readdir(migrationsDir);
  const migrationFiles = files
    .filter(f => f.endsWith('.sql'))
    .map(f => {
      const match = f.match(/^(\d+)_(.+)\.sql$/);
      if (!match) return null;
      return {
        filename: f,
        version: match[1],
        name: match[2],
      };
    })
    .filter((f): f is MigrationFile => f !== null)
    .sort((a, b) => a.version.localeCompare(b.version));

  console.log('📁 資料夾中的 Migration 檔案：\n');
  migrationFiles.forEach(m => {
    console.log(`  ${m.version} - ${m.name}`);
  });

  console.log(`\n總計: ${migrationFiles.length} 個 migration 檔案\n`);
  console.log('='.repeat(80));
  console.log('\n⚠️  請手動比對上述檔案與資料庫中的 migrations 記錄');
  console.log('💡 使用 Supabase MCP 的 list_migrations 來查看資料庫中的 migrations');
}

checkMigrationConsistency().catch(console.error);
