# EAKAP - Enterprise AI Knowledge Agent Platform

企業級 AI 知識庫與 Agent 管理平台

## 專案概述

EAKAP 是一個企業級的「AI Agent 工廠與知識運籌中心」，旨在解決企業導入 AI 時面臨的「知識分散」、「操作標準不一」與「權限失控」三大痛點。

### 核心架構

採用 **Hub & Spoke (軸輻式)** 架構：
- **Hub Layer (資料主權層)**：S3/MinIO - 原始檔案儲存
- **Spoke Layer (AI 運算層)**：Gemini File Storage - AI 運算用

## 技術堆疊

### 前端
- Next.js 14+ (App Router)
- TypeScript (嚴格模式)
- Tailwind CSS / Vanilla CSS
- Zustand (狀態管理)
- Lucide Icons

### 後端
- Supabase (PostgreSQL + Auth + Storage)
- Next.js API Routes
- Google Gemini 3 API (gemini-3-flash, gemini-3-pro)

### 儲存
- Layer 1: S3/MinIO (資料主權)
- Layer 2: Gemini File Storage (AI 運算)

## 快速開始

### 環境需求

- Node.js >= 18.0.0
- npm 或 yarn

### 安裝依賴

```bash
npm install
```

### 環境變數設定

複製 `.env.example` 並重新命名為 `.env.local`，填入以下變數：

```bash
# Supabase 設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# S3/MinIO 設定
S3_ENDPOINT=your_s3_endpoint
S3_ACCESS_KEY=your_s3_access_key
S3_SECRET_KEY=your_s3_secret_key
S3_BUCKET_NAME=your_bucket_name
S3_REGION=your_region
```

### 開發模式

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看結果。

### 建置生產版本

```bash
npm run build
npm start
```

## 專案結構

```
├── app/              # Next.js App Router
│   ├── (auth)/       # 身份驗證頁面
│   ├── (dashboard)/  # 主控台頁面
│   └── api/          # API Routes
├── components/       # React 元件
│   ├── ui/           # 基礎 UI
│   └── [功能]/       # 功能元件
├── lib/              # 工具函式
│   ├── supabase/     # Supabase 客戶端
│   ├── gemini/       # Gemini API
│   ├── storage/      # 儲存層抽象
│   └── errors.ts     # 自訂錯誤類別
├── hooks/            # 自訂 Hooks
├── stores/           # Zustand stores
├── types/            # TypeScript 型別
├── styles/           # 全域樣式與 CSS 變數
└── locales/          # 翻譯檔案
    ├── zh-TW/
    └── en/
```

## 開發規範

請參考 `.cursorrules` 檔案，包含：
- 程式碼風格規範
- UI/UX 設計規範
- API 設計規範
- 權限矩陣
- 錯誤處理規範

## 📚 說明文件

詳細的設定與開發指南請參考 `docs/` 目錄：

- [API 申請與設定指南 (Line, LiveKit, Google, OpenAI)](docs/API_APPLICATION_GUIDE.md)
- [環境變數設定完整指南](docs/ENV_VARIABLES_GUIDE.md)
- [語音 AI 助理方案評估](docs/04.VOICE_AI_ASSISTANT_SOLUTIONS.md)
- [超級管家設計文件](docs/10.SUPER_ASSISTANT_DESIGN.md)

## 授權

私有專案
