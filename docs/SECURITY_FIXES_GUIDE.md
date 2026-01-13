# 安全修復指南

**日期：** 2026-01-30  
**目的：** 修復 Supabase 安全檢查中發現的兩個警告

---

## 📋 問題摘要

### 1. tool_executions_log 表的 RLS 政策過於寬鬆
- **問題：** INSERT 政策的 WITH CHECK 子句為 `true`，允許無限制存取
- **風險：** 任何已認證使用者都可以插入任意記錄，可能導致資料偽造
- **優先級：** 中優先級

### 2. 洩漏密碼保護未啟用
- **問題：** Supabase Auth 的洩漏密碼保護功能未啟用
- **風險：** 使用者可能使用已洩漏的密碼，增加帳號被盜用的風險
- **優先級：** 中優先級

---

## 🔧 解決方案 1: 修復 tool_executions_log RLS 政策

### 步驟 1: 應用 Migration

已建立 migration 檔案：`supabase/migrations/20260130000000_fix_tool_executions_log_rls.sql`

使用 Supabase MCP 應用此 migration：

```bash
# 透過 MCP 工具應用 migration
mcp_supabase_apply_migration \
  --project_id vjvmwyzpjmzzhfiaojul \
  --name fix_tool_executions_log_rls \
  --query "<migration SQL 內容>"
```

或使用 Supabase CLI：

```bash
cd /Users/darrenhung/Desktop/知識架構師
supabase db push
```

### 步驟 2: 驗證修復

應用 migration 後，使用以下 SQL 驗證政策：

```sql
-- 檢查新的 RLS 政策
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'tool_executions_log'
    AND cmd = 'INSERT'
ORDER BY policyname;
```

預期結果：
- ✅ `使用者可插入自己的工具執行記錄` - WITH CHECK 包含 user_id 驗證
- ✅ `管理員可插入工具執行記錄` - WITH CHECK 包含角色驗證

### 步驟 3: 測試

#### 測試 1: 正常使用者插入自己的記錄（應該成功）

```sql
-- 模擬已認證使用者插入自己的記錄
INSERT INTO tool_executions_log (
    tool_name,
    user_id,
    input_params,
    status
) VALUES (
    'test_tool',
    auth.uid(),  -- 使用當前使用者 ID
    '{}'::jsonb,
    'success'
);
```

#### 測試 2: 嘗試插入其他使用者的記錄（應該失敗）

```sql
-- 嘗試插入其他使用者的記錄（應該被拒絕）
INSERT INTO tool_executions_log (
    tool_name,
    user_id,
    input_params,
    status
) VALUES (
    'test_tool',
    '00000000-0000-0000-0000-000000000000'::uuid,  -- 偽造的使用者 ID
    '{}'::jsonb,
    'success'
);
-- 預期：應該被 RLS 政策拒絕
```

### 修復內容說明

新的 RLS 政策包含以下安全檢查：

1. **使用者身份驗證**
   - 必須是已認證使用者（`auth.uid() IS NOT NULL`）
   - `user_id` 必須匹配 `auth.uid()`（防止偽造）

2. **關聯性驗證**
   - 如果提供 `agent_id`，確保該 agent 存在
   - 如果提供 `session_id`，確保該 session 屬於當前使用者

3. **管理員權限**
   - 允許 `SUPER_ADMIN` 和 `DEPT_ADMIN` 插入記錄（用於系統操作）

### 注意事項

⚠️ **Service Role 繞過 RLS**

如果您的應用程式使用 Service Role（`SUPABASE_SERVICE_ROLE_KEY`）來插入記錄，Service Role 會自動繞過 RLS 政策。這是正常的行為，因為 Service Role 擁有最高權限。

如果您的代碼使用 Service Role（如 `createAdminClient()`），則：
- ✅ Service Role 可以正常插入記錄
- ✅ RLS 政策只會影響使用 Anon Key 的客戶端操作
- ✅ 這是安全的，因為 Service Role 應該只在伺服器端使用

---

## 🔧 解決方案 2: 啟用洩漏密碼保護

### 步驟 1: 登入 Supabase Dashboard

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇專案：**Knowledge Architects** (vjvmwyzpjmzzhfiaojul)
3. 導航至 **Authentication** → **Settings**

### 步驟 2: 啟用洩漏密碼保護

1. 在 **Authentication Settings** 頁面中，找到 **Password Security** 區塊
2. 找到 **Leaked Password Protection** 選項
3. 切換開關啟用此功能

### 步驟 3: 設定選項（可選）

