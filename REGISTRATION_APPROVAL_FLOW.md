# 註冊審核流程完整說明

## 📋 功能概述

本系統實現了完整的註冊審核機制，符合以下需求：

1. ✅ **任何人都可以註冊** - 無需任何限制
2. ✅ **註冊不需要認證信** - 直接註冊成功，自動確認郵件
3. ✅ **註冊後狀態為 PENDING** - 需要管理員審核
4. ✅ **只有管理員可以審核** - SUPER_ADMIN 和 DEPT_ADMIN 可以審核
5. ✅ **審核通過後才能使用** - 待審核使用者無法使用任何功能
6. ✅ **管理員可以設定角色** - 審核時可以設定為 USER、EDITOR、DEPT_ADMIN 或 SUPER_ADMIN

---

## 🔄 完整流程

### 1. 使用者註冊流程

```
使用者填寫註冊表單
    ↓
提交到 /api/auth/register
    ↓
建立 Supabase Auth 使用者（自動確認郵件）
    ↓
建立 user_profiles 記錄（status = 'PENDING'）
    ↓
顯示註冊成功訊息
    ↓
3 秒後導向登入頁面
```

**關鍵設定：**
- 註冊 API 設定 `emailRedirectTo: undefined`（不需要郵件驗證）
- 自動使用 Admin API 確認郵件（`email_confirm: true`）
- 新使用者狀態自動設為 `PENDING`
- 預設角色為 `USER`（管理員審核時可修改）

### 2. 使用者登入流程

```
使用者登入
    ↓
檢查 user_profiles.status
    ↓
┌─────────────────┬─────────────────┐
│  status = PENDING │ status = APPROVED │
│  ↓                │  ↓                │
│ 導向 /dashboard/pending │ 導向 /dashboard │
│ 顯示待審核訊息    │ 正常使用系統     │
└─────────────────┴─────────────────┘
```

**權限控制：**
- 待審核使用者（PENDING）只能看到待審核頁面
- 所有其他頁面會自動導向待審核頁面
- 所有 API（除了登出）都會返回 403 錯誤

### 3. 管理員審核流程

```
管理員登入（SUPER_ADMIN 或 DEPT_ADMIN）
    ↓
前往 /dashboard/admin/users
    ↓
查看「待審核使用者」區塊
    ↓
選擇角色和部門（如需要）
    ↓
點擊「通過」或「拒絕」
    ↓
系統更新使用者狀態和角色
    ↓
使用者可以正常使用系統（如果通過）
```

**審核功能：**
- 只有 SUPER_ADMIN 和 DEPT_ADMIN 可以審核
- 審核通過時必須指定角色
- 可以選擇部門（可選）
- 只有 SUPER_ADMIN 可以設定 SUPER_ADMIN 或 DEPT_ADMIN 角色

---

## 🗄️ 資料庫結構

### user_profiles 表

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'USER' 
    CHECK (role IN ('SUPER_ADMIN', 'DEPT_ADMIN', 'EDITOR', 'USER')),
  status VARCHAR(20) DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  department_id UUID REFERENCES departments(id),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 狀態說明

| 狀態 | 說明 | 權限 |
|------|------|------|
| **PENDING** | 待審核 | 只能看到待審核頁面，無法使用任何功能 |
| **APPROVED** | 已審核通過 | 可以正常使用系統，權限由角色決定 |
| **REJECTED** | 已拒絕 | 無法使用系統（可擴充功能） |

### 角色說明

| 角色 | 說明 | 權限 |
|------|------|------|
| **SUPER_ADMIN** | 超級管理員 | 所有權限，可以審核並設定任何角色 |
| **DEPT_ADMIN** | 部門管理員 | 可以審核使用者，但只能設定 USER、EDITOR 角色 |
| **EDITOR** | 知識維護者 | 可以上傳和管理知識庫檔案 |
| **USER** | 一般使用者 | 只能使用 Agent 對話功能 |

---

## 🔐 權限控制機制

### API 端點權限

1. **註冊 API** (`/api/auth/register`)
   - ✅ 任何人都可以存取
   - ✅ 不需要郵件驗證
   - ✅ 自動確認郵件

2. **審核 API** (`/api/users/approve`)
   - ✅ 只有 SUPER_ADMIN 和 DEPT_ADMIN 可以存取
   - ✅ 審核通過時必須指定角色
   - ✅ 只有 SUPER_ADMIN 可以設定管理員角色

3. **其他 API**
   - ❌ 待審核使用者無法存取（除了登出）
   - ✅ 已審核使用者根據角色權限存取

### 頁面權限

1. **公開頁面**
   - `/` - 首頁
   - `/login` - 登入頁
   - `/register` - 註冊頁

2. **待審核使用者**
   - ✅ `/dashboard/pending` - 待審核頁面
   - ❌ 所有其他頁面會自動導向待審核頁面

