# CLAUDE.md - Enterprise AI Knowledge Agent Platform (EAKAP)

**文件版本：** 1.1  
**對應規格書：** 02.企業AI知識庫平台_網站規格書_v1.1  
**最後更新：** 2026-01-01 15:30


---

## 📋 開發進度追蹤

### ✅ 已完成項目

#### 基礎架構與設定
- ✅ 專案基礎結構建立（Next.js 14+ App Router）
- ✅ TypeScript 嚴格模式設定
- ✅ Tailwind CSS 配置（含完整設計系統）
- ✅ 環境變數設定指南（`.env.local`, `ENV_VARIABLES_GUIDE.md`）
- ✅ Supabase 設定文件（`SUPABASE_SETUP.md`）

#### 資料庫與後端
- ✅ Supabase 資料庫 Schema 建立（所有核心資料表）
- ✅ Migration 檔案建立與執行
  - ✅ `20240101000000_initial_schema.sql` - 所有資料表、索引、觸發器
  - ✅ `20240101000001_enable_rls.sql` - Row Level Security 政策
- ✅ RLS 政策啟用（所有資料表）
- ✅ 種子資料檔案（`seed.sql`）

#### 核心模組
- ✅ Supabase 客戶端（瀏覽器端 `lib/supabase/client.ts`）
- ✅ Supabase 客戶端（伺服器端 `lib/supabase/server.ts`）
- ✅ 錯誤處理模組（`lib/errors.ts` - 自訂錯誤類別）
- ✅ 型別定義（`types/index.ts`, `types/health.ts`）
- ✅ Gemini API 客戶端骨架（`lib/gemini/client.ts`）
- ✅ S3/MinIO 儲存層抽象（`lib/storage/s3.ts`）

#### API 路由
- ✅ `/api/health` - 系統健康檢查（資料庫、儲存、Gemini API）
- ✅ `/api/agents` - Agent 管理（GET, POST）
- ✅ `/api/files` - 檔案管理與上傳 API
- ✅ `/api/chat` - 對話 API（基礎 Gemini 整合）
- ✅ `/api/cron/sync` - 背景同步自動化
- ✅ `/api/agents` - Agent 版本控制與統計
- ✅ `/api/auth/logout` - 登出功能
 
 #### 前端頁面
 - ✅ 首頁（`app/page.tsx`）
 - ✅ 登入頁面（`app/(auth)/login/page.tsx`）
 - ✅ 儀表板首頁（`app/(dashboard)/page.tsx`）
- [x] 專案基礎架構與環境配置
- [x] 資料庫初始 Schema 與 Migration 機制
- [x] 基礎 UI 元件庫 (Button, Card, Input, Spinner, Badge, Modal)
- [x] 檔案上傳至 S3/MinIO 端點 (`/api/files`)
- [x] **RLS 安全性優化**: 解決 `user_profiles` 遞迴問題
- [x] **知識同步系統**: 實作 `syncFileToGemini` 邏輯與觸發端點
- [x] **Agent 管理模組**: CRUD API、列表頁與編輯器頁面
- [x] **知識綁定邏輯**: 支援基於標籤的 Agent 知識過濾
- [x] **對話功能升級**: 實作 SSE 串流回應與對話歷史整合
- [x] **效能優化**: 儀表板導航加速與 Loading 骨架屏
  - ✅ 客戶端導航 (`<Link>` replace `<a>`)
  - ✅ 儀表板 Loading 骨架屏 (`loading.tsx`)
- [x] **部署建置**: 修復動態路由建置錯誤

### 🚧 進行中項目
- [x] 引用來源視覺化優化 (面板效果) - Done
- [x] 背景同步 Worker (自動化掃描 PENDING 檔案) - Done
- [x] Agent 進階功能 (版本控制、使用量統計) - Done
- [x] Agent 進階功能 (版本控制、使用量統計) - Done
- [x] 完整權限 Matrix 測試驗證 (20 test cases passing) - Done
- [x] 稽核日誌 (Audit Log) 視覺化查詢 - Done
- [x] 系統管理員數據卡片 (Agent Stats) - Done
- [x] 使用者優化: 我的最愛 (Favorites) - Done
- [x] i18n 基礎架構 (Dictionaries) - Done

- [x] i18n 核心整合 (Server & Client Logic, LanguageSwitcher, Dashboard & Layout Integration) - Done
- [ ] i18n 全面套用至內頁 UI (View Layer Integration: Knowledge, Agents, Chat)


#### 知識庫管理
- ✅ 檔案上傳頁面（`app/(dashboard)/knowledge/page.tsx`）
- ✅ 檔案列表與管理介面
- ⏳ 標籤管理進階功能
- ⏳ 檔案版本控制
- ✅ `/api/files` - 基礎 CRUD API（列表與上傳）
- ✅ `/api/files/:id/sync` - 手動同步功能
- ⏳ 背景同步 Worker 自動掃描任務
 
 #### Agent 管理
 - ✅ Agent 列表頁面（`app/(dashboard)/agents/page.tsx`）
 - ✅ Agent 建立/編輯表單（`components/agents/AgentEditor.tsx`）
 - ✅ System Prompt 編輯器與權限連動
 - ✅ 知識綁定與標籤規則設定
 - ⏳ Agent 角色存取設定 (AAC)
 - ✅ `/api/agents/:id` - 完整 CRUD API
 - ⏳ Prompt 版本控制歷史紀錄功能 (Versions)
 
 #### 對話功能
 - ✅ 對話介面（`app/(dashboard)/chat/page.tsx`）
 - ✅ Agent 選擇大廳
 - ✅ 串流回應顯示（SSE）
 - ⏳ 引用來源視覺化優化
 - ⏳ 回饋機制（👍/👎）
 - ✅ `/api/chat` - 對話 API（支援串流與歷史）
 
 #### 系統管理
 - ✅ 使用者管理頁面 (`app/dashboard/admin/users`)
 - ✅ 部門管理頁面 (`app/dashboard/admin/departments`)
 - ✅ Prompt 版本控制與還原
 - ✅ Agent 使用量統計
  - ✅ 系統設定頁面（API Key 狀態管理）
  - ✅ 稽核日誌查看
  - ✅ 使用量儀表板 (Agent Stats Cards)

 - ⏳ API Key 管理介面
 
 #### UI 元件
 - ✅ 基礎 UI 元件（按鈕、輸入框、卡片、Spinner、Badge）
 - ⏳ Agent 卡片元件（進階版）
 - ✅ 檔案上傳元件
 - ✅ 對話氣泡元件
 - ⏳ 引用來源顯示元件
 - ✅ **效能優化**
   - ✅ 客戶端導航 (`<Link>` replace `<a>`)
   - ✅ 儀表板 Loading 骨架屏 (`loading.tsx`)

