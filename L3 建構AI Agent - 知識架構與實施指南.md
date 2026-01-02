# Marketing AI 知識庫：架構與實施指南

> **文件定位**：本文件為 Marketing AI 知識庫的**主索引 + 系統架構指南**，採用 **DIKW 四層架構**（Data → Information → Knowledge → Wisdom），以「以終為始」的邏輯設計，提供完整的智慧層輸出分類、知識框架庫、資訊提取指南、資料來源管理、檔案治理規範與實施路線圖。
>
> **目標**：讓戰略與戰術工作者一眼掌握「我要產出什麼（智慧層）→ 應該用哪些框架分析（知識層）→ 需要哪些資訊欄位（資訊層）→ 資料從哪裡來（資料層）」，並為 AI Agent 建立可檢索、可治理、可迭代的知識骨幹。

---

## 📚 文件導航：如何使用這套知識庫

本知識庫採用 **WKID 方法論**（Wisdom → Knowledge → Information → Data）作為核心設計思想，並依任務性質分為三類文件：

### 🗂️ 文件體系

| 文件名稱 | 文件類型 | 適用對象 | 使用時機 | 核心內容 |
|---------|---------|---------|---------|---------|
| **本文件**<br/>Marketing AI 知識庫：架構與實施指南 | 📘 主索引 + 架構指南 | 架構師、專案負責人、團隊管理者 | • 系統設計階段<br/>• 團隊導入規劃<br/>• 查找完整分類表<br/>• 建立治理規範 | • DIKW 四層架構<br/>• 150+ 戰術輸出完整分類<br/>• 檔案命名與治理<br/>• 12 個月實施路線圖 |
| **戰術輸出 AI Agent 規格** | 📕 WKID 執行手冊 | 內容創作者、行銷執行者、任何需要產出內容的人 | • 撰寫社群貼文<br/>• 製作 Landing Page<br/>• 設計 Email 文案<br/>• 產出任何行銷素材 | • WKID 戰術流程<br/>• 核心框架庫（VPC、Persona、Journey 等）<br/>• 輸出模板與 QA 檢查表<br/>• 與戰略協作介面 |
| **戰略擬定 AI Agent 規格** | 📗 WKID 決策手冊 | 決策者、策略規劃者、任何需要做戰略決策的人 | • 市場進入決策<br/>• 產品定價策略<br/>• 預算分配規劃<br/>• 多方案評估 | • WKID 決策流程<br/>• 決策模型庫（決策樹、投資組合等）<br/>• 情境模擬與風險分級<br/>• 與戰術協作介面 |
| **雅詩蘭黛白金系列 AI 產品經理 GPTs 知識框架** | 📙 實作案例 | 具體專案參考 | 學習如何為特定品牌/產品建立 GPTs | 完整的品牌專屬知識框架實作範例 |

### 🧭 快速導航：我該讀哪份文件？

**情境 1：我要做具體的內容產出**  
→ 直接使用 **[戰術輸出 AI Agent 規格](./戰術輸出_ai_agent_規格.md)**  
例如：「我要寫一篇部落格」「設計促銷 Email」「製作產品介紹影片腳本」

**情境 2：我需要做戰略決策**  
→ 直接使用 **[戰略擬定 AI Agent 規格](./戰略擬定_ai_agent_規格.md)**  
例如：「是否該降價促銷？」「預算該怎麼分配？」「要不要進入新市場？」

**情境 3：我想了解整體系統架構**  
→ 閱讀 **本文件** 的 §1 DIKW 四層架構 + §2 任務啟動流程

**情境 4：我需要查找完整的輸出類型分類（智慧層）**  
→ 查閱 **本文件** 的 §3 智慧層：戰略與戰術輸出對照清單 + 附錄 B：戰術輸出完整分類（150+ 項）

**情境 5：我需要了解可用的知識框架（知識層）**  
→ 查閱 **本文件** 的 §4 知識層：知識框架庫

**情境 6：我需要了解如何從資料提取資訊（資訊層與資料層）**  
→ 查閱 **本文件** 的 §5 資訊層與資料層：從資料到資訊的轉換

**情境 7：我要建立檔案命名規範與治理制度**  
→ 參考 **本文件** 的 §6.4 檔案格式與命名規範

**情境 8：我負責導入這套系統**  
→ 閱讀 **本文件** 的 §7 推進路線圖與成功要素

### 🔄 WKID 方法論簡介（以終為始的架構）

**WKID** 是本知識庫的核心工作心智模型，採用 **DIKW 四層架構**（Data → Information → Knowledge → Wisdom），以「以終為始」的邏輯確保每一次產出或決策都有清晰的邏輯鏈與可追溯性：

```
W (Wisdom：智慧)
  ↓ 最終輸出的戰略或戰術（如策略簡報、Landing Page、定價方案）
K (Knowledge：知識)
  ↓ 傳統知識框架工具（如 VPC、SWOT、PESTLE、Journey Map）
I (Information：資訊)
  ↓ 從資料中提取的內容，用來填寫知識框架的欄位
D (Data：資料)
  ↓ 原始資料來源，必須知道哪裡可以找到必要的資料
```

**工作流程（以終為始）**：
1. **定義智慧輸出**：明確最終要產出什麼（戰略決策文件、戰術內容等）
2. **選擇知識框架**：根據輸出目標，選擇適用的知識框架（SWOT、VPC、Journey 等）
3. **提取資訊內容**：從資料來源中提取框架所需的資訊欄位
4. **追溯資料來源**：標註資料來源，確保可追溯性與證據鏈

**應用差異**：
- **戰術輸出**：W = 具體內容產出（如「產出 Landing Page」），K = 內容框架（如 VPC、Messaging House），I = 填入框架的資訊（受眾特徵、賣點、證明），D = 資料來源（CRM、問卷、競品分析）
- **戰略擬定**：W = 決策文件（如「是否降價 10% 的決策報告」），K = 決策模型（如 SWOT、五力分析、ROI 模型），I = 分析資訊（市場規模、競品價格、財務數據），D = 資料來源（市場報告、財務系統、競品資料庫）

**兩者協作**：
- 戰略決定「做什麼」→ 自動產生戰術任務單 → 戰術產出內容
- 戰術測試結果 → 回饋戰略 → 觸發戰略重新評估

