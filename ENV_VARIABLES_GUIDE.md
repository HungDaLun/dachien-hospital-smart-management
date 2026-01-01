# 環境變數設定完整指南

本文件提供詳細的環境變數設定步驟，包含如何在 Supabase Dashboard 中找到所有必要的金鑰。

## 📍 在 Supabase Dashboard 找到環境變數

### 步驟 1：登入 Supabase Dashboard

1. 前往 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 登入您的帳號
3. 選擇您的專案（或建立新專案）

### 步驟 2：進入 API 設定頁面

1. 在左側選單中，點擊 **⚙️ Settings**（設定圖示）
2. 在 Settings 子選單中，點擊 **API**

### 步驟 3：複製 Project URL

在 API 設定頁面的頂部，您會看到：

```
Project URL
https://xxxxxxxxxxxxx.supabase.co    [📋 複製]
```

- 點擊右側的 **📋 複製圖示**
- 這就是您的 `NEXT_PUBLIC_SUPABASE_URL`

### 步驟 4：複製 API Keys

向下滾動到 **Project API keys** 區塊：

#### 4.1 複製 anon public 金鑰

```
Project API keys

[anon] [public]
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...    [👁️ 顯示] [📋 複製]
```

1. 點擊 **👁️ 顯示** 按鈕（如果金鑰被隱藏）
2. 點擊 **📋 複製** 按鈕
3. 這就是您的 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 4.2 複製 service_role secret 金鑰

```
[service_role] [secret]
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...    [👁️ 顯示] [📋 複製]
```

⚠️ **重要**：這是機密金鑰，擁有完整資料庫權限！

1. 點擊 **👁️ 顯示** 按鈕（如果金鑰被隱藏）
2. 點擊 **📋 複製** 按鈕
3. 這就是您的 `SUPABASE_SERVICE_ROLE_KEY`
4. **絕不要**將此金鑰提交到 Git 或暴露給前端

### 步驟 5：找到 Project Reference ID（用於連結）

1. 在 Settings 中，點擊 **General**（一般設定）
2. 找到 **Reference ID** 區塊：

```
Reference ID
teivojnbigtcsyotfncq    [📋 複製]
```

- 這個 ID 用於 `supabase link --project-ref` 指令
- 格式通常是 20 個字元的字串

---

## 📝 完整環境變數範例

### 雲端 Supabase 設定

```bash
# ============================================
# Supabase 設定（從 Dashboard → Settings → API 取得）
# ============================================

# Project URL（從 API 頁面頂部複製）
NEXT_PUBLIC_SUPABASE_URL=https://teivojnbigtcsyotfncq.supabase.co

# anon public key（從 Project API keys 區塊複製）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlaXZvam5iaWd0Y3N5b3RmbmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MjI0ODksImV4cCI6MjA4MTk5ODQ4OX0.TD4Usfy7r1ajMlr25WBGAbfZvn4CtIUXEC_lYzxvTNs

# service_role key（從 Project API keys 區塊複製，⚠️ 機密）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlaXZvam5iaWd0Y3N5b3RmbmNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQyMjQ4OSwiZXhwIjoyMDgxOTk4NDg5fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# Google Gemini API（從 Google AI Studio 取得）
# ============================================
GEMINI_API_KEY=your_gemini_api_key_here

# ============================================
# S3/MinIO 設定（本地開發可稍後設定）
# ============================================

# 本地 MinIO
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_NAME=eakap-files
S3_REGION=us-east-1

# 或使用 AWS S3
# S3_ENDPOINT=https://s3.amazonaws.com
# S3_ACCESS_KEY=your_aws_access_key
# S3_SECRET_KEY=your_aws_secret_key
# S3_BUCKET_NAME=your-bucket-name
# S3_REGION=ap-southeast-1

# ============================================
# 應用程式設定
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 本地 Supabase 設定（開發用）

如果您使用本地 Supabase CLI，可以使用以下預設值：

```bash
# 本地 Supabase（執行 supabase start 後使用）
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

---

## 🔄 切換本地與雲端

### 方法 1：修改 `.env.local` 檔案

只需修改 `NEXT_PUBLIC_SUPABASE_URL` 和對應的金鑰：

```bash
# 切換到本地
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# ... 使用本地金鑰

# 切換到雲端
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# ... 使用雲端金鑰
```

### 方法 2：使用不同的環境變數檔案

```bash
# 本地開發
cp .env.local.example .env.local
# 填入本地 Supabase 設定

# 生產環境
cp .env.production.example .env.production
# 填入雲端 Supabase 設定
```

---

## ✅ 驗證環境變數設定

### 1. 檢查環境變數是否正確載入

```bash
# 在終端執行（需先啟動 Next.js）
npm run dev

# 在瀏覽器開啟
# http://localhost:3000/api/health
```

### 2. 檢查 Supabase 連線

健康檢查 API 應該顯示：

```json
{
  "status": "healthy",
  "components": {
    "database": {
      "status": "up",
      "latencyMs": 50
    }
  }
}
```

如果顯示 `"status": "down"`，請檢查：
- 環境變數是否正確設定
- Supabase 專案是否正常運行
- 網路連線是否正常

---

## 🔒 安全性提醒

1. **`.env.local` 不會被 Git 追蹤**（已在 `.gitignore` 中）
2. **Service Role Key 絕不暴露給前端**
3. **不要將環境變數提交到 Git**
4. **生產環境使用環境變數管理服務**（如 Vercel、Railway 等）

---

## 📚 相關資源

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase API 文件](https://supabase.com/docs/reference/api)
- [環境變數最佳實踐](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)
