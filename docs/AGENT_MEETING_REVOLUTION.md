# AI 戰略會議系統 v2.0：深度洞察與決策引擎 (Agent Meeting Revolution)

**版本**：v2.1-Draft
**建立日期**：2026-01-16
**功能需求補充**：使用者於 2026/1/16 指定主席 UI 呈現方式。
**核心理念**：從單純的「角色扮演」轉型為導向結果的「戰略顧問團隊」。

---

## 1. 核心變革：三大機制創新

### 1.1 引入「AI 主席 (The Chairperson)」
不再讓 Agent 自由大亂鬥，也不只依靠人類主持人。我們引入一個權限最高的 **AI 主席 Agent**，它全權負責：
- **顯性介入 (Explicit Intervention)**：主席的每一句指導、提問或總結，都會**直接講出來**，以訊息形式出現在會議記錄中，讓使用者清楚知道「現在主席正在控場」。
- **流程控制**：決定何時從「討論」切換到「收斂」。
- **品質把關**：當 Agent 發言空泛時，直接駁回並要求「請提供數據」或「具體化你的建議」。
- **衝突引導**：當觀點過於一致（同溫層）時，主動扮演「魔鬼代言人」提出反方觀點。
- **SMART 檢核**：在會議收尾前，逐一檢查結論是否符合 SMART 原則，不符合則退回重議。

### 1.2 全新會議模式 (Meeting Modes)
廢除單純的「時間倒數制」，改採三種針對性模式：

| 模式名稱 | 機制核心 | 適用場景 | 結束條件 |
| :--- | :--- | :--- | :--- |
| **A. 快速同步 (Quick Sync)** | **改良時間制** | 日常資訊同步、簡單議題 | 時間到 + 強制執行 1 輪「收斂指令」 (Soft Timeout)。 |
| **B. 深度研討 (Deep Dive)** | **回合制 (Turns)** | 專案檢討、方案評估 | 每位 Agent 完成 N 輪發言，且經過主席總結。 |
| **C. 戰略決策 (Results Driven)** | **目標導向 (Goal Loops)** | 年度計畫、危機處理、預算分配 | **(無限回合)** 直到產出符合 SMART 標準的行動方案，且主席判定「信心分數」達標才結束。 |

### 1.3 思考階段流程 (The Thinking Phasing)
模仿高效率人類會議，強制 AI 經歷以下階段：
1.  **Phase 1 - 發散 (Diverge)**：各自表述，禁止批評，鼓勵引用數據。
2.  **Phase 2 - 激盪 (Debate)**：互相詰問。主席會挑出矛盾點：「財務部說沒錢，但業務部說要擴張，請雙方提出解決方案。」
3.  **Phase 3 - 收斂 (Converge)**：主席要求「停止爭論」，開始歸納共識。
4.  **Phase 4 - 檢核 (Audit)**：針對草擬的結論進行 SMART 檢測。如果不合格，**退回 Phase 3**。

---

## 2. 功能詳細設計

### 2.1 主席介入機制 (Chairperson System Prompt)

在每一輪對話後，後台會默默運行一次「主席思考」（User 看不到），判斷下一步：

```typescript
// 偽代碼邏輯
interface ChairpersonDecision {
  action: 'continue' | 'intervene' | 'wrap_up';
  instruction?: string; // 如果介入，給 Agent 的指令
}

// 範例：主席發現研發部講話太空泛
// Decision:
// action: 'intervene'
// instruction: "研發部 Agent，你提到要『提升效能』，請具體說明技術指標是提升多少 %？預計需要多少算力成本？"
```

### 2.2 無限回合與 SMART 閉環 (The SMART Loop)
這是讓企業主驚艷的關鍵。在「戰略決策模式」下：

1.  會議進入尾聲，產生初步結論。
2.  **AI 評審團 (SMART Validator)** 啟動掃描：
    *   *S (具體)*: ❌ 失敗 (只說了「提升業績」)
    *   *M (量化)*: ❌ 失敗 (沒有數字)
    *   *T (時限)*: ✅ 通過
3.  **系統自動延長會議**：
    *   主席發言：「目前的結論在『具體性』與『量化指標』上不足。請業務部重新補充 Q3 的具體成長率目標，請財務部確認預算是否支持。」
