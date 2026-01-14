#!/usr/bin/env tsx
/**
 * 驗證新 Migration 是否符合規範
 * 
 * 此腳本會檢查：
 * 1. Migration 檔案命名是否符合規範
 * 2. Migration 內容是否符合最佳實踐
 * 3. 是否有必要的 RLS 設定
 * 4. 是否有適當的註解
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';

// Migration 目錄
const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');

// 規範檢查結果
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 檢查檔案名稱是否符合規範
 */
function validateFileName(filename: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // 格式：YYYYMMDDHHMMSS_descriptive_name.sql
  const pattern = /^(\d{14})_(.+)\.sql$/;
  const match = filename.match(pattern);

  if (!match) {
    result.isValid = false;
    result.errors.push(`檔案名稱不符合規範：應該是 YYYYMMDDHHMMSS_descriptive_name.sql 格式`);
    return result;
  }

  const timestamp = match[1];
  const name = match[2];

  // 檢查時間戳格式（應該是 14 位數字）
  if (timestamp.length !== 14) {
    result.isValid = false;
    result.errors.push(`時間戳長度不正確：應該是 14 位數字`);
  }

  // 檢查名稱是否為空
  if (!name || name.trim().length === 0) {
    result.isValid = false;
    result.errors.push(`Migration 名稱不能為空`);
  }

  // 檢查名稱是否包含非法字元
  if (!/^[a-z0-9_]+$/.test(name)) {
    result.warnings.push(`Migration 名稱建議使用小寫字母、數字和底線`);
  }

  return result;
}

/**
 * 檢查 Migration 內容是否符合規範
 */
function validateContent(content: string, filename: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // 檢查是否有註解說明
  if (!content.trim().startsWith('--')) {
    result.warnings.push(`建議在檔案開頭加入註解說明 Migration 的目的`);
  }

  // 檢查是否有建立資料表但沒有啟用 RLS
  const hasCreateTable = /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i.test(content);
  if (hasCreateTable) {
    const tableMatches = Array.from(content.matchAll(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/gi));
    for (const match of tableMatches) {
      const tableName = match[1];
      const rlsPattern = new RegExp(`ALTER TABLE\\s+${tableName}\\s+ENABLE ROW LEVEL SECURITY`, 'i');
      
      if (!rlsPattern.test(content)) {
        result.warnings.push(`表 ${tableName} 已建立，但未啟用 RLS（如果表需要 RLS，建議啟用）`);
      }
    }
  }

  // 檢查是否有建立資料表但沒有 RLS 政策
  if (hasCreateTable) {
    const tableMatches = Array.from(content.matchAll(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/gi));
    for (const match of tableMatches) {
      const tableName = match[1];
      const hasPolicy = new RegExp(`CREATE POLICY.*ON\\s+${tableName}`, 'i').test(content);
      
      if (!hasPolicy) {
        result.warnings.push(`表 ${tableName} 已建立，但未定義 RLS 政策（如果表需要 RLS，建議定義政策）`);
      }
    }
  }

  // 檢查是否使用 IF NOT EXISTS（最佳實踐）
  const alterTableMatches = Array.from(content.matchAll(/ALTER TABLE\s+(\w+)\s+(?!IF NOT EXISTS)/gi));
  for (const match of alterTableMatches) {
    const alterType = content.substring(match.index!, match.index! + 100);
    if (alterType.includes('ADD COLUMN') && !alterType.includes('IF NOT EXISTS')) {
      result.warnings.push(`建議在 ADD COLUMN 時使用 IF NOT EXISTS 以避免重複執行錯誤`);
    }
  }

  // 檢查是否有硬編碼的 ID
  const hasHardcodedId = /'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/i.test(content);
  if (hasHardcodedId) {
    result.warnings.push(`發現硬編碼的 UUID，建議使用動態生成或查詢方式`);
  }

  // 檢查是否有 DROP TABLE（危險操作）
  if (/DROP TABLE/i.test(content)) {
    result.warnings.push(`Migration 中包含 DROP TABLE，請確認這是有意的操作`);
  }

  // 檢查是否有 TRUNCATE（危險操作）
  if (/TRUNCATE/i.test(content)) {
    result.warnings.push(`Migration 中包含 TRUNCATE，請確認這是有意的操作`);
  }

  return result;
}