詳細流程請參考各自的規格文件。

---

## 1. DIKW 四層架構：以終為始的知識體系

本知識庫採用 **DIKW 四層架構**（Data → Information → Knowledge → Wisdom），以「以終為始」的邏輯設計，從最終輸出的智慧層開始，逐步追溯到所需的知識框架、資訊內容與資料來源。

### 1.1 智慧層（Wisdom）：最終輸出的戰略或戰術

**定義**：智慧層是 AI Agent 的最終產出，包含所有戰略決策文件與戰術內容輸出。

**內容範圍**：
- **戰略輸出**：策略簡報、投資提案、市場進入決策、定價策略、預算分配規劃、OKR 對齊報告、風險評估等
- **戰術輸出**：150+ 類內容產出（詳見 §3），包含社群貼文、Landing Page、Email 文案、銷售提案、產品頁面等

**關鍵特徵**：
- 可直接交付給決策者或執行者使用
- 基於知識框架的結構化產出
- 包含可追溯的資訊來源與資料證據

**對應章節**：§3 戰術輸出對照清單（A1~A8）、附錄 B 戰術輸出完整分類

---

### 1.2 知識層（Knowledge）：傳統知識框架工具

**定義**：知識層是企業管理與行銷管理的公認知識框架，用於結構化分析與決策。

**內容範圍**：
- **產品與價值框架**：Value Proposition Canvas (VPC)、Business Model Canvas (BMC)、JTBD、Solution Map
- **市場與競爭框架**：PESTLE、Porter 五力、SWOT、TAM/SAM/SOM、Ansoff/BCG 矩陣
- **受眾與旅程框架**：Persona、ICP、Journey Map、Customer Experience Map
- **品牌與訊息框架**：品牌金字塔、訊息屋、Tone of Voice、故事弧
- **決策與分析框架**：ROI 模型、定價策略矩陣、KPI Tree、決策樹

**關鍵特徵**：
- 標準化的分析模板與結構
- 定義所需的資訊欄位清單
- 可重複使用的知識工具

**對應章節**：§4 知識框架庫

---

### 1.3 資訊層（Information）：從資料中提取的內容

**定義**：資訊層是從原始資料中提取、處理後的結構化內容，用來填寫知識框架的欄位。

**內容範圍**：
- **市場資訊**：市場規模數據、成長率、監管變化摘要、產業趨勢分析
- **競品資訊**：競品價格、主打賣點、市場份額、優勢/弱勢分析
- **顧客資訊**：受眾特徵、痛點洞察、旅程階段、行為數據
- **產品資訊**：功能清單、技術規格、差異化要點、Proof Points
- **財務資訊**：營收數據、成本結構、ROI 計算、預算分配

**關鍵特徵**：
- 已從原始資料中提取並結構化
- 可直接填入知識框架的欄位
- 標註資料來源與信心等級

**對應章節**：§5.1 資料領域與代表欄位（資訊提取指南）

---

### 1.4 資料層（Data）：原始資料來源

**定義**：資料層是未經處理的原始資料，必須明確知道哪裡可以找到這些資料。

**內容範圍**：
- **內部系統資料**：ERP、CRM、CDP、Data Warehouse、客服系統、專案管理工具
- **外部資料來源**：市場研究機構報告、政府統計、產業協會資料、競品分析平台、媒體監測工具
- **採集機制**：API 抓取、批次匯入、爬蟲、問卷、訪談、焦點團體

**關鍵特徵**：
- 原始、未經處理的資料
- 明確的資料來源位置與取得方式
- 資料品質管理機制（準確性、完整性、即時性）

**對應章節**：§5 資料建構層

---

### 1.5 四層協作流程

```
智慧層（輸出目標）
  ↓ 「我要產出什麼？」
知識層（選擇框架）
  ↓ 「應該用哪些框架分析？」
資訊層（提取內容）
  ↓ 「框架需要哪些資訊欄位？」
資料層（追溯來源）
  ↓ 「這些資訊從哪裡來？」
```

**AI Agent 工作流程**：
1. 使用者定義智慧輸出目標（如「產出市場進入策略簡報」）
2. Agent 選擇適用的知識框架（如 SWOT + PESTLE + Ansoff 矩陣）
3. Agent 從資料層提取資訊（市場規模、競品分析、內部能力評估）
4. Agent 將資訊填入知識框架，生成智慧輸出
5. 輸出包含完整的資料來源追溯與信心等級標註

---

## 2. 任務啟動流程：以終為始的 WKID 工作流

> **與 DIKW 四層架構的關係**：本章節提供「以終為始」的任務啟動流程，從智慧層（輸出目標）開始，逐步追溯到所需的知識框架、資訊內容與資料來源。若您已熟悉系統架構，可直接使用：
> - **戰術類任務**：跳至 [戰術輸出 AI Agent 規格](./戰術輸出_ai_agent_規格.md)，遵循 WKID 四步驟快速產出
> - **戰略類任務**：跳至 [戰略擬定 AI Agent 規格](./戰略擬定_ai_agent_規格.md)，遵循 WKID 決策流程

| DIKW 層級 | 步驟              | 目的                               | 對應內容                                                       | 主要資料來源                                 | 對應 Agent 模組                            | 代表性產出                         |
| --------- | ----------------- | ---------------------------------- | ------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------ | ---------------------------------- |
| **W 智慧層** | 1. 定義輸出目標   | 明確最終要產出什麼（戰略或戰術）   | 戰術輸出清單（A1~A8）、策略文件類型、內容格式要求               | 任務簡述、活動日曆、渠道 KPI、管理會議紀錄   | Strategist / Generator                     | 策略簡報、Landing Page、Email 文案、投資提案 |
| **K 知識層** | 2. 選擇知識框架   | 找出最適用的分析/決策框架          | VPC、BMC、SWOT、PESTLE、5 Forces、Ansoff、Journey Map、Persona、訊息屋 | 知識框架庫（§4）                              | Strategist / Brand Guardian                | 框架填寫稿、關鍵論述、分析結構     |
| **I 資訊層** | 3. 提取資訊內容   | 從資料中提取框架所需的資訊欄位     | 市場規模、競品分析、受眾洞察、產品規格、財務數據、Proof Points | 資料層（§5）→ 提取並結構化                   | Researcher / Legal Checker                 | 資訊摘要表、證據清單、引用來源標註 |
| **D 資料層** | 4. 追溯資料來源   | 確認資訊的原始資料來源與取得方式   | CRM、市場報告、競品資料庫、財務系統、問卷、訪談、實驗報告       | 內部系統、外部來源、採集機制（§5.2）         | Researcher / Optimizer                     | 資料來源清單、資料品質標註、信心等級 |
| **品質控制** | 5. 品質與迭代     | 確保品牌/法務/數據一致並計劃下一輪 | 品牌語氣指南、QA Checklist、L10N Workflow、實驗設計模板             | 品質審查紀錄、實驗結果、客戶回饋             | Brand Guardian / Legal Checker / Optimizer | 審核紀錄、A/B 設計、下一輪優化建議 |