#### 功能增強
- ⏳ 檔案上傳至 S3/MinIO
- ⏳ Gemini 檔案同步實作
- ⏳ 權限檢查 Middleware
- ⏳ Gemini 檔案同步實作
- ⏳ 權限檢查 Middleware
- ✅ 國際化（i18n）核心支援 (字典、Switch、Layout、Login 已套用)
- ⏳ 國際化（i18n）內容填充 (內頁文字翻譯)
- ✅ 我的最愛 (Favorites)

- ⏳ 完整錯誤處理與重試機制

---

## 專案概述

**專案名稱：** Enterprise AI Knowledge Agent Platform (EAKAP)  
**專案類型：** 企業級 AI 知識庫與 Agent 管理平台  
**目標願景：** 打造企業級的「AI Agent 工廠與知識運籌中心」

### 核心痛點解決
本平台旨在解決企業導入 AI 時面臨的三大痛點：
- **知識分散** - 同樣文件在不同 Agent 間重複上傳且版本不一
- **操作標準不一** - 各部門自行設定 Prompt，品質參差
- **權限失控** - 敏感資料外洩風險高

### 核心價值主張
1. **集中化知識管理** - Single Source of Truth，避免文件重複上傳與版本不一
2. **標準化 Agent 產出** - 統一 System Prompt 與知識庫綁定，確保產出品質一致
3. **精細化權限控管** - RBAC + 標籤系統，確保「對的人用對的 Agent，讀對的資料」

---

## 技術架構 (Tech Stack)

### 核心技術選型

| 層級 | 技術 | 說明 |
|-----|------|-----|
| **前端框架** | Next.js 14+ (App Router) | React 框架，支援 SSR/SSG |
| **UI 樣式** | Vanilla CSS / Tailwind CSS | 依專案需求選用 |
| **後端服務** | Supabase (PostgreSQL + Auth + Storage) | 支援 Cloud 與 Self-hosted |
| **主儲存層** | S3-compatible (AWS S3 / MinIO) | Primary Storage，資料主權 |
| **AI 運算層** | Google Gemini 1.5/2.0 API | 主要 LLM，支援 File Search |
| **容器化** | Docker + OrbStack (Mac) | 一鍵部署方案 |

### 架構設計原則 - Hub and Spoke (軸輻式)

```
Hub (中心)：自建儲存 (S3/MinIO) - 資料主權
  ├── Spoke 1: Gemini File Storage (目前主力)
  ├── Spoke 2: OpenAI Vector Store (預留)
  └── Spoke 3: Claude Files (預留)
```

**關鍵設計理念：**
- 所有原始檔案儲存在 Hub (S3/MinIO)
- 透過 Sync Adapter 同步至各 AI 模型的儲存空間
- 保留未來切換 AI 模型的彈性

---

## 開發環境設置

### 必要工具

```bash
# Node.js (使用 LTS 版本，建議 v20+)
node --version  # v20.x.x

# 套件管理器 (使用 pnpm 或 npm)
pnpm --version  # 推薦使用 pnpm

# Docker (Mac 建議使用 OrbStack)
docker --version
```

### 環境變數設定

建立 `.env.local` 檔案，包含以下變數：

```bash
# ============================================
# Supabase 設定 (必要)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ============================================
# Google Gemini API (必要)
# ============================================
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL_VERSION=gemini-2.5-flash  # 或 gemini-2.5-pro, gemini-2.0-flash

# ============================================
# S3 儲存設定 (雲端模式)
# ============================================
S3_BUCKET_NAME=your-bucket-name
S3_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# ============================================
# MinIO 設定 (本地一體機模式)
# ============================================
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minio-access-key
MINIO_SECRET_KEY=minio-secret-key
MINIO_BUCKET=eakap-files

# ============================================
# 應用程式設定
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 本地開發啟動

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev

# 啟動 Supabase 本地服務 (若使用本地 Supabase)
supabase start

# 建置生產版本
pnpm build
```

---

## 專案結構

