# Supabase 認證設定指南

## 🔧 關閉郵件驗證

為了讓註冊流程簡化（不需要郵件驗證），需要在 Supabase Dashboard 中關閉郵件驗證功能。

### 設定步驟

1. **前往 Supabase Dashboard**
   - 登入您的 Supabase 專案
   - 專案 ID: `vjvmwyzpjmzzhfiaojul`
   - 專案名稱: Knowledge Architects

2. **進入 Authentication 設定**
   - 左側選單 → Authentication → Settings

3. **關閉郵件驗證**
   - 找到 "Email Auth" 區塊
   - 關閉 "Enable email confirmations" 選項
   - 或設定 "Confirm email" 為 `false`

### 替代方案（透過 SQL）

如果無法透過 Dashboard 設定，可以嘗試透過 SQL（但 Supabase 可能不支援直接修改認證設定）：

```sql
-- 注意：Supabase 的認證設定通常無法透過 SQL 修改
-- 需要在 Dashboard 中手動設定
```

## ✅ 驗證設定

設定完成後，可以透過以下方式驗證：

1. **測試註冊**
   - 前往 `/register` 頁面
   - 註冊一個新帳號
   - 應該不需要郵件驗證即可註冊成功

2. **檢查使用者狀態**
   - 新註冊的使用者狀態應該是 `PENDING`
   - 可以在 Supabase Dashboard → Table Editor → user_profiles 中查看

## 📝 注意事項

- 關閉郵件驗證後，所有新註冊的使用者都不需要驗證郵件
- 現有已驗證的使用者不受影響
- 建議在生產環境中保留郵件驗證，或實作其他安全機制

## 🔐 安全建議

雖然關閉了郵件驗證，但系統仍有以下安全機制：

1. **審核機制**：所有新使用者都需要管理員審核
2. **密碼要求**：密碼長度至少 6 個字元
3. **RLS 政策**：資料庫層面的權限控制
4. **角色權限**：不同角色有不同的權限
