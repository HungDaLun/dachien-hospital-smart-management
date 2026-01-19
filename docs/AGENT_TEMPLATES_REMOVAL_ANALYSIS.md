# Agent Templates 移除可行性分析

**生成時間：** 2026-01-XX  
**分析目的：** 評估是否可以移除 `agent_templates` 表格及相關功能

---

## 📊 執行摘要

經過完整程式碼檢查，**`agent_templates` 表格確實可以移除**，因為：

1. ✅ 主要 Agent 建立流程（`AgentEditor`）不使用它
2. ✅ 有更好的替代方案（AI 架構師、直接輸入、Skills）
3. ✅ 相關元件（`AgentForm`）似乎已經被取代

---

## 🔍 使用情況分析

### 實際使用位置

| 元件/檔案 | 用途 | 狀態 |
|-----------|------|------|
| `AgentForm.tsx` | 使用 `TemplateSelector` | ⚠️ **未被實際使用** |
| `TemplateSelector.tsx` | 顯示模板選擇介面 | ⚠️ **僅在 AgentForm 中使用** |
| `app/api/agents/templates/route.ts` | Templates API | ⚠️ **僅被 AgentForm 使用** |

### 實際的 Agent 建立流程

```
app/dashboard/agents/new/page.tsx
  └─> NewAgentFlow
      └─> AgentEditor  ← 實際使用的元件
```

**關鍵發現：**
- ✅ `AgentEditor` **不使用** `TemplateSelector` 或 `agent_templates`
- ✅ `AgentForm` 只在 `index.ts` 中匯出，但**沒有找到實際使用的地方**
- ✅ 新建 Agent 的流程完全使用 `AgentEditor`

---

## 🎯 替代方案

### 目前可用的 Agent 建立方式

1. **AI 架構師（ArchitectChat）**
   - ✅ 使用 AI 自動生成 System Prompt
   - ✅ 根據使用者需求自動推薦配置
   - ✅ 更智能、更靈活

2. **直接輸入 System Prompt**
   - ✅ 使用者可以直接在 `AgentEditor` 中輸入
   - ✅ 完全自由控制

3. **選擇 Skills**
   - ✅ 從 `skills_library` 選擇專業技能
   - ✅ 動態注入到 System Prompt
   - ✅ 更模組化、可重用

### TemplateSelector 的功能對比

| 功能 | TemplateSelector | 替代方案 |
|------|-----------------|----------|
| 提供預設 System Prompt | ✅ | ✅ AI 架構師 / 直接輸入 |
| 建議知識規則 | ✅ | ✅ AI 架構師自動推薦 |
| 快速開始 | ✅ | ✅ AI 架構師更快 |
| 可跳過 | ✅ | ✅ 直接輸入即可 |

**結論：** 所有功能都有更好的替代方案

---

## 📋 移除影響評估

### 需要移除的項目

1. **資料庫**
   - `agent_templates` 表格
   - 相關 Migration 檔案（可保留作為歷史記錄）

2. **API 端點**
   - `app/api/agents/templates/route.ts`

3. **前端元件**
   - `components/agents/TemplateSelector.tsx`
   - `components/agents/TemplateCard.tsx`
   - `components/agents/AgentForm.tsx`（如果確認未被使用）

4. **快取函式**
   - `lib/cache/api-cache.ts` 中的相關註解（已清理）

### 移除後的影響

| 影響項目 | 影響程度 | 說明 |
|----------|----------|------|
| 使用者體驗 | ✅ **無影響** | 主要流程使用 `AgentEditor` |
| 功能完整性 | ✅ **無影響** | 有更好的替代方案 |
| 程式碼複雜度 | ✅ **降低** | 減少維護成本 |
| 資料遷移 | ⚠️ **需確認** | 檢查是否有現有資料需要保留 |

---

## ✅ 建議行動方案

### 方案 1：完全移除（推薦）

**步驟：**
1. 確認 `AgentForm` 沒有被使用（搜尋整個專案）
2. 備份現有的 `agent_templates` 資料（如果有）
3. 刪除相關元件和 API
4. 建立 Migration 移除表格
5. 更新文件

**優點：**
- 簡化程式碼
- 減少維護成本
- 避免混淆

### 方案 2：保留但標記為廢棄

**步驟：**
1. 在元件和 API 中添加 `@deprecated` 標記
2. 在文件中說明已廢棄
3. 計劃在下一版本移除

**優點：**
- 給使用者緩衝時間
- 可以收集回饋

---

## 🔧 移除檢查清單

- [ ] 確認 `AgentForm` 沒有被使用
- [ ] 檢查是否有現有的 `agent_templates` 資料需要遷移
- [ ] 備份資料庫（如果有資料）
- [ ] 刪除 `TemplateSelector.tsx`
- [ ] 刪除 `TemplateCard.tsx`
- [ ] 刪除 `AgentForm.tsx`（如果確認未使用）
- [ ] 刪除 `app/api/agents/templates/route.ts`
- [ ] 從 `components/agents/index.ts` 移除匯出
- [ ] 建立 Migration 移除 `agent_templates` 表格
- [ ] 更新相關文件
- [ ] 測試 Agent 建立流程

---

## 📝 結論

**`agent_templates` 表格確實是可有可無的**，建議移除，因為：

1. ✅ 主要流程不使用它
2. ✅ 有更好的替代方案（AI 架構師、Skills）
3. ✅ 可以簡化程式碼和維護成本
4. ✅ 不會影響使用者體驗

**建議：** 直接移除，因為功能已經被更好的方案取代。
