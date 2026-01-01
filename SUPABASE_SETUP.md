# Supabase 後端設定指南

本文件說明如何設定 Supabase 後端，包含本地開發與雲端部署兩種方式。

## 📋 目錄

1. [環境變數設定](#環境變數設定)
2. [本地開發設定](#本地開發設定)
3. [雲端 Supabase 設定](#雲端-supabase-設定)
4. [資料庫 Migration](#資料庫-migration)
5. [驗證設定](#驗證設定)

---

## 環境變數設定

### 建立 `.env.local` 檔案

在專案根目錄建立 `.env.local` 檔案（此檔案不會被 Git 追蹤）：

```bash
# Supabase 設定（後端中立性原則：可切換 Cloud/Self-hosted）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Service Role Key（僅用於伺服器端，絕不暴露給前端）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# S3/MinIO 設定（Hub Layer - 資料主權層）
S3_ENDPOINT=your_s3_endpoint
S3_ACCESS_KEY=your_s3_access_key
S3_SECRET_KEY=your_s3_secret_key
S3_BUCKET_NAME=your_bucket_name
S3_REGION=your_region

# 應用程式設定
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 環境變數說明

| 變數名稱 | 說明 | 取得方式 |
|---------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名金鑰（公開） | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服務角色金鑰（機密） | Supabase Dashboard → Settings → API |
| `GEMINI_API_KEY` | Google Gemini API 金鑰 | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `S3_ENDPOINT` | S3/MinIO 端點 | 本地：`http://localhost:9000`，雲端：AWS S3 端點 |
| `S3_ACCESS_KEY` | S3 存取金鑰 | MinIO 或 AWS IAM |
| `S3_SECRET_KEY` | S3 秘密金鑰 | MinIO 或 AWS IAM |
| `S3_BUCKET_NAME` | S3 儲存桶名稱 | 自行建立 |
| `S3_REGION` | S3 區域 | 如：`us-east-1`、`ap-southeast-1` |

---

## 本地開發設定

### 1. 啟動本地 Supabase

```bash
# 啟動 Supabase 本地環境（包含 PostgreSQL、Auth、Storage 等）
supabase start

# 查看本地 Supabase 資訊
supabase status
```

啟動後會顯示：
- API URL: `http://127.0.0.1:54321`
- GraphQL URL: `http://127.0.0.1:54321/graphql/v1`
- DB URL: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Studio URL: `http://127.0.0.1:54323`
- Inbucket URL: `http://127.0.0.1:54324`

### 2. 設定本地環境變數

將 `.env.local` 中的 Supabase 設定改為本地值：

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

> **注意**：這些是 Supabase 本地開發的預設金鑰，僅用於本地開發，不要用於生產環境。

### 3. 執行資料庫 Migration

```bash
# 執行所有 migration
supabase db reset

# 或只執行新的 migration
supabase migration up
```

### 4. 開啟 Supabase Studio

```bash
# 在瀏覽器開啟 Supabase Studio
open http://127.0.0.1:54323
```

在 Studio 中可以：
- 查看資料表結構
- 編輯資料
- 執行 SQL 查詢
- 管理使用者

### 5. 停止本地 Supabase

```bash
supabase stop
```

---

## 雲端 Supabase 設定

### 1. 建立 Supabase 專案

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 點擊「New Project」
3. 填寫專案資訊：
   - **Name**: EAKAP
   - **Database Password**: 設定強密碼（請妥善保存）
   - **Region**: 選擇最接近的區域（建議：Northeast Asia (Tokyo)）
4. 等待專案建立完成（約 2 分鐘）

### 2. 取得 API 金鑰（詳細步驟）

#### 步驟 1：進入 API 設定頁面

1. 在 Supabase Dashboard 中，點擊左側選單的 **⚙️ Settings**（設定）
2. 在 Settings 子選單中，點擊 **API**

#### 步驟 2：找到 Project URL

在 API 設定頁面的頂部，您會看到：

- **Project URL**
  - 格式：`https://xxxxx.supabase.co`
  - 這是您的 `NEXT_PUBLIC_SUPABASE_URL`
  - 點擊右側的 **📋 複製圖示** 即可複製

#### 步驟 3：找到 API Keys

在 **Project API keys** 區塊中，您會看到兩個金鑰：

1. **`anon` `public`** 金鑰
   - 這是公開的匿名金鑰，用於前端
   - 這是您的 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - 點擊右側的 **👁️ 顯示** 按鈕查看完整金鑰
   - 點擊 **📋 複製** 按鈕複製

2. **`service_role` `secret`** 金鑰
   - ⚠️ **這是機密金鑰，擁有完整資料庫權限**
   - 這是您的 `SUPABASE_SERVICE_ROLE_KEY`
   - **絕不要暴露給前端或提交到 Git**
   - 點擊右側的 **👁️ 顯示** 按鈕查看完整金鑰
   - 點擊 **📋 複製** 按鈕複製

#### 步驟 4：找到 Project Reference ID（用於連結）

1. 在 Settings 中，點擊 **General**（一般設定）
2. 找到 **Reference ID**
   - 格式：`teivojnbigtcsyotfncq`（類似這樣的字串）
   - 這個 ID 用於 `supabase link` 指令

#### 視覺化指引

```
Supabase Dashboard
├── ⚙️ Settings
    ├── General
    │   └── Reference ID: teivojnbigtcsyotfncq  ← 用於 supabase link
    └── API  ← 點擊這裡
        ├── Project URL: https://xxx.supabase.co  ← NEXT_PUBLIC_SUPABASE_URL
        └── Project API keys
            ├── anon public: eyJhbGc...  ← NEXT_PUBLIC_SUPABASE_ANON_KEY
            └── service_role secret: eyJhbGc...  ← SUPABASE_SERVICE_ROLE_KEY
```

### 3. 複製環境變數到 `.env.local`

將剛才複製的值填入 `.env.local`：

```bash
# 從 Supabase Dashboard → Settings → API 複製
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. 連結本地專案到雲端（可選）

> **重要說明**：本地 Supabase CLI 和雲端 Supabase 是**完全分開的**，不會衝突！

#### 本地與雲端的關係

| 項目 | 本地 Supabase CLI | 雲端 Supabase |
|------|------------------|--------------|
| **運行位置** | 本機 Docker 容器 | Supabase 雲端伺服器 |
| **資料庫** | 本地 PostgreSQL | 雲端 PostgreSQL |
| **是否衝突** | ❌ 不會衝突 | ✅ 可同時使用 |
| **用途** | 本地開發、測試 | 生產環境、團隊協作 |
| **切換方式** | 修改 `.env.local` 中的 URL | 修改 `.env.local` 中的 URL |

#### 為什麼要連結？

連結後可以：
- 使用 `supabase db push` 直接推送 migration 到雲端
- 使用 `supabase db pull` 從雲端拉取資料庫結構
- 同步本地和雲端的資料庫結構

#### 連結步驟

```bash
# 1. 連結到雲端專案（需要 Project Reference ID）
supabase link --project-ref your-project-ref

# 系統會要求您輸入資料庫密碼（建立專案時設定的密碼）

# 2. 驗證連結
supabase projects list

# 3. 推送 migration 到雲端
supabase db push
```

> **注意**：`project-ref` 可以在 Supabase Dashboard 的 **Settings → General → Reference ID** 中找到。

#### 不連結也可以使用

即使不連結，您也可以：
- 直接在雲端 Supabase Dashboard 的 SQL Editor 執行 migration
- 透過環境變數切換本地/雲端
- 兩者完全獨立運作

### 4. 執行 Migration

```bash
# 推送所有 migration 到雲端
supabase db push

# 或使用 Supabase Dashboard 的 SQL Editor 手動執行
# 1. 前往 Dashboard → SQL Editor
# 2. 複製 `supabase/migrations/` 中的 SQL 內容
# 3. 貼上並執行
```

---

## 資料庫 Migration

### Migration 檔案結構

```
supabase/
├── migrations/
│   ├── 20240101000000_initial_schema.sql    # 初始資料表結構
│   └── 20240101000001_enable_rls.sql        # RLS 政策
└── seed.sql                                  # 種子資料
```

### 建立新的 Migration

```bash
# 建立新的 migration 檔案
supabase migration new migration_name

# 編輯 migration 檔案
# 檔案位置：supabase/migrations/YYYYMMDDHHMMSS_migration_name.sql
```

### 執行 Migration

```bash
# 本地環境
supabase db reset          # 重置並執行所有 migration
supabase migration up     # 執行新的 migration

# 雲端環境
supabase db push           # 推送 migration 到雲端
```

---

## 驗證設定

### 1. 檢查 Supabase 連線

執行健康檢查 API：

```bash
# 啟動開發伺服器
npm run dev

# 在另一個終端執行
curl http://localhost:3000/api/health
```

應該會看到類似以下的回應：

```json
{
  "status": "healthy",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "components": {
    "database": {
      "status": "up",
      "latencyMs": 50
    },
    "storage": {
      "status": "up",
      "latencyMs": 30
    },
    "geminiApi": {
      "status": "up",
      "latencyMs": 100
    }
  }
}
```

### 2. 建立第一個管理員使用者

#### 方法 1：透過 Supabase Dashboard

1. 前往 Supabase Dashboard → Authentication → Users
2. 點擊「Add user」→「Create new user」
3. 填寫 Email 和 Password
4. 前往 SQL Editor，執行以下 SQL：

```sql
-- 將 user_id 替換為剛建立的使用者 ID
INSERT INTO user_profiles (id, email, display_name, role)
VALUES (
  'user-id-from-auth',  -- 從 Authentication → Users 複製
  'admin@example.com',
  '系統管理員',
  'SUPER_ADMIN'
);
```

#### 方法 2：透過 Supabase CLI

```bash
# 建立使用者（需先設定 Supabase Auth）
supabase auth admin create-user \
  --email admin@example.com \
  --password your-password \
  --email-confirmed
```

然後在 SQL Editor 中設定 role：

```sql
UPDATE user_profiles
SET role = 'SUPER_ADMIN'
WHERE email = 'admin@example.com';
```

### 3. 測試 API 端點

```bash
# 測試 Agent API（需先登入）
curl -X GET http://localhost:3000/api/agents \
  -H "Authorization: Bearer your-jwt-token"
```

---

## 常見問題

### Q: 本地 Supabase CLI 和雲端 Supabase 會衝突嗎？

A: **不會衝突！** 它們是完全分開的：

- **本地 Supabase CLI**：運行在本機 Docker 容器中，用於本地開發
- **雲端 Supabase**：運行在 Supabase 的雲端伺服器上，用於生產環境

您可以：
- 同時啟動本地和雲端（不會互相影響）
- 透過修改 `.env.local` 中的 URL 來切換使用哪一個
- 本地開發時用本地，部署時用雲端

### Q: 本地和雲端的資料庫版本一致嗎？

A: 是的，Supabase CLI 會自動使用與您雲端專案相同的 PostgreSQL 版本。您可以在 `supabase/config.toml` 中設定：

```toml
[db]
major_version = 17  # 與雲端專案版本一致
```

### Q: 如何切換本地與雲端 Supabase？

A: 只需修改 `.env.local` 中的 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 即可。程式碼會自動使用環境變數，無需修改。

**本地開發**：
```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
```

**雲端部署**：
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

### Q: 本地開發的資料會同步到雲端嗎？

A: **不會自動同步**。本地和雲端是完全獨立的資料庫。如果您需要：
- **推送 migration**：使用 `supabase db push`（需先連結）
- **同步資料**：需要手動匯出/匯入，或使用 Supabase Dashboard 的資料管理功能

### Q: Service Role Key 的用途？

A: Service Role Key 擁有完整資料庫權限，用於：
- 伺服器端 API 路由中的管理操作
- 背景任務（如檔案同步）
- 系統級操作（如稽核日誌寫入）

⚠️ **重要**：Service Role Key 絕不能暴露給前端或客戶端程式碼。

### Q: 如何重置本地資料庫？

A: 執行 `supabase db reset` 會：
1. 刪除所有資料
2. 重新執行所有 migration
3. 執行 seed.sql（如果啟用）

### Q: Migration 執行失敗怎麼辦？

A: 
1. 檢查 Supabase 日誌：`supabase logs`
2. 查看 migration 檔案語法是否正確
3. 手動在 SQL Editor 中執行 migration 內容，查看具體錯誤訊息

---

## 下一步

設定完成後，您可以：

1. ✅ 執行 `npm run dev` 啟動開發伺服器
2. ✅ 前往 `http://localhost:3000` 查看應用程式
3. ✅ 開始實作身份驗證功能
4. ✅ 建立第一個 Agent

如需更多資訊，請參考：
- [Supabase 官方文件](https://supabase.com/docs)
- [Next.js + Supabase 整合指南](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
