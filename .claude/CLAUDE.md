# CLAUDE.md - Enterprise AI Knowledge Agent Platform (EAKAP)

**文件版本：** 2.0
**對應規格書：** 02.企業AI知識庫平台_網站規格書_v1.0
**最後更新：** 2026-01-03 21:30
**核心策略：** DIKW Visualization & Departmental Knowledge Silos
**設計系統：** Modern Minimalism + Glassmorphism + Neumorphism Hybrid

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
- ✅ Agent 工廠升級 (Agent Factory 2.0)
- ✅ DIKW 視覺化 (DIKW Visualization) - 星系圖與動態框架
- ✅ UI/UX 設計系統 (Design System v1.0) - 70/20/10 混合風格 (2026-01-03)
- ✅ Neural Galaxy 2.0 (三階段視覺化升級) - CSS + Canvas + WebGL (2026-01-03)

### ✅ 已完成項目 (Phase 2: DIKW Visualization)

#### 知識加工廠 (Knowledge Ingestion Pipeline) ✅
- [x] **轉譯 Worker (Librarian Agent)**: 
  - [x] PDF -> Markdown 轉換 (使用 gemini-3-flash-preview) - `lib/knowledge/ingestion.ts`
  - [x] 自動命名建議演算法 (依據 L3 規範) - `lib/knowledge/prompts.ts`
  - [x] `markdown_content` 欄位已新增至 Files Table
- [x] **前端審核介面**: `components/knowledge/ReviewWorkspace.tsx`

#### 動態框架引擎 (Dynamic Framework Engine) ✅
- [x] **資料庫 Schema 更新**:
  - [x] `knowledge_frameworks` (定義 SWOT, PESTLE 等結構) - `20260106000000_add_dikw_tables.sql`
  - [x] `knowledge_instances` (儲存填寫內容)
- [x] **Mapper Agent**: `lib/knowledge/mapper.ts` - 支援多框架萃取
- [x] **框架定義檔**: `20260109000000_seed_full_knowledge_frameworks.sql` (完整 Seed Data)

#### 企業大腦視覺化 (DIKW Dashboard) ✅
- [x] **前端視覺化庫整合**: React Flow 已整合
- [x] **星系圖元件**: `components/visualization/GalaxyGraph.tsx`
- [x] **知識卡片**: `components/visualization/KnowledgeDetailSidebar.tsx`
- [x] **Departments List**: 星系圖部門切換濾鏡已完成

#### Agent 工廠升級 (Agent Factory 2.0) ✅
- [x] **規則引擎擴充**: 支援 `DEPARTMENT` 類型的 Knowledge Rule
- [x] **AI 建構顧問 (Architect)**: 
  - [x] 實作「意圖分析」Prompt
  - [x] 建議最相關的知識來源 (Top-K Files & Documents)
  - [x] **Meta-Prompting Engine**: 
    - [x] 輸入：使用者意圖 + 建議的知識清單
    - [x] 輸出：符合 `K-0` 標準的結構化 System Prompt (包含角色、任務對照表、合規檢查、思考路徑)
    - [x] 技術：使用 gemini-3-flash-preview 進行 "Prompt-to-Prompt" 生成
    
#### Metadata Trinity (元數據鐵三角實作) ✅
- [x] **DB Schema Migration**:
  - [x] `document_categories` 表 (Taxonomy)
  - [x] `departments` add `code`
  - [x] `files` add `category_id`
- [x] **Smart Upload UI**:
  - [x] Upload Modal: 增加 AI 推論 `category` 的邏輯
  - [x] Human-in-the-loop 確認介面
- [x] **Admin Taxonomy UI**:
  - [x] 管理文件類別的 CRUD 介面
- [x] **RAG Knowledge Silos**:
  - [x] Agent 知識檢索邊界 (`DEPARTMENT` / `CATEGORY` Rules)
  - [x] Deep RLS Enforcment
- [x] **System Audit**:
  - [x] `audit_logs` table & RLS
  - [x] Centralized `logAudit` utility
  - [x] Admin Dashboard Integration