啟用後，您可以設定以下選項：

- **Check on signup** - 在註冊時檢查密碼是否已洩漏
- **Check on password change** - 在更改密碼時檢查
- **Block compromised passwords** - 完全阻止使用已洩漏的密碼（建議啟用）

### 步驟 4: 驗證啟用

啟用後，可以透過以下方式驗證：

1. 嘗試註冊一個新帳號，使用常見的洩漏密碼（如 `password123`）
2. 系統應該會拒絕或警告該密碼已被洩漏

### 技術說明

Supabase 使用 [HaveIBeenPwned](https://haveibeenpwned.com/) API 來檢查密碼是否已洩漏。此服務：
- ✅ 使用 k-anonymity 技術，不會傳送完整密碼
- ✅ 只傳送密碼的 SHA-1 前 5 個字元
- ✅ 保護使用者隱私

---

## 📊 修復前後對比

### tool_executions_log RLS 政策

| 項目 | 修復前 | 修復後 |
|------|--------|--------|
| INSERT 政策 | `WITH CHECK (true)` | `WITH CHECK (user_id = auth.uid() AND ...)` |
| 安全性 | ⚠️ 低（任何人都可插入） | ✅ 高（只能插入自己的記錄） |
| 偽造風險 | ⚠️ 高 | ✅ 低 |

### 洩漏密碼保護

| 項目 | 修復前 | 修復後 |
|------|--------|--------|
| 狀態 | ❌ 未啟用 | ✅ 已啟用 |
| 註冊時檢查 | ❌ 無 | ✅ 有 |
| 密碼更改時檢查 | ❌ 無 | ✅ 有 |

---

## ✅ 驗證清單

完成修復後，請確認：

### RLS 政策修復
- [ ] Migration 已成功應用
- [ ] 新的 RLS 政策已建立
- [ ] 正常使用者可以插入自己的記錄
- [ ] 無法插入其他使用者的記錄
- [ ] 管理員可以插入記錄

### 洩漏密碼保護
- [ ] 已在 Dashboard 啟用
- [ ] 註冊時會檢查密碼
- [ ] 更改密碼時會檢查
- [ ] 已洩漏的密碼會被拒絕或警告

---

## 🔍 後續監控

### 定期檢查

建議定期執行以下檢查：

1. **使用 Supabase Advisors 檢查安全問題**
   ```bash
   mcp_supabase_get_advisors \
     --project_id vjvmwyzpjmzzhfiaojul \
     --type security
   ```

2. **檢查 RLS 政策**
   ```sql
   SELECT 
       tablename,
       policyname,
       cmd,
       with_check
   FROM pg_policies
   WHERE schemaname = 'public'
       AND with_check = 'true'  -- 檢查是否有其他過於寬鬆的政策
   ORDER BY tablename, policyname;
   ```

3. **檢查認證設定**
   - 定期檢查 Supabase Dashboard 中的認證設定
   - 確保所有安全功能都已啟用

---

## 📝 相關檔案

- **Migration 檔案：** `supabase/migrations/20260130000000_fix_tool_executions_log_rls.sql`
- **安全報告：** `docs/SUPABASE_MCP_SYNC_REPORT_20260129.md`
- **工具執行器：** `lib/tools/executor.ts`

---

## 🆘 故障排除

### 問題 1: Migration 應用失敗

**錯誤：** `policy already exists`

**解決方案：**
```sql
-- 手動刪除舊政策
DROP POLICY IF EXISTS "系統可寫入工具執行記錄" ON tool_executions_log;
-- 然後重新應用 migration
```

### 問題 2: 使用者無法插入記錄

**錯誤：** `new row violates row-level security policy`

**可能原因：**
- `user_id` 不匹配 `auth.uid()`
- `session_id` 不屬於當前使用者

**解決方案：**
- 確保插入時 `user_id = auth.uid()`
- 檢查 `session_id` 是否屬於當前使用者

### 問題 3: Service Role 無法插入記錄

**說明：** Service Role 應該可以繞過 RLS。如果無法插入，可能是：
- Service Role Key 不正確
- 使用了錯誤的客戶端（應該使用 `createAdminClient()`）

---

## ✅ 結論

完成以上兩個修復後，系統安全性將大幅提升：

1. ✅ **tool_executions_log 表** - RLS 政策已加強，防止資料偽造
2. ✅ **洩漏密碼保護** - 已啟用，防止使用已洩漏的密碼

建議在修復後進行完整的測試，確保所有功能正常運作。