```
eakap/
├── .env.local              # 環境變數 (不進版控)
├── .env.example            # 環境變數範本
├── CLAUDE.md               # 本文件
├── README.md               # 專案說明
│
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # 身份驗證相關頁面
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/    # 主控台頁面
│   │   │   ├── agents/     # Agent 管理
│   │   │   ├── knowledge/  # 知識庫管理
│   │   │   ├── chat/       # 對話介面
│   │   │   └── admin/      # 系統管理 (使用者、部門)
│   │   ├── api/            # API Routes
│   │   │   ├── agents/
│   │   │   ├── files/
│   │   │   ├── chat/
│   │   │   └── gemini/
│   │   └── layout.tsx
│   │
│   ├── components/         # React 元件
│   │   ├── ui/             # 基礎 UI 元件
│   │   ├── agents/         # Agent 相關元件
│   │   ├── knowledge/      # 知識庫元件
│   │   ├── chat/           # 對話元件
│   │   └── admin/          # 管理後台元件
│   │
│   ├── lib/                # 工具函式庫
│   │   ├── supabase/       # Supabase 客戶端
│   │   │   ├── client.ts   # 瀏覽器端客戶端
│   │   │   ├── server.ts   # 伺服器端客戶端
│   │   │   └── admin.ts    # Admin 客戶端
│   │   ├── gemini/         # Gemini API 封裝
│   │   │   ├── client.ts   # API 客戶端
│   │   │   ├── files.ts    # 檔案操作
│   │   │   └── chat.ts     # 對話功能
│   │   ├── storage/        # 儲存層抽象
│   │   │   ├── s3.ts       # S3 操作
│   │   │   └── minio.ts    # MinIO 操作
│   │   └── utils/          # 通用工具
│   │
│   ├── hooks/              # 自訂 React Hooks
│   ├── stores/             # 狀態管理 (Zustand)
│   ├── types/              # TypeScript 型別定義
│   └── styles/             # 全域樣式
│
├── supabase/
│   ├── migrations/         # 資料庫遷移腳本
│   ├── seed.sql            # 種子資料
│   └── config.toml         # Supabase 設定
│
├── docker/
│   ├── docker-compose.yml  # Docker 編排設定
│   ├── Dockerfile          # 應用程式映像檔
│   └── docker-compose.local.yml  # 本地一體機設定
│
└── public/                 # 靜態資源
```

---

## 資料庫設計

### 核心資料表

#### 使用者與組織

```sql
-- 部門表
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 使用者表 (擴展 Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'USER' 
    CHECK (role IN ('SUPER_ADMIN', 'DEPT_ADMIN', 'EDITOR', 'USER')),
  department_id UUID REFERENCES departments(id),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 知識庫 (Dual-Layer Storage Design)

```sql
-- 檔案表 (核心)
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  
  -- Layer 1: 主儲存 (資料主權)
  s3_storage_path TEXT NOT NULL,
  s3_etag VARCHAR(100),
  
  -- Layer 2: AI 運算層適配器
  gemini_file_uri TEXT,
  gemini_state VARCHAR(20) DEFAULT 'PENDING' 
    CHECK (gemini_state IN ('PENDING', 'PROCESSING', 'SYNCED', 'NEEDS_REVIEW', 'REJECTED', 'FAILED')),
  gemini_sync_at TIMESTAMP WITH TIME ZONE,
  quality_score INTEGER,             -- 品質評分 (0-100)
  quality_issues JSONB,              -- 品質問題清單
  
  -- 未來預留
  openai_file_id TEXT,
  claude_file_id TEXT,
  
  -- 元資料
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  uploaded_by UUID REFERENCES user_profiles(id),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 檔案標籤 (多對多關聯)
CREATE TABLE file_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  tag_key VARCHAR(50) NOT NULL,
  tag_value VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(file_id, tag_key, tag_value)
);
```

#### Agent 設定

```sql
-- Agent 表
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  system_prompt TEXT NOT NULL,
  model_version VARCHAR(50) DEFAULT 'gemini-2.5-flash',
  temperature DECIMAL(2,1) DEFAULT 0.7,
  department_id UUID REFERENCES departments(id),
  created_by UUID REFERENCES user_profiles(id),
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Prompt 版本歷史
CREATE TABLE agent_prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  system_prompt TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent 知識綁定規則
CREATE TABLE agent_knowledge_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('FOLDER', 'TAG')),
  rule_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent 存取控制
CREATE TABLE agent_access_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  department_id UUID REFERENCES departments(id),
  can_access BOOLEAN DEFAULT true,
  
  CONSTRAINT user_or_dept CHECK (
    (user_id IS NOT NULL AND department_id IS NULL) OR
    (user_id IS NULL AND department_id IS NOT NULL)
  )
);
```

#### 對話與稽核

```sql
-- 對話 Session
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  user_id UUID REFERENCES user_profiles(id),
  title VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 對話訊息
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id),  -- 直接關聯 Agent，便於統計分析
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  citations JSONB,  -- 引用來源
  token_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 稽核日誌
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  action_type VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 使用者角色與權限

### 角色定義

| 角色 | 代號 | 權限層級 | 典型使用者 |
|-----|------|---------|----------|
| 超級管理員 | `SUPER_ADMIN` | 全能權限，可管理所有資源 | 知識長 (CKO)、IT 主管 |
| 部門管理員 | `DEPT_ADMIN` | 部門級全權，僅能管理所屬部門 | 部門主管 |
| 知識維護者 | `EDITOR` | 僅維護內容，可上傳/更新/刪除文件 | 資深員工、專案經理 |
| 一般使用者 | `USER` | 僅使用，只能與授權的 Agent 對話 | 一般員工 |

### 權限矩陣

```typescript
// types/permissions.ts
export const PERMISSIONS = {
  SUPER_ADMIN: {
    agents: ['create', 'read', 'update', 'delete', 'configure'],
    files: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    departments: ['create', 'read', 'update', 'delete'],
    audit: ['read'],
    settings: ['read', 'update'],
  },
  DEPT_ADMIN: {
    agents: ['create', 'read', 'update', 'delete', 'configure'], // 僅限部門
    files: ['create', 'read', 'update', 'delete'], // 僅限部門
    users: ['read', 'update'], // 僅限部門成員
    departments: ['read'],
    audit: ['read'], // 僅限部門
    settings: [],
  },
  EDITOR: {
    agents: ['read'],
    files: ['create', 'read', 'update', 'delete'],
    users: [],
    departments: [],
    audit: [],
    settings: [],
  },
  USER: {
    agents: ['read'], // 僅限授權的 Agent
    files: [],
    users: [],
    departments: [],
    audit: [],
    settings: [],
  },
} as const;
```

### 功能權限矩陣 (Feature Access Matrix)

