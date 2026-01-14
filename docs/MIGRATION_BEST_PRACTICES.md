# Migration 管理最佳實踐

**建立日期：** 2026-02-01  
**適用專案：** Knowledge Architects  
**狀態：** ✅ 建議採用

---

## 📋 執行摘要

### 當前狀況
- **本地 migrations：** 66 個（歷史記錄）
- **遠端 migrations：** 55-63 個（實際已執行）
- **匹配度：** 約 82%
- **後端資料庫結構：** ✅ 完整且正確（38 個表，RLS 已啟用）

### 專業建議
**採用「接受現狀 + 建立 Baseline + 未來規範」的混合策略**

---

## 🎯 專業建議方案

### 方案 A：接受現狀（推薦 ⭐）

#### 原則
1. **後端資料庫結構為唯一真實來源（Source of Truth）**
2. **本地 migrations 作為歷史參考**
3. **不修改歷史 migrations**
4. **未來所有修改都建立新的 migration**

#### 優點
- ✅ 符合業界標準（Immutable Migrations）
- ✅ 保持歷史可追溯性
- ✅ 不破壞現有系統
- ✅ 風險最低

#### 缺點
- ⚠️ 本地 migrations 數量較多（但這是正常的）
- ⚠️ 新開發者需要理解這種狀況

#### 適用情況
- ✅ **當前專案的狀況**（已有多個環境使用）
- ✅ 生產環境已上線
- ✅ 團隊已在開發中

---

### 方案 B：建立 Baseline Migration（可選）

#### 如果未來需要從零重建資料庫

#### 步驟
```bash
# 1. 使用 Supabase CLI 拉取當前結構
supabase db pull

# 2. 這會生成新的 migration，包含當前結構
# 3. 將此 migration 作為 baseline
```

#### 優點
- ✅ 新環境可以快速建立
- ✅ 結構清晰明確

#### 缺點
- ⚠️ 會增加一個新的 migration
- ⚠️ 需要維護兩套結構（歷史 + baseline）

#### 適用情況
- 🔍 如果需要經常建立新環境
- 🔍 如果需要提供給客戶部署

---

### 方案 C：清理並重建（不推薦 ❌）

#### 為什麼不推薦？
- ❌ 破壞歷史記錄
- ❌ 可能影響已部署的環境
- ❌ 不符合業界標準
- ❌ 風險高

---

## 📝 建議的實際行動

### 1. 立即行動（必須）

#### ✅ 採用方案 A：接受現狀
- **行動：** 不做任何修改
- **理由：** 當前狀態是可接受的，符合業界標準
- **風險：** 無

#### ✅ 文件化當前狀態
- **行動：** 在 README 或文件中說明
- **內容：** 說明本地 migrations 作為歷史參考，後端結構為真實來源
- **位置：** `docs/MIGRATION_BEST_PRACTICES.md`（本文件）

---

### 2. 短期行動（建議）

#### ✅ 建立 Migration 規範文件
- **行動：** 建立開發規範
- **內容：** 定義如何建立新的 migrations
- **範例：** 見下方「未來 Migration 規範」

#### ✅ 建立驗證流程
- **行動：** 建立檢查腳本
- **功能：** 驗證新 migration 是否符合規範
- **工具：** `scripts/verify-new-migration.ts`

---

### 3. 長期行動（可選）

#### 🔍 建立 Baseline Migration（如需要）
- **時機：** 如果需要經常建立新環境
- **方法：** 使用 `supabase db pull` 生成
- **注意：** 僅作為參考，不替代歷史 migrations

#### 🔍 定期同步檢查
- **頻率：** 每次重要 release 後
- **工具：** `scripts/compare-migrations.ts`
- **目的：** 確保本地與遠端一致

---

## 🔧 未來 Migration 規範

### 1. 建立新 Migration 的流程

```bash
# 1. 建立 migration 檔案（使用正確的版本號）
supabase migration new your_migration_name

# 2. 編寫 SQL
# 3. 測試（本地 Supabase）
supabase db reset
# 4. 應用到遠端
supabase db push
```

### 2. Migration 命名規範

```
格式：YYYYMMDDHHMMSS_descriptive_name.sql

範例：
20260201120000_add_new_feature.sql
20260201120001_fix_bug.sql
```

### 3. Migration 內容規範

```sql
-- ============================================
-- Migration 名稱
-- 建立日期: YYYY-MM-DD
-- 目的: 簡要說明
-- ============================================

-- 1. 建立資料表（如果需要的話）
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

-- 2. 啟用 RLS（與建立資料表在同一個 migration）
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- 3. 建立 RLS 政策
CREATE POLICY "policy_name" ON new_table
  FOR SELECT
  USING (...);

-- 4. 建立索引
CREATE INDEX IF NOT EXISTS idx_name ON new_table(column);

-- 5. 註解（可選）
COMMENT ON TABLE new_table IS '說明';
```

### 4. 重要原則

#### ✅ 必須遵守
- **Immutable：** 一旦提交，永不修改
- **可逆性：** 盡可能提供 rollback migration
- **測試：** 本地測試後再應用到遠端
- **文檔：** 複雜的 migration 需要註解

#### ❌ 禁止事項
- ❌ 修改已提交的 migrations
- ❌ 刪除已應用的 migrations
- ❌ 在 migration 中硬編碼 ID
- ❌ 在 migration 中執行不確定的操作

---

## 📊 當前狀態總結

### ✅ 已符合最佳實踐
- ✅ 後端資料庫結構完整（38 個表）
- ✅ RLS 已全面啟用（100%）
- ✅ 核心功能 migrations 已應用
- ✅ 最新 migration（`add_ai_safeguards`）已成功應用

### ⚠️ 需要注意
- ⚠️ 本地 migrations（66 個）vs 遠端（55-63 個）數量不同
- ⚠️ 部分 migrations 名稱不同但功能相同（正常情況）
- ⚠️ 部分 migrations 可能已合併

### 🎯 建議
- **接受當前狀態**（符合業界標準）
- **以後端結構為真實來源**
- **未來遵循規範建立新 migrations**

---

## 🔍 相關文件

- `docs/MIGRATIONS_DIFF_REPORT.md` - Migrations 差異詳細報告
- `docs/SUPABASE_MCP_CONSISTENCY_REPORT.md` - 一致性檢查報告
- `scripts/compare-migrations.ts` - Migrations 比對工具

---

## 📚 參考資料

### 業界標準
- **Immutable Migrations**：已提交的 migrations 永不修改
- **Source of Truth**：資料庫結構為唯一真實來源
- **Version Control**：Migrations 是版本控制的歷史記錄

### Supabase 官方建議
- 使用 `supabase db pull` 來同步結構
- 使用 `supabase migration new` 建立新 migration
- 保持 migrations 的歷史記錄完整

---

**最後更新：** 2026-02-01  
**維護者：** Development Team  
**狀態：** ✅ 建議採用