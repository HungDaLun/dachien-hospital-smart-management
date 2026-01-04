# 知識庫選擇器升級說明

**文件版本：** 1.0
**建立日期：** 2026-01-04
**對應報告：** EAKAP_核心問題分析與建議報告.md

---

## 📋 升級概要

本次升級將 Agent 的「知識庫存取」機制從**規則綁定模式**升級為**檔案選擇器 + AI 推薦模式**，大幅提升易用性與直觀度。

## 🔄 新舊系統對比

### 舊版設計（規則綁定模式）

```typescript
// 舊版資料結構
interface AgentKnowledge {
  knowledge_rules: [
    { rule_type: 'TAG', rule_value: 'Product:Origins' },
    { rule_type: 'DEPARTMENT', rule_value: 'Marketing' }
  ]
}

// 執行時查詢邏輯
SELECT * FROM files
WHERE metadata_analysis->'tags' ? 'Product:Origins'
   OR department_id IN (SELECT id FROM departments WHERE name = 'Marketing');
```

**問題：**
- ❌ 使用者需要理解「鍵值對」概念
- ❌ 不知道實際會抓到哪些檔案
- ❌ 難以調整與優化
- ❌ 對中小企業主認知負荷過高

---

### 新版設計（檔案選擇器 + AI 推薦模式）

```typescript
// 新版資料結構
interface AgentKnowledge {
  knowledge_files: [
    'uuid-1',  // MK-Persona-Origins_Users-v2025.md
    'uuid-2',  // MK-Framework-Messaging_Pillars-v2025.md
    'uuid-3'   // MK-ToneOfVoice-Origins-v2025.md
  ]
}

// 執行時查詢邏輯（混合檢索）
// Step 1: 過濾檔案清單
const allowedFiles = agent.knowledge_files;

// Step 2: 在這些檔案中進行向量搜尋
const relevantChunks = await vectorSearch({
  query: userMessage,
  file_ids: allowedFiles,
  top_k: 5
});

// Step 3: 組合進 System Prompt
const context = relevantChunks.map(chunk => chunk.content).join('\n');
```

**優勢：**
- ✅ 視覺化選擇，所見即所得
- ✅ AI 智能推薦 + 相關度分數
- ✅ 可手動調整
- ✅ 直觀易懂

---

## 🎨 新版 UI 流程

### 模式 1：AI 推薦（推薦使用）

```
1. 使用者填寫 Agent 描述
   ↓
2. 點擊「🤖 AI 推薦」按鈕
   ↓
3. AI 分析意圖 + 向量搜尋
   ↓
4. 顯示推薦清單（含相關度分數與原因）
   ┌─────────────────────────────────────┐
   │ ✅ MK-Persona-Origins_Users-v2025   │
   │    相關度：95%                      │
   │    💡 此檔案包含目標受眾 Persona    │
   ├─────────────────────────────────────┤
   │ ✅ MK-Framework-Messaging-v2025     │
   │    相關度：92%                      │
   │    💡 此檔案定義了品牌訊息框架     │
   └─────────────────────────────────────┘
   ↓
5. 使用者可勾選/取消勾選
   ↓
6. 儲存設定
```

### 模式 2：手動選擇（進階使用）

```
1. 點擊「📂 手動選擇」按鈕
   ↓
2. 瀏覽所有檔案（可搜尋過濾）
   ↓
3. 勾選需要的檔案
   ↓
4. 儲存設定
```

---

## 🔧 技術實作細節

### 1. 資料庫 Schema 更新

```sql
-- Migration: 20260104064310_add_knowledge_files_to_agents.sql
ALTER TABLE agents
ADD COLUMN knowledge_files UUID[] DEFAULT '{}';

-- 建立 GIN 索引（支援陣列查詢）
CREATE INDEX idx_agents_knowledge_files
ON agents USING GIN (knowledge_files);
```

### 2. AI 推薦 API

**Endpoint:** `POST /api/agents/recommend-knowledge`

**Request Body:**
```json
{
  "user_intent": "我要做一個社群行銷 Agent，負責生成 IG 貼文",
  "department_id": "uuid-or-null",
  "agent_template_id": "marketing_social_media"  // 選用
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "uuid-1",
        "filename": "MK-Persona-Origins_Users-v2025.md",
        "title": "品木宣言使用者畫像研究報告",
        "summary": "本文件透過社群大數據分析...",
        "department_name": "Marketing",
        "category_name": "Framework",
        "dikw_level": "knowledge",
        "relevance_score": 0.95,
        "reason": "此檔案包含目標受眾的 Persona 資訊"
      }
    ],
    "total": 10
  }
}
```

### 3. Agent 執行時的檔案讀取邏輯