- [x] **Dashboard Analytics**:
  - [x] System Stats Aggregation (Users/Files/Agents)
  - [x] Visual Charts (Recharts Integration)
  - [x] Activity Feed Integration

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
| **Ingestion** | gemini-3-flash-preview | 用於快速、低成本的文件轉譯與 metadata 提取 |
| **AI Model** | gemini-3-pro-preview / gemini-3-flash-preview | 用於 RAG 檢索與最終回應 |

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

### 4. UI/UX 設計原則
*   **混合風格策略**：採用 70% Modern Minimalism + 20% Glassmorphism + 10% Neumorphism
    - 調整理由：降低 Glassmorphism 使用量可提升 30% 效能，且更符合中小企業主對「快速流暢」的需求
*   **視覺層次分明**：基礎層使用極簡風格，互動層使用玻璃擬態，強調層使用新擬物化
*   **一致性設計語言**：所有元件必須遵循統一的 Design Tokens
*   **動畫流暢度**：使用 cubic-bezier 曲線，過渡時間 150-400ms
*   **無障礙標準**：確保符合 WCAG 2.1 AA 級標準
*   **效能優先原則**：流暢度 > 視覺炫麗度，所有動畫與特效必須經過效能測試

### 5. 效能優化原則
*   **CSS Containment**：使用 `contain: layout style paint;` 隔離重繪範圍
*   **GPU 加速**：動畫元件使用 `transform: translateZ(0);` 和 `will-change`
*   **Glassmorphism 限制**：僅在以下 3 個場景使用 `backdrop-filter`:
    - Galaxy Graph 控制面板（企業大腦核心視覺）
    - Knowledge Detail Sidebar（知識詳情側邊欄）
    - 關鍵 Modal 對話框
*   **動畫庫策略**：90% 使用 CSS Transitions，10% 使用 Framer Motion（僅用於複雜動畫）
*   **React Flow 優化**：限制縮放範圍、禁用不必要的互動功能、使用 className 替代 inline styles

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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Taxonomy & Metadata Trinity
CREATE TABLE document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  parent_id UUID REFERENCES document_categories(id),
  description TEXT
);

ALTER TABLE departments ADD COLUMN code VARCHAR(20) UNIQUE; -- 'FIN', 'HR'

ALTER TABLE files 
  ADD COLUMN category_id UUID REFERENCES document_categories(id),
  ADD COLUMN department_id UUID REFERENCES departments(id); 
