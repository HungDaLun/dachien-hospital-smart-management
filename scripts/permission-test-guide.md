# 權限測試執行指南

本指南說明如何執行自動化權限測試腳本。

## 前置準備

### 1. 安裝依賴

確保已安裝 `tsx`（TypeScript 執行器）：

```bash
npm install -D tsx
```

或使用 npx（推薦）：

```bash
npx tsx scripts/permission-test.ts
```

### 2. 建立測試帳號

在 Supabase Dashboard 或使用 SQL 建立以下測試帳號：

```sql
-- 建立測試部門
INSERT INTO departments (name, description) VALUES
  ('測試部門 A', '用於權限測試的部門 A'),
  ('測試部門 B', '用於權限測試的部門 B')
ON CONFLICT (name) DO NOTHING;

-- 取得部門 ID（請替換為實際的部門 ID）
-- SELECT id FROM departments WHERE name = '測試部門 A';
-- SELECT id FROM departments WHERE name = '測試部門 B';
```

然後在 Supabase Auth 中建立測試使用者，並在 `user_profiles` 中設定角色：

```sql
-- 假設您已經在 Supabase Auth 中建立了使用者
-- 請替換 'USER_ID' 為實際的使用者 ID

-- DEPT_ADMIN (部門 A)
UPDATE user_profiles 
SET role = 'DEPT_ADMIN', department_id = '部門A的UUID'
WHERE email = 'deptadmin-a@test.com';

-- EDITOR (部門 A)
UPDATE user_profiles 
SET role = 'EDITOR', department_id = '部門A的UUID'
WHERE email = 'editor-a@test.com';

-- USER (部門 A)
UPDATE user_profiles 
SET role = 'USER', department_id = '部門A的UUID'
WHERE email = 'user-a@test.com';
```

### 3. 設定環境變數

確保 `.env.local` 檔案包含：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. 修改測試腳本

編輯 `scripts/permission-test.ts`，修改測試帳號資訊：

```typescript
const testAccounts = {
  superAdmin: {
    email: 'siriue0@gmail.com', // 您的 SUPER_ADMIN 帳號
    password: 'YOUR_PASSWORD',  // 實際密碼
  },
  deptAdmin: {
    email: 'deptadmin-a@test.com',
    password: 'YOUR_PASSWORD',
  },
  // ... 其他帳號
};
```

## 執行測試

### 方法 1: 使用 npx（推薦）

```bash
# 確保應用程式正在運行
npm run dev

# 在另一個終端執行測試
npx tsx scripts/permission-test.ts
```

### 方法 2: 使用 ts-node

```bash
npm install -D ts-node
npx ts-node scripts/permission-test.ts
```

### 方法 3: 編譯後執行

```bash
# 編譯 TypeScript
npx tsc scripts/permission-test.ts --outDir dist --esModuleInterop

# 執行
node dist/permission-test.js
```

## 測試結果解讀

### 成功案例

```
✅ SUPER_ADMIN 存取 /api/system/config
   狀態碼: 200
```

### 失敗案例（預期的拒絕）

```
✅ DEPT_ADMIN 存取 /api/system/config (應被拒絕)
   狀態碼: 403
```

### 實際失敗案例

```
❌ SUPER_ADMIN 建立 Agent
   錯誤: 預期狀態碼 201，實際為 500
   狀態碼: 500
```

## 測試覆蓋範圍

目前測試腳本涵蓋：

1. ✅ 系統設定 API（僅 SUPER_ADMIN）
2. ✅ Agent 管理 API（建立、查看）
3. ✅ 檔案管理 API（查看列表）
4. ✅ 未登入保護
5. ✅ 公開端點（健康檢查）

## 擴展測試

您可以根據 `PERMISSION_TEST_PLAN.md` 中的測試案例，擴展測試腳本：

```typescript
// 範例：測試檔案刪除權限
results.push(
  await testApi(
    'EDITOR 刪除自己上傳的檔案',
    'DELETE',
    '/api/files/FILE_ID',
    tokens.editor,
    undefined,
    200
  )
);
```

## 疑難排解

### 問題 1: Token 取得失敗

**錯誤訊息：**
```
❌ 無法登入 deptadmin-a@test.com: Invalid login credentials
```

**解決方法：**
- 確認測試帳號已正確建立
- 確認密碼正確
- 確認帳號在 Supabase Auth 中已啟用

### 問題 2: 連線失敗

**錯誤訊息：**
```
❌ 測試執行失敗: fetch failed
```

**解決方法：**
- 確認應用程式正在運行（`npm run dev`）
- 確認 `NEXT_PUBLIC_APP_URL` 設定正確
- 確認網路連線正常

### 問題 3: 環境變數未設定

**錯誤訊息：**
```
❌ 請設定環境變數：NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**解決方法：**
- 確認 `.env.local` 檔案存在
- 確認環境變數名稱正確
- 嘗試使用 `dotenv` 載入環境變數

## 下一步

1. 根據測試結果修復權限問題
2. 擴展測試案例覆蓋更多場景
3. 整合到 CI/CD 流程中
