# AI 回答品質防護機制實作檢查報告

**報告日期**：2026-01-16（更新版）  
**檢查範圍**：系統中所有 AI 回答功能  
**檢查標準**：五層品質防護機制（Layer 1-5）  
**版本**：v2.0 — 加入風險分級框架與技術落地方案

---

## 執行摘要

### 核心發現

經過詳細檢查，系統中各 AI 功能的品質防護實作程度不一。然而，**並非所有場景都需要完整實作五層防護**。本報告提出**風險分級框架**，根據場景特性決定適當的防護層級，以達到品質與效率的最佳平衡。

### 整體實作狀況

| 功能 | 風險等級 | Layer 1<br/>引用來源 | Layer 2<br/>信心度 | Layer 3<br/>覆核提示 | Layer 4<br/>反饋學習 | Layer 5<br/>定期審計 | 建議 |
|------|:--------:|:------------------:|:----------------:|:------------------:|:------------------:|:------------------:|:----:|
| 部門 Agent（無工具） | 🔴 高 | ✅ | ✅ | ✅ | ✅ | ⚠️ | 維持 |
| 部門 Agent（工具模式） | 🔴 高 | ❌ | ❌ | ❌ | ✅ | ⚠️ | **需補齊** |
| 企業參謀 | 🔴 高 | ❌ | ❌ | ❌ | ❌ | ⚠️ | **需補齊** |
| 部門對話 | 🟡 中 | ❌ | ❌ | ❌ | ❌ | ⚠️ | 部分實作 |
| Agent 會議 | 🟡 中 | ✅ | ❌ | ❌ | ❌ | ⚠️ | 部分實作 |
| OpenAI 相容 API | 🟢 低 | ❌ | ❌ | ❌ | ❌ | ⚠️ | 最小化 |
| 企業參謀（War Room） | 🟢 低 | ❌ | ❌ | ❌ | ❌ | ⚠️ | 事後審計 |

---

## 第一部分：風險分級框架

### 1.1 風險等級定義

| 風險等級 | 定義 | 錯誤影響 | 典型場景 |
|:--------:|------|----------|----------|
| 🔴 **高風險** | 直接影響業務決策，錯誤成本高 | 財務損失、法律風險、聲譽損害 | 企業參謀、部門 Agent 決策支援 |
| 🟡 **中風險** | 內部協作用途，影響可控 | 溝通誤解、效率降低、需人工修正 | Agent 會議、部門內部對話 |
| 🟢 **低風險** | 輔助工具、用戶自行負責 | 輕微不便、用戶可自行判斷 | API 整合、背景分析、創意發想 |

### 1.2 防護層級建議矩陣

| 風險等級 | Layer 1<br/>引用來源 | Layer 2<br/>信心度 | Layer 3<br/>覆核提示 | Layer 4<br/>反饋學習 | Layer 5<br/>定期審計 |
|:--------:|:--------------------:|:------------------:|:--------------------:|:--------------------:|:--------------------:|
| 🔴 高風險 | ✅ 必須 | ✅ 必須 | ✅ 必須 | ✅ 必須 | ✅ 必須 |
| 🟡 中風險 | ✅ 必須 | ⚠️ 建議 | ⭕ 選用 | ✅ 必須 | ✅ 抽樣 |
| 🟢 低風險 | ⚠️ 建議 | ⭕ 選用 | ❌ 不需 | ⚠️ 簡化 | ✅ 抽樣 |

### 1.3 各層級適用性分析

#### Layer 1: 強制引用來源 — 建議普遍實作
- **價值**：可信度基礎，成本低效益高
- **例外**：純創意生成、無 RAG 來源的場景

#### Layer 2: 信心度評分 — 選擇性實作
- **適合**：高風險決策場景
- **不適合**：創意發想階段（會抑制創新思維）

#### Layer 3: 人工覆核提示 — 選擇性實作
- **適合**：法規、財務、人事等敏感議題
- **不適合**：日常查詢（避免「警報疲勞」）

#### Layer 4: 使用者反饋學習 — 建議普遍實作
- **價值**：持續改善的基礎
- **簡化方案**：低風險場景可只記錄 👍/👎

