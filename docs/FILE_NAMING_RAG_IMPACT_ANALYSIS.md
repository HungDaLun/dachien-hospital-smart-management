# 檔案命名對 RAG 準確度影響分析報告

**建立日期：** 2026-01-01  
**版本：** 1.0  
**作者：** EAKAP 開發團隊

---

## 📋 執行摘要

本報告分析檔案命名在 EAKAP 系統中對 RAG（Retrieval-Augmented Generation）準確度的影響，並探討中英文檔名的差異。結論是：**檔案命名對 RAG 檢索準確度的直接影響有限，但對 AI 理解和使用者體驗有重要影響**。

---

## 🔍 目前系統實作分析

### 1. 檔案命名流程

根據 `app/api/files/route.ts` 和 `lib/gemini/client.ts` 的實作：

```typescript
// 1. 上傳時保留原始檔名
const { data: newFile } = await supabase.from('files').insert({
    filename: file.name,  // 原始檔名
    // ...
});

// 2. 上傳至 Gemini 時使用檔名作為 displayName
const geminiFile = await uploadFileToGemini(
    buffer,
    file.mime_type,
    file.filename  // 作為 displayName 傳給 Gemini
);
```

**關鍵發現：**
- 檔案名稱儲存在資料庫的 `filename` 欄位
- 上傳至 Gemini 時，檔名作為 `displayName` 參數傳遞
- Gemini API 的 `displayName` 是給 AI 模型看的檔案識別名稱

### 2. RAG 檢索流程

根據 `app/api/chat/route.ts` 的實作：

```typescript
// 1. 透過標籤（tags）或類別（categories）過濾檔案
const { data: files } = await supabase
    .from('files')
    .select('id, filename, gemini_file_uri, mime_type')
    .eq('gemini_state', 'SYNCED')
    .in('id', matchedFileIds);

// 2. 將檔案 URI 傳給 Gemini API
const fileUris = files.map(f => ({
    uri: f.gemini_file_uri!,
    mimeType: f.mime_type
}));

// 3. 在 System Prompt 中加入檔案名稱映射提示
let mappingHint = '';
if (fileUris.length > 0) {
    mappingHint = "系統已為您載入以下知識庫檔案內容：\n" +
        retrievedFiles.map((f, i) => `- 檔案 ${i + 1}: [${f.filename}]`).join('\n') +
        "\n請務必根據提示詞中的檔案名稱引用對應內容。\n\n";
}
```

**關鍵發現：**
- RAG 檢索主要依據：**標籤（tags）和類別（categories）**，而非檔名
- 檔案名稱主要用於：
  1. **System Prompt 中的映射提示**（mappingHint）
  2. **引用來源顯示**（citations）
  3. **Gemini API 的 displayName**

---

## 📊 檔案命名對 RAG 的影響分析

### ✅ 有影響的層面

#### 1. **AI 理解與對應**（中等影響）

**影響機制：**
- Gemini API 的 `displayName` 會讓 AI 知道檔案的「名稱」
- System Prompt 中的 `mappingHint` 會列出檔案名稱，幫助 AI 對應檔案內容
- 當 AI 需要引用特定檔案時，檔名是重要的識別資訊

**實證：**
```typescript
// app/api/chat/route.ts:207-209
mappingHint = "系統已為您載入以下知識庫檔案內容：\n" +
    retrievedFiles.map((f, i) => `- 檔案 ${i + 1}: [${f.filename}]`).join('\n') +
    "\n請務必根據提示詞中的檔案名稱引用對應內容。\n\n";
```

**結論：** 描述性的檔名有助於 AI 理解檔案主題，但**不是檢索的主要依據**。

#### 2. **使用者體驗**（高影響）

**影響機制：**
- 引用來源（citations）會顯示檔案名稱
- 清晰的檔名有助於使用者理解回答的來源
- 混亂的檔名會降低使用者信任度

**結論：** 檔名對使用者體驗有**直接且重要的影響**。

### ❌ 影響有限的層面

#### 1. **RAG 檢索準確度**（低影響）

**原因：**
- RAG 檢索主要透過**標籤（tags）**和**類別（categories）**過濾檔案
- 檔案內容的**向量嵌入（embeddings）**才是語義搜尋的依據
- 檔名**不會**直接參與向量相似度計算

**證據：**
```typescript
// app/api/chat/route.ts:78-87
// 檢索邏輯：透過標籤過濾，而非檔名
const { data: files } = await supabase
    .from('files')
    .select('id, gemini_file_uri, mime_type')
    .eq('gemini_state', 'SYNCED')
    .in('id', (
        await supabase
            .from('file_tags')
            .select('file_id')
            .or(tagFilters.map(f => `and(tag_key.eq.${f.key},tag_value.eq.${f.value})`).join(','))
    ).data?.map(t => t.file_id) || []);
```

**結論：** 檔名對 RAG **檢索準確度**的影響很小，因為檢索主要依賴標籤和內容向量。

---

## 🌐 中英文檔名差異分析

### Gemini 模型的多語言支援

根據 Google Gemini 的官方文件：
- Gemini 1.5/2.0 模型對**中文和英文都有良好的支援**
- 模型在訓練時使用了大量中英文混合語料
- 檔名使用中文或英文**理論上不會有顯著差異**

### 實際考量因素

#### 1. **一致性原則**

**建議：** 如果系統主要使用繁體中文（如 EAKAP），建議檔名也使用中文，以保持一致性。

