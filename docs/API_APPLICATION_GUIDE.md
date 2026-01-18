# API 申請與設定指南

本文件詳細說明如何申請並獲取本系統所需的各項第三方服務 API 金鑰。請依據您的需求參考相應的章節。

---

## 📋 目錄

1. [Line Messaging API](#1-line-messaging-api)
2. [LiveKit Cloud](#2-livekit-cloud)
3. [OpenAI API](#3-openai-api)
4. [Google Cloud / Gemini API](#4-google-cloud--gemini-api)
5. [Vercel 部署指南 (前台/全端)](#5-vercel-部署指南-前台全端)

---

## 1. Line Messaging API

**用途**：用於 Line Bot 聊天機器人互動、接收使用者訊息、發送主動推播通知 (Push Message)。

### 申請步驟

1. **登入 Line Developers Console**
   - 前往 [Line Developers Console](https://developers.line.biz/zh-hant/)。
   - 使用您的 Line 帳號登入。

2. **建立 Provider (提供者)**
   - 如果是第一次使用，請點擊「Create a new provider」。
   - 輸入 Provider name（例如：您的公司名稱），點擊 Create。

3. **建立 Channel (頻道)**
   - 選擇 **Messaging API** 通道類型。
   - 填寫基本資訊：
     - **Channel name**：機器人的名稱（例如：EAKAP 超級管家）。
     - **Channel description**：簡單描述。
     - **Category** / **Subcategory**：依照實際情況選擇。
   - 勾選同意條款，點擊 Create。

4. **獲取 Channel Secret**
   - 進入剛建立的 Channel 頁面。
   - 切換到 **Basic settings** 分頁。
   - 捲動到下方找到 **Channel secret**，點擊 Issue (如未顯示) 或複製該字串。
   - ✅ **這是系統設定中的 `Line Channel Secret`**。

5. **獲取 Channel Access Token**
   - 切換到 **Messaging API** 分頁。
   - 捲動到下方找到 **Channel access token (long-lived)**。
   - 點擊 **Issue** 按鈕生成 Token。
   - 複製生成的長字串。
   - ✅ **這是系統設定中的 `Line Channel Token`**。

6. **設定 Webhook URL (重要！)**
   - 在 **Messaging API** 分頁中，找到 **Webhook settings**。
   - **Webhook URL** 填入您的系統網址：
     - 開發環境：(需使用 ngrok 等工具) `https://xxxx.ngrok.io/api/integrations/line/webhook`
     - 正式環境：`https://您的網域/api/integrations/line/webhook`
   - 點擊 **Update**。
   - 開啟 **Use webhook** 開關。

7. **關閉自動回應**
   - 在 **Messaging API** 分頁，找到 **Auto-reply messages**，點擊 Edit。
   - 此操作會開啟 Line Official Account Manager。
   - 在「回應設定」中：
     - **聊天**：開啟（若需要手動回覆）或關閉。
     - **加入好友的歡迎訊息**：依需求設定。
     - **Webhook**：務必設為 **啟用**。
     - **自動回應訊息**：建議 **停用** (避免與 AI 回覆衝突)。

---

## 2. LiveKit Cloud

**用途**：提供低延遲的即時語音通訊功能 (WebRTC)，用於「超級管家」的語音對話模式。

### 申請步驟

1. **註冊 LiveKit Cloud**
   - 前往 [LiveKit Cloud](https://cloud.livekit.io/)。
   - 使用 GitHub 或 Google 帳號註冊/登入。

2. **建立新專案 (Project)**
   - 點擊 **New Project**。
   - 輸入專案名稱（例如：EAKAP-Voice）。

3. **獲取 API Key 與 Secret**
   - 進入專案後的 Dashboard 首頁，或點擊左側 **Settings** > **Keys**。
   - 您會看到 **API Key** (以 `API` 開頭) 和 **API Secret** (以 `APA` 或類似開頭)。
   - ✅ **這是系統設定中的 `LiveKit API Key` 和 `LiveKit API Secret`**。

4. **獲取 WebSocket URL**
   - 在 Dashboard 頂部或 Settings 頁面，找到 **WebSocket URL**。
   - 格式通常為 `wss://<project-id>.livekit.cloud`。
   - ✅ **這是系統設定中的 `Next Public LiveKit URL`**。

---

## 3. OpenAI API

**用途**：提供 Whisper (語音轉文字)、TTS (文字轉語音) 以及 GPT 模型支援。

### 申請步驟

1. **註冊 OpenAI Platform**
   - 前往 [OpenAI Platform](https://platform.openai.com/)。
   - 註冊並登入帳號。

2. **建立 API Key**
   - 點擊右上角個人頭像 > **Dashboard** > **API Keys**。
   - 點擊 **+ Create new secret key**。
   - 設定名稱（例如：EAKAP System），權限建議設為 All (或依需求限制)。
   - 點擊 Create secret key。
   - ⚠️ **請務必立即複製**，視窗關閉後將無法再次查看。
   - ✅ **這是系統設定中的 `OpenAI API Key`**。

3. **儲值帳戶 (必要)**
   - 進入 **Settings** > **Billing**。
   - 點擊 **Add to credit balance** 進行儲值（OpenAI API 大多為預付制）。
   - 確保帳戶有足夠餘額，否則 API 會回傳錯誤。

---

## 4. Google Cloud / Gemini API

**用途**：
1. **Google OAuth**：讓使用者登入、連結 Google 行事曆。
2. **Gemini API**：使用 Google Gemini Pro/Flash 模型作為 AI 大腦。

### A. 申請 Google OAuth 憑證

1. **建立 Google Cloud 專案**
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)。
   - 點擊上方專案選單 > **建立新專案**。
   - 輸入專案名稱，點擊建立。

2. **啟用 API**
   - 在左側選單選擇 **API 和服務** > **已啟用的 API 和服務**。
   - 點擊 **+ 啟用 API 和服務**。
   - 搜尋並啟用以下 API：
     - **Google Calendar API**
     - **Google People API** (用於獲取使用者資訊)

3. **設定 OAuth 同意畫面**
   - 左側選單選擇 **OAuth 同意畫面**。
   - User Type 選擇 **External** (外部)，點擊建立。
   - 填寫 App information：
     - App name：應用程式名稱。
     - User support email：您的 Email。
     - Developer contact information：您的 Email。
   - 點擊儲存並繼續。
   - **Scopes (範圍)**：點擊 Add or Remove Scopes，加入：
     - `.../auth/calendar` (行事曆讀寫)
     - `email`
     - `profile`
   - **Test users (測試使用者)**：在應用程式發布前，需加入測試的 Google 帳號 Email。

4. **建立憑證 (Credentials)**
   - 左側選單選擇 **憑證**。
   - 點擊 **+ 建立憑證** > **OAuth 用戶端 ID**。
   - 應用程式類型選擇 **Web application**。
   - Name：輸入名稱。
   - **已授權的重新導向 URI (Authorized redirect URIs)**：
     - 新增：`http://localhost:3000/api/auth/google/callback` (開發用)
     - 新增：`https://您的網域/api/auth/google/callback` (正式用)
   - 點擊建立。
   - 畫面會顯示 **Client ID** 和 **Client Secret**。
   - ✅ **這是系統設定中的 `Google OAuth Client ID` 和 `Google OAuth Client Secret`**。

### B. 申請 Gemini API Key (Google AI Studio)

1. **前往 Google AI Studio**
   - 訪問 [Google AI Studio](https://aistudio.google.com/)。
   - 登入 Google 帳號。

2. **獲取 API Key**
   - 點擊左上角的 **Get API key**。
   - 點擊 **Create API key**。
   - 選擇您的 Google Cloud 專案（或建立新的）。
   - 複製生成的 API Key。
   - ✅ **這是系統設定中的 `Gemini API Key`** (部分功能可能整合於 OpenAI 相容介面或獨立設定)。
    
---

## 5. Vercel 部署指南 (前台/全端)

**用途**：將您的「知識架構師」系統部署到公開的網路環境，讓您可以隨時隨地存取，並與 Line/Google 等服務進行正式串接。

### 前置準備

1.  **GitHub 帳號 & Repository**：
    *   確保您的完整程式碼已經上傳到 GitHub Repository (私有或公開皆可)。
2.  **Vercel 帳號**：
    *   前往 [Vercel 官網](https://vercel.com/) 註冊或登入。
    *   建議直接使用 GitHub 帳號登入，方便連動。

### 詳細部署步驟

#### 1. 匯入專案
1.  進入 [Vercel Dashboard (儀表板)](https://vercel.com/dashboard/projects)。
2.  點擊右上角或畫面中的 **Add New ...** 按鈕，選擇 **Project**。
3.  在 **Import Git Repository** 列表中找到您的專案（例如 `knowledge-architect-system`），點擊旁邊的 **Import** 按鈕。

#### 2. 設定專案 (Configure Project)
在設定頁面中確認以下資訊：
*   **Project Name**：您可以自訂專案名稱（這將成為預設網址的一部分，如 `project-name.vercel.app`）。
*   **Framework Preset**：Vercel 會自動偵測，請確認顯示為 **Next.js**。
*   **Root Directory**：若您的 `package.json` 位於根目錄，請保持預設的 `./`。

#### 3. 設定環境變數 (Environment Variables) —— **⚠️ 最關鍵步驟**
為了讓系統在線上正常運作，您必須將本地 `.env` 檔案中的設定填入 Vercel。

1.  展開 **Environment Variables** 區域。
2.  您可以選擇逐一輸入，或使用「複製貼上」功能（推薦）：
    *   在您的電腦上打開專案的 `.env` 或 `.env.local` 檔案。
    *   全選並複製所有內容。
    *   回到 Vercel 網頁，點擊輸入框上方的小文字連結（通常顯示為 Copy/Paste 模式）。
    *   將內容貼上，Vercel 會自動解析 Key 和 Value。
    *   **特別注意**：請確保以下關鍵變數已正確設定：
        *   `OPENAI_API_KEY`
        *   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
        *   `LINE_CHANNEL_ACCESS_TOKEN` / `LINE_CHANNEL_SECRET`
        *   `NEXT_PUBLIC_LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET`
        *   `NEXTAUTH_SECRET` (線上環境必須設定此亂數密鑰，可用線上工具生成一個長字串)
        *   `NEXTAUTH_URL` (初次部署可先不填或填入預計的 Vercel 網址，部署後再修正)

#### 4. 開始部署
1.  點擊下方的 **Deploy** 按鈕。
2.  等待部署流程執行（Building...），通常需要 1~3 分鐘。
3.  若出現滿版煙火動畫與 "Congratulations!" 字樣，即代表部署成功！
4.  點擊預覽圖或 **Continue to Dashboard**，您會看到您的 **正式網址** (Domain)，通常格式為：
    `https://您的專案名稱.vercel.app`

---

### 部署後的重要設定 (更新 Callback URL)

⚠️ **這是新手最容易忽略的步驟！**
部署產生新的網址後，您必須回到 Google 與 Line 的後台，將原本的 `localhost` 網址替換或新增為您的 **Vercel 正式網址**。

#### 1. 更新 Google OAuth 設定
1.  回到 [Google Cloud Console](https://console.cloud.google.com/) > **憑證**。
2.  點擊您的 OAuth 2.0 用戶端 ID。
3.  在 **已授權的重新導向 URI (Authorized redirect URIs)** 區域：
    *   新增一筆 URL：
    *   `https://您的-vercel-網址.vercel.app/api/auth/google/callback`
4.  點擊儲存。
    *   *注意：Google 設定更新後可能需數分鐘生效。*

#### 2. 更新 Line Webhook 設定
1.  回到 [Line Developers Console](https://developers.line.biz/) > 您的 Channel。
2.  進入 **Messaging API** 分頁。
3.  找到 **Webhook settings**。
4.  將 Webhook URL 修改為：
    *   `https://您的-vercel-網址.vercel.app/api/integrations/line/webhook`
5.  點擊 **Update** 並可點擊 **Verify** 測試連線（需您的系統 Webhook 端點有正確回應 200 OK）。

#### 3. 檢查資料庫設定 (重要提示)
*   若您的系統目前使用 **SQLite** (本地檔案資料庫)，在 Vercel (Serverless 環境) 上，**每次重新部署或一段時間未操作，資料庫檔案就會被重置，導致資料遺失。**
*   **建議解法**：
    *   正式部署建議將資料庫遷移至雲端 PostgreSQL 服務（如 [Neon](https://neon.tech/) 或 [Supabase](https://supabase.com/)）。
    *   並在 Vercel 的 Environment Variables 中，將 `DATABASE_URL` 更新為雲端資料庫的連接字串。
