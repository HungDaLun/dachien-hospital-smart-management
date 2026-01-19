# Agent Templates vs Skills Library 功能重複分析報告

**生成時間：** 2026-01-XX  
**分析範圍：** `agent_templates` 與 `skills_library` 表格的使用情況

---

## 📊 執行摘要

經過完整程式碼檢查，發現 `agent_templates` 表格**目前仍在使用中**，但與 `skills_library` 存在**部分功能重疊**和**使用不一致**的問題。

---

## 🔍 兩個表格的設計目的

### `agent_templates` - Agent 建立模板
**用途：** 在建立 Agent 時提供預設的 System Prompt 模板

| 欄位 | 說明 |
|------|------|
| `system_prompt_template` | Handlebars 語法模板，用於建立 Agent 時的起始 System Prompt |
| `recommended_knowledge` | JSONB，建議的知識規則（categories, frameworks） |
| `input_schema` | JSONB，模板變數定義 |
| `mcp_config` | JSONB，MCP 配置（後續擴展） |
| `model_config` | JSONB，模型配置（後續擴展） |

**使用場景：**
- ✅ `TemplateSelector.tsx` - 建立 Agent 時選擇模板
- ✅ `AgentForm.tsx` - 將模板的 `system_prompt_template` 複製到 Agent 的 `system_prompt`

### `skills_library` - Skills 技能包庫
**用途：** 在 Agent 運行時動態注入的專業技能模組

| 欄位 | 說明 |
|------|------|
| `skill_content` | SKILL.md 格式的完整技能內容，運行時注入到 System Prompt |
| `required_tools` | TEXT[]，此技能需要的工具列表 |
| `enabled_skills` | Agent 的 `enabled_skills` 欄位引用此表格的 ID |

**使用場景：**
- ✅ `SkillSelector.tsx` - 在 Agent 編輯器中選擇技能
- ✅ `lib/skills/loader.ts` - 運行時載入技能並注入到 System Prompt
- ✅ Agent 的 `enabled_skills` 欄位儲存技能 ID 列表

---

## ⚠️ 發現的問題

### 1. **功能重疊但用途不同**

| 功能 | `agent_templates` | `skills_library` |
|------|------------------|-----------------|
| 提供 System Prompt | ✅ 建立時複製（一次性） | ✅ 運行時注入（動態） |
| 支援 MCP 配置 | ✅ 有 `mcp_config` | ❌ 無 |
| 支援工具需求 | ❌ 無 | ✅ 有 `required_tools` |
| 可多選掛載 | ❌ 單選（建立時） | ✅ 多選（運行時） |

### 2. **程式碼使用不一致**

#### 問題 A：`SkillsMarketplace.tsx` 使用錯誤的 API
```typescript
// ❌ 錯誤：應該使用 /api/skills
const res = await fetch(`/api/agents/templates?${params.toString()}`);

// ✅ 正確：應該改為
const res = await fetch(`/api/skills?${params.toString()}`);
```

**位置：** `components/skills/SkillsMarketplace.tsx:39`

#### 問題 B：`agent_templates` 被用來匯入 Skills
```typescript
// app/api/agents/templates/route.ts:133
// POST 端點將 Skills 資料寫入 agent_templates
const { data, error } = await supabase
    .from('agent_templates')
    .insert([dbPayload])
```

**問題：** Skills 應該寫入 `skills_library`，而不是 `agent_templates`

#### 問題 C：快取函式查詢不存在的欄位
```typescript
// lib/cache/api-cache.ts:130
.select('id, name, description, icon, category, default_system_prompt')
// ❌ 問題：agent_templates 沒有 icon 和 default_system_prompt 欄位
```

**實際欄位：** `system_prompt_template`（不是 `default_system_prompt`）

### 3. **未使用的程式碼**

- `lib/cache/api-cache.ts` 中的 `getCachedAgentTemplates` 函式：
  - ❌ 查詢了不存在的欄位
  - ❌ 未被任何地方引用
  - ⚠️ 建議：刪除或修正

---

## 📋 實際使用情況統計

### `agent_templates` 的使用位置

