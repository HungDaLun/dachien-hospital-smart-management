#!/usr/bin/env tsx
/**
 * 比對本地與遠端的 migrations
 * 找出差異並生成詳細報告
 */

import { readdir } from 'fs/promises';
import { join } from 'path';

// 本地 migrations 目錄
const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');

// 遠端 migrations 列表（從 Supabase MCP 獲取）
const REMOTE_MIGRATIONS = [
  { version: "20251231182352", name: "initial_schema" },
  { version: "20251231182435", name: "enable_rls_fixed" },
  { version: "20251231192011", name: "fix_rls_recursion_complete" },
  { version: "20260101031251", name: "fix_rls_final" },
  { version: "20260101053440", name: "update_agents_rls" },
  { version: "20260101053736", name: "add_missing_rls_policies" },
  { version: "20260101063128", name: "add_favorites" },
  { version: "20260101080847", name: "fix_user_profiles_select_policy" },
  { version: "20260101081336", name: "update_agents_rls_with_helpers" },
  { version: "20260101084217", name: "fix_rls_helper_functions_bypass" },
  { version: "20260101093127", name: "fix_rls_security_definer_functions" },
  { version: "20260101093838", name: "comprehensive_fix_user_profiles_rls" },
  { version: "20260101094812", name: "add_user_status_field" },
  { version: "20260101100111", name: "test_rls_diagnosis_policy" },
  { version: "20260101111804", name: "add_user_status_field" },
  { version: "20260101111820", name: "update_handle_new_user_function" },
  { version: "20260102083901", name: "fix_agents_model_version_default" },
  { version: "20260102083902", name: "remove_test_rls_policy" },
  { version: "20260102084505", name: "add_dikw_tables" },
  { version: "20260102150016", name: "add_dept_silos" },
  { version: "20260102150305", name: "fix_files_rls_policies_and_functions" },
  { version: "20260102151857", name: "align_schema" },
  { version: "20260102163845", name: "update_agents_model_version_to_gemini3" },
  { version: "20260102164043", name: "ensure_schema_consistency" },
  { version: "20260103040007", name: "update_gemini_model_comments" },
  { version: "20260103115517", name: "add_metadata_trinity" },
  { version: "20260103121555", name: "add_rag_silos" },
  { version: "20260103122948", name: "relax_file_viewing_rls" },
  { version: "20260104072006", name: "add_vector_search_support" },
  { version: "20260104072708", name: "create_agent_templates" },
  { version: "20260104072731", name: "seed_agent_templates" },
  { version: "20260104073000", name: "add_knowledge_files_to_agents" },
  { version: "20260104073823", name: "add_dikw_levels" },
  { version: "20260104075806", name: "extend_agent_templates_for_skills" },
  { version: "20260104084852", name: "add_mcp_config_to_agents" },
  { version: "20260104123646", name: "seed_standard_document_categories" },
  { version: "20260104160116", name: "add_tactical_templates" },
  { version: "20260105092944", name: "add_knowledge_decay" },
  { version: "20260105093328", name: "fix_function_security" },
  { version: "20260105113811", name: "add_aggregation" },
  { version: "20260105113846", name: "enable_rls_for_knowledge_units" },
  { version: "20260105114807", name: "add_hnsw_search" },
  { version: "20260105114813", name: "add_knowledge_push" },
  { version: "20260105114901", name: "enable_rls_for_knowledge_push" },
  { version: "20260105115109", name: "add_feedback_loop" },
  { version: "20260105115129", name: "enable_rls_for_feedback_loop" },
  { version: "20260105203437", name: "setup_avatars_storage" },
  { version: "20260105203848", name: "avatar_auto_replace_and_compress" },
  { version: "20260106013612", name: "extend_user_profiles" },
  { version: "20260106023116", name: "add_war_room_infrastructure" },
  { version: "20260106070223", name: "20260106000000_add_strategic_insights_cache" },
  { version: "20260106113138", name: "add_global_knowledge_search" },
  { version: "20260106113913", name: "add_framework_embeddings" },
  { version: "20260107122929", name: "fix_audit_logs_schema" },
  { version: "20260113035324", name: "add_ai_summary_to_files" },
  { version: "20260113035328", name: "fix_vector_search_operators" },
  { version: "20260113035823", name: "fix_security_issues" },
  { version: "20260113042341", name: "add_skills_and_tools_system" },
  { version: "20260113042512", name: "seed_skills_and_tools" },
  { version: "20260113144244", name: "fix_tool_executions_log_rls" },
  { version: "20260114121808", name: "extend_api_key_settings" },
  { version: "20260114121814", name: "update_tool_api_key_config" },
  { version: "20260114185834", name: "add_ai_safeguards" }
];