### 2.1 戰術第一線快速使用

- 問題句型：「我要產出 `{輸出類型}`，目標是 `{漏斗階段/KPI}`，對象是 `{persona}`。」
- Agent 自動回傳：必備框架、需補齊的資料欄位、相依的合規要求、建議輸出模板。
- 使用者填寫缺口資料後觸發生成，並依 QA Checklist 完成交付。

### 2.2 主管/策略人員流程

- 先透過策略框架（SWOT、Growth Flywheel、Portfolio Matrix）定義優先戰場。
- 以資料層檢核：TAM/SAM/SOM、財務敏感度、營運假設。
- 指派跨部門 Agent 任務，設定資料刷新週期與責任人。
- 產出決策必要文件（策略簡報、投資提案、分階段實施計畫），並回寫決策與驗證結果。

### 2.3 關鍵術語釐清

- **Rock**：源自 EOS 管理系統，用於描述單季內必須完成的高優先度專案或里程碑，可對齊 OKR 的 `Key Results` 與資源配置。
- **Growth Hypothesis Canvas**：用來記錄成長假設的結構化模板，涵蓋目標客群、待解決的行為落差、主張/訊息、啟動通路、預期指標與驗證時間框，便於後續實驗與追蹤。
- **Offer Architecture**：定義一個提案或促案的價值組合、價格層級、贈品/加值、核心 CTA 與牽動的履約條件，確保各接觸點訊息一致且合規。
- **Proof 概念族**：`Proof Point` 指單一句子或數據證明；`Proof Asset` 為可供引用的完整素材（如案例、證照、媒體報導）；`Proof Library` 則是將前述證據依使用場景、信心等級、最後審核日期加以編目管理的知識庫。
- **DIKW 架構（第 1 節）**：採用 Data → Information → Knowledge → Wisdom 四層架構，以「以終為始」的邏輯設計，從智慧層（輸出目標）開始，逐步追溯到所需的知識框架、資訊內容與資料來源。

---

## 3. 智慧層：戰略與戰術輸出對照清單（A1~A8）

> **DIKW 架構定位**：本章節對應 **智慧層（Wisdom）**，定義 AI Agent 的最終產出目標。  
> 各階段的代表性產出已在附錄 B 標註 `stage`、`channel`、`format` 等標籤，可直接對應 AI Agent 的檢索條件。

### A1. 觸及／認知（Reach & Awareness）

- **任務焦點**：放大聲量、建立第一印象與品牌關聯。
- **代表性產出（詳見附錄 B）**：社群媒體內容類、廣告內容類、活動與展會類的上游素材。
- **核心框架**：Persona、JTBD、Messaging House、品牌金字塔、5A Journey（Aware、Appeal）、競品 Battlecard。
- **必備資料**：受眾分群與觸達指標、聲量趨勢、KOL/媒體清單、平台規範、品牌語氣樣式、關鍵事實與數據證明。
- **關聯 Agent**：Strategist → Researcher → Brand Guardian → Generator。

### A2. 評估／考量（Consideration）

- **任務焦點**：說服潛在客戶理解價值並降低疑慮。
- **代表性產出（詳見附錄 B）**：內容行銷類、網站內容類、影音內容類的評估素材。
- **核心框架**：VPC、BMC、Solution Map、Proof Points、Journey（Evaluate）、Buyers Guide、大綱/故事弧模板。
- **必備資料**：客戶痛點證據、功能/規格表、競品差異、SEO 語義圖、客戶引用、技術限制、法規註記。

### A3. 轉換（Conversion）

- **任務焦點**：促成明確行動（提交表單、購買、預約等）。
- **代表性產出（詳見附錄 B）**：電子郵件行銷類、銷售支援內容類、網站轉換頁。
- **核心框架**：Journey（Convert）、A/B Hypothesis Canvas、Offer Architecture、ROI 模型、Pricing Playbook、異議地圖。
- **必備資料**：轉換率/漏斗指標、價格方案、顧客異議資料庫、渠道規範、付款/履約限制、合約條件、成交流程。

### A4. 留存／擴張（Retention & Expansion）

- **任務焦點**：提升使用率、留存率與擴張營收。
- **代表性產出（詳見附錄 B）**：產品與用戶教育類、客服與成功類、數據與分析報告類。
- **核心框架**：Success Plan、Health Score 模型、Customer Value Map、Journey（Adopt/Retain）、Referral Playbook。
- **必備資料**：產品使用行為、健康分數指標、續約/流失原因、客訴與回饋、產品路線圖、交叉銷售成功案例。

### A5. 品牌／企業向（Brand & Corporate）

- **任務焦點**：維護企業聲譽、吸引人才與投資人、支援內部溝通。
- **代表性產出（詳見附錄 B）**：公關傳播類、決策與策略文件類、內部管理與訓練類。
- **核心框架**：品牌金字塔、Corporate Narrative、企業文化語彙、ESG/IR 披露準則、變更管理模型。
- **必備資料**：公司里程碑與指標、治理結構、CSR/ESG 指標、法規要求、雇主品牌調查、員工價值主張研究。

### A6. 零售／實體與包裝

- **任務焦點**：在實體渠道實現一致體驗與銷售轉換。
- **代表性產出（詳見附錄 B）**：零售與實體通路類、品牌與識別類的應用素材。
- **核心框架**：Retail Playbook、Merchandising Checklist、品牌識別系統、法規標示清單。
- **必備資料**：包裝法規、尺寸/材質規範、門市陳列準則、在地化術語、消費者動線研究。