4.  Agent 被迫重新思考並回答。
5.  直到 **SMART 分數 > 85** 或 **人類手動強制結束**。

### 2.3 UI 體驗升級
讓使用者「看見」AI 在思考，增加專業感與信任感：

*   **聊天室佈局 (Chat Layout - IM Style)**：
    *   **左側 (Left)**：所有參與的 Agent（部門代表、顧問）。這是「別人」在發言。
    *   **右側 (Right)**：**AI 主席** 與 **使用者 (User)**。這是「我方/控場方」在發言。
    *   **視覺暗示**：這樣的佈局讓使用者在心理上感覺「主席」是代表自己（或系統意志）在管理這些 Agent，而非只是另一個參與者。

*   **階段指示器**：UI 上方顯示當前階段：`📊 資料收集` -> `⚔️ 觀點激盪` -> `🎯 方案收斂` -> `✅ 品質檢核`。
*   **即時洞察通知**：當主席強力介入時，顯示 Toast：「💡 主席正在要求財務部提供具體數據...」。
*   **動態時長**：如果選「戰略決策模式」，時間顯示為「以討論出結果為主」，並顯示「已進行回合：12」。

---

## 3. 技術實作架構 (Architecture)

### 3.1 資料庫變更 (Schema Updates)

```sql
-- 新增會議階段與模式
ALTER TABLE meetings 
ADD COLUMN mode text DEFAULT 'quick_sync', -- 'quick_sync', 'deep_dive', 'result_driven'
ADD COLUMN current_phase text DEFAULT 'diverge', -- 'diverge', 'debate', 'converge', 'audit'
ADD COLUMN smart_score integer DEFAULT 0, -- 當前結論的 SMART 品質分數
ADD COLUMN turn_count integer DEFAULT 0,  -- 當前總回合數
ADD COLUMN max_turns integer;             -- 回合制上限 (無限模式則為 null)
```

### 3.2 狀態機邏輯 (State Machine)

在 `MeetingService.processNextTurn` 中引入狀態機：

1.  **Check Phase**: 檢查目前會議階段。
2.  **Chairperson Evaluate**: 呼叫 LLM (Lightweight model) 評估上一則發言品質。
    *   品質差 -> 插入 `System Message` (主席指導)。
    *   品質好 -> 繼續 `Scheduler` 指派下一位。
3.  **Phase Transition**:
    *   如果回合數 > X 或 衝突點已解決 -> 轉入 `Converge`。
    *   如果處於 `Converge` 且 結論已出 -> 轉入 `Audit`。
    *   如果 `Audit` 失敗 -> 退回 `Converge`。

---

## 4. 執行計畫 (Implementation Steps)

### 第一階段：基礎建設 (Foundation) - 本次優先
1.  **重構 Scheduler**：加入「主持人 (Chairperson)」作為特殊的參與者，擁有最高優先級。
2.  **實作「回合制」**：在 UI 增加「會議模式」選擇（時間制 / 回合制）。
3.  **軟性收斂 (Soft Wrap-up)**：修改時間制邏輯，時間到時不 Kill，而是強制主席發言總結。

### 第二階段：深度邏輯 (Intelligence)
1.  **主席邏輯實作**：設計主席的 Prompt，讓它能「聽懂」並「指導」討論。
2.  **階段狀態機**：實作發散/收斂的狀態切換。

### 第三階段：極致體驗 (Perfection)
1.  **SMART 閉環迴圈**：實作「結論不合格就重來」的邏輯。
2.  **即時 UI 回饋**：讓使用者看到 AI 的思考階段。

---

## 5. 預期成效 (Expected Outcome)

當企業主使用這個系統時，他會看到的不再是「幾個機器人講幾句話然後突然結束」，而是：

> "業務部提出了一個激進的方案，但立刻被**主席**攔下來要求提供 ROI 預測。財務部隨即補上了風險評估。最後會議自動延長了 2 分鐘，因為 AI 認為原本的執行時間太模糊，直到雙方確認了『Q3 月底前完成』這個細節，會議才顯示『完美達成』並結束。"

這樣的體驗，才能真正證明 **Agent 的價值**。
