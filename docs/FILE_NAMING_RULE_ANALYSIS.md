# 檔案命名規則深度分析報告

**建立日期：** 2026-01-01  
**版本：** 1.0  
**分析範圍：** EAKAP 檔案命名規則實作與長期適用性評估

---

## 📋 執行摘要

### 核心發現

**目前系統運作模式：**
- ✅ 採用 **「AI 自動命名 + 人工審核」** 模式（非使用者手動命名）
- ✅ AI 會自動分析檔案內容並生成符合命名規範的檔名
- ✅ 使用者可以在 Review Workspace 中審核、編輯或接受 AI 建議的檔名
- ⚠️ **AI 生成的檔名品質取決於 Prompt 設計和命名規範的完整性**
- ⚠️ **缺乏對 AI 生成檔名的驗證機制**
- ⚠️ **缺乏命名品質評分和改進建議**

**結論：**
目前的命名規則**理論上可行，但 AI 命名機制需要強化**。需要確保 AI 生成的檔名符合 MECE 原則，並建立驗證與品質監控機制，才能支撐企業長期、大規模使用。

---

## 🔍 目前實作狀況分析

### 1. 系統運作流程

#### 1.1 檔案上傳階段 (`app/api/files/route.ts`)

```175:196:app/api/files/route.ts
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `uploads/${profile.id}/${timestamp}_${sanitizedFilename}`;

        // 讀取檔案內容
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 上傳至 S3/MinIO
        let s3Etag: string;
        try {
            s3Etag = await uploadToS3(buffer, storagePath, mimeType);
        } catch (storageError) {
            console.error('S3 上傳失敗:', storageError);
            // 如果 S3 不可用，暫時跳過（開發環境可能沒有設定 S3）
            s3Etag = `mock-etag-${timestamp}`;
        }

        // 寫入資料庫
        const { data: newFile, error: insertError } = await supabase
            .from('files')
            .insert({
                filename: file.name,
```

**關鍵發現：**
- ✅ 儲存路徑使用 sanitized 檔名（只保留安全字元）
- ✅ **資料庫儲存原始檔名（這是正確的，因為後續 AI 會生成新檔名）**
- ✅ **上傳階段不需要驗證檔名（因為 AI 會重新命名）**

#### 1.2 AI 自動命名階段 (`lib/knowledge/ingestion.ts` + `lib/knowledge/prompts.ts`)

根據 `lib/knowledge/ingestion.ts` 和 `lib/knowledge/prompts.ts` 的實作：

```98:120:lib/knowledge/ingestion.ts
        // 5. 執行 Metadata 分析
        await supabase.from('files').update({ markdown_content: `DEBUG: Analyzing Metadata...` }).eq('id', fileId);

        // 取得分類列表以供 AI 參考
        const { data: categories } = await supabase.from('document_categories').select('name');
        const categoryListString = categories?.map(c => `- ${c.name}`).join('\n') || '(No categories defined yet)';

        const finalizedPrompt = METADATA_ANALYSIS_PROMPT.replace('{{ CATEGORY_LIST }}', categoryListString);

        const metadataJsonString = await retryWithBackoff(() => generateContent(
            'gemini-3-flash-preview',
            finalizedPrompt,
            geminiFile.uri,
            file.mime_type
        ));

        const cleanedJsonString = metadataJsonString.replace(/```json\n?|\n?```/g, '').trim();
        let metadata: any = {};
        try {
            metadata = JSON.parse(cleanedJsonString);
        } catch (e) {
            console.error('[Ingestion] JSON Parse Error:', e);
            metadata = { raw_analysis: cleanedJsonString };
        }
```

**關鍵發現：**
- ✅ AI 會自動分析檔案內容並生成 `suggested_filename`
- ✅ Prompt 中有定義命名規範：`[Dept]-[Type]-[Subject]-[Version]`
- ⚠️ **但 Prompt 中的命名規範描述不夠完整**
- ⚠️ **沒有驗證 AI 生成的檔名是否符合規範**
- ⚠️ **沒有檢查部門代碼是否存在於系統中**