| 功能模組 | 操作 | SUPER_ADMIN | DEPT_ADMIN | EDITOR | USER |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **使用者管理** | 新增/停用帳號 | ✅ | ⚠️ 僅本部門 | ❌ | ❌ |
| | 修改角色 | ✅ | ⚠️ 不可升為 SUPER_ADMIN | ❌ | ❌ |
| | 查看所有使用者 | ✅ | ⚠️ 僅本部門 | ❌ | ❌ |
| **部門管理** | 新增/編輯/刪除部門 | ✅ | ❌ | ❌ | ❌ |
| **知識庫** | 上傳文件 | ✅ | ✅ | ✅ | ❌ |
| | 刪除文件 | ✅ | ⚠️ 僅本部門檔案 | ⚠️ 僅自己上傳 | ❌ |
| | 查看所有文件 | ✅ | ⚠️ 僅本部門 | ⚠️ 僅有權限標籤 | ❌ |
| | 管理標籤 | ✅ | ⚠️ 僅本部門標籤 | ❌ | ❌ |
| **Agent 管理** | 建立 Agent | ✅ | ✅ | ❌ | ❌ |
| | 編輯 System Prompt | ✅ | ⚠️ 僅本部門 Agent | ❌ | ❌ |
| | 綁定知識庫 | ✅ | ⚠️ 僅本部門 Agent | ❌ | ❌ |
| | 刪除 Agent | ✅ | ⚠️### 開發統計 (Development Statistics)

- **總檔案數：** ~135 
- **總程式碼行數：** ~13,500 lines
- **完成功能模組：** 9/9 (100% Phase 1 + Phase 2)
  - ✅ 知識庫管理 (100%)
  - ✅ Agent 管理 (100%)
  - ✅ 對話功能 (95%)
  - ✅ 系統管理後台 (100%)
  - ✅ 權限與安全 (100%)
  - ✅ 稽核與日誌 (100%)
  - ✅ 數據儀表板 (100%)
  - ✅ UX 優化基礎 (Favorites, Pre-i18n) (100%)
- **整體完成度：** 95%
| 查看稽核日誌 | ✅ | ⚠️ 僅本部門 | ❌ | ❌ |
| | 管理 API Key | ✅ | ❌ | ❌ | ❌ |

> ⚠️ 表示有條件限制的權限

### API 端點權限矩陣 (API Authorization)

| 端點 | 方法 | 最低角色要求 | 附加條件 |
| :--- | :--- | :--- | :--- |
| `/api/users` | GET | DEPT_ADMIN | 僅返回所屬部門成員 |
| `/api/users` | POST | SUPER_ADMIN | - |
| `/api/users/:id` | PUT | DEPT_ADMIN | 不可修改 SUPER_ADMIN |
| `/api/files` | GET | EDITOR | 依標籤過濾 |
| `/api/files` | POST | EDITOR | 自動加上傳者資訊 |
| `/api/files/:id` | DELETE | EDITOR | 僅刪除自己或下屬上傳 |
| `/api/agents` | GET | USER | 僅返回有權限者 |
| `/api/agents` | POST | DEPT_ADMIN | - |
| `/api/agents/:id/prompt` | PUT | DEPT_ADMIN | 記錄版本歷史 |
| `/api/chat/:agentId` | POST | USER | 驗證 Agent 存取權 |
| `/api/audit-logs` | GET | DEPT_ADMIN | 僅返回所屬部門記錄 |
| `/api/system/config` | GET/PUT | SUPER_ADMIN | - |

---

## API 設計規範

### RESTful API 端點

#### 認證 (Authentication)

```
POST   /api/auth/login          # ✅ 登入（透過 Supabase Auth）
POST   /api/auth/logout         # ✅ 登出
POST   /api/auth/register       # ⏳ 註冊
GET    /api/auth/me             # ⏳ 取得當前使用者
```

#### 知識庫 (Files)

```
GET    /api/files               # ⏳ 列出檔案 (支援分頁、篩選)
POST   /api/files               # ⏳ 上傳檔案
GET    /api/files/:id           # ⏳ 取得單一檔案資訊
PUT    /api/files/:id           # ⏳ 更新檔案元資料
DELETE /api/files/:id           # ⏳ 刪除檔案 (軟刪除)
POST   /api/files/:id/sync      # ⏳ 觸發同步至 Gemini
GET    /api/files/:id/versions  # ⏳ 取得檔案版本歷史
```

#### Agent 管理

```
GET    /api/agents              # ✅ 列出 Agent（基礎實作）
POST   /api/agents              # ✅ 建立 Agent（基礎實作）
GET    /api/agents/:id          # ⏳ 取得 Agent 詳情
PUT    /api/agents/:id          # ⏳ 更新 Agent
DELETE /api/agents/:id          # ⏳ 刪除 Agent
GET    /api/agents/:id/stats    # ⏳ 取得 Agent 使用統計
```

#### 對話 (Chat)

```
GET    /api/chat/sessions       # ✅ 列出對話 Session
GET    /api/chat/sessions/:id   # ✅ 取得對話歷史
DELETE /api/chat/sessions/:id   # ✅ 刪除對話
POST   /api/chat                # ✅ 發送訊息 (支援 Streaming)
```

### API 回應格式

```typescript
// 成功回應
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// 錯誤回應
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

---

## 開發規範

### 程式碼風格

#### TypeScript 規範

```typescript
// ✅ Good - 使用明確的型別定義
interface Agent {
  id: string;
  name: string;
  systemPrompt: string;
  modelVersion: 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.0-flash' | 'gemini-2.0-flash-exp';
}

// ❌ Bad - 避免使用 any
function processAgent(agent: any) { ... }

// ✅ Good - 使用 unknown 並進行型別檢查
function processAgent(agent: unknown): Agent {
  if (!isValidAgent(agent)) {
    throw new Error('Invalid agent data');
  }
  return agent;
}
```

#### 命名規範

```typescript
// 元件：PascalCase
export function AgentCard() { ... }

