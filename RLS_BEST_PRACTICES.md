# RLS 最佳實踐說明

## 📋 決策總結

經過檢查，我們採用了**直接修正並依賴 RLS 政策**的方案，而非使用 Admin client 繞過 RLS。這是正確的最佳實踐。

## ✅ 為什麼選擇直接依賴 RLS？

### 優點

1. **安全性更高**
   - 權限控制發生在資料庫層面，無法被繞過
   - 即使應用程式碼有漏洞，資料庫仍然會保護資料
   - 符合最小權限原則（Principle of Least Privilege）

2. **效能更好**
   - 不需要額外的 fallback 邏輯和重試機制
   - 查詢直接在資料庫層面過濾，減少網路傳輸

3. **維護性更好**
   - 權限邏輯集中管理，易於理解和修改
   - 不需要在每個查詢點都寫權限檢查邏輯

4. **符合 Supabase 設計理念**
   - Supabase 的 RLS 就是為了在資料庫層面處理權限
   - 這是官方推薦的做法

## 🔍 目前的 RLS 政策狀態

### user_profiles 表的 SELECT 政策

1. **使用者可讀取自己的資料**
   ```sql
   USING (auth.uid() = id)
   ```
   - 所有人可以讀取自己的資料

2. **超級管理員可讀取所有使用者**
   ```sql
   USING (is_super_admin() = true)
   ```
   - SUPER_ADMIN 可以讀取所有使用者資料
   - 使用 `is_super_admin()` 輔助函式（SECURITY DEFINER）

3. **部門管理員可讀取部門成員**
   ```sql
   USING (
     get_user_role() = 'DEPT_ADMIN' 
     AND department_id = get_user_dept()
   )
   ```
   - DEPT_ADMIN 可以讀取同部門的成員

### 輔助函式

- `is_super_admin()` - 檢查當前使用者是否為 SUPER_ADMIN（SECURITY DEFINER）
- `get_user_role()` - 取得當前使用者的角色（SECURITY DEFINER）
- `get_user_dept()` - 取得當前使用者的部門 ID（SECURITY DEFINER）

這些函式使用 `SECURITY DEFINER`，可以繞過 RLS 限制來查詢使用者自己的資料，避免無限遞迴問題。

## 🔧 應用程式碼的實作

### 查詢「自己的」資料

使用 `getCachedUserProfile(userId)`：
- 有 fallback 機制，可以自動建立 `user_profiles` 記錄（如果不存在）
- 這對於新使用者登入時很重要

### 查詢「所有使用者」（SUPER_ADMIN）

直接使用普通的 supabase client：
```typescript
const { data: users } = await supabase
  .from('user_profiles')
  .select('*')
  .order('created_at', { ascending: false });
```

RLS 會自動處理：
- 如果是 SUPER_ADMIN：可以查詢所有使用者
- 如果不是 SUPER_ADMIN：查詢會被阻擋

## ⚠️ 何時使用 Admin Client？

Admin client 應該**只在以下情況使用**：

1. **系統級操作**
   - 背景任務（cron jobs）
   - 資料遷移
   - 自動建立使用者資料（在新使用者註冊時）

2. **緊急修復**
   - 當 RLS 政策有問題且需要立即修復時（臨時方案）
   - 之後應該立即修正 RLS 政策

3. **不應該用於**：
   - 日常的應用程式查詢
   - 管理頁面的資料查詢
   - 任何可以由 RLS 處理的情況

## 📝 總結

- ✅ **RLS 政策已正確設定** - SUPER_ADMIN 可以查詢所有使用者
- ✅ **應用程式碼直接依賴 RLS** - 不使用 fallback 繞過
- ✅ **只在必要時使用 Admin client** - 例如自動建立使用者資料
- ✅ **符合最佳實踐** - 安全性、效能、維護性都更好

如果將來發現 RLS 政策有問題，應該：
1. 使用 Supabase MCP 檢查實際的 RLS 政策狀態
2. 建立 migration 修正 RLS 政策
3. 不要在應用程式碼中用 fallback 繞過問題