### A7. 法務／合規／風險

- **任務焦點**：確保所有輸出符合法規並預備危機回應。
- **代表性產出（詳見附錄 B）**：法務與合規類、危機通訊素材。
- **核心框架**：Legal Checklist、風險矩陣、平台規範對照表、危機通訊 SOP。
- **必備資料**：地區法規、平台政策、法務審核紀錄、危機案例、授權合約、證據要求。

### A8. 國際化／在地化

- **任務焦點**：跨語言與跨地區調整訊息與流程。
- **代表性產出（詳見附錄 B）**：國際化與在地化類、翻譯資產與本地化指引。
- **核心框架**：L10N Workflow、Tone of Voice Matrix、Cultural Dos & Don’ts、Terminology Governance。
- **必備資料**：市場/語言研究、在地法規、文化禁忌案例、翻譯品質量表、地域優先級與商業目標。

---

## 4. 知識層：知識框架庫（Knowledge Layer）

> **DIKW 架構定位**：本章節對應 **知識層（Knowledge）**，定義所有可用的傳統知識框架工具。  
> 這些框架用於結構化分析與決策，並定義所需的資訊欄位清單。

### 4.1 核心框架分類

- **產品與價值（Foundation）**：Value Proposition Canvas、Business Model Canvas、JTBD、Solution Map、產品技術規格、差異化清單、Roadmap 摘要。
- **市場與競爭（Market）**：PESTLE、Porter 五力、SWOT、TAM/SAM/SOM、Category Horizon Map、競品 Battlecard、定價策略矩陣、Ansoff/BCG。
- **受眾與旅程（Audience & Journey）**：Persona、ICP、STP、Buying Center、Journey Map（AARRR/5A/See-Think-Do-Care）、Customer Experience Map。
- **品牌與訊息（Brand & Messaging）**：品牌金字塔、訊息屋、Tone of Voice、故事弧、Proof Library、Visual/Verbal Identity 指南。
- **內容與通路（GTM Content）**：SEO 語義圖、Content Pillar Map、Channel Playbook、Campaign Blueprint、Editorial Calendar。
- **銷售與 CS（Sales & CS）**：Pricing Playbook、ROI 模型、Deal Desk SOP、Sales Sequence、Success Plan、Health Score、Renewal Playbook。
- **法務與合規（Legal & Risk）**：廣告禁語對照表、法遵需求矩陣、資料保護政策、危機管理手冊、審核流程圖。
- **營運與資料（Ops & Data）**：KPI Tree、Tracking Plan、Attribution Model、Naming Convention、A/B 測試模板、數據品質檢查表。
- **流程與治理（Process & Governance）**：RACI、版本控制規範、QA Checklist、Localisation Workflow、知識維護 SOP。

### 4.2 文件治理建議

- 採用 YAML Front Matter 記錄 `title / version / owner / last_reviewed / persona / stage / region / language / sources / compliance / confidence`。
- 設定更新節奏：策略文件季更、戰術模板月更、數據資料週更新。
- 建立引用制度：所有內容需標註資料來源與信心等級，方便 Agent 策略性引用。

---

## 5. 資訊層與資料層：從資料到資訊的轉換

> **DIKW 架構定位**：本章節涵蓋 **資訊層（Information）** 與 **資料層（Data）**。  
> - **資訊層**：從原始資料中提取、處理後的結構化內容，用來填寫知識框架的欄位  
> - **資料層**：未經處理的原始資料來源，必須明確知道哪裡可以找到這些資料

### 5.1 資訊層：資料領域與資訊提取指南

以下表格定義了從資料層提取資訊的領域與代表欄位，這些資訊可直接填入知識框架（§4）的對應欄位：

| 資訊領域   | 資訊欄位（從資料中提取）                            | 對應的資料來源（資料層）                             | 支援的知識框架（知識層）                      |
| ---------- | --------------------------------------------------- | --------------------------------------------------- | -------------------------------------------- |
| 市場趨勢   | 市場規模、成長率、監管變化、類別關鍵事件            | Gartner/Forrester、政府公開資料、產業協會、新聞監測 | PESTLE、五力、SWOT、策略簡報                 |
| 競品情報   | 價格、主打賣點、投放渠道、關鍵訊息、份額、優勢/弱勢 | SimilarWeb、廣告資料庫、競品官網、招股書            | Battlecard、比較頁、提案、定位策略           |
| 顧客洞察   | 人口/公司特徵、任務、痛點、動機、媒體偏好、旅程阻礙 | CRM、MA、問卷、訪談、社群聆聽                       | Persona、JTBD、Journey、訊息屋               |
| 產品與服務 | 功能清單、技術規格、Roadmap、差異化、Proof 資產、案例| 產品文件、JIRA、Roadmap 工具、CS 訪談               | Product Page、Datasheet、Demo、Sales Deck    |
| 銷售與營收 | 成交率、客單價、折扣、使用率、流失/續約資料         | CRM、訂閱系統、財務系統                             | Pricing Playbook、ROI 模型、提案書、留存計畫 |
| 行銷績效   | 漏斗數據、轉換率、曝光、互動、廣告成本、SEO 指標    | GA4、廣告平台、SEO 工具、BI                         | 活動成效報告、A/B 測試、優化建議、渠道策略   |
| 內容資產   | 歷史素材、表現評分、語氣樣例、版型、素材授權        | DAM、CMS、品牌手冊、法律授權庫                      | 內容生成、品牌一致性、在地化                 |
| 法務與風險 | 法規條款、禁語、審核紀錄、授權狀態、危機案例        | 法務資料庫、合規平台、法規公報                      | Legal Checklist、危機腳本、條款文件          |
| 實驗與優化 | 假設、對照組、樣本量、結果、統計顯著性              | Experiment Platform、A/B 工具、分析報表             | A/B 設計、優化建議、增長實驗文件             |

> **資訊提取流程**：AI Agent 從資料層（§5.2）的原始資料中提取上述資訊欄位，經過結構化處理後，填入知識框架（§4）的對應欄位，最終生成智慧層（§3）的輸出。

### 5.2 資料層：原始資料來源與管線

**定義**：資料層包含所有未經處理的原始資料，必須明確知道哪裡可以找到這些資料。