#### Layer 5: 定期人工審計 — 集中實作
- **建議**：統一審計系統，定期抽樣所有 AI 回應
- **不建議**：每個功能獨立實作審計邏輯

---

## 第二部分：現狀詳細檢查

### 2.1 高風險場景

#### ✅ 部門 Agent 對話 - 無工具模式（完整實作）

**路徑**：`app/api/chat/route.ts`

| 層級 | 狀態 | 實作細節 |
|------|:----:|----------|
| Layer 1 | ✅ | System Prompt 要求 JSON 格式 citations，解析後儲存至 `chat_messages.citations` |
| Layer 2 | ✅ | 從 JSON 提取 `confidence` 和 `reasoning`，儲存至對應欄位 |
| Layer 3 | ✅ | 使用 `detectReviewTriggers()` 檢測關鍵字 |
| Layer 4 | ✅ | `chat_feedback` 表 + `/api/chat/feedback` 端點 |
| Layer 5 | ⚠️ | 資料庫結構就緒，缺少 Cron Job |

**程式碼位置**：`app/api/chat/route.ts:404-452`

---

#### ❌ 部門 Agent 對話 - 工具模式（需補齊）

**問題清單**：
- 使用 `chatWithTools()` 時直接串流，無後處理
- 未解析 citations、confidence_score
- 未檢測 review_triggers
- 儲存時缺少所有防護欄位

**程式碼位置**：`app/api/chat/route.ts:289-365`

**修復優先級**：🔴 最高

---

#### ❌ 企業參謀（需補齊）

**路徑**：`app/api/chat/corporate/route.ts`

**問題清單**：
- 僅在 System Prompt 要求「標註來源」，無結構化提取
- 回應直接串流，無後處理
- 未儲存至 `chat_messages` 表，無法追蹤反饋

**程式碼位置**：`app/api/chat/corporate/route.ts:77-100`

**修復優先級**：🔴 最高

---

### 2.2 中風險場景

#### ⚠️ Agent 會議（部分實作）

**路徑**：`lib/meeting/service.ts`

| 層級 | 狀態 | 說明 |
|------|:----:|------|
| Layer 1 | ✅ | 使用 `CitationValidator` 驗證引用 |
| Layer 2 | ❌ | `meeting_messages` 表缺少 `confidence_score` 欄位 |
| Layer 3 | ⭕ | 可選實作（會議為內部協作用途） |
| Layer 4 | ❌ | 缺少會議訊息反饋機制 |
| Layer 5 | ⚠️ | 納入統一審計系統 |

**建議**：補齊 Layer 2 和 Layer 4，Layer 3 為選用

---

#### ❌ 部門對話（需補齊基礎層）

**路徑**：`app/api/chat/department/route.ts`

**建議實作**：Layer 1 + Layer 4
- 引用來源必須
- 反饋機制必須
- 信心度與覆核提示為選用

---

### 2.3 低風險場景

#### ⚠️ OpenAI 相容 API（維持現狀）

**路徑**：`app/api/openai/v1/chat/completions/route.ts`

**設計考量**：
- 為相容 OpenAI API 格式，回應直接串流
- API 用戶自行負責品質控管
- 若需防護，由呼叫端實作

**建議**：僅實作 Layer 1（引用來源），其餘維持現狀

---

#### ⚠️ War Room 企業參謀（事後審計）

**路徑**：`lib/war-room/kpi/corporate-strategy.ts`

**設計考量**：
- 背景生成的分析報告，非即時對話
- 儲存在 `ai_strategic_insights` 表

**建議**：僅納入 Layer 5 統一審計，不需即時防護

---

## 第三部分：技術落地方案

### 3.1 架構設計：統一品質防護模組

建立 `lib/ai-safeguards/` 模組，提供分級防護能力：

```
lib/ai-safeguards/
├── index.ts                    # 主要匯出
├── types.ts                    # 類型定義
├── processor.ts                # 核心處理器
├── layers/
│   ├── citation-extractor.ts   # Layer 1: 引用來源提取
│   ├── confidence-scorer.ts    # Layer 2: 信心度評分
│   ├── review-detector.ts      # Layer 3: 覆核提示檢測
│   └── feedback-recorder.ts    # Layer 4: 反饋記錄
├── presets/
│   ├── high-risk.ts            # 高風險場景預設
│   ├── medium-risk.ts          # 中風險場景預設
│   └── low-risk.ts             # 低風險場景預設
└── audit/
    └── unified-auditor.ts      # Layer 5: 統一審計
```