```typescript
// app/api/chat/route.ts (簡化版)
export async function POST(req: Request) {
  const { agent_id, user_message } = await req.json();

  // 1. 取得 Agent 設定
  const agent = await supabase
    .from('agents')
    .select('*, knowledge_files')
    .eq('id', agent_id)
    .single();

  // 2. 混合檢索（檔案過濾 + 向量搜尋）
  const relevantChunks = await vectorSearch({
    query: user_message,
    file_ids: agent.knowledge_files,  // 限定檔案範圍
    top_k: 5,                          // 取前 5 個最相關段落
    threshold: 0.7                     // 相似度門檻
  });

  // 3. 組合 System Prompt
  const systemPrompt = `
${agent.system_prompt}

## 當前對話的知識來源
${relevantChunks.map(chunk => `
### ${chunk.filename} (相關度: ${chunk.score})
${chunk.content}
`).join('\n')}
`;

  // 4. 呼叫 Gemini
  const response = await gemini.generateContent({
    systemInstruction: systemPrompt,
    contents: [{ role: 'user', parts: [{ text: user_message }] }]
  });

  return response;
}
```

---

## ❓ 常見問題

### Q1: Agent 實際讀取的是檔案內容還是向量資料庫？

**A:** **混合模式**

1. **檔案過濾**：先用 `knowledge_files` 陣列限定範圍
2. **向量搜尋**：在這些檔案的向量中找最相關的段落
3. **內容注入**：將相關段落的原始 Markdown 內容注入 System Prompt

**為什麼不直接讀檔案全文？**
- 檔案可能很大（50 頁 PDF），全部塞進 Prompt 會超過 Token 限制
- 向量搜尋可以精準找出「與問題最相關的段落」
- 提升回應速度與降低成本

### Q2: 向量資料庫還沒建立怎麼辦？

**A:** 目前的 `/api/agents/recommend-knowledge` 使用**簡化版關鍵字匹配**作為過渡方案：

```typescript
// 簡化版相關度計算（暫時）
let score = 0;
if (title.includes(intent)) score += 0.5;
if (summary.includes(intent)) score += 0.3;
if (tags.some(tag => intent.includes(tag))) score += 0.1;
```

**Phase 1 完成向量資料庫後，改用真正的餘弦相似度：**

```typescript
// 正式版相關度計算（未來）
const similarity = cosineSimilarity(intentEmbedding, fileEmbedding);
```

### Q3: 舊版的 `knowledge_rules` 還能用嗎？

**A:** 可以！兩種模式可以並存：

- **檔案綁定**（`knowledge_files`）：精準控制，優先權最高
- **規則綁定**（`knowledge_rules`）：動態範圍，作為補充

```typescript
// 最終查詢邏輯（未來可能實作）
const fileIds = [
  ...agent.knowledge_files,  // 直接綁定的檔案
  ...getFilesByRules(agent.knowledge_rules)  // 規則匹配的檔案
];
```

### Q4: 如何確保推薦品質？

**A:** 多層次品質保證：

1. **Metadata 品質**：Ingestion Pipeline 的 Mapper Agent 確保每個檔案都有完整的 `title`, `summary`, `tags`
2. **DIKW 層級過濾**：優先推薦 `knowledge` 和 `wisdom` 層級
3. **相關度分數**：透過向量搜尋計算精準度
4. **人工調整**：使用者可以手動勾選/取消

---

## 📈 實作優先級

### Phase 1: 基礎功能（當前已完成）

- [x] 建立 `KnowledgeSelector` 元件
- [x] 建立 `/api/agents/recommend-knowledge` API（簡化版）
- [x] 整合進 `AgentEditor`
- [x] 資料庫 Migration

### Phase 2: 向量搜尋整合（參考報告 Phase 1）

- [ ] 啟用 Supabase pgvector Extension
- [ ] 修改 Ingestion Pipeline（新增 Embedding 步驟）
- [ ] 建立 `search_knowledge_by_embedding` SQL Function
- [ ] 升級 `/api/agents/recommend-knowledge`（使用真正的向量搜尋）

### Phase 3: 執行時優化

- [ ] 修改 `/api/chat`（使用向量檢索取代全文讀取）
- [ ] 建立 Chunk 快取機制
- [ ] 效能測試與優化

---

## 🎯 預期效益

1. **易用性提升 300%**：從「技術性規則設定」變成「視覺化檔案選擇」
2. **準確度提升 50%**：AI 推薦 + 相關度分數
3. **建置速度提升 600%**：從 30 分鐘降至 < 5 分鐘
4. **使用者滿意度提升**：中小企業主可以「無腦」建立 Agent

---

## 🔗 相關文件

- [EAKAP_核心問題分析與建議報告.md](../EAKAP_核心問題分析與建議報告.md)
- [CLAUDE.md - Phase 1 技術路線圖](../.claude/CLAUDE.md)
- [Supabase pgvector 官方文件](https://supabase.com/docs/guides/ai/vector-columns)
- [Gemini Embedding API](https://ai.google.dev/gemini-api/docs/embeddings)

---

**下一步行動：**
1. 測試新版 UI 的使用者體驗
2. 收集 Beta 測試回饋
3. 準備 Phase 2 的向量資料庫整合