/**
 * 標準化 migration 名稱（用於比對）
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[_-]/g, '_')
    .replace(/^\d+_/, '') // 移除開頭的版本號
    .replace(/\.sql$/, ''); // 移除 .sql 後綴
}

/**
 * 從檔案名稱提取 migration 資訊
 */
function extractMigrationInfo(filename: string): {
  version: string;
  name: string;
  normalizedName: string;
  filename: string;
} {
  const match = filename.match(/^(\d+)_(.+)\.sql$/);
  if (!match) {
    throw new Error(`無法解析 migration 檔案名稱: ${filename}`);
  }
  
  const version = match[1];
  const name = match[2];
  
  return {
    version,
    name,
    normalizedName: normalizeName(name),
    filename
  };
}

/**
 * 主函式
 */
async function main() {
  console.log('🔍 開始比對本地與遠端的 migrations...\n');
  
  // 讀取本地 migrations
  const localFiles = await readdir(MIGRATIONS_DIR);
  const localMigrations = localFiles
    .filter(f => f.endsWith('.sql'))
    .sort()
    .map(extractMigrationInfo);
  
  console.log(`📁 本地 migrations: ${localMigrations.length} 個\n`);
  
  // 處理遠端 migrations
  const remoteMigrations = REMOTE_MIGRATIONS.map(m => ({
    ...m,
    normalizedName: normalizeName(m.name)
  }));
  
  console.log(`☁️  遠端 migrations: ${remoteMigrations.length} 個\n`);
  
  // 建立比對映射
  const localMap = new Map<string, typeof localMigrations[0]>();
  const remoteMap = new Map<string, typeof remoteMigrations[0]>();
  
  localMigrations.forEach(m => {
    localMap.set(m.normalizedName, m);
  });
  
  remoteMigrations.forEach(m => {
    remoteMap.set(m.normalizedName, m);
  });
  
  // 找出差異
  const localOnly = localMigrations.filter(m => !remoteMap.has(m.normalizedName));
  const remoteOnly = remoteMigrations.filter(m => !localMap.has(m.normalizedName));
  const matched = localMigrations.filter(m => remoteMap.has(m.normalizedName));
  
  // 輸出結果
  console.log('='.repeat(80));
  console.log('📊 比對結果\n');
  
  console.log(`✅ 已匹配: ${matched.length} 個`);
  console.log(`⚠️  僅本地: ${localOnly.length} 個`);
  console.log(`❓ 僅遠端: ${remoteOnly.length} 個\n`);
  
  // 僅本地的 migrations
  if (localOnly.length > 0) {
    console.log('='.repeat(80));
    console.log('⚠️  僅在本地存在的 migrations（可能未應用到遠端）：\n');
    localOnly.forEach((m, idx) => {
      console.log(`  ${idx + 1}. ${m.filename}`);
      console.log(`     版本: ${m.version}`);
      console.log(`     名稱: ${m.name}`);
      console.log(`     標準化名稱: ${m.normalizedName}`);
      console.log('');
    });
  }
  
  // 僅遠端的 migrations
  if (remoteOnly.length > 0) {
    console.log('='.repeat(80));
    console.log('❓ 僅在遠端存在的 migrations（可能本地已刪除或重新命名）：\n');
    remoteOnly.forEach((m, idx) => {
      console.log(`  ${idx + 1}. ${m.name}`);
      console.log(`     版本: ${m.version}`);
      console.log(`     標準化名稱: ${m.normalizedName}`);
      console.log('');
    });
  }
  
  // 已匹配的 migrations（顯示前 10 個）
  if (matched.length > 0) {
    console.log('='.repeat(80));
    console.log('✅ 已匹配的 migrations（前 10 個）：\n');
    matched.slice(0, 10).forEach((m, idx) => {
      const remote = remoteMap.get(m.normalizedName)!;
      console.log(`  ${idx + 1}. ${m.name}`);
      console.log(`     本地: ${m.filename}`);
      console.log(`     遠端: ${remote.name} (${remote.version})`);
      console.log('');
    });
    
    if (matched.length > 10) {
      console.log(`     ... 還有 ${matched.length - 10} 個已匹配的 migrations\n`);
    }
  }
  
  // 總結
  console.log('='.repeat(80));
  console.log('📝 總結\n');
  
  if (localOnly.length === 0 && remoteOnly.length === 0) {
    console.log('✅ 本地與遠端的 migrations 完全一致！');
  } else {
    if (localOnly.length > 0) {
      console.log(`⚠️  有 ${localOnly.length} 個本地 migrations 可能未應用到遠端`);
      console.log('   建議：檢查這些 migrations 是否需要應用到遠端');
    }
    
    if (remoteOnly.length > 0) {
      console.log(`❓ 有 ${remoteOnly.length} 個遠端 migrations 在本地找不到對應`);
      console.log('   建議：檢查這些 migrations 是否已合併或重新命名');
    }
  }
  
  console.log('');
}

main().catch(console.error);