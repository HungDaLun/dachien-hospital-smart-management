# RLS 問題修復總結

## 🔍 問題根源

根據日誌分析，問題的核心是：

1. **PGRST116 錯誤**：查詢 `user_profiles` 時返回 0 筆記錄（被 RLS 阻擋）
2. **根本原因**：「使用者可讀取自己的資料」政策可能：
   - 不存在（在 `20240101000002_fix_rls_recursion.sql` 中被意外刪除）
   - 或條件不正確
   - 或 migration 未執行

## ✅ 立即修復步驟

### 方法 1: 執行 Migration（推薦）

```bash
# 如果使用 Supabase CLI
cd "/Users/darrenhung/Desktop/知識架構師"
supabase db push

# 或手動在 Supabase Dashboard 執行 migration
# supabase/migrations/20260103000000_comprehensive_fix_user_profiles_rls.sql
```

### 方法 2: 直接在 Supabase Dashboard 執行 SQL

1. 前往 Supabase Dashboard → SQL Editor
2. 執行以下 SQL：

```sql
-- 刪除舊政策（如果存在）
DROP POLICY IF EXISTS "使用者可讀取自己的資料" ON user_profiles;

-- 重新建立政策
CREATE POLICY "使用者可讀取自己的資料" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);
```

## 🔍 驗證修復

### 1. 檢查政策是否存在

在 Supabase Dashboard 執行：

```sql
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'user_profiles'
  AND policyname = '使用者可讀取自己的資料';
```

**預期結果：**
- 應該返回 1 筆記錄
- `cmd` 應該是 `SELECT`
- `qual` 應該包含 `auth.uid() = id`

### 2. 測試查詢

在 Supabase Dashboard 中，以測試使用者身份執行：

```sql
-- 這應該返回 1 筆記錄（使用者的資料）
SELECT * FROM user_profiles WHERE id = auth.uid();
```

### 3. 檢查應用程式日誌

修復後，重新啟動應用程式：

```bash
npm run dev
```

**預期結果：**
- 不再出現 PGRST116 錯誤
- 不再需要 fallback 到 Admin client
- 日誌中應該看到「成功查詢到使用者資料」（而不是「嘗試使用 Admin client」）

## 📋 完整的 RLS 政策清單

修復後，`user_profiles` 表應該有以下 SELECT 政策：

1. **使用者可讀取自己的資料**
   ```sql
   USING (auth.uid() = id)
   ```

2. **超級管理員可讀取所有使用者**
   ```sql
   USING (is_super_admin() = true)
   ```

3. **部門管理員可讀取部門成員**
   ```sql
   USING (
     get_user_role() = 'DEPT_ADMIN' 
     AND department_id = get_user_dept()
   )
   ```

## 🐛 如果問題持續存在

### 檢查項目 1: auth.uid() 是否正確

在 `lib/cache/user-profile.ts` 中添加調試日誌：

```typescript
const { data: { user: authUser } } = await supabase.auth.getUser();
console.log('🔍 Debug:', {
  authUserId: authUser?.id,
  queryUserId: userId,
  match: authUser?.id === userId,
  sessionExists: !!authUser
});
```

### 檢查項目 2: 是否有重複記錄

```sql
SELECT 
  id,
  COUNT(*) as count
FROM user_profiles
GROUP BY id
HAVING COUNT(*) > 1;
```

如果有重複記錄，需要清理。

### 檢查項目 3: 檢查輔助函式

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name IN ('is_super_admin', 'get_user_role', 'get_user_dept');
```

應該返回 3 筆記錄。

## 📚 相關文件

- `RLS_COMPREHENSIVE_FIX.md` - 詳細的診斷和修復指南
- `RLS_ANALYSIS.md` - RLS 問題分析
- `RLS_BEST_PRACTICES.md` - RLS 最佳實踐

## ✅ 修復檢查清單

- [ ] 執行 migration 或手動執行 SQL
- [ ] 驗證政策存在且條件正確
- [ ] 測試查詢返回正確結果
- [ ] 重新啟動應用程式
- [ ] 確認日誌中不再有 PGRST116 錯誤
- [ ] 測試使用者登入和資料查詢功能
