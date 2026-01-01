# RLS 問題全面分析與修復指南

## 🔍 問題診斷

### 錯誤現象
```
使用者資料查詢失敗（可能是 RLS 限制），嘗試使用 Admin client: {
  userId: '82eb6660-cc05-44f2-aa57-61ab33511d15',
  errorCode: 'PGRST116',
  errorMessage: 'Cannot coerce the result to a single JSON object',
  authUserId: '82eb6660-cc05-44f2-aa57-61ab33511d15'
}
```

### 錯誤原因分析

**PGRST116 錯誤** 表示：
- `.single()` 方法期望返回恰好 1 筆記錄
- 但實際查詢返回了 0 筆或多筆記錄
- 在我們的案例中，最可能是返回了 **0 筆記錄**（RLS 阻擋）

### 可能的原因

1. **RLS 政策缺失或錯誤**
   - 「使用者可讀取自己的資料」政策不存在
   - 政策條件不正確（例如：`auth.uid() = id` 未正確匹配）

2. **auth.uid() 未正確設定**
   - Supabase session 未正確初始化
   - Middleware 未正確傳遞認證資訊
   - Cookie 或 Header 設定問題

3. **資料庫記錄問題**
   - 使用者記錄不存在
   - 有重複記錄導致查詢失敗

4. **Migration 未執行**
   - `20260102000000_fix_user_profiles_select_policy.sql` 未執行
   - 政策被其他 migration 意外刪除

## 🔧 修復步驟

### 步驟 1: 檢查 RLS 政策狀態

在 Supabase Dashboard 的 SQL Editor 中執行：

```sql
-- 檢查所有 user_profiles 的 RLS 政策
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'user_profiles'
ORDER BY policyname;
```

**預期結果：**
應該看到至少 3 個 SELECT 政策：
1. `使用者可讀取自己的資料` - `USING (auth.uid() = id)`
2. `超級管理員可讀取所有使用者` - `USING (is_super_admin() = true)`
3. `部門管理員可讀取部門成員` - `USING (get_user_role() = 'DEPT_ADMIN' AND department_id = get_user_dept())`

### 步驟 2: 執行修復 Migration

執行新建立的 migration：
```bash
# 如果使用 Supabase CLI
supabase db push

# 或直接在 Supabase Dashboard 執行
# supabase/migrations/20260103000000_comprehensive_fix_user_profiles_rls.sql
```

### 步驟 3: 檢查資料完整性

```sql
-- 檢查是否有重複記錄
SELECT 
  id,
  COUNT(*) as count
FROM user_profiles
GROUP BY id
HAVING COUNT(*) > 1;

-- 檢查特定使用者記錄
SELECT * FROM user_profiles 
WHERE id = '82eb6660-cc05-44f2-aa57-61ab33511d15';
```

### 步驟 4: 檢查輔助函式

```sql
-- 檢查所有輔助函式是否存在
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_user_role', 'get_user_dept', 'is_admin', 'is_super_admin')
ORDER BY routine_name;
```

### 步驟 5: 測試 RLS 政策

在 Supabase Dashboard 中，以測試使用者身份執行：

```sql
-- 測試：使用者查詢自己的資料
-- 這應該返回 1 筆記錄
SELECT * FROM user_profiles WHERE id = auth.uid();
```

如果返回 0 筆記錄，表示 RLS 政策有問題。

## 🐛 深入診斷

### 診斷 1: 檢查 auth.uid() 是否正確

在應用程式中，檢查 `auth.uid()` 是否返回正確的值：

```typescript
// 在 lib/cache/user-profile.ts 中
const { data: { user: authUser } } = await supabase.auth.getUser();
console.log('auth.uid():', authUser?.id);
console.log('查詢的 userId:', userId);
console.log('是否匹配:', authUser?.id === userId);
```

### 診斷 2: 檢查 Supabase Client 初始化

確認 `createClient()` 正確初始化並設定 session：

```typescript
// 在 lib/supabase/server.ts 中
const supabase = await createClient();
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session?.user?.id);
```

### 診斷 3: 檢查 Middleware

確認 middleware 正確處理認證：

```typescript
// 在 middleware.ts 中
const { data: { user } } = await supabase.auth.getUser();
console.log('Middleware user:', user?.id);
```

## ✅ 修復驗證

修復後，請驗證以下項目：

1. **應用程式日誌**
   - 不再出現 PGRST116 錯誤
   - 不再需要 fallback 到 Admin client

2. **功能測試**
   - 使用者可以正常登入
   - Dashboard 可以正常載入使用者資料
   - 管理員功能正常運作

3. **效能測試**
   - 查詢速度正常（不需要 fallback）
   - 沒有不必要的 Admin client 查詢

## 📋 修復檢查清單

- [ ] 執行 migration `20260103000000_comprehensive_fix_user_profiles_rls.sql`
- [ ] 確認「使用者可讀取自己的資料」政策存在
- [ ] 確認政策條件為 `auth.uid() = id`
- [ ] 確認沒有重複記錄
- [ ] 確認輔助函式存在
- [ ] 測試使用者查詢自己的資料
- [ ] 檢查應用程式日誌，確認不再有 PGRST116 錯誤
- [ ] 移除不必要的 Admin client fallback（可選）

## 🔄 長期解決方案

### 1. 移除 Admin Client Fallback

修復 RLS 後，可以考慮移除 `lib/cache/user-profile.ts` 中的 Admin client fallback，改為：

```typescript
// 如果查詢失敗，直接返回 null 或拋出錯誤
// 而不是使用 Admin client 繞過 RLS
if (error) {
  console.error('取得使用者資料失敗:', error);
  return null;
}
```

### 2. 確保 Migration 順序

確保所有 migration 按正確順序執行：
1. `20240101000001_enable_rls.sql` - 啟用 RLS 並建立初始政策
2. `20240101000002_fix_rls_recursion.sql` - 修復遞迴問題
3. `20260102000000_fix_user_profiles_select_policy.sql` - 修復缺失的政策
4. `20260102030000_fix_rls_security_definer_functions.sql` - 修復輔助函式
5. `20260103000000_comprehensive_fix_user_profiles_rls.sql` - 全面修復

### 3. 建立自動化測試

建立測試腳本來驗證 RLS 政策：

```typescript
// scripts/test-rls-policies.ts
// 測試各種角色的 RLS 政策是否正確運作
```

## 📚 參考文件

- [Supabase RLS 文件](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS 文件](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- 專案文件：`RLS_ANALYSIS.md`, `RLS_BEST_PRACTICES.md`