- **內部系統**：ERP、CRM、CDP、Data Warehouse、客服系統、專案管理工具。
- **外部來源**：市場研究機構（Nielsen、Ipsos）、產業報告（Gartner、IDC）、政府統計、開放資料、媒體監測、SEO/社群工具、競品分析平台。
- **採集機制**：API 抓取、批次匯入、爬蟲、問卷、訪談、焦點團體、使用者錄影、第三方購買數據。
- **品質確保**：定期資料稽核、Source of Truth 定義、資料字典、欄位版本管控、信心等級標示。

---

## 6. 知識庫與系統架構（Governance & Automation）

### 6.1 目錄範例

```
/01_Foundation/
  VPC/ vpc_core.md
  BMC/ bmc_global.md
  JTBD/ persona_job.md
  TechSpecs/ product_specs.md          # 產品技術規格（Markdown 表格）
/02_Market/
  PESTLE_region_year.md
  FiveForces_category.md
  TAM_analysis.md                       # 市場規模分析（改用 Markdown）
  Competitors/ brand/battlecard.md
/03_Audience/
  Persona/ role_industry_region.md
  Journey/ segment_funnel.md
/04_Brand_Message/
  MessagingHouse/product_segment.md
  ToneOfVoice/global.md
  Glossary/glossary_en.md               # 術語表（改用 Markdown）
  Glossary/glossary_zh-TW.md
/05_GTM_Content/
  SEO/ semantic_map_lang.md             # SEO 語義圖（改用 Markdown 表格）
  ContentPillars/pillar.md
  Channel_Strategy/channel.md
/06_Sales_CS/
  Pricing/ pricing_plan.md              # 定價方案（改用 Markdown 表格）
  ROI_Models/ roi_model.md              # ROI 模型（改用 Markdown）
  Playbooks/ motion.md
/07_Legal/
  AdPolicy/platform_region.md
  Disclaimers/usecase.md
/08_Ops_Data/
  KPI_Tree.md                           # KPI 樹（改用 Markdown）
  TrackingPlan.md                       # 追蹤計畫（改用 Markdown 表格）
  UTM_Standard.md
  Attribution_Model.md
/09_Process/
  RACI.md
  QA_Checklist.md
  Localization/workflow.md
```

### 6.2 AI Agent 分工建議

1. **Strategist Agent**：組合產品、通路、受眾框架，輸出策略骨架。
2. **Researcher Agent**：蒐集證據、補齊市調、競品、數據佐證。
3. **Brand Guardian Agent**：檢核訊息屋、品牌語氣、禁語、在地化。
4. **Legal Checker Agent**：對照法規、平台規範，標註風險句與替代語。
5. **Generator Agent**：根據戰術輸出清單生成多格式內容。
6. **Optimizer Agent**：連結 KPI、實驗結果，制定下一輪優化計畫。

### 6.3 系統層級整合（對應 DIKW 四層架構）

- **資料層（Data）**：Master/Transactional/Behavioral/External/Document Repository，包含所有原始資料來源與採集機制。
- **資訊層（Information）**：資料提取與結構化處理模組，將原始資料轉換為可填入知識框架的資訊欄位。
- **知識層（Knowledge）**：策略、品牌、行銷、分析、合規框架文件庫，定義標準化的分析模板與結構。
- **智慧層（Wisdom）**：內容生成、策略規劃、決策支援模組，產出最終的戰略與戰術輸出。
- **智能層（Agent 協作）**：市場分析、競爭分析、顧客洞察、內容生成、策略規劃、績效分析、風險評估、創意發想 Agent，依任務自動調用各層資源。
- **回饋層（持續優化）**：成效追蹤、A/B 測試、模型訓練、知識更新、持續優化機制。

### 6.4 檔案格式與命名規範

> **檔案格式核心原則**：優先使用 Markdown (.md)，確保 GPT 可讀性與人類友善性。  
> 📖 完整檔案格式標準請參考：[File_Format_Standards.md](./File_Format_Standards.md)

**格式快速決策**：
- ✅ **知識文件**：一律使用 `.md`（Persona、VPC、模板、策略分析等）
- ⚠️ **代碼字典**：可用 `.csv`（僅限 `/00_Catalog/` 目錄）
- ⚠️ **腳本配置**：可用 `.yaml`（僅限給 Python 腳本使用）
- ❌ **禁用格式**：`.xlsx`、`.pdf`、`.docx`（改用 `.md` 表格）

---

#### 6.4.1 命名與代碼規格（可彈性擴充）

> 設計原則：採「核心欄位（所有組織必填）」＋「延伸欄位（大型組織再啟用）」的雙層架構，先確保中小企業能快速上手，再讓跨國集團依需求擴展。

| 層級 | 欄位代碼         | 說明（核心欄位必填，延伸欄位視需求啟用）                      | 範例代碼                           |
| ---- | ---------------- | -------------------------------------------------------------- | ---------------------------------- |
| 核心 | `domain`         | 對應九大目錄或主要知識域（Foundation/Market/...）             | `market`、`audience`               |
| 核心 | `artifact`       | 具體文件類型（persona、battlecard、tone_of_voice 等）         | `persona`、`messaging_house`       |
| 核心 | `stage`          | 對應 A1~A8 營運階段或流程節點                                | `A2`、`A5`                         |
| 核心 | `language`       | ISO 語言代碼，必要時加地區後綴                               | `zh-TW`、`en-US`                   |
| 核心 | `version`        | 版本或日期標記，建議 `vYYYYMMDD` 或 `vX.Y` 格式               | `v20240415`、`v1.3`                |
| 核心 | `status`         | 文件狀態，用於 Agent 決定是否可引用                           | `draft`、`approved`、`archived`    |
| 延伸 | `brand`          | 品牌代碼或事業單位                                           | `mt-global`、`mt-lite`             |
| 延伸 | `product_line`   | 產品線或方案類別                                             | `crm`、`academy`                   |
| 延伸 | `sku`            | 具體產品/服務代碼，必要時使用 SKU/服務代碼                   | `crm-pro`、`event-kit`             |
| 延伸 | `region`         | 市場/地區代碼                                                | `global`、`apac`、`tw`             |
| 延伸 | `channel`        | 使用通路或媒介                                               | `email`、`web`、`paid-media`       |
| 延伸 | `persona`        | 目標角色或 Buying Center 代碼                                | `cmo`、`sales-manager`             |
| 延伸 | `compliance`     | 合規域（法規、平台、內控等）                                 | `gdpr`、`meta-ads`、`legal-int`    |
| 延伸 | `security_level` | 內部安全等級，用於權限控管                                   | `public`、`internal`、`restricted` |

