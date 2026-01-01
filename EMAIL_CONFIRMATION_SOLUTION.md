# 郵件驗證問題解決方案

## 🔍 問題

Supabase Dashboard 中找不到關閉郵件驗證的設定選項。

## ✅ 解決方案

我已經在應用程式層面實作了自動確認郵件的功能，**即使 Supabase 要求郵件驗證，系統也會自動確認**，使用者不需要點擊郵件連結。

### 實作方式

在註冊 API (`/api/auth/register`) 中，註冊成功後會自動使用 Admin API 確認使用者的郵件：

```typescript
// 如果 Supabase 要求郵件驗證，使用 Admin API 自動確認郵件
if (!authData.user.email_confirmed_at) {
  await adminClient.auth.admin.updateUserById(authData.user.id, {
    email_confirm: true, // 自動確認郵件
  });
}
```

### 優點

1. **不需要修改 Supabase Dashboard 設定**
2. **自動處理**：註冊後立即確認，使用者體驗無縫
3. **向後相容**：即使 Supabase 設定改變，系統仍能正常運作

## 📋 Supabase Dashboard 路徑（參考）

如果您仍然想嘗試在 Dashboard 中關閉，以下是可能的路徑：

### 路徑 1：Authentication → Providers
```
Dashboard → Authentication → Providers → Email → Confirm email [關閉]
```

### 路徑 2：Authentication → Settings
```
Dashboard → Authentication → Settings → Email Auth → Enable email confirmations [關閉]
```

### 路徑 3：Project Settings
```
Dashboard → Settings → Authentication → Email confirmations [關閉]
```

## 🧪 測試驗證

註冊後，可以透過以下 SQL 檢查郵件是否已確認：

```sql
SELECT 
  email,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

如果 `email_confirmed_at` 不為 NULL，表示郵件已確認。

## ✅ 結論

**您不需要在 Dashboard 中關閉郵件驗證**，系統已經自動處理了這個問題。新使用者註冊後會自動確認郵件，可以直接登入使用（但需要等待管理員審核）。