/**
 * 驗證單個 Migration 檔案
 */
async function validateMigration(filename: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // 檢查檔案名稱
  const nameValidation = validateFileName(filename);
  result.isValid = result.isValid && nameValidation.isValid;
  result.errors.push(...nameValidation.errors);
  result.warnings.push(...nameValidation.warnings);

  // 讀取檔案內容
  const filePath = join(MIGRATIONS_DIR, filename);
  try {
    const content = await readFile(filePath, 'utf-8');
    
    // 檢查內容
    const contentValidation = validateContent(content, filename);
    result.isValid = result.isValid && contentValidation.isValid;
    result.errors.push(...contentValidation.errors);
    result.warnings.push(...contentValidation.warnings);
  } catch (error) {
    result.isValid = false;
    result.errors.push(`無法讀取檔案：${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * 驗證最新的 Migration 檔案
 */
async function validateLatestMigration(): Promise<void> {
  console.log('🔍 驗證最新的 Migration 檔案...\n');

  try {
    // 讀取所有 migration 檔案
    const files = await readdir(MIGRATIONS_DIR);
    const migrationFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort()
      .reverse(); // 從最新到最舊

    if (migrationFiles.length === 0) {
      console.log('⚠️  未找到任何 migration 檔案');
      return;
    }

    // 驗證最新的 migration
    const latestFile = migrationFiles[0];
    console.log(`📄 檢查檔案：${latestFile}\n`);

    const result = await validateMigration(latestFile);

    // 輸出結果
    console.log('='.repeat(80));
    if (result.isValid && result.errors.length === 0) {
      console.log('✅ 驗證通過！');
    } else {
      if (result.errors.length > 0) {
        console.log('❌ 驗證失敗：');
        result.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
      }
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️  警告：');
      result.warnings.forEach(warning => {
        console.log(`   - ${warning}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    
    // 輸出建議
    if (result.errors.length > 0) {
      console.log('\n📝 建議：');
      console.log('   請修正上述錯誤後再提交 migration');
      console.log('   詳細規範請參考：docs/MIGRATION_BEST_PRACTICES.md');
    } else if (result.warnings.length > 0) {
      console.log('\n📝 建議：');
      console.log('   請考慮處理上述警告（非必須，但建議遵循最佳實踐）');
      console.log('   詳細規範請參考：docs/MIGRATION_BEST_PRACTICES.md');
    } else {
      console.log('\n✅ Migration 符合所有規範！');
    }

  } catch (error) {
    console.error('❌ 執行失敗：', error);
    process.exit(1);
  }
}

/**
 * 驗證指定的 Migration 檔案
 */
async function validateSpecificMigration(filename: string): Promise<void> {
  console.log(`🔍 驗證 Migration 檔案：${filename}\n`);

  const result = await validateMigration(filename);

  console.log('='.repeat(80));
  if (result.isValid && result.errors.length === 0) {
    console.log('✅ 驗證通過！');
  } else {
    if (result.errors.length > 0) {
      console.log('❌ 驗證失敗：');
      result.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  警告：');
    result.warnings.forEach(warning => {
      console.log(`   - ${warning}`);
    });
  }

  console.log('\n' + '='.repeat(80));
}

/**
 * 主函式
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // 驗證指定的檔案
    const filename = args[0];
    if (!filename.endsWith('.sql')) {
      console.error('❌ 請提供 .sql 檔案');
      process.exit(1);
    }
    await validateSpecificMigration(filename);
  } else {
    // 驗證最新的 migration
    await validateLatestMigration();
  }
}

main().catch(error => {
  console.error('❌ 執行失敗：', error);
  process.exit(1);
});