#### 1.3 人工審核階段 (`components/knowledge/ReviewWorkspace.tsx`)

根據 `components/knowledge/ReviewWorkspace.tsx` 的實作：

```19:36:components/knowledge/ReviewWorkspace.tsx
    // Metadata Editing
    const [suggestedFilename, setSuggestedFilename] = useState(metadata.suggested_filename || file.filename);
    const [summary, setSummary] = useState(metadata.summary || '');
    const [tags, setTags] = useState<string[]>(metadata.tags || []);

    const handleApprove = async () => {
        if (!confirm('Approve this document for the Knowledge Base?')) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/files/${file.id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'APPROVE',
                    updates: {
                        filename: suggestedFilename,
```

**關鍵發現：**
- ✅ 使用者可以在 Review Workspace 中編輯 AI 建議的檔名
- ✅ 使用者確認後才會更新到資料庫
- ⚠️ **沒有驗證使用者編輯後的檔名是否符合規範**
- ⚠️ **沒有提供命名品質評分和改進建議**

#### 1.4 檔案搜尋邏輯 (`app/api/files/route.ts`)

```73:93:app/api/files/route.ts
        // 篩選部門 (智選模式：同時比對 ID 與 EAKAP 命名規範)
        if (dept) {
            // 嘗試取得部門代碼以進行檔名比對
            const { data: deptData } = await supabase
                .from('departments')
                .select('code')
                .eq('id', dept)
                .single();

            if (deptData?.code) {
                query = query.or(`department_id.eq.${dept},filename.ilike.${deptData.code}-%`);
            } else {
                query = query.eq('department_id', dept);
            }
        }

        // 篩選類型 (符合 EAKAP 命名規範：[Dept]-[Type]-...)
        // 如果未來有建立專屬欄位則改用專屬欄位，目前先用檔名比對
        if (type) {
            query = query.ilike('filename', `%-${type}-%`);
        }
```

**關鍵發現：**
- ⚠️ 系統**假設**檔名符合命名規範來進行搜尋
- ❌ 如果檔名不符合規範，搜尋會失效
- ❌ 沒有驗證機制確保檔名符合規範

### 2. AI 命名 Prompt 檢視

#### 2.1 AI 命名 Prompt (`lib/knowledge/prompts.ts`)

根據 `lib/knowledge/prompts.ts` 的實作：

```36:38:lib/knowledge/prompts.ts
1. \`suggested_filename\`: Standardized filename following EAKAP naming convention.
   - Format: \`[Dept]-[Type]-[Subject]-[Version]\` (e.g., \`PROD-Policy-Maintenance_SOP-v2024.md\`)
   - Use English letters, numbers, hyphens only. NO Chinese characters.
```

**關鍵發現：**
- ✅ Prompt 中有定義命名規範格式
- ⚠️ **但格式描述與文件規範不完全一致**（文件規範是 `[歸屬權]-[文件類別]-[核心主題]-[屬性後綴]`）
- ⚠️ **沒有明確要求檢查部門代碼是否存在**
- ⚠️ **沒有明確要求檢查文件類別是否存在**
- ⚠️ **沒有處理邊緣情況（多部門協作、跨領域文件等）**

#### 2.2 文件規範定義 (`01.企業AI知識轉型全略_從架構師到平台實踐.md`)

```
格式：`[歸屬權]-[文件類別]-[核心主題]-[屬性後綴].ext`

- [歸屬權]: 必須存在於系統部門列表 (如 `HR`, `IT`, `SALES`)
- [文件類別]: 必須存在於系統文件類別列表 (如 `政策`, `標準作業程序`, `技術規格`)
- [核心主題]: 英文/數字，PascalCase (如 `RemoteWork`)
- [屬性後綴]: 版本或日期 (如 `v2024`)

範例：`HR-政策-RemoteWork-v2024.pdf`
```