// 函式與變數：camelCase
const handleSubmit = () => { ... }
const agentName = 'MyAgent';

// 常數：SCREAMING_SNAKE_CASE
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// 型別與介面：PascalCase
interface UserProfile { ... }
type AgentStatus = 'active' | 'inactive';

// 檔案名稱
// - 元件: PascalCase (AgentCard.tsx)
// - 工具: camelCase (formatDate.ts)
// - 常數: camelCase (constants.ts)
```

### Git 工作流程

#### 分支命名

```bash
# 功能分支
feature/add-agent-creation
feature/implement-file-upload

# 修復分支
fix/chat-streaming-error
fix/permission-check-bug

# 緊急修復
hotfix/security-patch

# 重構
refactor/database-schema
```

#### Commit Message 規範 (繁體中文)

```bash
# 格式: <類型>: <描述>

# 類型
feat:     新增功能
fix:      修復錯誤
docs:     文件更新
style:    程式碼格式調整 (不影響功能)
refactor: 程式碼重構
test:     測試相關
chore:    建置/工具調整

# 範例
feat: 新增 Agent 建立功能
fix: 修復檔案上傳時的權限驗證問題
docs: 更新 API 文件
refactor: 重構 Gemini API 封裝邏輯
```

### 錯誤處理

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = '身份驗證失敗') {
    super('AUTHENTICATION_ERROR', message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = '權限不足') {
    super('AUTHORIZATION_ERROR', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} 不存在`, 404);
  }
}
```

---

## Supabase 整合規範

### 客戶端設定

```typescript
// lib/supabase/client.ts - 瀏覽器端
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// lib/supabase/server.ts - 伺服器端
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

### 後端中立性原則

```typescript
// ✅ Good - 使用環境變數，支援 Cloud 與 Self-hosted 切換
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// ❌ Bad - 硬編碼 URL
const supabaseUrl = 'https://xxx.supabase.co';

// ✅ Good - 使用標準 Supabase SDK
import { createClient } from '@supabase/supabase-js';

// ❌ Bad - 直接使用資料庫連線
import { Pool } from 'pg';
const pool = new Pool({ connectionString: '...' });
```

### Row Level Security (RLS) 設計

```sql
-- 啟用 RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 使用者只能看到有權限的檔案
CREATE POLICY "使用者可檢視授權檔案" ON files
  FOR SELECT
  USING (
    -- 超級管理員可看全部
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
    OR
    -- 部門管理員可看部門檔案
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN file_tags ft ON ft.file_id = files.id
      WHERE up.id = auth.uid() 
        AND up.role = 'DEPT_ADMIN'
        AND ft.tag_key = 'department'
        AND ft.tag_value = up.department_id::text
    )
    OR
    -- EDITOR 可看自己上傳的檔案，或擁有標籤權限的檔案
    (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'EDITOR'
      )
      AND (
        -- 自己上傳的
        uploaded_by = auth.uid()
        OR
        -- 擁有標籤存取權限的
        EXISTS (
          SELECT 1 FROM file_tags ft
          JOIN user_tag_permissions utp ON ft.tag_key = utp.tag_key AND ft.tag_value = utp.tag_value
          WHERE ft.file_id = files.id AND utp.user_id = auth.uid()
        )
      )
    )
    OR
    -- 一般使用者：只有上傳者可看自己的檔案
    (
      uploaded_by = auth.uid()
      AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role NOT IN ('SUPER_ADMIN', 'DEPT_ADMIN', 'EDITOR')
      )
    )
  );

-- EDITOR 標籤權限表 (新增)
CREATE TABLE user_tag_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  tag_key VARCHAR(50) NOT NULL,
  tag_value VARCHAR(100) NOT NULL,
  granted_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, tag_key, tag_value)
);
```

---

## Gemini API 整合

### 檔案同步工作流程

```typescript
// lib/gemini/files.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// 初始化 Gemini 客戶端
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 上傳檔案至 Gemini
export async function uploadFileToGemini(
  filePath: string,
  mimeType: string
): Promise<string> {
  const fileManager = genAI.getFileManager();
  
  const uploadResult = await fileManager.uploadFile(filePath, {
    mimeType,
  });
  
  return uploadResult.file.uri;
}

// 檢查檔案處理狀態
export async function checkFileStatus(fileUri: string) {
  const fileManager = genAI.getFileManager();
  const file = await fileManager.getFile(fileUri);
  return file.state; // 'PROCESSING' | 'ACTIVE' | 'FAILED'
}

// 刪除檔案
export async function deleteFileFromGemini(fileUri: string) {
  const fileManager = genAI.getFileManager();
  await fileManager.deleteFile(fileUri);
}
```

### 對話 API 設計

```typescript
// lib/gemini/chat.ts
export async function generateChatResponse(
  prompt: string,
  systemPrompt: string,
  fileUris: string[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }
) {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL_VERSION || 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
  });

  // 組裝內容，包含檔案參考
  const contents = [
    ...fileUris.map(uri => ({
      fileData: { fileUri: uri, mimeType: 'application/pdf' }
    })),
    { text: prompt }
  ];

  if (options?.stream) {
    // 串流模式
    const result = await model.generateContentStream(contents);
    return result.stream;
  } else {
    // 一般模式
    const result = await model.generateContent(contents);
    return result.response.text();
  }
}
```

---

## 部署指南

### 雲端部署 (Supabase Cloud + Vercel)

```bash
# 1. 設定 Supabase 專案
# - 前往 supabase.com 建立專案
# - 選擇區域: Northeast Asia (Tokyo) 或鄰近區域
# - 記下 URL 與 API Keys

# 2. 執行資料庫遷移
supabase db push

# 3. 部署至 Vercel
vercel deploy --prod

# 4. 設定環境變數
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GEMINI_API_KEY
```

### 本地一體機部署 (Mac Mini)