#### 6.4.1 檔名與路徑樣板

```
/Brand/{brand?}/ProductLine/{product_line?}/{domain}/{artifact}/
  {brand?}-{product_line?}-{artifact}-{stage}-{region?}-{language}-{version}.md
```

- `?` 表示可選欄位；中小企業可省略 `Brand/ProductLine` 兩層，直接使用 `{domain}/{artifact}/` 結構。
- 檔名使用小寫英數與連字號，避免空白；必要時以底線 `_` 區隔變體。
- 版本更新時沿用同名檔案並更新 Front Matter 中的 `version`、`last_reviewed`，或另存新檔並透過版本控管目錄 `/Archive/` 保存舊稿。

#### 6.4.2 Front Matter 範本

```yaml
---
title: "APAC SaaS Persona - Growth Marketer"
domain: audience
artifact: persona
stage: A2
brand: mt-global        # 中小企業可省略
product_line: crm       # 中小企業可省略
region: apac
language: en-US
persona: growth_marketer
channel: web
version: v20240415
status: approved
owner: marketing-insights
last_reviewed: 2024-04-15
sources:
  - customer-interviews-q1-2024
compliance:
  - gdpr
confidence: high
---
```

- 標示 `brand`、`product_line` 等欄位後，AI Agent 可用 `brand:mt-global AND artifact:persona` 直接查詢；中小企業若無多品牌需求，可省略這些欄位。
- `sources`、`compliance` 建議對應代碼字典，例如 `gdpr`, `tw-fair-trade`, `meta-ads`，讓 Agent 在生成內容時自動套用合規規則。

#### 6.4.3 代碼字典與維護建議

- 建議建立 `/00_Catalog/` 目錄，專責管理命名代碼與檢查工具。基本結構可參考：

```
/00_Catalog/
  brand_codes.csv
  product_line_codes.csv
  region_codes.csv
  channel_codes.csv
  compliance_codes.csv
  lint/
    check_metadata.py
    rules.yaml
  README.md
```

- CSV 範例（可照需要擴充欄位）：

```
brand_codes.csv
brand_code,brand_name,notes
mt-global,MasterTech Global,Corporate brand
mt-lite,MasterTech Lite,SaaS lite brand

product_line_codes.csv
product_line_code,product_line_name,notes
crm,CRM Platform,Core SaaS line
academy,Academy Training,Education products

region_codes.csv
region_code,region_name
global,Global
apac,Asia Pacific
tw,Taiwan

channel_codes.csv
channel_code,channel_name
email,Email Marketing
web,Website
paid-media,Paid Media

compliance_codes.csv
compliance_code,description
gdpr,EU General Data Protection Regulation
tw-fair-trade,Taiwan Fair Trade Act
meta-ads,Meta Ads Policy
```

- 小型團隊初期可僅保留 `brand_code=default`、`region_code=home`，待業務擴張再新增。
- 需指定字典維護責任人與審查頻率（建議季度檢查），並讓 AI Agent 先讀取字典後再處理知識庫，確保新代碼即時生效。

#### 6.4.4 自動化驗證範例

- 可建立簡易 Python 檢查腳本（位於 `/00_Catalog/lint/check_metadata.py`），確認檔名與 Front Matter 是否符合規範：

```python
import re
import yaml
from pathlib import Path

FILENAME_PATTERN = re.compile(
    r"^(?:[a-z0-9\-]+-)?(?:[a-z0-9\-]+-)?[a-z0-9_]+-A[1-8](?:-[a-z0-9\-]+)?-[a-z]{2}(?:-[A-Z]{2})?-v[0-9]+(?:\.[0-9]+)?\.md$"
)

REQUIRED_FIELDS = ["domain", "artifact", "stage", "language", "version", "status"]

def validate_file(path: Path) -> list[str]:
    errors = []
    if not FILENAME_PATTERN.match(path.name):
        errors.append("filename format mismatch")
    front_matter = []
    with path.open(encoding="utf-8") as fh:
        if fh.readline().strip() != "---":
            return errors + ["missing front matter"]
        for line in fh:
            if line.strip() == "---":
                break
            front_matter.append(line)
    data = yaml.safe_load("".join(front_matter)) or {}
    for field in REQUIRED_FIELDS:
        if field not in data:
            errors.append(f"missing field: {field}")
    return errors

if __name__ == "__main__":
    base = Path("../..")  # 根據實際位置調整
    issues = []
    for file in base.rglob("*.md"):
        if "/Archive/" in str(file):
            continue
        errs = validate_file(file)
        if errs:
            issues.append((file, errs))
    if issues:
        for file, errs in issues:
            print(f"[FAIL] {file}")
            for err in errs:
                print(f"  - {err}")
        raise SystemExit(1)
    print("All files passed metadata checks.")
```

- `rules.yaml` 可用來設定可選欄位、允許的代碼或例外名單，檢查腳本讀取後做進一步驗證。
- 在本地或 CI 中執行 `python /00_Catalog/lint/check_metadata.py`，可防止不合規檔案進入知識庫。

#### 6.4.5 導入流程建議

1. 建立命名指南：整理上述欄位與代碼字典，發布於內部流程文件，並在入門訓練中示範中小型與大型使用情境。
2. 設定檔案建立檢查表：新增檔案前需確認命名、Front Matter、代碼是否正確，避免 Agent 索引到不完整資料。
3. 建立自動化驗證：若使用 Git/Lint，可以撰寫簡易腳本驗證檔名格式、Front Matter 欄位是否齊全。
4. 新增/變更代碼時，先更新 `/00_Catalog/` 字典檔案，再指派 Agent 或系統批次更新既有文件的 metadata。

---

## 7. 推進路線圖與成功要素

### 7.1 最小可行包（MVP）- 依 DIKW 四層架構

**智慧層（Wisdom）**：
1. 定義核心輸出類型：至少選擇 3-5 個最常用的戰略/戰術輸出（如策略簡報、Landing Page、Email 文案）