### 3.2 核心類型定義

```typescript
// lib/ai-safeguards/types.ts

export type RiskLevel = 'high' | 'medium' | 'low';

export interface SafeguardConfig {
  riskLevel: RiskLevel;
  enableCitation: boolean;      // Layer 1
  enableConfidence: boolean;    // Layer 2
  enableReviewTrigger: boolean; // Layer 3
  enableFeedback: boolean;      // Layer 4
  auditSampleRate: number;      // Layer 5: 0-1 抽樣率
}

export interface SafeguardResult {
  // Layer 1
  citations: Citation[];
  
  // Layer 2
  confidenceScore?: number;
  confidenceReasoning?: string;
  
  // Layer 3
  needsReview: boolean;
  reviewTriggers: string[];
  
  // 原始內容（清理後）
  cleanContent: string;
  
  // 審計標記
  selectedForAudit: boolean;
}

export interface Citation {
  fileId: string;
  fileName: string;
  excerpt: string;
  relevanceScore?: number;
}

// 預設配置
export const RISK_PRESETS: Record<RiskLevel, SafeguardConfig> = {
  high: {
    riskLevel: 'high',
    enableCitation: true,
    enableConfidence: true,
    enableReviewTrigger: true,
    enableFeedback: true,
    auditSampleRate: 0.1,  // 10% 抽樣
  },
  medium: {
    riskLevel: 'medium',
    enableCitation: true,
    enableConfidence: true,
    enableReviewTrigger: false,
    enableFeedback: true,
    auditSampleRate: 0.05, // 5% 抽樣
  },
  low: {
    riskLevel: 'low',
    enableCitation: true,
    enableConfidence: false,
    enableReviewTrigger: false,
    enableFeedback: false,
    auditSampleRate: 0.02, // 2% 抽樣
  },
};
```

### 3.3 核心處理器實作

```typescript
// lib/ai-safeguards/processor.ts

import { SafeguardConfig, SafeguardResult, RISK_PRESETS, RiskLevel } from './types';
import { extractCitations } from './layers/citation-extractor';
import { extractConfidence } from './layers/confidence-scorer';
import { detectReviewTriggers } from './layers/review-detector';

export class SafeguardProcessor {
  private config: SafeguardConfig;

  constructor(riskLevel: RiskLevel);
  constructor(config: SafeguardConfig);
  constructor(configOrRiskLevel: SafeguardConfig | RiskLevel) {
    this.config = typeof configOrRiskLevel === 'string' 
      ? RISK_PRESETS[configOrRiskLevel]
      : configOrRiskLevel;
  }

  /**
   * 處理 AI 回應，提取品質防護資訊
   */
  async process(rawContent: string): Promise<SafeguardResult> {
    const result: SafeguardResult = {
      citations: [],
      needsReview: false,
      reviewTriggers: [],
      cleanContent: rawContent,
      selectedForAudit: Math.random() < this.config.auditSampleRate,
    };

    // 嘗試解析 JSON 格式的回應
    const parsed = this.tryParseJsonResponse(rawContent);
    
    if (parsed) {
      result.cleanContent = parsed.content || parsed.answer || rawContent;
      
      // Layer 1: 引用來源
      if (this.config.enableCitation && parsed.citations) {
        result.citations = extractCitations(parsed.citations);
      }
      
      // Layer 2: 信心度評分
      if (this.config.enableConfidence) {
        result.confidenceScore = parsed.confidence;
        result.confidenceReasoning = parsed.reasoning;
      }
    }

    // Layer 3: 覆核提示（基於關鍵字檢測）
    if (this.config.enableReviewTrigger) {
      const triggers = detectReviewTriggers(result.cleanContent);
      result.needsReview = triggers.length > 0;
      result.reviewTriggers = triggers;
    }

    return result;
  }

  /**
   * 生成 System Prompt 附加內容
   */
  getSystemPromptSuffix(): string {
    const requirements: string[] = [];

    if (this.config.enableCitation) {
      requirements.push('"citations": [{"fileId": "...", "fileName": "...", "excerpt": "..."}]');
    }

    if (this.config.enableConfidence) {
      requirements.push('"confidence": 0.0-1.0 的數字');
      requirements.push('"reasoning": "信心度評估的簡短理由"');
    }

    if (requirements.length === 0) {
      return '';
    }

    return `