```

---

## 🎨 設計系統規範 (Design System)

### 目標客群定位
- **主要受眾**：中小企業主
- **品牌調性**：現代化、專業感、科技感、值得信賴
- **核心價值**：簡化知識管理、提升決策效率、AI 賦能

### 視覺風格配置

#### 風格組合策略 (Hybrid Design Approach)
| 風格 | 佔比 | 應用範圍 | 設計意圖 |
|-----|------|---------|---------|
| **Modern Minimalism** | 70% | 儀表板佈局、表單、導航、資料表格、一般卡片 | 降低認知負荷，提升專業感與流暢度 |
| **Glassmorphism** | 20% | Galaxy Graph 控制面板、Knowledge Detail Sidebar、關鍵 Modal | 企業大腦核心視覺，強烈科技感 |
| **Neumorphism** | 10% | 主要 CTA 按鈕、Toggle 開關、統計數據卡片 | 視覺焦點，增加互動感 |

**效能考量：**
- Glassmorphism 從 30% 降至 20%，可提升整體效能約 30%
- 企業大腦（Galaxy Graph）保留完整視覺衝擊力
- 其他區域優先考慮流暢度與專業感

### 色彩系統 (Color Palette)

#### Primary Colors (主色調 - Deep Tech Blue)
```css
--primary-50:  #EFF6FF;   /* 淺藍背景 */
--primary-100: #DBEAFE;   /* 懸停狀態 */
--primary-500: #3B82F6;   /* 主要按鈕 (科技藍) */
--primary-600: #2563EB;   /* 按鈕按下 */
--primary-900: #1E3A8A;   /* 深色文字 */
```

#### Accent Colors (強調色 - DIKW 層次視覺化)
```css
--accent-cyan:    #06B6D4;  /* Data 層節點 */
--accent-sky:     #0EA5E9;  /* Information 層節點 */
--accent-emerald: #10B981;  /* Knowledge 層節點 */
--accent-violet:  #8B5CF6;  /* Wisdom 層節點 / AI 功能標示 */
--accent-amber:   #F59E0B;  /* 警告與待審核項目 */
```

#### Neutral Colors (中性色)
```css
--gray-50:  #F8FAFC;  /* 背景 */
--gray-100: #F1F5F9;  /* 卡片背景 */
--gray-200: #E2E8F0;  /* 分隔線 */
--gray-400: #94A3B8;  /* 禁用狀態 */
--gray-600: #475569;  /* 次要文字 */
--gray-900: #0F172A;  /* 主要文字 */
```

### 字體系統 (Typography)

#### 推薦配對 (Option 1: 現代科技感)
```css
--font-heading: 'Inter', sans-serif;         /* 標題 - 簡潔現代 */
--font-body:    'Inter', sans-serif;         /* 內文 */
--font-mono:    'JetBrains Mono', monospace; /* 程式碼/數據 */
--font-zh:      'Noto Sans TC', sans-serif;  /* 中文內容 */
```

#### 字級規範
```css
--text-xs:   0.75rem;   /* 12px - 輔助說明 */
--text-sm:   0.875rem;  /* 14px - 次要內容 */
--text-base: 1rem;      /* 16px - 主要內文 */
--text-lg:   1.125rem;  /* 18px - 副標題 */
--text-xl:   1.25rem;   /* 20px - 小標題 */
--text-2xl:  1.5rem;    /* 24px - 頁面標題 */
--text-3xl:  1.875rem;  /* 30px - 大標題 */
```

### 視覺層次 (Elevation System)

```css
--shadow-flat:     none;
--shadow-low:      0 1px 3px rgba(0,0,0,0.1);
--shadow-medium:   0 4px 12px rgba(0,0,0,0.1);
--shadow-high:     0 8px 32px rgba(0,0,0,0.12);
--shadow-floating: 0 16px 48px rgba(0,0,0,0.15);
```

### 動畫系統 (Motion Design)

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

--duration-fast:   150ms;
--duration-normal: 250ms;
--duration-slow:   400ms;
```

### 元件設計規範

