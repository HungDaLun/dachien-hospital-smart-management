# 資料庫結構與 RLS 一致性檢查報告

**檢查日期**：2026-01-18  
**專案**：Knowledge Architects (vjvmwyzpjmzzhfiaojul)  
**檢查範圍**：資料表結構、RLS 政策、索引、函式

---

## 📊 執行摘要

### ✅ 通過項目
- **所有資料表已啟用 RLS**：19 個資料表全部啟用
- **核心資料表結構完整**：files、agents、user_profiles 等主要資料表欄位齊全
- **索引建立完整**：所有必要的索引都已建立
- **Migration 已同步**：最新 migration `add_knowledge_decay` 已成功套用

### ✅ 已修復項目
- **函式安全設定**：已為所有 SECURITY DEFINER 函式設定 `search_path = public`
- **函式重載**：確認 `search_knowledge_by_embedding` 的兩個版本都是必要的（4 參數版本用於向後相容，5 參數版本支援 DIKW 過濾）

---

## 📋 詳細檢查結果

### 1. 資料表 RLS 狀態

所有 19 個資料表都已啟用 RLS：

| 資料表 | RLS 狀態 | 政策數量 |
|--------|---------|---------|
| agent_access_control | ✅ 已啟用 | 1 |
| agent_knowledge_rules | ✅ 已啟用 | 2 |
| agent_prompt_versions | ✅ 已啟用 | 2 |
| agent_tactical_templates | ✅ 已啟用 | 2 |
| agent_templates | ✅ 已啟用 | 1 |
| agents | ✅ 已啟用 | 3 |
| audit_logs | ✅ 已啟用 | 1 |
| chat_feedback | ✅ 已啟用 | 4 |
| chat_messages | ✅ 已啟用 | 2 |
| chat_sessions | ✅ 已啟用 | 4 |
| departments | ✅ 已啟用 | 2 |
| document_categories | ✅ 已啟用 | 2 |
| file_tags | ✅ 已啟用 | 3 |
| files | ✅ 已啟用 | 4 |
| knowledge_frameworks | ✅ 已啟用 | 2 |
| knowledge_instances | ✅ 已啟用 | 3 |
| user_favorites | ✅ 已啟用 | 3 |
| user_profiles | ✅ 已啟用 | 4 |
| user_tag_permissions | ✅ 已啟用 | 3 |

### 2. files 資料表結構檢查

**已確認欄位**（共 29 個）：

#### 核心欄位
- ✅ `id` (uuid, PK)
- ✅ `filename` (varchar)
- ✅ `s3_storage_path` (text)
- ✅ `s3_etag` (varchar)
- ✅ `mime_type` (varchar)
- ✅ `size_bytes` (bigint)
- ✅ `uploaded_by` (uuid, FK → user_profiles)
- ✅ `is_active` (boolean, default: true)
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)

#### Gemini 整合欄位
- ✅ `gemini_file_uri` (text)
- ✅ `gemini_state` (varchar, default: 'PENDING')
- ✅ `gemini_sync_at` (timestamptz)
- ✅ `quality_score` (integer, 0-100)
- ✅ `quality_issues` (jsonb)

#### 其他 AI 平台預留欄位
- ✅ `openai_file_id` (text)
- ✅ `claude_file_id` (text)

#### 知識管理欄位
- ✅ `markdown_content` (text)
- ✅ `metadata_analysis` (jsonb, default: '{}')
- ✅ `department_id` (uuid, FK → departments)
- ✅ `category_id` (uuid, FK → document_categories)
- ✅ `content_embedding` (vector(768))
- ✅ `dikw_level` (dikw_level_enum, default: 'data')

#### 知識衰減欄位（最新新增）
- ✅ `decay_type` (varchar(20), default: 'reference')
- ✅ `decay_score` (numeric, default: 1.0)
- ✅ `decay_status` (varchar(20), default: 'fresh')
- ✅ `valid_until` (timestamptz)

#### 其他欄位
- ✅ `expires_at` (timestamptz)

**索引檢查**：
- ✅ `files_pkey` (主鍵)
- ✅ `idx_files_uploaded_by`
- ✅ `idx_files_gemini_state`
- ✅ `idx_files_is_active`
- ✅ `idx_files_created_at`
- ✅ `idx_files_department_id`
- ✅ `files_content_embedding_idx` (HNSW 向量索引)
- ✅ `files_dikw_level_idx`
- ✅ `idx_files_decay_status` (最新新增)

### 3. agents 資料表結構檢查

**已確認欄位**（共 14 個）：

#### 核心欄位
- ✅ `id` (uuid, PK)
- ✅ `name` (varchar)
- ✅ `description` (text)
- ✅ `avatar_url` (text)
- ✅ `system_prompt` (text)
- ✅ `model_version` (varchar, default: 'gemini-3-flash-preview')
- ✅ `temperature` (numeric, default: 0.7)
- ✅ `department_id` (uuid, FK → departments)
- ✅ `created_by` (uuid, FK → user_profiles)
- ✅ `is_active` (boolean, default: true)
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)

#### 知識綁定欄位
- ✅ `knowledge_files` (uuid[], default: '{}')
- ✅ `mcp_config` (jsonb, default: '{}')

**索引檢查**：
- ✅ `agents_pkey` (主鍵)
- ✅ `idx_agents_department`
- ✅ `idx_agents_created_by`
- ✅ `idx_agents_is_active`
- ✅ `idx_agents_knowledge_files` (GIN 索引)

### 4. user_profiles 資料表結構檢查