【回應格式要求】
請以 JSON 格式回應，包含以下欄位：
{
  "answer": "你的回答內容",
  ${requirements.join(',\n  ')}
}
`;
  }

  private tryParseJsonResponse(content: string): Record<string, any> | null {
    try {
      // 嘗試直接解析
      return JSON.parse(content);
    } catch {
      // 嘗試從 markdown code block 中提取
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch {
          return null;
        }
      }
      return null;
    }
  }
}

// 便捷函式
export function createHighRiskProcessor(): SafeguardProcessor {
  return new SafeguardProcessor('high');
}

export function createMediumRiskProcessor(): SafeguardProcessor {
  return new SafeguardProcessor('medium');
}

export function createLowRiskProcessor(): SafeguardProcessor {
  return new SafeguardProcessor('low');
}
```

### 3.4 Layer 實作範例

#### Layer 1: 引用來源提取

```typescript
// lib/ai-safeguards/layers/citation-extractor.ts

import { Citation } from '../types';

export function extractCitations(rawCitations: any[]): Citation[] {
  if (!Array.isArray(rawCitations)) {
    return [];
  }

  return rawCitations
    .filter((c) => c && typeof c === 'object')
    .map((c) => ({
      fileId: String(c.fileId || c.file_id || ''),
      fileName: String(c.fileName || c.file_name || c.filename || ''),
      excerpt: String(c.excerpt || c.quote || ''),
      relevanceScore: typeof c.relevance === 'number' ? c.relevance : undefined,
    }))
    .filter((c) => c.fileName || c.fileId);
}
```

#### Layer 3: 覆核提示檢測

```typescript
// lib/ai-safeguards/layers/review-detector.ts

const REVIEW_TRIGGER_PATTERNS = [
  // 法規相關
  { pattern: /法規|法律|合規|監管|罰則/g, category: 'legal' },
  
  // 財務相關
  { pattern: /財務報表|稅務|審計|投資建議|財務預測/g, category: 'financial' },
  
  // 人事相關
  { pattern: /解僱|資遣|薪資調整|勞資糾紛/g, category: 'hr' },
  
  // 不確定性表達
  { pattern: /我不確定|可能有誤|建議諮詢專業|請進一步確認/g, category: 'uncertainty' },
  
  // 敏感決策
  { pattern: /重大決策|風險評估|不可逆|緊急狀況/g, category: 'critical' },
];

export function detectReviewTriggers(content: string): string[] {
  const triggers: string[] = [];

  for (const { pattern, category } of REVIEW_TRIGGER_PATTERNS) {
    if (pattern.test(content)) {
      triggers.push(category);
    }
    // 重置 regex 狀態
    pattern.lastIndex = 0;
  }

  return [...new Set(triggers)];
}
```

### 3.5 使用範例：整合至現有 API

#### 高風險場景（企業參謀）

```typescript
// app/api/chat/corporate/route.ts

import { createHighRiskProcessor } from '@/lib/ai-safeguards';

export async function POST(request: Request) {
  const processor = createHighRiskProcessor();
  
  // 1. 建構 System Prompt
  const systemPrompt = `
    你是企業參謀 AI 助手...
    ${processor.getSystemPromptSuffix()}
  `;
  
  // 2. 呼叫 AI
  const rawResponse = await callGemini(systemPrompt, userMessage);
  
  // 3. 處理回應
  const safeguardResult = await processor.process(rawResponse);
  
  // 4. 儲存至資料庫（包含所有防護欄位）
  await supabase.from('chat_messages').insert({
    content: safeguardResult.cleanContent,
    citations: safeguardResult.citations,
    confidence_score: safeguardResult.confidenceScore,
    confidence_reasoning: safeguardResult.confidenceReasoning,
    needs_review: safeguardResult.needsReview,
    review_triggers: safeguardResult.reviewTriggers,
    selected_for_audit: safeguardResult.selectedForAudit,
    // ...其他欄位
  });
  
  // 5. 回傳給前端
  return Response.json({
    content: safeguardResult.cleanContent,
    citations: safeguardResult.citations,
    confidenceScore: safeguardResult.confidenceScore,
    needsReview: safeguardResult.needsReview,
  });
}
```

