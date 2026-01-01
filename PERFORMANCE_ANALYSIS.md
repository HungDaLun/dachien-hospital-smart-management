# 效能分析報告

## 🔍 發現的效能問題

### 1. Middleware 中的重複資料庫查詢

**問題位置**：`middleware.ts`

**問題描述**：
- 每個請求都會執行 `supabase.auth.getUser()` (第70行)
- 對於 API 路由，會再次查詢 `user_profiles` (第100-104行)
- 對於管理員路由，又會再次查詢 `user_profiles` (第161-165行, 174-178行)
- 這導致一個請求可能執行 **2-3 次資料庫查詢**

**影響**：
- 每個頁面載入都會有額外的資料庫查詢延遲
- 公開路由（如首頁）也會執行不必要的認證查詢

### 2. Dashboard Layout 重複查詢

**問題位置**：`app/dashboard/layout.tsx`

**問題描述**：
- Middleware 已經查詢過使用者資訊
- Layout 又再次查詢 `supabase.auth.getUser()` 和 `user_profiles`
- 造成重複的資料庫查詢

### 3. 字體載入

**問題位置**：`app/layout.tsx`

**問題描述**：
- 載入 Google Fonts (Inter 和 Noto Sans TC)
- 雖然使用了 `display: 'swap'`，但首次載入仍需要下載字體

### 4. 沒有快取機制

**問題描述**：
- 每次請求都重新查詢資料庫
- 沒有使用 React cache 或 Next.js unstable_cache

---

## 🚀 優化方案

### 方案 1：優化 Middleware（優先實作）

1. **快取 user_profiles 查詢結果**
2. **對於公開路由，跳過不必要的認證查詢**
3. **將 profile 資料存在 header 中傳遞給後續請求**

### 方案 2：使用 React cache

在 layout 和 page 中使用 React 的 `cache` 函數來快取查詢結果。

### 方案 3：字體優化

考慮使用 `next/font/local` 或預載入字體。

---

## 📊 預期改善

- **首頁載入時間**：減少 200-500ms
- **Dashboard 載入時間**：減少 300-600ms
- **資料庫查詢次數**：從 2-3 次減少到 1 次