| 檔案 | 用途 | 狀態 |
|------|------|------|
| `app/api/agents/templates/route.ts` | GET/POST API 端點 | ✅ 使用中 |
| `components/agents/TemplateSelector.tsx` | 建立 Agent 時選擇模板 | ✅ 使用中 |
| `components/agents/AgentForm.tsx` | 套用模板到 Agent | ✅ 使用中 |
| `components/skills/SkillsMarketplace.tsx` | 錯誤地使用此 API | ⚠️ 應修正 |
| `components/skills/SkillImporter.tsx` | 匯入 Skills（錯誤地寫入此表格） | ⚠️ 應修正 |
| `lib/cache/api-cache.ts` | 快取函式（有錯誤且未使用） | ❌ 應刪除 |

### `skills_library` 的使用位置

| 檔案 | 用途 | 狀態 |
|------|------|------|
| `app/api/skills/route.ts` | GET API 端點 | ✅ 使用中 |
| `components/agents/SkillSelector.tsx` | 選擇技能 | ✅ 使用中 |
| `lib/skills/loader.ts` | 運行時載入技能 | ✅ 使用中 |
| `app/api/agents/[id]/skills/route.ts` | 為 Agent 安裝技能 | ✅ 使用中 |
| `app/api/agents/architect/route.ts` | AI 架構師查詢可用技能 | ✅ 使用中 |

---

## 🎯 建議方案

### 方案 1：保留兩個表格，修正使用不一致（推薦）

**優點：**
- 最小變更，風險低
- 兩個表格的設計目的確實不同
- 不需要遷移資料

**需要修正：**
1. ✅ 修正 `SkillsMarketplace.tsx` 使用 `/api/skills`
2. ✅ 修正 `SkillImporter.tsx` 寫入 `skills_library` 而非 `agent_templates`
3. ✅ 刪除或修正 `lib/cache/api-cache.ts` 中的錯誤函式
4. ✅ 更新 `app/api/agents/templates/route.ts` 的 POST 端點，明確區分 Templates 和 Skills

### 方案 2：合併到 `skills_library`，移除 `agent_templates`

**優點：**
- 統一資料模型
- 減少維護成本

**缺點：**
- 需要遷移現有資料
- 需要修改多處程式碼
- 可能影響現有功能

**遷移步驟：**
1. 將 `agent_templates` 的資料遷移到 `skills_library`
2. 修改 `TemplateSelector` 使用 `skills_library`
3. 更新 Agent 建立流程
4. 刪除 `agent_templates` 表格和相關程式碼

---

## 🔧 立即需要修正的問題

### 優先級 1：修正 API 使用錯誤

```typescript
// components/skills/SkillsMarketplace.tsx:39
// 修正前
const res = await fetch(`/api/agents/templates?${params.toString()}`);

// 修正後
const res = await fetch(`/api/skills?${params.toString()}`);
```

### 優先級 2：修正 Skills 匯入目標

```typescript
// components/skills/SkillImporter.tsx
// 應該寫入 skills_library，而不是 agent_templates
// 需要檢查 POST /api/agents/templates 的邏輯
```

### 優先級 3：清理未使用的快取函式

```typescript
// lib/cache/api-cache.ts:125-146
// 刪除 getCachedAgentTemplates 函式（未被使用且有錯誤）
```

---

## 📝 結論

1. **`agent_templates` 表格目前仍在使用**，主要用於 Agent 建立時的模板選擇
2. **兩個表格的設計目的不同**：
   - `agent_templates` = 建立時的起始模板（一次性）
   - `skills_library` = 運行時的技能模組（動態注入）
3. **存在使用不一致的問題**，需要修正
4. **建議保留兩個表格**，但需要：
   - 明確區分使用場景
   - 修正錯誤的 API 呼叫
   - 清理未使用的程式碼

---

## 🔗 相關檔案

- `app/api/agents/templates/route.ts` - Templates API
- `app/api/skills/route.ts` - Skills API
- `components/agents/TemplateSelector.tsx` - 模板選擇器
- `components/agents/SkillSelector.tsx` - 技能選擇器
- `lib/skills/loader.ts` - 技能載入器
- `supabase/migrations/20260113000000_create_agent_templates.sql` - Templates 表格定義
- `supabase/migrations/20260129000000_add_skills_and_tools_system.sql` - Skills 表格定義