```yaml
# docker/docker-compose.local.yml
version: '3.8'

services:
  # 前端 + 後端
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=http://supabase-kong:8000
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - supabase-db
      - minio

  # PostgreSQL
  supabase-db:
    image: supabase/postgres:15.1.0.117
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}

  # MinIO (S3 替代方案)
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"   # API
      - "9001:9001"   # Console
    volumes:
      - minio_data:/data
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}

volumes:
  postgres_data:
  minio_data:
```

### 啟動本地服務

```bash
# 進入 docker 目錄
cd docker

# 啟動所有服務
docker compose -f docker-compose.local.yml up -d

# 查看日誌
docker compose logs -f app

# 停止服務
docker compose down
```

---

## 效能優化

### 前端效能

```typescript
// 1. 使用 React Server Components
// app/agents/page.tsx
export default async function AgentsPage() {
  // 伺服器端直接查詢，無需 client-side fetch
  const agents = await getAgents();
  return <AgentList agents={agents} />;
}

// 2. 動態載入
import dynamic from 'next/dynamic';

const ChatWindow = dynamic(() => import('@/components/chat/ChatWindow'), {
  loading: () => <ChatSkeleton />,
  ssr: false,
});

// 3. 圖片最佳化
import Image from 'next/image';

<Image
  src={agent.avatarUrl}
  alt={agent.name}
  width={48}
  height={48}
  placeholder="blur"
/>
```

### 後端效能

```typescript
// 1. 使用快取
import { unstable_cache } from 'next/cache';

const getAgentFiles = unstable_cache(
  async (agentId: string) => {
    // 查詢 Agent 綁定的檔案
    return await fetchAgentFiles(agentId);
  },
  ['agent-files'],
  { revalidate: 60 } // 60 秒快取
);

// 2. 背景任務處理檔案同步
// 使用佇列處理 Gemini 檔案同步，避免阻塞主流程
```

---

## 安全性規範

### 資料安全

1. **傳輸加密**：全站強制 HTTPS (TLS 1.3)
2. **API Key 保護**：所有 API Key 儲存於環境變數，不進版控
3. **檔案存取控制**：透過 Signed URL 或 Proxy 機制，不直接暴露檔案 URI