#### 中風險場景（Agent 會議）

```typescript
// lib/meeting/service.ts

import { createMediumRiskProcessor } from '@/lib/ai-safeguards';

async function processAgentResponse(content: string) {
  const processor = createMediumRiskProcessor();
  const result = await processor.process(content);
  
  // 中風險：只儲存 citations 和 confidence（不含 review triggers）
  return {
    content: result.cleanContent,
    citations: result.citations,
    confidenceScore: result.confidenceScore,
  };
}
```

### 3.6 Layer 5: 統一審計系統

```typescript
// lib/ai-safeguards/audit/unified-auditor.ts

import { createClient } from '@/lib/supabase/server';

interface AuditConfig {
  // 審計週期（天）
  periodDays: number;
  // 抽樣數量上限
  maxSampleSize: number;
  // 高風險訊息全部審計
  auditAllHighRisk: boolean;
}

const DEFAULT_CONFIG: AuditConfig = {
  periodDays: 30,
  maxSampleSize: 100,
  auditAllHighRisk: true,
};

export async function generateAuditReport(config: AuditConfig = DEFAULT_CONFIG) {
  const supabase = await createClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - config.periodDays);

  // 1. 收集待審計的訊息
  const { data: chatMessages } = await supabase
    .from('chat_messages')
    .select('*')
    .or(`selected_for_audit.eq.true,needs_review.eq.true`)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(config.maxSampleSize);

  const { data: meetingMessages } = await supabase
    .from('meeting_messages')
    .select('*')
    .eq('selected_for_audit', true)
    .gte('created_at', startDate.toISOString())
    .limit(config.maxSampleSize / 2);

  // 2. 生成審計報告
  const report = {
    generatedAt: new Date().toISOString(),
    periodStart: startDate.toISOString(),
    periodEnd: new Date().toISOString(),
    summary: {
      totalChatMessages: chatMessages?.length || 0,
      totalMeetingMessages: meetingMessages?.length || 0,
      messagesNeedingReview: chatMessages?.filter(m => m.needs_review).length || 0,
      avgConfidenceScore: calculateAvgConfidence(chatMessages),
    },
    samples: {
      chatMessages: chatMessages?.slice(0, 20),
      meetingMessages: meetingMessages?.slice(0, 10),
    },
  };

  // 3. 儲存報告
  await supabase.from('audit_reports').insert({
    report_type: 'ai_quality_monthly',
    report_data: report,
    created_at: new Date().toISOString(),
  });

  return report;
}

function calculateAvgConfidence(messages: any[] | null): number {
  if (!messages || messages.length === 0) return 0;
  const scores = messages
    .map(m => m.confidence_score)
    .filter(s => typeof s === 'number');
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
```

#### Cron Job 端點

```typescript
// app/api/cron/audit-ai-quality/route.ts

import { generateAuditReport } from '@/lib/ai-safeguards/audit/unified-auditor';

export async function GET(request: Request) {
  // 驗證 Cron 密鑰
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const report = await generateAuditReport();
    
    return Response.json({
      success: true,
      summary: report.summary,
      generatedAt: report.generatedAt,
    });
  } catch (error) {
    console.error('Audit report generation failed:', error);
    return Response.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
```

---

## 第四部分：資料庫結構補充

### 4.1 已存在的結構（✅ 無需變更）

```sql
-- chat_messages 表（完整）
citations JSONB DEFAULT '[]'
confidence_score DECIMAL(3,2)
confidence_reasoning TEXT
needs_review BOOLEAN DEFAULT FALSE
review_triggers TEXT[]
reviewed_at TIMESTAMPTZ
reviewed_by UUID REFERENCES user_profiles(id)
```

### 4.2 需要補充的結構