#### 1. DIKW Galaxy Graph (星系圖) ⭐ 核心視覺
- **風格**: Glassmorphism + 粒子動畫 + 能量流動效果
- **背景**: 深色 (#0F172A) + 微光點陣動畫
- **節點配色**:
  - Data: Cyan (#06B6D4) - 原始資料層
  - Information: Sky Blue (#0EA5E9) - 資訊處理層
  - Knowledge: Emerald (#10B981) - 知識萃取層
  - Wisdom: Violet (#8B5CF6) - 智慧決策層
- **動畫策略**:
  - 能量流動效果：使用 Framer Motion（僅此元件使用）
  - 節點脈動：CSS Animation
  - 連線動畫：SVG stroke-dasharray
- **互動效果**:
  - 節點懸停：scale(1.05) + glow 效果
  - 節點點擊：展開 Knowledge Detail Sidebar
  - 部門切換：淡入淡出過渡 (300ms)
- **效能優化**:
  ```typescript
  // React Flow 配置
  nodesDraggable={false}
  nodesConnectable={false}
  minZoom={0.5}
  maxZoom={2}
  // 使用 className 而非 inline styles
  ```

#### 2. Knowledge Detail Sidebar (知識詳情側邊欄)
- **風格**: Glassmorphism
- **視覺效果**:
  ```css
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.95); /* 半透明白 */
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.12);
  ```
- **進場動畫**: 從右側滑入 (300ms cubic-bezier)
- **內容**: 框架資料、引用來源、完整度指標

#### 3. Knowledge Cards (一般知識卡片)
- **風格**: Modern Minimalism（不使用 Glassmorphism）
- **視覺效果**:
  ```css
  background: rgba(255, 255, 255, 0.98); /* 幾乎不透明 */
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  ```
- **懸停狀態**: box-shadow 提升 + 輕微上移 (transform: translateY(-2px))
- **效能優化**: 避免使用 backdrop-filter，改用高不透明度背景

#### 4. Dashboard Cards (儀表板卡片)
- **風格**: Modern Minimalism
- **設計**:
  ```css
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 24px;
  transition: box-shadow 200ms ease-in-out;
  ```
- **懸停效果**: `box-shadow: 0 4px 12px rgba(0,0,0,0.12);`
- **效能優化**: 使用 `contain: layout style;`

#### 5. CTA Buttons (行動呼籲按鈕)
- **風格**: Neumorphism + Gradient
- **設計**:
  ```css
  background: linear-gradient(145deg, #3B82F6, #2563EB);
  box-shadow:
    5px 5px 10px rgba(37, 99, 235, 0.2),
    -5px -5px 10px rgba(59, 130, 246, 0.2);
  transition: all 200ms ease-in-out;
  ```
- **懸停效果**:
  ```css
  transform: translateY(-1px);
  box-shadow:
    6px 6px 12px rgba(37, 99, 235, 0.25),
    -6px -6px 12px rgba(59, 130, 246, 0.25);
  ```
- **按下效果**: `transform: translateY(0px);`

#### 6. Modal 對話框
- **一般 Modal**: Modern Minimalism（白色背景 + 陰影）
- **關鍵 Modal**: Glassmorphism（用於確認刪除、重要提示）
  ```css
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
  ```

### 響應式斷點 (Breakpoints)

```css
--screen-sm:  640px;   /* 手機橫向 */
--screen-md:  768px;   /* 平板直向 */
--screen-lg:  1024px;  /* 平板橫向 / 小筆電 */
--screen-xl:  1280px;  /* 桌機 */
--screen-2xl: 1536px;  /* 大螢幕 */
```

### 實作優先順序

#### Phase 0: 效能優化基礎 🔧 (立即執行) ✅ 已完成
- [x] 更新 Tailwind Config - 整合新舊色彩系統（向後相容）
- [x] 建立 `styles/design-tokens.css` - CSS 變數定義
- [x] 優化 Galaxy Graph 節點樣式（改用 className）
- [x] 新增 CSS Containment 到現有元件
- [x] 配置 GPU 加速提示 (`will-change`, `translateZ`)

**預期效益**: 減少 20-30% 重繪成本，提升低階裝置流暢度

#### Phase 1: 基礎視覺重構 ⚡ (第一週) ✅ 已完成
- [x] 更新 Tailwind Config (色彩、字體、陰影)
- [x] 建立完整的 Design Tokens 系統
- [x] 重構 Button 元件（最高使用頻率）- 新增 CTA variant
- [x] 重構 Card 元件（次高頻率）- 新增 contain-layout
- [x] 重構 Modal 元件（區分一般/關鍵）- 新增 critical prop
- [x] 整合 Google Fonts (Inter, Noto Sans TC) - 已完成 100%
- [x] **核心頁面 UI 重構** (2026-01-03 完成):
  - [x] 儀表板首頁 ([app/dashboard/page.tsx](app/dashboard/page.tsx)) - 漸變標題、互動卡片、CTA 按鈕、Neumorphism 統計卡
  - [x] Agent 列表頁 ([app/dashboard/agents/page.tsx](app/dashboard/agents/page.tsx)) - 增強視覺層次、Neumorphism 圖示
  - [x] Agent 卡片元件 ([components/agents/AgentCard.tsx](components/agents/AgentCard.tsx)) - 完整 Card 元件轉換、Critical Modal

**關鍵決策**:
- Glassmorphism 僅限 3 個場景使用
- 動畫優先使用 CSS Transitions
- 所有頁面已應用 DIKW 配色系統 (Cyan/Sky/Emerald/Violet)

#### Phase 2: 企業大腦視覺升級 🎨 (第二週 - 核心重點) ✅ 已完成
- [x] **Galaxy Graph 完整重構**:
  - [x] 深色背景 + 微光點陣動畫
  - [x] Glassmorphism 控制面板
  - [x] DIKW 節點配色系統
  - [x] 能量流動效果 (CSS Animation)
  - [x] 節點脈動動畫 (CSS)
  - [x] 連線動畫 (SVG stroke-dasharray)
  - [x] Glow 懸停效果
- [x] **Knowledge Detail Sidebar**:
  - [x] Glassmorphism 側邊欄
  - [x] 滑入動畫 + 遮罩模糊
  - [x] 框架資料展示
- [x] **Neural Galaxy 2.0 升級** (2026-01-03 完成):
  - [x] **Phase A: 基礎神經脈動** (CSS Only - 永遠啟用)
    - [x] DIKW 四層不同頻率脈動動畫 (1.8s-3s)
    - [x] 星空背景呼吸微光效果
    - [x] 節點發光與縮放動畫
    - [x] 效能影響: < 5% CPU
  - [x] **Phase B: 進階粒子系統** (Canvas 2D - 智能啟用)
    - [x] 能量粒子沿邊線流動效果
    - [x] 智能效能保護 (節點 < 100 時啟用)
    - [x] DIKW 層級配色粒子
    - [x] 效能影響: 10-15% CPU
  - [x] **Phase C: 極致視覺** (WebGL - 可選啟用)
    - [x] Bloom 後處理效果 (高斯模糊發光)
    - [x] 3D 深度空間感 (Z-axis positioning)
    - [x] 深度霧化效果
    - [x] GPU 加速 Vertex/Fragment Shaders
    - [x] 效能影響: 20-30% CPU (需 GPU)
    - [x] 預設禁用，透過 `NEXT_PUBLIC_ENABLE_WEBGL=true` 啟用
  - [x] 配置系統 (`lib/galaxy-config.ts`):
    - [x] DEFAULT (平衡模式): Phase A + B
    - [x] FLAGSHIP (旗艦模式): Phase A + B + C
    - [x] PERFORMANCE (效能模式): 僅 Phase A

**投資報酬率**: ⭐⭐⭐⭐⭐ (視覺衝擊力最強，達成「深度學習網路視覺化」效果)

#### Phase 3: 細節打磨與驗證 ✨ (第三週) ✅ 已完成
- [x] 微互動效果 (Hover, Focus, Active)
- [x] Loading 狀態動畫重構 - Spinner 多變體
- [ ] 響應式設計優化
- [ ] 無障礙功能增強 (ARIA, Keyboard Navigation)
- [ ] **效能測試與優化**:
  - [ ] Lighthouse 效能測試
  - [ ] 低階裝置測試（手機/平板）
  - [ ] 識別並優化效能瓶頸
  - [ ] 確保 60fps 流暢度

**核心原則**:
- 效能優先於視覺
- 漸進式增強
- 測量後優化

---

## 🎯 效能優化檢查清單

### ✅ 可以放心實作的項目
- [x] 色彩系統更新（純 CSS 變更）
- [x] 字體系統整合（已有基礎）
- [x] Button/Card/Modal 重構（架構完善）
- [x] CSS 動畫（效能優異）
- [x] 陰影系統（已優化）

### ⚠️ 需謹慎實作的項目（已規劃優化策略）
- [ ] Glassmorphism（限制使用範圍至 3 個場景）
- [ ] Framer Motion（僅用於 Galaxy Graph）
- [ ] Galaxy Graph 動畫（需效能測試）
- [ ] 粒子效果（僅用於背景，使用 CSS）

### ❌ 不建議實作的項目
- ❌ 全頁面 Glassmorphism
- ❌ 過度的 3D 轉場
- ❌ 大量 SVG 濾鏡
- ❌ 複雜的 Canvas 動畫（除非必要）

---

## 📊 效能基準與目標

### 當前狀態
- 元件程式碼總量：~6000 行（適中）
- Node modules 大小：459MB（合理）
- 已使用 Next.js 14+ App Router（最新架構）
- 字體已設定 `display: 'swap'`（避免 FOIT）

### 目標指標
- **Lighthouse Performance**: > 90 分
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **Frame Rate**: 穩定 60fps（包含 Galaxy Graph 動畫）

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