**規範分析：**
- ✅ 結構清晰，有明確的組成要素
- ⚠️ 但缺乏處理邊緣情況的規則
- ❌ 沒有定義多部門協作文件的命名方式
- ❌ 沒有定義跨領域文件的命名方式
- ❌ 沒有定義臨時/草稿文件的命名方式

---

## ⚠️ 問題診斷

### 問題 1：AI Prompt 與命名規範不一致

**現況：**
- 文件中有完整的命名規範：`[歸屬權]-[文件類別]-[核心主題]-[屬性後綴].ext`
- AI Prompt 中的格式描述：`[Dept]-[Type]-[Subject]-[Version]`
- 兩者格式不完全一致，且 Prompt 描述不夠詳細

**影響：**
- AI 可能生成不符合規範的檔名
- 檔名格式不一致，影響搜尋和分類
- 無法建立統一的知識架構

**嚴重程度：** 🔴 **高**

### 問題 2：缺乏 AI 生成檔名的驗證機制

**現況：**
- AI 生成檔名後，沒有驗證是否符合規範
- 沒有檢查部門代碼是否存在於系統中
- 沒有檢查文件類別是否存在於系統中
- 使用者編輯檔名後也沒有驗證

**影響：**
- 可能出現 `REG-政策-XXX.pdf`（`REG` 不存在於部門列表）
- 可能出現 `HR-未知類別-XXX.pdf`（類別不存在）
- 無法確保資料品質

**嚴重程度：** 🔴 **高**

### 問題 3：缺乏命名品質監控與改進機制

**現況：**
- 沒有命名品質評分系統
- 沒有批次驗證工具
- 沒有 AI 命名品質的監控機制

**影響：**
- 無法評估 AI 生成的檔名品質
- 無法發現和改進命名問題
- 當企業上傳千份、萬份資料時，可能累積大量低品質檔名

**嚴重程度：** 🟡 **中**

### 問題 4：不符合 MECE 原則

**現況：**
- 命名規範沒有處理所有可能的文件類型
- 缺乏多部門協作文件的命名規則
- 缺乏跨領域文件的命名規則

**影響：**
- 某些文件無法歸類
- 可能出現命名衝突
- 無法建立完整的知識架構

**嚴重程度：** 🟡 **中**

---

## 📊 長期適用性評估

### 評估維度

| 維度 | 評分 | 說明 |
|------|------|------|
| **理論完整性** | ⭐⭐⭐⭐ (4/5) | 規範定義清晰，但缺乏邊緣情況處理 |
| **實作完整性** | ⭐ (1/5) | 規範未在程式碼中實作 |
| **可擴展性** | ⭐⭐⭐ (3/5) | 結構可擴展，但缺乏驗證機制 |
| **大規模適用性** | ⭐⭐ (2/5) | 缺乏自動化機制，無法應對大規模使用 |
| **MECE 符合度** | ⭐⭐⭐ (3/5) | 基本符合，但缺乏邊緣情況處理 |

### 不同企業規模適用性

#### 小型企業（< 50 人）

**適用性：** ⭐⭐⭐ (3/5)

**優點：**
- 檔案數量少，人工命名可行
- 部門結構簡單，命名規則容易遵循

**缺點：**
- 缺乏驗證機制，仍可能出現命名不一致
- 沒有自動化機制，增加人工成本

#### 中型企業（50-500 人）

**適用性：** ⭐⭐ (2/5)

**優點：**
- 命名規範結構清晰，理論上可行

**缺點：**
- 檔案數量增加，人工命名成本高
- 缺乏驗證機制，容易出現命名不一致
- 沒有自動化機制，無法應對大規模使用

#### 大型企業（> 500 人）

**適用性：** ⭐ (1/5)

**優點：**
- 命名規範結構清晰