**知識層（Knowledge）**：
2. 建立核心知識框架：VPC、BMC、SWOT、PESTLE、Persona、Journey Map、Messaging House
3. 建立品牌與法務護欄：Tone of Voice/Glossary → 廣告規範/禁語清單

**資訊層（Information）**：
4. 建立資訊提取指南：定義至少 3-5 個核心資訊領域的提取規則（市場趨勢、競品情報、顧客洞察）

**資料層（Data）**：
5. 準備資料底座：KPI 樹、Tracking Plan、UTM 標準、命名與代碼字典（參考 6.4 節）
6. 建立資料來源清單：至少列出內部系統（CRM、財務系統）與外部來源（市場報告、競品資料庫）的取得方式

### 7.2 分階段實施（對應 12 個月藍圖）

- **階段一（1–3 月）**：資料與文件盤點、收集流程設計、核心框架文件完成、命名與標籤系統建立、技術平台選擇。
- **階段二（3–6 月）**：框架文件全量化、整合內外部資料源、資料更新機制、知識圖譜初版、AI 模型訓練。
- **階段三（6–9 月）**：開發 Agent 模組、串接系統、建立自動化工作流、完成內容生成測試、品質管控制度。
- **階段四（9–12 月）**：收集使用者回饋、優化模型與流程、擴增模組與場景、建立最佳實踐、持續學習機制。

### 7.3 關鍵成功因素

- 資料品質管理：準確性、完整性、即時性。
- 框架標準化：統一格式、命名、版本規則。
- 命名治理：維護 `/00_Catalog/` 代碼表並執行 metadata 檢查腳本（見 6.4.4）。
- 跨部門協同：行銷、銷售、產品、客服、法務共同維護知識庫。
- 技術整合：系統互通、權限控管、API 管線穩定。
- 持續更新：排定審查節奏與責任人。
- 人機協作：AI 輔助人類判斷，建立審核節點與回饋流程。
- 測試驗證：建立 KPI 與 A/B 測試，追蹤產出效益。
- 安全合規：資料隱私、法規遵循、版權管理。
- 變革管理：培訓與內部溝通、激勵機制、導入手冊。
- 投資回報：建立效益量表，定期檢討調整。

---

## 附錄 A：內容類別 ↔ 營運階段 ↔ 補充要點

> 目的：延伸第 3 章的 A1~A8 階段，僅列出額外需要注意的框架與資料補充，避免重複既有說明。

| 內容類別               | 對應營運階段        | 框架補充（相較第 3 章）                                      | 資料補充重點                                   | 補充提醒                                |
| ---------------------- | ------------------- | ------------------------------------------------------------ | ---------------------------------------------- | --------------------------------------- |
| 社群/短影音/廣告       | A1                  | Channel Playbook、Campaign Brief、平台規範對照               | 版位規格、素材授權狀態、過往投放成效           | 確認素材版權、在地化語氣、廣告審核條件  |
| PR/新聞稿/記者會       | A1／A5              | Corporate Narrative 深入版、Crisis FAQ、Stakeholder Map      | 發言人授權、審核流程、媒體與利害關係人列表     | 預先備好問答、危機預案、核對合規聲明    |
| 部落格/白皮書/研究     | A2                  | Editorial Calendar、Topic Cluster、Citation Matrix           | 引用來源可信度標記、圖表授權、外部專家審閱紀錄 | 標註引用來源、設計 CTA 與內部連結       |
| 產品頁/功能頁/比較頁   | A2 → A3             | Solution Fit Checklist、Proof Library 取用規則、FAQ 模板     | 最新功能版本、客戶評語分級、技術限制清單       | 搭配 Proof Points、FAQ、法務條款        |
| Webinar/課程/案例研究  | A2 → A3             | Event Playbook、Learning Design Canvas、Ask-Me-Anything 清單 | 講者合約、參與者屬性、互動紀錄                 | 規劃前後培育流程、蒐集 Q&A 與回饋       |
| Landing Page/Email/SMS | A3                  | Offer Architecture、Experiment Backlog、Frequency Plan       | 渠道壅塞度、訊息頻率限制、退訂/合規紀錄         | 預先設定追蹤參數與測試計畫              |
| 銷售提案/投標/RFP      | A3                  | Deal Qualification、Legal Checklist 深入版、SLA 模板         | 授權條款、服務邊界、成功案例 ROI 證據           | 確保法律審核、列出實施計畫與 SLA        |
| Onboarding/產品內文案  | A4                  | Role-Based Playbook、Adoption Journey、Support Escalation SOP| 權限矩陣、使用情境、客服轉接路徑               | 對應角色權限、設定觸發條件與回饋機制    |
| 客成/續約/擴張         | A4                  | Expansion Playbook、Health Score Dashboard、Success Plan 版控| 升級觸發條件、風險旗標、共創計畫紀錄           | 辨識風險客戶、提供下一步 CTA 與報告模板 |
| 包裝/零售物料          | A6                  | Visual Merchandising Guide、Channel Checklist                | 通路規範差異、陳列研究、地區促銷政策           | 蒐集通路簡報、進行在地化與測試          |
| ESG/IR/雇主品牌        | A5                  | ESG Topic Map、IR Disclosure Timeline、Employer Narrative Map | ESG 評等、永續目標進度、人才品牌指標           | 對齊國際準則、準備審計資料與問答        |

---

## 附錄 B：戰術輸出完整分類（150+ 項）

> `建議標籤` 欄位以 `key:value` 呈現，常見鍵值包含：  
> `stage`（對應 A1~A8）、`channel`、`format`、`persona`、`compliance`、`complexity`。  
> AI Agent 可直接以這些標籤作為查詢條件（例：`stage:A3 channel:email`）。

