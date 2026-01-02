# CLAUDE.md - Enterprise AI Knowledge Agent Platform (EAKAP)

**文件版本：** 1.3
**對應規格書：** 02.企業AI知識庫平台_網站規格書_v1.0
**最後更新：** 2026-01-02
**核心策略：** DIKW Visualization & Departmental Knowledge Silos

---

## 📋 開發進度追蹤

### ✅ 已完成項目

#### 基礎架構與設定
- ✅ 專案基礎結構建立（Next.js 14+ App Router）
- ✅ Supabase 設定與 Migration 機制
- ✅ Gemini API 客戶端整合

#### 核心模組
- ✅ 檔案上傳與同步 (`/api/files`, `/api/files/[id]/sync`)
- ✅ Agent 管理 (`/api/agents`) - CRUD 與 System Prompt 編輯
- ✅ 基礎對話功能 (`/api/chat`) - 支援 Gemini 與串流 (SSE)
- ✅ 企業大腦橋接 (`/api/openai/v1/chat/completions`) - 相容 OpenAI 介面

### 🚧 進行中項目 (Phase 2: DIKW Visualization)

#### 知識加工廠 (Knowledge Ingestion Pipeline)
- [ ] **轉譯 Worker (Librarian Agent)**: 
  - 實作 PDF -> Markdown 轉換 (使用 Gemini Flash)
  - 實作自動命名建議演算法 (依據 L3 規範)
  - 增加 `markdown_content` 到 Files Table
- [ ] **前端審核介面**: 讓使用者確認 AI 建議的檔名與標籤

#### 動態框架引擎 (Dynamic Framework Engine)
- [ ] **資料庫 Schema 更新**:
  - `knowledge_frameworks` (定義 SWOT, PESTLE 等結構)
  - `knowledge_instances` (儲存填寫內容)
- [ ] **Mapper Agent**: 背景任務，負責掃描新文件並填入框架
- [ ] **框架定義檔**: 建立初始的 `swot.json`, `vpc.json` Seed Data

#### 企業大腦視覺化 (DIKW Dashboard)
- [ ] **前端視覺化庫整合**: 安裝 `reactflow` 或 `d3`
- [ ] **星系圖元件**: 實作 Data -> Info -> Knowledge 節點動畫
- [ ] **知識卡片**: 顯示框架內容 (SWOT 四象限) 與引用來源
- [ ] **Departments List**: 星系圖增加部門切換濾鏡 (Department Filter)

#### Agent 工廠升級 (Agent Factory 2.0)
- [ ] **規則引擎擴充**: 支援 `DEPARTMENT` 類型的 Knowledge Rule
- [ ] **AI 建構顧問 (Architect)**: 
  - 實作「意圖分析」Prompt
  - 建議最相關的知識來源 (Top-K Files & Documents)
  - **Meta-Prompting Engine**: 
    - 輸入：使用者意圖 + 建議的知識清單
    - 輸出：符合 `K-0` 標準的結構化 System Prompt (包含角色、任務對照表、合規檢查、思考路徑)
    - 技術：使用 Gemini 2.0 Flash 進行 "Prompt-to-Prompt" 生成

---

## 系統架構理念 (Architecture Philosophy)

本專案採用 **"Hub & Spoke"** 加 **"DIKW Pyramid"** 雙重架構：

1.  **Hub (Sovereign Data)**: 
    - 使用 Supabase + MinIO/S3 儲存「清洗後的 Markdown」與「結構化知識 JSON」。
    - 這裡的資料擁有最高主權，格式通用，不綁定特定 AI 模型。
2.  **Spoke (AI Runtime)**:
    - 透過 Adapter 同步資料至 Gemini File Search (或其他 LLM)。
    - 僅作為運算引擎，不作為永久儲存。
    - 僅作為運算引擎，不作為永久儲存。
    *   **Layer 3: Department Silos (The Filter)**:
    *   以 `department_id` 為硬性邊界，建立企業組織架構的知識護城河。
    *   Agent 可設為 `Scope: Department`，自動讀取該部門所有新舊文件。
4.  **Visualization (The Brain)**:
    - 使用 Metadata 驅動的前端介面，讓知識產出過程具象化。
    - 拒絕 Hard-coding 框架，保持未來擴充彈性。

---

## 技術棧更新 (Tech Stack)

| 層級 | 技術 | 說明 |
|-----|------|-----|
| **Frontend** | Next.js 14+, Tailwind CSS | App Router 架構 |
| **Visualization** | **React Flow / D3.js** | 負責繪製 DIKW 星系圖與節點連接 |
| **Backend** | Supabase (Postgres) | 使用 JSONB 儲存動態框架內容 |
| **Ingestion** | Gemini 2.0 Flash | 用於快速、低成本的文件轉譯與 metadata 提取 |
| **AI Model** | Gemini 1.5 Pro/Flash | 用於 RAG 檢索與最終回應 |

---

## 開發規範 (Guidelines)

### 1. 動態框架開發原則
*   **不要寫死框架欄位**：不要在 TypeScript Interface 中定義 `swot_strengths`。
*   **使用 Generic Interface**：
    ```typescript
    interface FrameworkInstance {
      id: string;
      type: string; // 'swot', 'pestle'
      data: Record<string, any>; // { 'Strengths': [...], ... }
    }
    ```
*   **Schema Validation**：使用 Zod 驗證 `framework_frameworks.structure_schema` 定義的結構。

### 2. 檔案處理原則
*   **保留原始與成品**：上傳 PDF (Raw) 後，務必產生一份 Markdown (Clean) 並存回 DB。
*   **AI 命名優先**：檔名盡量由 AI 根據內容生成建議，再由人類確認，以確保知識庫整潔。

### 3. 前端視覺化原則
*   **流暢回饋**：上傳檔案後，必須有視覺上的「能量流動」效果傳導至知識節點。
*   **可鑽取 (Drill-down)**：所有視覺化節點都必須是可點擊的，展開後顯示 Raw Data 來源。

---

## 資料庫設計 (New Schema Preview)

```sql
-- Knowledge Framework Defs
CREATE TABLE knowledge_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- 'swot', 'pestle'
  name VARCHAR(100) NOT NULL,
  schema JSONB NOT NULL, -- Zod schema definition for UI generation
  ui_config JSONB -- Color, icon, layout type
);

-- Knowledge Data (Filled by AI)
CREATE TABLE knowledge_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_code VARCHAR(50) REFERENCES knowledge_frameworks(code),
  title VARCHAR(200),
  data JSONB NOT NULL,
  completeness FLOAT DEFAULT 0, -- 0-1
  confidence FLOAT DEFAULT 0, -- 0-1
  source_file_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 常用指令

```bash
# 生成新的 Migration
supabase migration new add_knowledge_frameworks

# 更新 Type Definition
npm run update-types

# 啟動開發環境
npm run dev
```