```sql
-- Migration: add_meeting_messages_safeguards.sql

ALTER TABLE meeting_messages
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS confidence_reasoning TEXT,
ADD COLUMN IF NOT EXISTS selected_for_audit BOOLEAN DEFAULT FALSE;

-- 新增審計報告表
CREATE TABLE IF NOT EXISTS audit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  report_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- 為 chat_messages 新增審計抽樣欄位
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS selected_for_audit BOOLEAN DEFAULT FALSE;

-- 建立索引以加速審計查詢
CREATE INDEX IF NOT EXISTS idx_chat_messages_audit 
ON chat_messages(selected_for_audit, needs_review, created_at);

CREATE INDEX IF NOT EXISTS idx_meeting_messages_audit 
ON meeting_messages(selected_for_audit, created_at);
```

---

## 第五部分：實作優先順序

### Phase 1：建立基礎設施（Week 1）

| 項目 | 說明 | 檔案 |
|------|------|------|
| 1.1 | 建立 `lib/ai-safeguards/` 模組結構 | 新建 |
| 1.2 | 實作 `types.ts` 和 `processor.ts` | 新建 |
| 1.3 | 實作各 Layer 處理函式 | 新建 |
| 1.4 | 執行資料庫 Migration | `supabase/migrations/` |

### Phase 2：修復高風險場景（Week 2）

| 項目 | 說明 | 檔案 |
|------|------|------|
| 2.1 | 修復部門 Agent 工具模式 | `app/api/chat/route.ts` |
| 2.2 | 為企業參謀加入完整防護 | `app/api/chat/corporate/route.ts` |
| 2.3 | 前端顯示 citations 和 confidence | 相關元件 |

### Phase 3：補齊中風險場景（Week 3）

| 項目 | 說明 | 檔案 |
|------|------|------|
| 3.1 | 為部門對話加入基礎防護 | `app/api/chat/department/route.ts` |
| 3.2 | 為 Agent 會議補齊 Layer 2 | `lib/meeting/service.ts` |
| 3.3 | 實作會議反饋機制 | 新建 API 端點 |

### Phase 4：統一審計系統（Week 4）

| 項目 | 說明 | 檔案 |
|------|------|------|
| 4.1 | 實作統一審計器 | `lib/ai-safeguards/audit/` |
| 4.2 | 建立 Cron Job 端點 | `app/api/cron/audit-ai-quality/` |
| 4.3 | 設定 Vercel Cron | `vercel.json` |
| 4.4 | 建立審計報告檢視頁面 | 管理後台 |

---

## 第六部分：成本效益分析

### 6.1 實作成本比較

| 方案 | 開發成本 | 維護成本 | 效益 |
|------|:--------:|:--------:|:----:|
| 所有功能完整實作 5 層 | 🔴 極高 | 🔴 高 | 過度工程化、警報疲勞 |
| **按風險分級實作（建議）** | 🟢 中等 | 🟢 低 | ✅ 平衡品質與效率 |
| 完全不實作 | 🟢 零 | 🟢 零 | 🔴 品質風險 |

### 6.2 預期效益

| 指標 | 現狀 | 優化後 |
|------|:----:|:------:|
| 高風險場景覆蓋率 | 33% | 100% |
| 審計覆蓋率 | 0% | 100%（抽樣） |
| 程式碼重複率 | 高 | 低（統一模組） |
| 維護複雜度 | 中 | 低 |

---

## 結論

### 核心原則

1. **依風險分級**：高風險場景完整實作，低風險場景精簡處理
2. **共用基礎設施**：建立統一的 `lib/ai-safeguards/` 模組
3. **Layer 5 獨立設計**：審計是跨場景的監控機制

### 立即行動項目

1. ✅ 建立 `lib/ai-safeguards/` 模組
2. ✅ 修復企業參謀和部門 Agent 工具模式（高風險）
3. ✅ 執行資料庫 Migration
4. ✅ 設定統一審計 Cron Job

### 設計選擇說明

以下項目維持現狀，屬於**設計選擇而非缺陷**：
- OpenAI 相容 API：為相容性放棄部分防護
- War Room 背景分析：僅需事後審計

---

**報告結束**