| 內容族群               | 優先對應階段 | 建議標籤                                                   | AI 取用提示（複雜度/合規）                            | 代表輸出項 |
| ---------------------- | ------------ | ---------------------------------------------------------- | ---------------------------------------------------- | -------- |
| 社群媒體內容類         | A1           | `stage:A1` `channel:social` `format:copy+visual` `persona:broad` `compliance:brand` | 低→中複雜度；需檢核品牌語氣、素材授權                | 社群貼文、限時動態、社群影片腳本、圖像設計文案、互動回覆、活動企劃、直播腳本、UGC 徵集、危機聲明、節慶檔期內容 |
| 廣告內容類             | A1｜A3       | `stage:A1` `stage:A3` `channel:paid-media` `format:copy+visual` `compliance:platform` | 中複雜度；平台審核、法規與素材版權需雙重確認        | 搜尋、展示、影音、購物、再行銷、App 安裝、Lead Gen、動態商品、原生、程序化廣告素材 |
| 內容行銷類             | A2           | `stage:A2` `channel:owned-content` `format:longform` `persona:researcher` `compliance:citation` | 中→高複雜度；確保引用來源、Proof Points 與 SEO 對齊  | 部落格、白皮書、電子書、案例研究、產業報告、操作指南、Listicle、訪談、資訊圖表、Podcast、Webinar、線上課程、新聞稿、媒體採訪稿、專欄 |
| 電子郵件行銷類         | A3｜A4       | `stage:A3` `stage:A4` `channel:email` `format:copy` `compliance:privacy` `complexity:medium` | 中複雜度；需維護名單授權、退訂與頻率控管            | 歡迎信、電子報、促銷、購物車挽回、產品推薦、生日/週年、喚醒、問卷邀請、活動邀請、交易確認、使用教學、回饋邀請、VIP 優惠 |
| 網站內容類             | A2｜A3       | `stage:A2` `stage:A3` `channel:web` `format:copy+ux` `compliance:legal` | 中複雜度；需同步 UX、SEO、法務條款                   | 首頁訊息、產品/服務頁、關於我們、使命願景、FAQ、使用條款、隱私權、客戶見證、團隊介紹、職缺招募、聯絡我們、404、Landing Page、比較表、定價頁 |
| 影音內容類             | A1｜A2       | `stage:A1` `stage:A2` `channel:video` `format:script` `persona:engager` `complexity:high` | 高複雜度；拍攝腳本需搭配視覺與配樂權利              | 品牌形象、產品介紹、教學、客戶見證、幕後花絮、直播銷售、動畫、微電影、開箱、比較評測、問答、訪談 |
| 銷售支援內容類         | A3           | `stage:A3` `channel:sales` `format:presentation` `persona:buyer` `compliance:legal` | 中→高複雜度；不得誤導承諾，需對齊 ROI/方案條款       | 產品目錄、Sales Deck、一頁紙、提案書、報價說明、合約範本、銷售腳本、異議處理、成交技巧、電話銷售、產品演示 |
| 公關傳播類             | A1｜A5       | `stage:A1` `stage:A5` `channel:pr` `format:longform` `persona:stakeholder` `compliance:legal` | 高複雜度；財務/法務審核與危機 SOP 必須同步           | 公司/產品新聞稿、危機聲明、CSR/永續/年度報告、媒體資料袋、發言稿、Q&A、媒體邀請、活動稿、講稿、致詞、危機預案 |
| 活動與展會類           | A2｜A3       | `stage:A2` `stage:A3` `channel:event` `format:multimedia` `complexity:high` | 高複雜度；跨部門協同、現場資源排程與資料收集        | 活動企劃案、議程、主持稿、展場文案、邀請函、行前包、贈品文案、會後回顧、活動成效報告、參展指南 |
| 品牌與識別類           | A5           | `stage:A5` `channel:brand` `format:guideline` `persona:internal` `compliance:brand` | 中複雜度；成為其它產出的 Source of Truth            | 品牌故事、品牌手冊、識別系統、語氣指南、訊息屋、企業文化手冊、品牌聲音庫、視覺模板、圖庫 |
| 產品與用戶教育類       | A4           | `stage:A4` `channel:product` `format:guide` `persona:user` `complexity:medium` | 中複雜度；需對應產品版本、使用者權限                | 使用指南、快速入門、FAQ、教學影片腳本、使用情境案例、功能更新公告、Release Notes、知識庫文章 |
| 客服與成功類           | A4           | `stage:A4` `channel:service` `format:script+playbook` `persona:customer` `compliance:sla` | 中→高複雜度；需準確反映 SLA 與升級流程              | 客服話術、流程 SOP、問題分類、升級流程、健康檢查報告、續約提案、客戶成長計畫、成功案例模板 |
| 法務與合規類           | A7           | `stage:A7` `channel:legal` `format:checklist` `compliance:regulation` `complexity:high` | 高複雜度；需維持最新法規與授權證明                  | 條款、授權書、審核清單、風險矩陣、危機腳本、聲明模板、資料保護告知 |
| 內部管理與訓練類       | A5           | `stage:A5` `channel:internal` `format:guideline+deck` `persona:employee` `complexity:medium` | 中複雜度；對齊組織政策與變革管理                    | 全員信、變更溝通、政策公告、訓練教材、內訓投影片、流程指南、績效報告、RACI、SOP 文件 |
| 零售與實體通路類       | A6           | `stage:A6` `channel:retail` `format:copy+visual` `persona:shopper` `compliance:trade` | 中複雜度；需符合實體通路規範與陳列標準              | 包裝文案、陳列物、價籤、店內廣播、銷售訓練冊、POS 素材、促銷物料 |
| 數據與分析報告類       | A4｜A5       | `stage:A4` `stage:A5` `channel:reporting` `format:analysis` `complexity:high` | 高複雜度；資料可信度與統計顯著性需標註              | 行銷成效報告、漏斗分析、A/B 測試報告、ROI 報告、預算使用、洞察簡報、Dashboard 解讀、預測模型結果 |
| 決策與策略文件類       | A5           | `stage:A5` `channel:leadership` `format:deck` `persona:executive` `complexity:high` | 高複雜度；需整合多資料源並記錄決策脈絡              | 年度/季度策略簡報、成長計畫、投資提案、OKR 對齊報告、跨部門協作計畫、風險評估 |
| 國際化與在地化類       | A8           | `stage:A8` `channel:l10n` `format:guideline` `persona:regional` `compliance:locale` | 中→高複雜度；語言品質、文化禁忌與法規需逐區確認      | 翻譯記憶庫、術語表、文化適配指南、在地化 SEO、語氣調整、敏感詞庫、區域化 CTA |

以上分類可搭配內容管理系統的標籤欄位（如 `format_type`、`channel`、`persona`、`funnel_stage`），並供 AI Agent 在規劃輸出或回傳候選素材時套用，確保檢索與調用一致。