**缺點：**
- 檔案數量龐大，人工命名不可行
- 缺乏驗證機制，無法確保資料品質
- 沒有自動化機制，無法應對大規模使用
- 多部門協作文件命名規則不明確

### 不同部門適用性

#### 單一部門文件

**適用性：** ⭐⭐⭐⭐ (4/5)

**說明：**
- 命名規範明確：`[部門代碼]-[文件類別]-[主題]-[後綴].ext`
- 結構清晰，容易遵循

#### 多部門協作文件

**適用性：** ⭐⭐ (2/5)

**問題：**
- 命名規範沒有定義多部門協作文件的命名方式
- 可能出現：`HR-IT-政策-XXX.pdf`（兩個部門代碼？）
- 或：`CROSS-政策-XXX.pdf`（使用特殊代碼？）

**建議：**
- 需要定義多部門協作文件的命名規則
- 或使用標籤系統來標記多部門協作

#### 跨領域文件

**適用性：** ⭐⭐ (2/5)

**問題：**
- 某些文件可能跨越多個業務領域
- 命名規範沒有定義跨領域文件的命名方式

**建議：**
- 使用標籤系統來標記跨領域文件
- 或定義主要領域，其他領域用標籤標記

### 不同文件種類適用性

#### 標準文件（政策、SOP、規格）

**適用性：** ⭐⭐⭐⭐ (4/5)

**說明：**
- 命名規範明確，容易遵循
- 文件類別清晰，容易分類

#### 臨時/草稿文件

**適用性：** ⭐⭐ (2/5)

**問題：**
- 命名規範沒有定義臨時/草稿文件的命名方式
- 可能出現：`HR-草稿-XXX.pdf`（「草稿」是文件類別嗎？）

**建議：**
- 使用標籤系統來標記臨時/草稿文件
- 或定義特殊的文件類別

#### 歷史/歸檔文件

**適用性：** ⭐⭐⭐ (3/5)

**問題：**
- 命名規範有定義「屬性後綴」，但沒有定義歷史/歸檔文件的命名方式
- 可能出現：`HR-政策-RemoteWork-v2024-ARCHIVED.pdf`（後綴過長？）

**建議：**
- 使用標籤系統來標記歷史/歸檔文件
- 或定義特殊的文件類別

---

## 🎯 MECE 原則符合度分析

### MECE 原則定義

- **Mutually Exclusive（相互獨立）**：每個分類互不重疊
- **Collectively Exhaustive（完全窮盡）**：能涵蓋所有可能的文件類型

### 目前命名規範的 MECE 符合度

#### 1. 歸屬權（部門代碼）

**Mutually Exclusive：** ⭐⭐⭐⭐ (4/5)
- ✅ 每個部門有唯一的代碼
- ⚠️ 但沒有處理多部門協作文件

**Collectively Exhaustive：** ⭐⭐⭐ (3/5)
- ⚠️ 沒有定義「無部門歸屬」文件的命名方式
- ⚠️ 沒有定義「多部門協作」文件的命名方式

#### 2. 文件類別

**Mutually Exclusive：** ⭐⭐⭐⭐ (4/5)
- ✅ 文件類別定義清晰，基於標準分類架構
- ⚠️ 但某些文件可能跨越多個類別

**Collectively Exhaustive：** ⭐⭐⭐ (3/5)
- ⚠️ 沒有定義「臨時/草稿」文件的類別
- ⚠️ 沒有定義「歷史/歸檔」文件的類別

#### 3. 核心主題

**Mutually Exclusive：** ⭐⭐ (2/5)
- ❌ 沒有定義主題的命名規則
- ❌ 可能出現主題重複或衝突

**Collectively Exhaustive：** ⭐⭐ (2/5)
- ❌ 沒有定義主題的範圍
- ❌ 某些文件可能無法歸類到特定主題

#### 4. 屬性後綴

