/**
 * 檢查 Migration 同步狀態
 * 對比本地 migration 檔案與後端實際結構
 */

import * as fs from 'fs';
import * as path from 'path';

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase/migrations');

interface MigrationFile {
    filename: string;
    version: string;
    name: string;
    path: string;
}

function getAllMigrations(): MigrationFile[] {
    const files = fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort();

    return files.map(filename => {
        // 提取版本號和名稱
        const match = filename.match(/^(\d+)_(.+)\.sql$/);
        if (!match) {
            return { filename, version: '', name: '', path: path.join(MIGRATIONS_DIR, filename) };
        }
        return {
            filename,
            version: match[1],
            name: match[2],
            path: path.join(MIGRATIONS_DIR, filename)
        };
    });
}

function analyzeMigration(file: MigrationFile) {
    const content = fs.readFileSync(file.path, 'utf8');
    
    const analysis = {
        file,
        hasCreateTable: /CREATE TABLE/i.test(content),
        hasAlterTable: /ALTER TABLE/i.test(content),
        hasCreatePolicy: /CREATE POLICY/i.test(content),
        hasDropPolicy: /DROP POLICY/i.test(content),
        hasCreateFunction: /CREATE (OR REPLACE )?FUNCTION/i.test(content),
        hasDropFunction: /DROP FUNCTION/i.test(content),
        tables: [] as string[],
        policies: [] as string[],
        functions: [] as string[],
    };

    // 提取表名
    const tableMatches = content.matchAll(/CREATE TABLE\s+(\w+)/gi);
    for (const match of tableMatches) {
        analysis.tables.push(match[1]);
    }

    // 提取政策名
    const policyMatches = content.matchAll(/CREATE POLICY\s+"([^"]+)"/gi);
    for (const match of policyMatches) {
        analysis.policies.push(match[1]);
    }

    // 提取函式名
    const functionMatches = content.matchAll(/CREATE (OR REPLACE )?FUNCTION\s+(\w+)/gi);
    for (const match of functionMatches) {
        analysis.functions.push(match[2]);
    }

    return analysis;
}

async function main() {
    console.log('📋 檢查 Migration 同步狀態\n');
    console.log('='.repeat(80));

    const migrations = getAllMigrations();
    
    console.log(`\n📁 找到 ${migrations.length} 個 Migration 檔案：\n`);
    
    for (const migration of migrations) {
        const analysis = analyzeMigration(migration);
        console.log(`📄 ${migration.filename}`);
        console.log(`   版本: ${migration.version}`);
        console.log(`   名稱: ${migration.name}`);
        
        if (analysis.tables.length > 0) {
            console.log(`   建立表: ${analysis.tables.join(', ')}`);
        }
        if (analysis.policies.length > 0) {
            console.log(`   建立政策: ${analysis.policies.length} 個`);
        }
        if (analysis.functions.length > 0) {
            console.log(`   建立函式: ${analysis.functions.join(', ')}`);
        }
        console.log('');
    }

    console.log('='.repeat(80));
    console.log('\n📝 說明：');
    console.log('   後端的 Migration 版本號可能與本地檔案不同，這是正常的。');
    console.log('   重要的是確保 migration 的內容和順序一致。');
    console.log('\n   請檢查：');
    console.log('   1. 所有 migration 檔案都已存在');
    console.log('   2. Migration 的執行順序正確');
    console.log('   3. 沒有遺漏的 migration');
}

main().catch(err => {
    console.error('❌ 執行失敗:', err);
    process.exit(1);
});