3. **已審核使用者**
   - ✅ 根據角色權限存取相應頁面
   - ✅ SUPER_ADMIN 可以存取所有管理頁面

---

## 📝 Migration 檔案

### 1. 添加 status 欄位

**檔案：** `supabase/migrations/20260104000000_add_user_status_field.sql`

- 添加 `status` 欄位到 `user_profiles` 表
- 建立索引以提升查詢效能
- 將現有使用者狀態設為 `APPROVED`

### 2. 更新觸發器

**檔案：** `supabase/migrations/20260102020000_add_user_profile_trigger.sql`

- 更新 `handle_new_user()` 函式以包含 `status` 欄位
- 新使用者自動設為 `PENDING` 狀態
- 使用 `ON CONFLICT` 處理 API 和觸發器同時建立記錄的情況

---

## 🎨 UI/UX 設計

### 註冊頁面 (`/register`)

- 顯示藍色提示框，說明需要審核
- 註冊成功後顯示明確的審核訊息
- 3 秒後自動導向登入頁面

### 待審核頁面 (`/dashboard/pending`)

- 顯示時鐘圖示和「帳號審核中」標題
- 說明審核通過後的權限
- 提供登出功能

### 管理員審核頁面 (`/dashboard/admin/users`)

- 分離顯示待審核和已審核使用者
- 待審核使用者使用黃色背景標示
- 提供角色和部門選擇下拉選單
- 提供「通過」和「拒絕」按鈕

---

## ⚙️ 設定步驟

### 1. 執行 Migration

```bash
# 確保所有 migration 都已執行
# 特別是：
# - 20260104000000_add_user_status_field.sql
# - 20260102020000_add_user_profile_trigger.sql
```

### 2. Supabase Dashboard 設定

1. 前往 **Authentication → Settings**
2. 關閉 **"Enable email confirmations"**（不需要郵件驗證）
3. 儲存設定

### 3. 環境變數

確保以下環境變數已設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## ✅ 測試檢查清單

### 註冊流程測試

- [ ] 任何人都可以註冊（無需任何限制）
- [ ] 註冊不需要郵件驗證
- [ ] 註冊成功後狀態為 PENDING
- [ ] 註冊成功後顯示審核訊息
- [ ] 註冊成功後自動導向登入頁面

### 登入流程測試

- [ ] 待審核使用者登入後導向待審核頁面
- [ ] 待審核使用者無法存取其他頁面
- [ ] 待審核使用者無法使用 API（除了登出）
- [ ] 已審核使用者可以正常使用系統

### 審核流程測試

- [ ] 只有管理員可以看到待審核使用者
- [ ] 管理員可以選擇角色和部門
- [ ] 管理員可以通過或拒絕審核
- [ ] 審核通過後使用者可以正常使用系統
- [ ] 只有 SUPER_ADMIN 可以設定管理員角色

---

## 🐛 常見問題

### Q: 註冊後無法登入？

**A:** 檢查：
1. Supabase Dashboard 中是否關閉了郵件驗證
2. `user_profiles` 表中是否有對應記錄
3. `status` 欄位是否正確設定為 `PENDING`

### Q: 待審核使用者可以看到其他頁面？

**A:** 檢查：
1. `middleware.ts` 中的權限檢查是否正確
2. `dashboard/layout.tsx` 中的狀態檢查是否正確
3. `status` 欄位是否正確設定

### Q: 管理員無法審核使用者？

**A:** 檢查：
1. 管理員的角色是否為 `SUPER_ADMIN` 或 `DEPT_ADMIN`
2. `/api/users/approve` API 的權限檢查是否正確
3. RLS 政策是否允許管理員查詢所有使用者

---

## 📚 相關檔案

### API 端點
- `app/api/auth/register/route.ts` - 註冊 API
- `app/api/users/approve/route.ts` - 審核 API

### 頁面
- `app/(auth)/register/page.tsx` - 註冊頁面
- `app/(auth)/login/LoginForm.tsx` - 登入表單
- `app/dashboard/pending/page.tsx` - 待審核頁面
- `app/dashboard/admin/users/page.tsx` - 使用者管理頁面

### 權限控制
- `middleware.ts` - 中間件權限檢查
- `lib/permissions.ts` - 權限檢查函式
- `app/dashboard/layout.tsx` - Dashboard 佈局權限檢查

### 資料庫
- `supabase/migrations/20260104000000_add_user_status_field.sql` - 添加 status 欄位
- `supabase/migrations/20260102020000_add_user_profile_trigger.sql` - 更新觸發器

---

## 🎯 總結

本系統已完整實現註冊審核機制，符合所有需求：

✅ 任何人都可以註冊  
✅ 註冊不需要認證信  
✅ 註冊後狀態為 PENDING  
✅ 只有管理員可以審核  
✅ 審核通過後才能使用  
✅ 管理員可以設定角色和權限  

系統已準備就緒，可以開始接受新使用者註冊！