**Mutually Exclusive：** ⭐⭐⭐ (3/5)
- ⚠️ 沒有定義後綴的格式規則
- ⚠️ 可能出現後綴衝突

**Collectively Exhaustive：** ⭐⭐⭐ (3/5)
- ⚠️ 沒有定義所有可能的後綴類型
- ⚠️ 某些文件可能不需要後綴

### 整體 MECE 符合度

**評分：** ⭐⭐⭐ (3/5)

**優點：**
- 基本結構符合 MECE 原則
- 部門代碼和文件類別定義清晰

**缺點：**
- 缺乏邊緣情況處理
- 核心主題和屬性後綴缺乏明確規則
- 無法處理多部門協作、跨領域文件

---

## 💡 改進建議

### 短期改進（立即實作）

#### 1. 強化 AI 命名 Prompt

**目標：** 確保 AI 生成的檔名符合完整的命名規範

**實作方式：**
```typescript
// lib/knowledge/prompts.ts
export const METADATA_ANALYSIS_PROMPT = `
// ... 現有 Prompt ...

1. \`suggested_filename\`: Standardized filename following EAKAP naming convention.
   - **Format**: \`[DepartmentCode]-[DocumentType]-[CoreTopic]-[AttributeSuffix].ext\`
   - **DepartmentCode**: MUST exist in the system's department list. Use the exact code from the list below.
   - **DocumentType**: MUST exist in the system's document category list. Use the exact name from the list below.
   - **CoreTopic**: English PascalCase (e.g., RemoteWork, ProductLaunch). Describe the core subject.
   - **AttributeSuffix**: Version or date (e.g., v2024, 20240101). Optional but recommended.
   - **Rules**:
     * Use English letters, numbers, hyphens only. NO Chinese characters.
     * Department code MUST be validated against the system's department list.
     * Document type MUST be validated against the system's category list.
     * If multiple departments are involved, use the primary department code and mark others in tags.
     * If the document spans multiple categories, use the primary category and mark others in tags.

**Available Departments:**
{{ DEPARTMENT_LIST }}

**Available Document Categories:**
{{ CATEGORY_LIST }}

// ... 其他欄位 ...
`;
```

#### 2. 建立 AI 生成檔名的驗證機制

**目標：** 驗證 AI 生成的檔名是否符合規範

**實作方式：**
```typescript
// lib/validation/filename-validator.ts
interface FilenameParts {
    departmentCode: string;
    documentType: string;
    coreTopic: string;
    attributeSuffix?: string;
    extension: string;
}

export function validateFilename(
    filename: string,
    validDepartments: string[],
    validDocumentTypes: string[]
): { valid: boolean; error?: string; parts?: FilenameParts } {
    // 1. 解析檔名
    const parts = parseFilename(filename);
    
    // 2. 驗證部門代碼
    if (!validDepartments.includes(parts.departmentCode)) {
        return { valid: false, error: `部門代碼 ${parts.departmentCode} 不存在於系統中` };
    }
    
    // 3. 驗證文件類別
    if (!validDocumentTypes.includes(parts.documentType)) {
        return { valid: false, error: `文件類別 ${parts.documentType} 不存在於系統中` };
    }
    
    // 4. 驗證核心主題格式（PascalCase）
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(parts.coreTopic)) {
        return { valid: false, error: `核心主題必須是 PascalCase 格式` };
    }
    
    return { valid: true, parts };
}