**已確認欄位**（共 9 個）：
- ✅ `id` (uuid, PK, FK → auth.users)
- ✅ `email` (varchar)
- ✅ `display_name` (varchar)
- ✅ `role` (varchar, CHECK: SUPER_ADMIN/DEPT_ADMIN/EDITOR/USER)
- ✅ `department_id` (uuid, FK → departments)
- ✅ `avatar_url` (text)
- ✅ `status` (varchar, CHECK: PENDING/APPROVED/REJECTED, default: 'PENDING')
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)

**索引檢查**：
- ✅ `user_profiles_pkey` (主鍵)
- ✅ `idx_user_profiles_department`
- ✅ `idx_user_profiles_role`
- ✅ `idx_user_profiles_status`

### 5. RLS 政策檢查

#### files 資料表政策（4 個）
1. ✅ **所有已登入使用者可查看檔案** (SELECT)
   - 條件：`auth.uid() IS NOT NULL`
   - 符合 migration: `20260104000000_relax_file_viewing_rls.sql`

2. ✅ **授權使用者可上傳檔案** (INSERT)
   - 條件：已登入 + 上傳者為自己 + 角色為 SUPER_ADMIN/DEPT_ADMIN/EDITOR

3. ✅ **上傳者或管理員可更新檔案** (UPDATE)
   - 條件：上傳者本人 OR SUPER_ADMIN OR DEPT_ADMIN（部門內）

4. ✅ **上傳者或管理員可刪除檔案** (DELETE)
   - 條件：上傳者本人 OR SUPER_ADMIN OR DEPT_ADMIN（部門內）

#### agents 資料表政策（3 個）
1. ✅ **使用者可看授權的 Agent** (SELECT)
   - 使用 helper 函式：`is_super_admin()`, `get_user_role()`, `get_user_dept()`

2. ✅ **管理員可建立 Agent** (INSERT)
   - 條件：`is_admin() = true` AND `created_by = auth.uid()`

3. ✅ **建立者可更新自己的 Agent** (UPDATE)
   - 條件：`created_by = auth.uid()` OR `is_super_admin() = true`

#### user_profiles 資料表政策（4 個）
1. ✅ **使用者可讀取自己的資料** (SELECT)
2. ✅ **使用者可更新自己的資料** (UPDATE)
3. ✅ **超級管理員可讀取所有使用者** (SELECT)
4. ✅ **部門管理員可讀取部門成員** (SELECT)

### 6. 函式檢查

#### search_knowledge_by_embedding
- ⚠️ **發現兩個版本**（可能是函式重載）
- ⚠️ **安全警告**：缺少 `search_path` 設定
- 建議：檢查是否需要兩個版本，並為函式設定 `SET search_path = public`

#### set_audit_log_department
- ⚠️ **安全警告**：缺少 `search_path` 設定
- 建議：為函式設定 `SET search_path = public`

### 7. Migration 同步狀態

**已套用的 Migration**（共 40 個）：
- ✅ `20240101000000_initial_schema` - 初始結構
- ✅ `20240101000001_enable_rls` - RLS 啟用
- ✅ `20260104000000_add_user_status_field` - 使用者狀態欄位
- ✅ `20260104000000_relax_file_viewing_rls` - 放寬檔案查看權限
- ✅ `20260104064310_add_knowledge_files_to_agents` - Agent 知識檔案綁定
- ✅ `20260112000000_add_vector_search_support` - 向量搜尋支援
- ✅ `20260114000000_add_dikw_levels` - DIKW 層級
- ✅ `20260116000000_add_mcp_config_to_agents` - MCP 設定
- ✅ `20260118000000_add_knowledge_decay` - 知識衰減
- ✅ `20260118000001_fix_function_security` - 修復函式安全設定（最新）

**Migration 檔案與資料庫狀態**：✅ 一致

---

## ✅ 已完成的修復

### 1. 函式安全設定（已完成）✅

**問題**：兩個函式缺少 `search_path` 設定，可能導致安全風險。

**修復狀態**：✅ 已透過 migration `20260118000001_fix_function_security` 修復

**修復內容**：
- ✅ `search_knowledge_by_embedding` (4 參數版本)：已設定 `SET search_path = public`
- ✅ `search_knowledge_by_embedding` (5 參數版本)：已設定 `SET search_path = public` 並標記為 `SECURITY DEFINER`
- ✅ `set_audit_log_department`：已設定 `SET search_path = public`

### 2. 函式重載確認（已完成）✅

**確認結果**：
- ✅ `search_knowledge_by_embedding` 的兩個版本都是必要的
  - **4 參數版本**：用於向後相容，不支援 DIKW 層級過濾
  - **5 參數版本**：推薦使用，支援 DIKW 層級過濾（`filter_dikw_levels`）
- ✅ 兩個版本都已設定正確的安全設定

---

## ✅ 總結

### 整體狀態：**良好** ✅

資料庫結構與 migrations 資料夾內的檔案**高度一致**。所有核心功能都已正確實作：

1. ✅ **資料表結構完整**：所有必要的欄位都已建立
2. ✅ **RLS 政策健全**：所有資料表都啟用了 RLS，政策符合權限矩陣
3. ✅ **索引優化到位**：所有必要的索引都已建立
4. ✅ **Migration 同步**：最新 migration 已成功套用

### 已完成項目

1. ✅ **函式安全設定**：已為所有 SECURITY DEFINER 函式設定 `search_path`
2. ✅ **函式重載確認**：已確認兩個版本的 `search_knowledge_by_embedding` 都是必要的

### 建議行動

1. ✅ **已完成**：修復函式 `search_path` 設定（已透過 migration 完成）
2. ✅ **已完成**：確認函式重載的必要性
3. **持續監控**：使用 Supabase Advisors 定期檢查安全問題

---

**報告生成時間**：2026-01-18  
**檢查工具**：Supabase MCP + SQL 查詢  
**檢查範圍**：資料表結構、RLS 政策、索引、函式、Migration 同步狀態