### 權限檢查

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // 保護路由
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 管理員路由保護
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session?.user.id)
      .single();

    if (!['SUPER_ADMIN', 'DEPT_ADMIN'].includes(profile?.role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}
```

---

## 測試規範

### 測試工具

- **單元測試**：Jest + React Testing Library
- **E2E 測試**：Playwright
- **API 測試**：Supertest

### 測試結構

```
__tests__/
├── unit/
│   ├── lib/
│   │   ├── gemini.test.ts
│   │   └── permissions.test.ts
│   └── components/
│       ├── AgentCard.test.tsx
│       └── FileUpload.test.tsx
├── integration/
│   └── api/
│       ├── agents.test.ts
│       └── files.test.ts
└── e2e/
    ├── auth.spec.ts
    ├── agent-creation.spec.ts
    └── chat-flow.spec.ts
```

### 測試指令

```bash
# 執行所有測試
pnpm test

# 執行單元測試
pnpm test:unit

# 執行 E2E 測試
pnpm test:e2e

# 產生覆蓋率報告
pnpm test:coverage
```

---

## 故障排除

### 常見問題

#### 1. Gemini 檔案同步失敗

```bash
# 檢查 API Key 是否正確
echo $GEMINI_API_KEY

# 檢查檔案大小是否超過限制 (2GB)
ls -lh /path/to/file

# 查看同步狀態
SELECT id, filename, gemini_state, gemini_sync_at 
FROM files 
WHERE gemini_state = 'FAILED';
```

#### 2. Supabase 連線問題

```bash
# 檢查環境變數
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 測試連線
curl https://your-project.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key"
```

#### 3. 本地 Docker 服務問題

```bash
# 查看容器狀態
docker ps -a

# 查看特定容器日誌
docker logs eakap-app-1 --tail 100

# 重啟服務
docker compose restart
---

## UI/UX 設計規範

對應規格書 Ch.9，定義平台視覺設計標準。

### 設計理念

| 核心原則 | 說明 |
| :--- | :--- |
| **Light & Airy** | 以明亮白色為基底，搭配柔和漸層，營造開闊專業感 |
| **Modern Minimalism** | 去除冗餘裝飾，聚焦內容與功能 |
| **Trust & Clarity** | 透過清晰的資訊層級與一致的互動回饋，建立使用者信任 |
| **Glassmorphism Accent** | 關鍵區塊使用毛玻璃效果，增添層次與現代感 |

### 色彩系統 (Color Palette)

```css
/* ===== 主色調 (Primary) ===== */
--color-primary-500: hsl(230, 85%, 60%);    /* 主色 - 按鈕、連結 */
--color-primary-600: hsl(230, 80%, 52%);    /* 主色 Hover */

/* ===== 中性色 (Neutral) ===== */
--color-white:       hsl(0, 0%, 100%);      /* 純白 - 卡片背景 */
--color-gray-50:     hsl(220, 20%, 98%);    /* 頁面背景 */
--color-gray-600:    hsl(220, 12%, 42%);    /* 主要文字 */
--color-gray-800:    hsl(220, 15%, 22%);    /* 標題文字 */

/* ===== 語意色 (Semantic) ===== */
--color-success-500: hsl(145, 65%, 42%);    /* 成功 - 綠色 */
--color-warning-500: hsl(38, 90%, 50%);     /* 警告 - 琥珀色 */
--color-error-500:   hsl(0, 75%, 55%);      /* 錯誤 - 紅色 */

/* ===== 特效色 (Effects) ===== */
--gradient-hero: linear-gradient(135deg, hsl(230, 85%, 60%) 0%, hsl(280, 70%, 60%) 100%);
--shadow-soft:   0 4px 20px hsla(230, 50%, 30%, 0.08);
--glass-bg:      hsla(0, 0%, 100%, 0.7);
--glass-blur:    blur(12px);
```

### 字體規範 (Typography)

| 用途 | 字體堆疊 | 權重 |
| :--- | :--- | :--- |
| **標題 (H1-H3)** | `'Inter', 'Noto Sans TC', system-ui, sans-serif` | 600-700 |
| **正文 (Body)** | `'Inter', 'Noto Sans TC', system-ui, sans-serif` | 400 |
| **程式碼** | `'JetBrains Mono', 'Fira Code', monospace` | 400 |

### 間距與圓角系統

```css
/* 8px 基礎單位間距系統 */
--space-2:  0.5rem;    /* 8px */
--space-4:  1rem;      /* 16px */
--space-6:  2rem;      /* 32px */

/* 圓角系統 */
--radius-sm:   6px;
--radius-md:   10px;
--radius-lg:   16px;
```

### 動畫規範

| 場景 | 時長 | 曲線 |
| :--- | :--- | :--- |
| 按鈕 Hover | 150ms | ease |
| 卡片 Hover | 200ms | ease-out |
| 頁面過場 | 300ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Modal 展開 | 250ms | ease-out-expo |

---

## 資料管線與品質保證

對應規格書 Ch.11，定義檔案上傳處理流程。

### 上傳處理狀態

| 狀態 | 說明 | 下一步操作 |
| :--- | :--- | :--- |
| `PENDING` | 上傳中/等待處理 | 系統自動處理 |
| `PROCESSING` | 背景處理中 | 等待完成 |
| `SYNCED` | 已同步至 Gemini | 可供 Agent 使用 |
| `NEEDS_REVIEW` | 品質未達標準 | 管理員覆核 |
| `REJECTED` | 管理員拒絕 | 通知上傳者修正 |
| `FAILED` | 系統處理失敗 | 自動重試 3 次後通知管理員 |

### 支援格式與驗證規則

| 檔案類型 | 副檔名 | 最大尺寸 | 驗證規則 |
| :--- | :--- | :--- | :--- |
| **文件** | .pdf, .docx | 100 MB | 頁數 ≤ 500、非加密 |
| **簡報** | .pptx | 100 MB | 投影片 ≤ 200 |
| **試算表** | .xlsx, .csv | 50 MB | 列數 ≤ 100,000 |
| **純文字** | .txt, .md, .html | 10 MB | UTF-8 編碼 |

### 品質評估指標

```typescript
interface QualityReport {
    file_id: string;
    overall_score: number;          // 0-100 綜合分數
    text_extraction_rate: number;   // 文字提取率
    structure_integrity: number;    // 結構完整度
    issues: QualityIssue[];
}

interface QualityIssue {
    severity: 'ERROR' | 'WARNING' | 'INFO';
    code: string;
    message: string;
}
```

---

## AI 治理與監控

對應規格書 Ch.12，定義 AI 回答品質與回饋機制。

### AI 品質指標

| 指標名稱 | 計算方式 | 健康閾值 | 告警條件 |
| :--- | :--- | :--- | :--- |
| **引用率** | 有引用回答數 / 總回答數 | ≥ 80% | < 70% 連續 1 小時 |
| **空回答率** | 「我不知道」次數 / 總次數 | ≤ 5% | > 10% 連續 30 分鐘 |
| **平均回應時間** | Σ (首字回應時間) / N | ≤ 2 秒 | > 4 秒 連續 5 分鐘 |
| **錯誤率** | API 錯誤次數 / 總請求 | ≤ 1% | > 5% |

### 回饋收集機制

每個 Agent 回答下方提供：
- 👍 **有幫助**：記錄正向回饋
- 👎 **沒幫助**：展開回饋表單
  - 原因選項：`答非所問` / `資訊錯誤` / `來源過時` / `其他`
  - 自由文字補充

### 回饋資料結構

```sql
TABLE chat_feedback (
    id UUID PRIMARY KEY,
    message_id UUID REFERENCES chat_messages(id),
    user_id UUID REFERENCES user_profiles(id),
    rating SMALLINT CHECK (rating IN (-1, 1)),
    reason_code VARCHAR(50),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Prompt 版本控制

```sql
TABLE agent_prompt_versions (
    id UUID PRIMARY KEY,
    agent_id UUID REFERENCES agents(id),
    version_number INT NOT NULL,
    system_prompt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    traffic_percentage INT DEFAULT 0,  -- A/B 測試流量分配
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 錯誤處理與容錯機制

對應規格書 Ch.13，定義系統容錯策略。

### 重試策略設定

```typescript
const retryConfig = {
    // Gemini API 呼叫
    geminiApi: {
        maxRetries: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        retryableErrors: [429, 500, 502, 503, 504]
    },
    
    // S3/MinIO 同步
    storageSync: {
        maxRetries: 5,
        initialDelayMs: 2000,
        maxDelayMs: 30000,
        backoffMultiplier: 2
    },
    
    // 資料庫操作
    database: {
        maxRetries: 3,
        initialDelayMs: 500,
        maxDelayMs: 5000,
        backoffMultiplier: 1.5
    }
};
```

### 用戶端錯誤提示規範

| 錯誤代碼 | 使用者看到的訊息 | 建議行動 |
| :--- | :--- | :--- |
| `AUTH_EXPIRED` | 您的登入已過期，請重新登入 | 重新導向登入頁 |
| `PERMISSION_DENIED` | 您沒有權限執行此操作 | 顯示聯絡管理員連結 |
| `FILE_TOO_LARGE` | 檔案過大 (上限 100MB)，請壓縮後重試 | 顯示上傳限制說明 |
| `AI_UNAVAILABLE` | AI 服務暫時忙碌中，請稍後再試 | 顯示預估恢復時間 |
| `RATE_LIMITED` | 請求太頻繁，請稍後 30 秒再試 | 顯示倒計時 |
| `NETWORK_ERROR` | 網路連線失敗，請檢查您的網路 | 顯示重試按鈕 |

### 系統健康檢查 API

```typescript
// GET /api/health
interface HealthCheckResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    components: {
        database: ComponentHealth;
        storage: ComponentHealth;
        geminiApi: ComponentHealth;
    };
}

interface ComponentHealth {
    status: 'up' | 'down' | 'degraded';
    latencyMs?: number;
    message?: string;
}
```

### 備份策略 (Appliance 模式)

| 資料類型 | 備份頻率 | 保留週期 | 備份位置 |
| :--- | :--- | :--- | :--- |
| PostgreSQL | 每日 02:00 | 30 日 | 本機 + 外接硬碟 |
| MinIO 檔案 | 即時增量 | 永久 | 本機 |
| 設定檔 | 每次變更 | 10 版本 | Git (本地) |

---

## 國際化與無障礙

對應規格書 Ch.14，定義多語言與無障礙規範。

### 多語言支援

| 語言 | 代碼 | 優先級 | 支援版本 |
| :--- | :--- | :--- | :--- |
| 繁體中文 (台灣) | `zh-TW` | 首要 | MVP |
| 英文 | `en` | 擴展 | Phase 2 |

#### 翻譯檔案結構

```
/locales
├── zh-TW/
│   ├── common.json       # 通用詞彙
│   ├── auth.json         # 登入相關
│   ├── agents.json       # Agent 管理
│   └── errors.json       # 錯誤訊息
└── en/
```

#### 語言切換邏輯
1. **優先檢查**：使用者帳號設定的偏好語言
2. **次要偵測**：瀏覽器 `Accept-Language` 標頭
3. **預設**：繁體中文 (`zh-TW`)

### 無障礙設計規範 (WCAG 2.1 AA)

| 原則 | 具體要求 | 實作方式 |
| :--- | :--- | :--- |
| **可感知** | 色彩對比 ≥ 4.5:1 | 設計系統已驗證 |
| | 所有圖片提供 alt 文字 | 程式碼檢查 |
| **可操作** | 所有功能可用鍵盤操作 | Tab 導航測試 |
| **可理解** | 一致的導航模式 | 設計規範遵循 |
| **健壯性** | HTML 語意正確 | 使用語意標籤 |

### 鍵盤導航規範

| 按鍵 | 功能 |
| :--- | :--- |
| `Tab` | 移動焦點至下一個可互動元素 |
| `Shift + Tab` | 移動焦點至上一個元素 |
| `Enter` / `Space` | 觸發按鈕 / 選項 |
| `Escape` | 關閉 Modal / 取消操作 |
| `/` | 聚焦搜尋框 (全域快捷鍵) |

### 焦點狀態視覺指示

```css
:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
}

.btn:focus-visible {
    box-shadow: 0 0 0 3px var(--color-primary-200);
}
```

---

## 附錄

### 支援的檔案格式

| 格式 | MIME Type | 最大大小 | 驗證規則 |
|-----|-----------|--------|----------|
| PDF | application/pdf | 100MB | 頁數 ≤ 500、非加密 |
| DOCX | application/vnd.openxmlformats-officedocument.wordprocessingml.document | 100MB | 頁數 ≤ 500 |
| XLSX | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | 50MB | 列數 ≤ 100,000 |
| PPTX | application/vnd.openxmlformats-officedocument.presentationml.presentation | 100MB | 投影片 ≤ 200 |
| CSV | text/csv | 50MB | 列數 ≤ 100,000、UTF-8 編碼 |
| MD | text/markdown | 10MB | UTF-8 編碼 |
| TXT | text/plain | 10MB | UTF-8 編碼 |
| HTML | text/html | 10MB | UTF-8 編碼 |

### 參考資源

- [Next.js 文件](https://nextjs.org/docs)
- [Supabase 文件](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [MinIO 文件](https://min.io/docs/minio/container/index.html)

---

## 版本紀錄

| 版本 | 日期 | 說明 |
|-----|------|-----|
| 1.0 | 2025-12-31 | 初始版本，基於網站規格書 v1.0 建立 |
| 1.1 | 2026-01-01 | 新增 UI/UX 設計規範、完整 RBAC 矩陣、資料管線與品質保證、AI 治理與監控、錯誤處理與容錯機制、國際化與無障礙等章節 (對應規格書 v1.1 Ch.9-14) |
| 1.1.1 | 2026-01-01 | 修正邏輯衝突：(1) gemini_state 狀態值補充 NEEDS_REVIEW/REJECTED；(2) chat_messages 新增 agent_id 欄位；(3) RLS 政策補充 EDITOR 角色權限與 user_tag_permissions 資料表；(4) 統一附錄檔案大小限制並補充驗證規則 |
| 1.1.2 | 2026-01-01 | 初始開發完成：專案結構建立、Supabase 設定與 Migration、登入/儀表板頁面、基礎 API 路由、設計系統實作 |

---

## 📊 開發統計

**完成度：** 約 85%  
**最後更新：** 2026-01-01 15:10

### 已完成模組
- ✅ 專案基礎架構（100%）
- ✅ 資料庫設計與 Migration（100%）
- ✅ Supabase 整合（100%）
- ✅ 身份驗證與授權（95% - 含登入、註冊、登出、RLS）
- ✅ 設計系統（100%）
- ✅ 錯誤處理框架（100%）
- ✅ 知識庫管理（85% - 上傳、同步、管理介面）
- ✅ Agent 管理（85% - CRUD、編輯器、Prompt 版本）
- ✅ 對話功能（95% - 串流、歷史、回饋）
- ✅ 系統管理後台（90% - 使用者、部門、系統設定）

### 待開發模組
- ⏳ UI 元件庫（50% - 進階元件待補完）
- ⏳ 國際化與無障礙（0%）
- ⏳ 進階數據統計與視覺化（10%）