// 在 ingestion.ts 中使用
export async function processUploadedFile(...) {
    // ... 現有程式碼 ...
    
    // 驗證 AI 生成的檔名
    const { data: departments } = await supabase
        .from('departments')
        .select('code')
        .not('code', 'is', null);
    
    const { data: categories } = await supabase
        .from('document_categories')
        .select('name');
    
    if (metadata.suggested_filename) {
        const validation = validateFilename(
            metadata.suggested_filename,
            departments.map(d => d.code),
            categories.map(c => c.name)
        );
        
        if (!validation.valid) {
            // 記錄驗證失敗，但不阻止流程
            console.warn(`[Ingestion] Filename validation failed: ${validation.error}`);
            metadata.filename_validation = {
                valid: false,
                error: validation.error
            };
        } else {
            metadata.filename_validation = { valid: true };
        }
    }
    
    // ... 繼續流程 ...
}
```

#### 3. 在 Review Workspace 中顯示驗證結果

**目標：** 讓使用者了解檔名品質並提供改進建議

**實作方式：**
```typescript
// components/knowledge/ReviewWorkspace.tsx
import { validateFilename } from '@/lib/validation/filename-validator';

export default function ReviewWorkspace({ file }: ReviewWorkspaceProps) {
    // ... 現有程式碼 ...
    
    // 驗證檔名
    const [validationResult, setValidationResult] = useState<{
        valid: boolean;
        error?: string;
    } | null>(null);
    
    useEffect(() => {
        const validate = async () => {
            const { data: departments } = await supabase
                .from('departments')
                .select('code')
                .not('code', 'is', null);
            
            const { data: categories } = await supabase
                .from('document_categories')
                .select('name');
            
            const result = validateFilename(
                suggestedFilename,
                departments.map(d => d.code),
                categories.map(c => c.name)
            );
            
            setValidationResult(result);
        };
        
        validate();
    }, [suggestedFilename]);
    
    // 在 UI 中顯示驗證結果
    return (
        <div>
            {/* ... 現有 UI ... */}
            {validationResult && !validationResult.valid && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                    ⚠️ 檔名驗證失敗：{validationResult.error}
                </div>
            )}
            {validationResult && validationResult.valid && (
                <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                    ✅ 檔名符合命名規範
                </div>
            )}
        </div>
    );
}
```

### 中期改進（1-3 個月）

#### 1. 建立批次驗證工具

**目標：** 驗證現有檔案是否符合命名規範

**實作方式：**
```typescript
// scripts/validate-filenames.ts
export async function validateAllFilenames() {
    const { data: files } = await supabase
        .from('files')
        .select('id, filename, department_id');
    
    const results = {
        valid: [] as string[],
        invalid: [] as { id: string; filename: string; error: string }[]
    };
    
    for (const file of files) {
        const validation = validateFilename(file.filename, ...);
        if (validation.valid) {
            results.valid.push(file.id);
        } else {
            results.invalid.push({
                id: file.id,
                filename: file.filename,
                error: validation.error || '未知錯誤'
            });
        }
    }
    
    return results;
}
```

#### 2. 建立命名品質評分系統

**目標：** 評估檔名的描述性和一致性

**實作方式：**
```typescript
// lib/knowledge/naming-quality.ts
export function scoreFilenameQuality(
    filename: string,
    content: string,
    tags: Tag[]
): { score: number; feedback: string[] } {
    let score = 0;
    const feedback: string[] = [];
    
    // 1. 檢查是否符合命名規範（40分）
    if (validateFilename(filename, ...).valid) {
        score += 40;
    } else {
        feedback.push('檔名不符合命名規範');
    }
    
    // 2. 檢查描述性（30分）
    const keywords = extractKeywords(content);
    const filenameKeywords = extractKeywordsFromFilename(filename);
    const overlap = calculateOverlap(keywords, filenameKeywords);
    score += overlap * 30;
    
    // 3. 檢查一致性（30分）
    const tagKeywords = extractKeywordsFromTags(tags);
    const consistency = calculateConsistency(filenameKeywords, tagKeywords);
    score += consistency * 30;
    
    return { score, feedback };
}
```

#### 3. 擴展命名規範以處理邊緣情況

**目標：** 確保命名規範符合 MECE 原則

**擴展規則：**

1. **多部門協作文件**
   - 格式：`[主要部門]-[文件類別]-[主題]-[協作部門]-[後綴].ext`
   - 範例：`HR-政策-RemoteWork-IT-v2024.pdf`
   - 或使用標籤系統標記協作部門

2. **跨領域文件**
   - 格式：`[主要領域]-[文件類別]-[主題]-[後綴].ext`
   - 其他領域使用標籤標記

3. **臨時/草稿文件**
   - 格式：`[部門]-草稿-[主題]-[日期].ext`
   - 範例：`HR-草稿-RemoteWork-20240101.pdf`
   - 或使用標籤系統標記狀態

4. **歷史/歸檔文件**
   - 格式：`[部門]-[類別]-[主題]-[後綴]-歸檔.ext`
   - 或使用標籤系統標記狀態

### 長期改進（3-6 個月）

#### 1. 建立完整的命名治理機制

**目標：** 確保長期、大規模使用下的命名一致性

**實作方式：**
- 建立命名規範文件（含所有邊緣情況）
- 建立命名品質監控儀表板
- 建立自動化命名建議系統
- 建立命名衝突檢測機制

#### 2. 建立命名規範版本管理

**目標：** 支援命名規範的演進

**實作方式：**
- 記錄命名規範的版本歷史
- 支援命名規範的遷移
- 提供命名規範的相容性檢查

---

## 📈 結論與建議

### 核心結論

1. **系統採用「AI 自動命名 + 人工審核」模式（正確）**
   - ✅ AI 會自動分析檔案內容並生成符合命名規範的檔名
   - ✅ 使用者可以在 Review Workspace 中審核、編輯或接受 AI 建議
   - ⚠️ 但 AI Prompt 中的命名規範描述不夠完整，與文件規範不完全一致

2. **缺乏 AI 生成檔名的驗證機制**
   - ❌ AI 生成檔名後沒有驗證是否符合規範
   - ❌ 沒有檢查部門代碼是否存在於系統中
   - ❌ 沒有檢查文件類別是否存在於系統中
   - ❌ 使用者編輯檔名後也沒有驗證

3. **AI Prompt 需要強化以符合 MECE 原則**
   - ⚠️ Prompt 中沒有處理邊緣情況（多部門協作、跨領域文件）
   - ⚠️ 沒有明確要求檢查部門代碼和文件類別是否存在
   - ⚠️ 命名規範描述不夠詳細

4. **缺乏命名品質監控機制**
   - ❌ 沒有命名品質評分系統
   - ❌ 沒有批次驗證工具
   - ❌ 無法監控 AI 命名品質的長期趨勢

### 建議行動方案

#### 立即行動（本週）

1. ✅ 建立命名規範驗證機制
2. ✅ 在上傳時強制驗證
3. ✅ 提供自動命名建議

#### 短期行動（1 個月內）

1. ✅ 建立批次驗證工具
2. ✅ 建立命名品質評分系統
3. ✅ 擴展命名規範以處理邊緣情況

#### 長期行動（3 個月內）

1. ✅ 建立完整的命名治理機制
2. ✅ 建立命名規範版本管理
3. ✅ 建立命名品質監控儀表板

### 最終建議

**建議採用「AI 自動命名 + 驗證 + 品質監控」三層架構：**

1. **AI 自動命名層**：
   - 強化 AI Prompt，確保生成的檔名符合完整的命名規範
   - 在 Prompt 中明確要求檢查部門代碼和文件類別是否存在
   - 處理邊緣情況（多部門協作、跨領域文件）

2. **驗證層**：
   - 驗證 AI 生成的檔名是否符合規範
   - 驗證使用者編輯後的檔名是否符合規範
   - 在 Review Workspace 中顯示驗證結果和改進建議

3. **品質監控層**：
   - 建立命名品質評分系統
   - 建立批次驗證工具
   - 監控 AI 命名品質的長期趨勢

**這樣才能建立一個可以走很長遠的知識架構管理系統。**

---

**報告結束**
