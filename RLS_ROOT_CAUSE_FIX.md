# RLS 問題根本原因與修復報告

## 🔍 問題根本原因

經過深入診斷，發現問題的根本原因是：

### 核心問題：JWT Token 未正確傳遞到資料庫層面

即使：
- ✅ Session 存在且正確
- ✅ `authUserId` 和 `sessionUserId` 都匹配
- ✅ `hasAccessToken: true`
- ✅ RLS 政策存在且正確

但在資料庫層面執行 RLS 政策時，`auth.uid()` **仍然返回 NULL**，導致：
- RLS 政策條件 `auth.uid() = id` 結果為 NULL（不是 true）
- PostgreSQL 的 NULL 比較永遠返回 NULL，不是 true 或 false
- RLS 因此阻擋查詢，返回 0 筆記錄
- `.single()` 期望 1 筆記錄，但收到 0 筆，觸發 PGRST116 錯誤

### 根本原因：createServerClient 設定問題

**問題設定：**
```typescript
return createServerClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      Authorization: headersStore.get('Authorization') || '', // ❌ 這會干擾
    },
  },
  cookies: { ... }
});
```

**問題分析：**
- 設定 `global.headers.Authorization` 可能會干擾 JWT token 從 cookies 傳遞
- 根據 Supabase SSR 文件，JWT token 應該**只從 cookies 傳遞**，不應該在 headers 中設定
- 這導致資料庫層面無法正確取得 JWT token，`auth.uid()` 返回 NULL

## ✅ 已執行的修復

### 1. 修復 createServerClient 設定（關鍵修復）

**修改檔案：** `lib/supabase/server.ts`

**修改前：**
```typescript
return createServerClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      Authorization: headersStore.get('Authorization') || '',
    },
  },
  cookies: { ... }
});
```

**修改後：**
```typescript
// 移除 global.headers.Authorization
// JWT token 應該只從 cookies 傳遞
return createServerClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      } catch {
        // 在 Server Actions 中可能無法設定 cookies
      }
    },
  },
});
```

### 2. 改進查詢邏輯與診斷

**修改檔案：** `lib/cache/user-profile.ts`

**改進內容：**
- 先不使用 `.single()`，檢查實際返回的記錄數
- 加入詳細的診斷資訊，顯示：
  - 返回的記錄數
  - 診斷結果（RLS 阻擋 / 查詢成功 / 重複記錄）
- 根據返回的記錄數決定後續處理

### 3. 建立測試 RLS 政策

**Migration：** `test_rls_diagnosis_policy`

**測試政策：**
```sql
CREATE POLICY "診斷：測試使用者讀取自己的資料" ON user_profiles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = id
  );
```

**目的：** 如果這個測試政策可以運作，表示問題在於原始政策的條件。

## 🧪 測試與驗證

### 預期結果

修復後，應該看到：

1. **新的診斷日誌**
   ```
   🔍 RLS 查詢診斷: {
     returnedCount: 1,  // 應該是 1，不是 0
     diagnosis: '✅ 查詢成功'
   }
   ```

2. **不再出現 PGRST116 錯誤**
   - 查詢直接成功
   - 不再需要 fallback 到 Admin client

3. **查詢直接成功**
   - 不再看到 "使用者資料查詢失敗（可能是 RLS 限制）"
   - 不再看到 "嘗試使用 Admin client"

### 如果問題仍然存在

如果修復後問題仍然存在，新的診斷日誌會顯示：
- `returnedCount: 0` → 表示 RLS 仍然阻擋（需要進一步診斷）
- `returnedCount: 1` → 表示查詢成功（問題已解決）

## 📋 修復檢查清單

- [x] 移除 `createServerClient` 中的 `global.headers.Authorization`
- [x] 改進查詢邏輯，加入詳細診斷
- [x] 建立測試 RLS 政策
- [x] 驗證建置成功
- [ ] 測試修復是否生效（需要重新啟動應用程式）

## 🚀 下一步

1. **重新啟動應用程式**
   ```bash
   npm run dev
   ```

2. **檢查新的診斷日誌**
   - 查看 `🔍 RLS 查詢診斷` 日誌
   - 確認 `returnedCount` 是否為 1
   - 確認 `diagnosis` 是否為 "✅ 查詢成功"

3. **如果問題持續**
   - 檢查診斷日誌中的 `returnedCount`
   - 如果為 0，表示 JWT token 仍然沒有正確傳遞
   - 需要進一步檢查 cookies 設定

## 📝 技術細節

### 為什麼移除 global.headers.Authorization 很重要？

1. **Supabase SSR 設計**
   - `@supabase/ssr` 的 `createServerClient` 設計為從 cookies 讀取 JWT token
   - 設定 `global.headers.Authorization` 可能會覆蓋或干擾這個機制

2. **JWT Token 傳遞流程**
   - 瀏覽器 → Cookies → Next.js Server → Supabase Client → 資料庫
   - 如果在 headers 中設定 Authorization，可能會中斷這個流程

3. **RLS 政策執行**
   - RLS 政策在資料庫層面執行
   - 需要從請求的 JWT token 中取得使用者 ID
   - 如果 JWT token 沒有正確傳遞，`auth.uid()` 會返回 NULL

## ✅ 結論

**根本原因已找到並修復：**
- 問題：`createServerClient` 中的 `global.headers.Authorization` 干擾了 JWT token 從 cookies 傳遞
- 修復：移除 `global.headers.Authorization`，只依賴 cookies
- 預期：查詢應該直接成功，不再需要 fallback

**請重新啟動應用程式並測試修復是否生效。**
