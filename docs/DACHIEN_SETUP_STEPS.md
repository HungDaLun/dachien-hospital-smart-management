# 大千醫院 Demo 環境建立步驟指南

**建立日期：** 2026-02-24  
**用途：** 為大千醫院建立專屬 Demo 環境

---

## 📋 執行摘要

由於 Supabase 免費方案有專案數量限制（2個），您需要手動建立新專案並選擇 Pro 方案。建立完成後，我會透過 MCP 自動執行所有 migrations。

---

## 🎯 完整步驟流程

### 階段一：手動建立 Supabase 專案（5-10 分鐘）

#### 步驟 1.1：前往 Supabase Dashboard
1. 開啟瀏覽器，前往 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 登入您的帳號

#### 步驟 1.2：建立新專案
1. 點擊右上角 **「New Project」** 按鈕
2. 填寫專案資訊：
   - **Name**: `eakap-dachien-hospital`
   - **Database Password**: 設定一個強密碼（**請妥善保存！**）
     - 建議：至少 16 字元，包含大小寫、數字、特殊符號
   - **Region**: 選擇 **`Northeast Asia (Tokyo)`** 或 **`Southeast Asia (Singapore)`**
   - **Pricing Plan**: **選擇 Pro 方案**（$25 USD/月，符合企劃 A 文件建議）

#### 步驟 1.3：等待專案建立完成
- 專案建立約需 2-3 分鐘
- 建立完成後，您會看到專案 Dashboard

#### 步驟 1.4：取得專案連線資訊
1. 點擊左側選單 **⚙️ Settings** → **API**
2. 複製以下資訊（**請先保存在記事本**）：
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ⚠️ 機密
   ```
3. 點擊左側選單 **⚙️ Settings** → **General**
4. 複製 **Reference ID**（專案 ID，格式如：`abcdefghijklmnop`）

#### 步驟 1.5：通知我執行 Migrations
完成步驟 1.4 後，請告訴我：
- **專案 Reference ID**（我會用這個連結專案）
- 然後我會自動執行所有 86 個 migrations

---

### 階段二：我執行 Migrations（自動化，約 5 分鐘）

我會透過 Supabase MCP：
1. ✅ 連結到您的新專案
2. ✅ 讀取本地 `supabase/migrations/` 目錄（86 個檔案）
3. ✅ 依時間順序自動執行所有 migrations
4. ✅ 驗證資料庫結構與 RLS 政策
5. ✅ 提供執行報告

**您無需做任何操作，只需等待我完成。**

---

### 階段三：複製專案到新資料夾（10 分鐘）

#### 步驟 3.1：建立新專案資料夾
```bash
# 在終端機執行
cd ~/Desktop
cp -r "知識架構師" "知識架構師-大千醫院"
cd "知識架構師-大千醫院"
```

#### 步驟 3.2：初始化 Git（可選）
```bash
# 如果原本有 Git，移除舊的 remote
git remote remove origin

# 建立新的 Git 倉庫（可選）
git init
git add .
git commit -m "feat: 大千醫院專案初始化"
```

---

### 階段四：設定環境變數（5 分鐘）

#### 步驟 4.1：建立環境變數檔案
```bash
cd ~/Desktop/知識架構師-大千醫院

# 建立 .env.local 檔案
touch .env.local
```

#### 步驟 4.2：填入環境變數
開啟 `.env.local` 檔案，填入以下內容：

```bash
# ============================================
# Supabase 設定（大千醫院專用）
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ============================================
# Google Gemini API
# ============================================
GEMINI_API_KEY=your_gemini_api_key_here

# ============================================
# S3/MinIO 設定（大千醫院專用儲存空間）
# ============================================
# 選項 A：使用 AWS S3
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your_aws_access_key
S3_SECRET_KEY=your_aws_secret_key
S3_BUCKET_NAME=eakap-dachien-files
S3_REGION=ap-southeast-1

# 選項 B：使用 MinIO（自建）
# S3_ENDPOINT=http://your-minio-server:9000
# S3_ACCESS_KEY=your_minio_access_key
# S3_SECRET_KEY=your_minio_secret_key
# S3_BUCKET_NAME=eakap-dachien-files
# S3_REGION=us-east-1

# ============================================
# 應用程式設定
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**重要：**
- 將 `your-project-ref.supabase.co` 替換為步驟 1.4 取得的 Project URL
- 將 `your_anon_key_here` 替換為步驟 1.4 取得的 anon public key
- 將 `your_service_role_key_here` 替換為步驟 1.4 取得的 service_role key
- 將 `your_gemini_api_key_here` 替換為您的 Gemini API Key（如果有的話）

---

### 階段五：驗證設定（5 分鐘）

#### 步驟 5.1：安裝依賴
```bash
cd ~/Desktop/知識架構師-大千醫院
npm install
```

#### 步驟 5.2：啟動開發伺服器
```bash
npm run dev
```

#### 步驟 5.3：檢查連線
1. 開啟瀏覽器，前往 [http://localhost:3000](http://localhost:3000)
2. 嘗試登入或註冊帳號
3. 檢查 Supabase 連線是否正常

---

## ✅ 檢查清單

完成所有步驟後，請確認：

- [ ] Supabase 專案已建立（Pro 方案）
- [ ] 已取得 Project URL、anon key、service_role key
- [ ] 已提供專案 Reference ID 給我執行 migrations
- [ ] Migrations 已成功執行（我會提供報告）
- [ ] 專案已複製到新資料夾 `知識架構師-大千醫院`
- [ ] `.env.local` 檔案已建立並填入正確的環境變數
- [ ] 開發伺服器可正常啟動
- [ ] 可以連線到 Supabase 資料庫

---

## 🆘 常見問題

### Q1: 如果 migrations 執行失敗怎麼辦？
**A:** 我會提供詳細的錯誤報告，您可以：
1. 檢查 Supabase Dashboard → SQL Editor 的錯誤訊息
2. 告訴我錯誤內容，我會協助修復

### Q2: 環境變數設定錯誤會怎樣？
**A:** 應用程式會無法連線到 Supabase，請檢查：
- `.env.local` 檔案是否存在
- 環境變數名稱是否正確（注意大小寫）
- 值是否正確（沒有多餘的空格）

### Q3: 可以同時運行兩個專案嗎？
**A:** 可以！只要：
- 使用不同的資料夾
- 使用不同的環境變數（不同的 Supabase 專案）
- 使用不同的 Port（如果同時運行，修改 `package.json` 中的 port）

---

## 📞 下一步

完成階段一後，請告訴我：
1. **專案 Reference ID**
2. 我會立即開始執行 migrations

然後您可以繼續進行階段三（複製專案）和階段四（設定環境變數）。

---

**文件版本：** v1.0  
**最後更新：** 2026-02-24
