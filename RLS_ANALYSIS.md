# RLS 政策分析報告

## 🔍 問題診斷

### 發現的問題

在 `20240101000002_fix_rls_recursion.sql` migration 中，只重新建立了以下兩個政策：
1. "超級管理員可讀取所有使用者"
2. "部門管理員可讀取部門成員"

但是**沒有重新建立「使用者可讀取自己的資料」政策**！

### RLS 政策歷史

#### 初始建立（20240101000001_enable_rls.sql）
- ✅ "使用者可讀取自己的資料" - `USING (auth.uid() = id)`
- ✅ "使用者可更新自己的資料" - `USING (auth.uid() = id)`
- ✅ "超級管理員可讀取所有使用者" - `USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'))`
- ✅ "部門管理員可讀取部門成員" - `USING (EXISTS (...))`

#### 修復遞迴（20240101000002_fix_rls_recursion.sql）
- ❌ **刪除了** "超級管理員可讀取所有使用者"
- ❌ **刪除了** "部門管理員可讀取部門成員"
- ✅ **重新建立** "超級管理員可讀取所有使用者"（使用 `is_super_admin()` 函式）
- ✅ **重新建立** "部門管理員可讀取部門成員"（使用 `get_user_role()` 和 `get_user_dept()` 函式）
- ⚠️ **但沒有重新建立** "使用者可讀取自己的資料"！

### 為什麼這會導致問題？

當使用者嘗試查詢自己的 `user_profiles` 記錄時：
1. 查詢：`SELECT * FROM user_profiles WHERE id = auth.uid()`
2. RLS 檢查：
   - "超級管理員可讀取所有使用者" - 只有在使用者是 SUPER_ADMIN 時才匹配
   - "部門管理員可讀取部門成員" - 只有在使用者是 DEPT_ADMIN 且查詢同部門成員時才匹配
   - **「使用者可讀取自己的資料」不存在！** ❌

3. 結果：查詢被 RLS 拒絕，返回 0 行，導致 `PGRST116` 錯誤

## ✅ 解決方案

已建立 migration：`20260102000000_fix_user_profiles_select_policy.sql`

這個 migration 會：
1. 刪除可能存在的舊政策（如果有的話）
2. 重新建立「使用者可讀取自己的資料」政策
3. 確保政策使用正確的條件：`USING (auth.uid() = id)`

## 📋 完整的 user_profiles RLS 政策（修復後）

修復後，`user_profiles` 表應該有以下 SELECT 政策：

1. **"使用者可讀取自己的資料"**
   ```sql
   USING (auth.uid() = id)
   ```
   - 允許使用者讀取自己的資料
   - 這是**基礎政策**，必須存在

2. **"超級管理員可讀取所有使用者"**
   ```sql
   USING (is_super_admin() = true)
   ```
   - 允許 SUPER_ADMIN 讀取所有使用者的資料
   - 使用 `is_super_admin()` 函式避免遞迴

3. **"部門管理員可讀取部門成員"**
   ```sql
   USING (
     get_user_role() = 'DEPT_ADMIN' 
     AND department_id = get_user_dept()
   )
   ```
   - 允許 DEPT_ADMIN 讀取同部門成員的資料
   - 使用輔助函式避免遞迴

### 政策執行邏輯

PostgreSQL 的 RLS 政策使用 **OR 邏輯**：
- 如果**任何一個**政策匹配，查詢就會成功
- 所有政策都會被檢查，只要有一個匹配就允許訪問

因此：
- 使用者查詢自己的資料 → 第一個政策匹配 ✅
- SUPER_ADMIN 查詢任何資料 → 第二個政策匹配 ✅
- DEPT_ADMIN 查詢部門成員 → 第三個政策匹配 ✅

## 🚀 應用修復

### 方法 1：使用 Supabase Dashboard

1. 前往 Supabase Dashboard → SQL Editor
2. 執行以下 SQL：

```sql
-- 修復 user_profiles 表的 SELECT 政策
DROP POLICY IF EXISTS "使用者可讀取自己的資料" ON user_profiles;

CREATE POLICY "使用者可讀取自己的資料" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);
```

### 方法 2：使用 Supabase CLI

```bash
# 如果已連結到雲端專案
supabase db push

# 或者使用 migration 檔案
supabase migration up
```

### 方法 3：執行腳本

```bash
npx tsx scripts/apply-rls-fix.ts
```

腳本會顯示需要執行的 SQL，然後您可以在 Supabase Dashboard 中執行。

## ✅ 驗證修復

修復後，請執行以下測試：

```bash
npx tsx scripts/test-user-profile-query.ts
```

應該會看到：
- ✅ 登入成功
- ✅ 查詢成功（角色: SUPER_ADMIN）

## 📝 注意事項

1. **政策順序不重要**：PostgreSQL 會檢查所有政策，只要有一個匹配就允許
2. **政策必須存在**：「使用者可讀取自己的資料」是基礎政策，必須存在
3. **輔助函式**：`is_super_admin()`, `get_user_role()`, `get_user_dept()` 都使用 `SECURITY DEFINER`，可以繞過 RLS 避免遞迴