**理由：**
- System Prompt 使用中文時，中文檔名更易於 AI 對應
- 使用者介面顯示中文檔名更符合使用者習慣

#### 2. **技術限制**

**潛在問題：**
- 某些檔案系統對中文檔名支援不佳（但 EAKAP 使用 S3/Gemini，無此問題）
- URL 編碼可能讓中文檔名變長（但 EAKAP 使用 URI，無此問題）

**結論：** EAKAP 系統架構下，中英文檔名**技術上無差異**。

#### 3. **AI 理解能力**

**測試建議：**
- 可以進行 A/B 測試，比較相同內容但不同語言檔名的回應品質
- 但根據 Gemini 的多語言能力，預期差異應該很小

---

## 💡 建議與最佳實踐

### 1. **檔案命名策略**

#### ✅ 推薦做法

```
✅ 描述性檔名
- "品木宣言使用者畫像研究報告_v2025.md"
- "Q1_2025_銷售數據分析.xlsx"
- "產品規格書_青春無敵系列.pdf"

✅ 包含關鍵資訊
- 主題/類別
- 版本號或日期
- 部門或專案名稱（可選）
```

#### ❌ 避免做法

```
❌ 無意義檔名
- "document1.pdf"
- "檔案_20250101.pdf"
- "temp.docx"

❌ 過長或過短的檔名
- "這是一個非常非常非常長的檔案名稱包含了很多不必要的資訊.pdf"
- "a.pdf"
```

### 2. **自動命名建議**

如果系統要實作 AI 自動命名，建議：

```typescript
// 建議的命名策略
interface AutoNamingStrategy {
    // 1. 從檔案內容提取關鍵資訊
    extractKeywords: (content: string) => string[];
    
    // 2. 結合標籤資訊
    includeTags: (tags: Tag[]) => string;
    
    // 3. 加入時間戳記（可選）
    includeTimestamp: boolean;
    
    // 4. 語言一致性
    language: 'zh-TW' | 'en';  // 與系統語言一致
}

// 範例實作
const generateFilename = async (file: File, content: string, tags: Tag[]) => {
    // 使用 Gemini 分析內容並生成檔名
    const prompt = `請根據以下檔案內容和標籤，生成一個清晰、描述性的繁體中文檔名。
    
內容摘要：${content.slice(0, 500)}
標籤：${tags.map(t => `${t.key}:${t.value}`).join(', ')}

請只回傳檔名（不含副檔名），長度控制在 50 字元以內。`;
    
    const filename = await generateContent('gemini-3-flash-preview', prompt);
    return `${filename.trim()}.${getExtension(file.name)}`;
};
```

### 3. **系統改進建議**

#### 短期改進（可立即實作）

1. **在 System Prompt 中強化檔名提示**
   ```typescript
   // 改進 mappingHint，加入更多上下文
   mappingHint = `系統已為您載入以下知識庫檔案內容：
   ${retrievedFiles.map((f, i) => 
       `- 檔案 ${i + 1}: [${f.filename}]
        標籤：${f.tags?.map(t => `${t.key}:${t.value}`).join(', ') || '無'}
        類別：${f.category_name || '未分類'}`
   ).join('\n')}
   
   請根據檔案名稱和標籤，準確引用對應內容。`;
   ```

2. **在引用來源中顯示更多資訊**
   - 除了檔名，也顯示標籤和類別
   - 幫助使用者理解引用來源的相關性

#### 長期改進（需要規劃）

1. **實作 AI 自動命名功能**
   - 上傳時自動分析內容並生成描述性檔名
   - 允許使用者編輯自動生成的檔名

2. **檔名品質評分**
   - 評估檔名的描述性
   - 提供改進建議

---

## 📈 結論

### 檔案命名的重要性評分

| 層面 | 重要性 | 說明 |
|------|--------|------|
| **RAG 檢索準確度** | ⭐⭐ (2/5) | 檢索主要依賴標籤和內容向量，檔名影響小 |
| **AI 理解與對應** | ⭐⭐⭐ (3/5) | 檔名有助於 AI 理解檔案主題和對應內容 |
| **使用者體驗** | ⭐⭐⭐⭐⭐ (5/5) | 清晰的檔名對使用者理解引用來源至關重要 |
| **系統一致性** | ⭐⭐⭐⭐ (4/5) | 檔名應與系統語言和命名規範保持一致 |

### 最終建議

1. **檔案命名是重要的，但不是 RAG 檢索的核心**
   - 重點應該放在**標籤（tags）**和**類別（categories）**的正確設定
   - 檔名主要影響使用者體驗和 AI 理解

2. **中英文檔名差異很小**
   - Gemini 模型對中英文都有良好支援
   - 建議與系統主要語言保持一致（EAKAP 建議使用繁體中文）

3. **建議實作 AI 自動命名**
   - 可以提升檔名的描述性和一致性
   - 但需要允許使用者手動調整

4. **優先改進標籤系統**
   - 標籤對 RAG 檢索的影響遠大於檔名
   - 建議加強標籤的智能推薦和自動分類功能

---

## 📚 參考資料

- [Google Gemini API 文件](https://ai.google.dev/docs)
- EAKAP 專案規範：`.claude/CLAUDE.md`
- 系統實作檔案：
  - `app/api/files/route.ts`
  - `app/api/chat/route.ts`
  - `lib/gemini/client.ts`
  - `lib/knowledge/ingestion.ts`

---

**報告結束**
