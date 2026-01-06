# EAKAP 進階知識架構系統設計
**版本：** v3.1
**建立日期：** 2026-01-01
**最後更新：** 2026-01-06
**設計目標：** 建立一套極度專業、具技術與內容門檻的知識架構系統，讓 AI Agent 能精準解讀與運用企業知識

---

## 📋 執行摘要

### 核心價值主張

本系統不僅僅是文件分類系統，而是一套**「語義知識架構引擎」**，具備以下核心能力：

#### 基礎能力（v2.0）
1. **多維度知識索引**：超越傳統分類，建立語義、時序、關聯、權重四維索引
2. **智能知識路由**：Agent 建立時自動選擇最相關的知識來源
3. **知識品質評估**：AI 自動評估知識的完整性、準確性、時效性
4. **語義知識圖譜**：建立知識之間的語義關聯，支援推理與發現
5. **知識演化追蹤**：追蹤知識的版本演進與依賴關係

#### 進階能力（v3.0 新增）
6. **知識衰減模型**：依知識類型自動計算「知識保鮮期」，避免使用過時知識
7. **反饋學習迴路**：從 Agent 使用結果學習，持續優化知識品質評分
8. **知識碎片聚合**：自動發現並整合分散的知識碎片，建構完整知識單元
9. **高效能語義搜尋**：使用 ANN 演算法實現萬級文件的即時語義搜尋
10. **主動推送機制**：知識變更時主動通知相關 Agent，避免使用過時知識

### 技術門檻

- **複雜度門檻**：多層次 AI 推理、語義分析、關聯計算
- **內容門檻**：基於 DIKW 理論、知識管理最佳實踐、企業治理標準
- **實作門檻**：需要深度理解 AI Agent 運作機制、知識圖譜技術、語義搜尋

---

## 🏗️ 系統架構設計

### 1. 多維度知識索引系統（Multi-dimensional Knowledge Index）

#### 1.1 四維索引架構

```
┌─────────────────────────────────────────────────────────┐
│           多維度知識索引系統 (MDKI)                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 語義維度     │  │ 時序維度     │  │ 關聯維度     │ │
│  │ Semantic     │  │ Temporal     │  │ Relational   │ │
│  │ - Embedding  │  │ - Created    │  │ - Framework  │ │
│  │ - Keywords   │  │ - Updated    │  │ - Dependency │ │
│  │ - Topics     │  │ - ValidUntil │  │ - Hierarchy  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 權重維度     │  │ 品質維度     │  │ 可用性維度   │ │
│  │ Weight       │  │ Quality      │  │ Availability │ │
│  │ - Relevance  │  │ - Completeness│ │ - Access     │ │
│  │ - Authority  │  │ - Accuracy   │  │ - Status     │ │
│  │ - Usage      │  │ - Freshness   │  │ - Permission │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

#### 1.2 索引實作設計

```typescript
// lib/knowledge/indexing/multi-dimensional-index.ts

/**
 * 多維度知識索引
 */
export interface MultiDimensionalKnowledgeIndex {
    // 語義維度
    semantic: {
        embedding: number[];           // 向量嵌入（1536 維）
        keywords: string[];              // 關鍵詞（TF-IDF 加權）
        topics: string[];                // 主題標籤
        entities: Entity[];              // 實體識別（人物、組織、產品等）
        concepts: Concept[];              // 概念提取（抽象概念）
    };
    
    // 時序維度
    temporal: {
        created_at: string;              // 建立時間
        updated_at: string;              // 更新時間
        valid_from: string;              // 生效時間
        valid_until: string | null;      // 失效時間
        version: string;                 // 版本號
        lifecycle_stage: LifecycleStage; // 生命週期階段
    };
    
    // 關聯維度
    relational: {
        framework_id: string | null;     // 所屬知識框架
        instance_id: string | null;      // 知識實例 ID
        parent_file_id: string | null;   // 父檔案（衍生關係）
        child_file_ids: string[];        // 子檔案（衍生關係）
        related_file_ids: string[];      // 相關檔案（語義關聯）
        dependency_chain: string[];      // 依賴鏈（知識依賴）
    };
    
    // 權重維度
    weight: {
        relevance_score: number;          // 相關度評分（0-1）
        authority_score: number;         // 權威性評分（0-1）
        usage_frequency: number;         // 使用頻率
        citation_count: number;         // 引用次數
        agent_usage_count: number;       // Agent 使用次數
    };
    
    // 品質維度
    quality: {
        completeness_score: number;      // 完整性評分（0-1）
        accuracy_score: number;          // 準確性評分（0-1）
        freshness_score: number;         // 時效性評分（0-1）
        consistency_score: number;       // 一致性評分（0-1）
        validation_status: ValidationStatus; // 驗證狀態
    };
    
    // 可用性維度
    availability: {
        access_level: AccessLevel;       // 存取層級
        department_restrictions: string[]; // 部門限制
        tag_restrictions: TagRestriction[]; // 標籤限制
        status: FileStatus;              // 檔案狀態
        dikw_level: DIKWLevel;           // DIKW 層級
    };
}
```

### 2. 智能知識路由系統（Intelligent Knowledge Routing）

#### 2.1 Agent 知識路由演算法

當 Agent 建立時，系統會自動選擇最相關的知識來源：

```typescript
// lib/knowledge/routing/agent-knowledge-router.ts

/**
 * Agent 知識路由演算法
 * 
 * 目標：根據 Agent 的任務描述，自動選擇最相關的知識來源
 */
export class AgentKnowledgeRouter {
    /**
     * 為 Agent 選擇知識來源
     */
    async routeKnowledgeForAgent(
        agentDescription: string,
        agentSkills: AgentSkill[],
        departmentId: string | null
    ): Promise<KnowledgeRoute[]> {
        
        // Step 1: 語義匹配（使用 Embedding 相似度）
        const semanticMatches = await this.findSemanticMatches(
            agentDescription,
            agentSkills,
            departmentId
        );
        
        // Step 2: 框架匹配（根據 Agent Skills 匹配知識框架）
        const frameworkMatches = await this.findFrameworkMatches(
            agentSkills,
            departmentId
        );
        
        // Step 3: DIKW 層級過濾（優先選擇 Knowledge 和 Wisdom 層級）
        const dikwFiltered = this.filterByDIKWLevel(
            [...semanticMatches, ...frameworkMatches],
            ['knowledge', 'wisdom'] // 優先層級
        );
        
        // Step 4: 品質過濾（過濾低品質知識）
        const qualityFiltered = this.filterByQuality(
            dikwFiltered,
            { minCompleteness: 0.7, minAccuracy: 0.8 }
        );
        
        // Step 5: 時效性過濾（過濾過期知識）
        const temporalFiltered = this.filterByTemporal(
            qualityFiltered,
            { maxAge: 365 } // 最多 1 年
        );
        
        // Step 6: 權重排序（綜合相關度、權威性、使用頻率）
        const ranked = this.rankByWeight(temporalFiltered, {
            relevanceWeight: 0.4,
            authorityWeight: 0.3,
            usageWeight: 0.3
        });
        
        // Step 7: 多樣性平衡（確保知識來源多樣化）
        const diversified = this.ensureDiversity(ranked, {
            maxPerFramework: 3,
            maxPerCategory: 5,
            minTotalSources: 5,
            maxTotalSources: 20
        });
        
        return diversified;
    }
}
```

### 3. 知識品質評估系統（Knowledge Quality Assessment）

#### 3.1 多維度品質評估

```typescript
// lib/knowledge/quality/quality-assessor.ts

/**
 * 知識品質評估系統
 * 
 * 自動評估知識的完整性、準確性、時效性、一致性
 */
export class KnowledgeQualityAssessor {
    /**
     * 評估知識品質
     */
    async assessQuality(
        fileId: string,
        content: string,
        metadata: any
    ): Promise<QualityAssessment> {
        
        // 1. 完整性評估
        const completeness = await this.assessCompleteness(content, metadata);
        
        // 2. 準確性評估
        const accuracy = await this.assessAccuracy(content, metadata);
        
        // 3. 時效性評估
        const freshness = await this.assessFreshness(metadata);
        
        // 4. 一致性評估
        const consistency = await this.assessConsistency(content, metadata);
        
        // 5. 結構化程度評估
        const structure = await this.assessStructure(content);
        
        // 6. 綜合評分
        const overallScore = this.calculateOverallScore({
            completeness,
            accuracy,
            freshness,
            consistency,
            structure
        });
        
        return {
            completeness,
            accuracy,
            freshness,
            consistency,
            structure,
            overall_score: overallScore,
            recommendations: this.generateRecommendations({
                completeness,
                accuracy,
                freshness,
                consistency,
                structure
            })
        };
    }
}
```

### 4. 語義知識圖譜（Semantic Knowledge Graph）

#### 4.1 知識關聯發現

```typescript
// lib/knowledge/graph/semantic-graph-builder.ts

/**
 * 語義知識圖譜建構器
 * 
 * 自動發現知識之間的語義關聯
 */
export class SemanticKnowledgeGraphBuilder {
    /**
     * 建構知識圖譜
     */
    async buildGraph(fileIds: string[]): Promise<KnowledgeGraph> {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];
        
        // 1. 建立節點（檔案、知識實例、框架）
        for (const fileId of fileIds) {
            const file = await this.getFile(fileId);
            nodes.push({
                id: fileId,
                type: 'file',
                label: file.filename,
                data: {
                    dikw_level: file.dikw_level,
                    category: file.category_id,
                    department: file.department_id
                }
            });
        }
        
        // 2. 發現語義關聯
        const semanticEdges = await this.discoverSemanticRelations(nodes);
        edges.push(...semanticEdges);
        
        // 3. 發現依賴關係
        const dependencyEdges = await this.discoverDependencies(nodes);
        edges.push(...dependencyEdges);
        
        return {
            nodes,
            edges,
            metadata: {
                node_count: nodes.length,
                edge_count: edges.length,
                density: edges.length / (nodes.length * (nodes.length - 1))
            }
        };
    }
}
```

### 5. 知識演化追蹤系統（Knowledge Evolution Tracking）

#### 5.1 版本演進追蹤

```typescript
// lib/knowledge/evolution/evolution-tracker.ts

/**
 * 知識演化追蹤系統
 * 
 * 追蹤知識的版本演進、依賴關係、影響範圍
 */
export class KnowledgeEvolutionTracker {
    /**
     * 追蹤知識演化
     */
    async trackEvolution(fileId: string): Promise<EvolutionChain> {
        // 1. 取得版本歷史
        const versions = await this.getVersionHistory(fileId);
        
        // 2. 分析變更內容
        const changes = await this.analyzeChanges(versions);
        
        // 3. 追蹤依賴影響
        const impact = await this.trackDependencyImpact(fileId);
        
        // 4. 建構演化鏈
        return {
            file_id: fileId,
            versions,
            changes,
            impact,
            evolution_path: this.buildEvolutionPath(versions, changes)
        };
    }
}
```

---

## 🆕 v3.0 進階子系統設計

### 6. 知識衰減模型（Knowledge Decay Model）

#### 6.1 設計理念

**核心問題**：不同類型的知識有不同的「保鮮期」，簡單的時間閾值無法精準判斷知識是否過時。

**解決方案**：建立依據知識類型的「衰減曲線模型」，自動計算知識的有效性分數。

#### 6.2 衰減曲線類型定義

```typescript
// lib/knowledge/decay/knowledge-decay-model.ts

export enum KnowledgeDecayType {
    STABLE = 'stable',         // 穩定型（如法規、政策）
    TECHNICAL = 'technical',   // 技術型（如 API 文件）
    MARKET = 'market',         // 市場型（如競品分析）
    EVENT = 'event',           // 事件型（如會議記錄）
    PROCEDURAL = 'procedural', // 流程型（如 SOP）
    REFERENCE = 'reference'    // 參考型（如百科知識）
}

/**
 * 衰減曲線配置表
 * 
 * 半衰期設計理念：
 * - 穩定型：法規通常 3-5 年更新，設定 1095 天（3 年）
 * - 技術型：技術迭代快，設定 365 天（1 年）
 * - 市場型：市場變化迅速，設定 90 天（3 個月）
 * - 事件型：會議記錄時效性最短，設定 30 天（1 個月）
 */
export const DECAY_CURVES: Map<KnowledgeDecayType, DecayCurve> = new Map([
    [KnowledgeDecayType.STABLE, {
        type: KnowledgeDecayType.STABLE,
        halfLife: 1095,  // 3 年
        minValidScore: 0.3,
        decayFunction: 'exponential'
    }],
    [KnowledgeDecayType.TECHNICAL, {
        type: KnowledgeDecayType.TECHNICAL,
        halfLife: 365,   // 1 年
        minValidScore: 0.4,
        decayFunction: 'exponential'
    }],
    [KnowledgeDecayType.MARKET, {
        type: KnowledgeDecayType.MARKET,
        halfLife: 90,    // 3 個月
        minValidScore: 0.5,
        decayFunction: 'exponential'
    }],
    [KnowledgeDecayType.EVENT, {
        type: KnowledgeDecayType.EVENT,
        halfLife: 30,    // 1 個月
        minValidScore: 0.3,
        decayFunction: 'exponential'
    }],
    [KnowledgeDecayType.PROCEDURAL, {
        type: KnowledgeDecayType.PROCEDURAL,
        halfLife: 548,   // 1.5 年
        minValidScore: 0.5,
        decayFunction: 'step'  // SOP 過期就是過期，沒有漸進
    }],
    [KnowledgeDecayType.REFERENCE, {
        type: KnowledgeDecayType.REFERENCE,
        halfLife: 730,   // 2 年
        minValidScore: 0.4,
        decayFunction: 'linear'
    }]
]);
```

#### 6.3 資料庫結構擴充

```sql
-- 新增欄位到 files 表
ALTER TABLE files ADD COLUMN IF NOT EXISTS decay_type VARCHAR(20) DEFAULT 'reference';
ALTER TABLE files ADD COLUMN IF NOT EXISTS decay_score DECIMAL(3,2) DEFAULT 1.0;
ALTER TABLE files ADD COLUMN IF NOT EXISTS decay_status VARCHAR(20) DEFAULT 'fresh';
ALTER TABLE files ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ DEFAULT NULL;

-- 建立索引以加速衰減狀態查詢
CREATE INDEX IF NOT EXISTS idx_files_decay_status 
    ON files(decay_status) WHERE gemini_state = 'SYNCED';
```

---

### 7. 反饋學習迴路（Feedback Learning Loop）

#### 7.1 設計理念

**核心問題**：系統只記錄知識被使用次數，但不知道使用效果好不好。

**解決方案**：建立完整的反饋收集與學習機制，讓知識品質評分能夠持續優化。

#### 7.2 反饋類型定義

```typescript
// lib/knowledge/feedback/feedback-types.ts

export enum FeedbackSource {
    USER_EXPLICIT = 'user_explicit',     // 使用者明確反饋（按讚/倒讚）
    USER_IMPLICIT = 'user_implicit',     // 使用者隱性反饋（繼續對話/重新提問）
    AGENT_SELF = 'agent_self',           // Agent 自我評估
    SYSTEM_AUDIT = 'system_audit'        // 系統審計
}

export enum FeedbackType {
    HELPFUL = 'helpful',               // 有幫助
    NOT_HELPFUL = 'not_helpful',       // 沒幫助
    OUTDATED = 'outdated',            // 資訊過時
    INACCURATE = 'inaccurate',        // 資訊不正確
    INCOMPLETE = 'incomplete',         // 資訊不完整
    IRRELEVANT = 'irrelevant',        // 與問題無關
    PERFECT = 'perfect'               // 完美回答
}
```

#### 7.3 資料庫結構

```sql
-- 反饋事件表
CREATE TABLE IF NOT EXISTS knowledge_feedback_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    
    source VARCHAR(30) NOT NULL,
    sentiment VARCHAR(10) NOT NULL,
    score DECIMAL(3,2) NOT NULL,
    feedback_type VARCHAR(30) NOT NULL,
    details JSONB DEFAULT '{}',
    context JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 新增欄位到 files 表
ALTER TABLE files ADD COLUMN IF NOT EXISTS feedback_score DECIMAL(3,2) DEFAULT 0.5;
ALTER TABLE files ADD COLUMN IF NOT EXISTS feedback_count INTEGER DEFAULT 0;
ALTER TABLE files ADD COLUMN IF NOT EXISTS positive_ratio DECIMAL(3,2) DEFAULT 0.5;
ALTER TABLE files ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE;
```

---

### 8. 知識碎片聚合（Knowledge Fragment Aggregation）

#### 8.1 設計理念

**核心問題**：企業知識往往分散在多份文件中，Agent 只能獲取片段視角。

**解決方案**：自動發現討論同一概念的文件，聚合成完整的「知識單元」。

#### 8.2 知識單元定義

```typescript
// lib/knowledge/aggregation/knowledge-unit.ts

export interface KnowledgeUnit {
    id: string;
    concept_id: string;           // 核心概念 ID
    concept_name: string;         // 概念名稱（如「員工離職流程」）
    concept_description: string;  // 概念描述
    source_files: SourceFile[];   // 組成此知識單元的文件
    synthesized_knowledge: string;  // AI 合成的統一知識
    conflicts: ConflictRecord[];    // 發現的衝突
    conflict_resolution: string;    // 衝突解決說明
    completeness_score: number;     // 知識完整度
    confidence_score: number;       // 綜合信心度
    coverage_map: CoverageMap;      // 知識覆蓋地圖
    created_at: string;
    updated_at: string;
    auto_generated: boolean;
}
```

#### 8.3 資料庫結構

```sql
-- 知識單元表
CREATE TABLE IF NOT EXISTS knowledge_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id VARCHAR(255) NOT NULL UNIQUE,
    concept_name VARCHAR(500) NOT NULL,
    concept_description TEXT,
    source_files JSONB NOT NULL DEFAULT '[]',
    synthesized_knowledge TEXT,
    conflicts JSONB DEFAULT '[]',
    conflict_resolution TEXT,
    completeness_score DECIMAL(3,2) DEFAULT 0,
    confidence_score DECIMAL(3,2) DEFAULT 0,
    coverage_map JSONB DEFAULT '{}',
    auto_generated BOOLEAN DEFAULT TRUE,
    needs_human_review BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 知識單元與文件的關聯表
CREATE TABLE IF NOT EXISTS knowledge_unit_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES knowledge_units(id) ON DELETE CASCADE,
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    contribution TEXT,
    coverage_areas JSONB DEFAULT '[]',
    weight DECIMAL(3,2) DEFAULT 1.0,
    UNIQUE(unit_id, file_id)
);
```

---

### 9. 高效能語義搜尋（High-Performance Semantic Search）

#### 9.1 設計理念

**核心問題**：兩兩比較 Embedding 的 O(n²) 演算法在萬級文件時極慢。

**解決方案**：使用 Approximate Nearest Neighbor (ANN) 演算法實現近似即時搜尋。

#### 9.2 PostgreSQL + pgvector 優化配置

```sql
-- 確保 pgvector 擴展已啟用
CREATE EXTENSION IF NOT EXISTS vector;

-- 為 content_embedding 建立 HNSW 索引（推薦用於高維向量）
CREATE INDEX IF NOT EXISTS idx_files_embedding_hnsw 
    ON files 
    USING hnsw (content_embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- 語義搜尋函數（使用 ANN 索引）
CREATE OR REPLACE FUNCTION semantic_search_ann(
    query_embedding vector(1536),
    similarity_threshold FLOAT DEFAULT 0.7,
    match_count INTEGER DEFAULT 10,
    filter_department UUID DEFAULT NULL,
    filter_category UUID DEFAULT NULL,
    filter_dikw_level TEXT DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    filename TEXT,
    similarity FLOAT,
    snippet TEXT,
    dikw_level TEXT,
    decay_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.filename,
        1 - (f.content_embedding <=> query_embedding) as similarity,
        LEFT(f.markdown_content, 200) as snippet,
        f.dikw_level,
        f.decay_score
    FROM files f
    WHERE f.gemini_state = 'SYNCED'
    AND f.content_embedding IS NOT NULL
    AND (filter_department IS NULL OR f.department_id = filter_department)
    AND (filter_category IS NULL OR f.category_id = filter_category)
    AND (filter_dikw_level IS NULL OR f.dikw_level = filter_dikw_level)
    AND 1 - (f.content_embedding <=> query_embedding) >= similarity_threshold
    ORDER BY f.content_embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
```

#### 9.3 效能對比

| 演算法 | 時間複雜度 | 10,000 檔案 | 100,000 檔案 | 精確度 |
|-------|-----------|-------------|--------------|--------|
| 暴力法 (Brute Force) | O(n²) | ~5 分鐘 | ~8 小時 | 100% |
| IVFFlat | O(n·√n) | ~3 秒 | ~30 秒 | ~95% |
| **HNSW** | O(n·log n) | **<1 秒** | **~5 秒** | **~98%** |

---

### 10. 主動推送機制（Proactive Knowledge Push）

#### 10.1 設計理念

**核心問題**：知識更新時，使用該知識的 Agent 不會自動知道。

**解決方案**：建立事件驅動的主動通知系統。

#### 10.2 通知事件類型

```typescript
// lib/knowledge/push/notification-types.ts

export enum KnowledgeNotificationType {
    // 緊急通知（需立即處理）
    KNOWLEDGE_EXPIRED = 'knowledge_expired',
    CRITICAL_UPDATE = 'critical_update',
    CONFLICT_DETECTED = 'conflict_detected',
    
    // 重要通知（建議當日處理）
    KNOWLEDGE_UPDATED = 'knowledge_updated',
    QUALITY_DEGRADATION = 'quality_degradation',
    APPROACHING_EXPIRY = 'approaching_expiry',
    
    // 資訊通知（可稍後處理）
    NEW_RELATED_KNOWLEDGE = 'new_related_knowledge',
    AGGREGATION_AVAILABLE = 'aggregation_available',
    FEEDBACK_SUMMARY = 'feedback_summary'
}
```

#### 10.3 資料庫結構

```sql
-- 通知表
CREATE TABLE IF NOT EXISTS knowledge_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(10) NOT NULL,
    affected_files UUID[] DEFAULT '{}',
    affected_agents UUID[] DEFAULT '{}',
    affected_users UUID[] DEFAULT '{}',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    suggested_actions JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES user_profiles(id)
);

-- Agent 知識來源關聯表
CREATE TABLE IF NOT EXISTS agent_knowledge_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, file_id)
);

-- 新增欄位到 agents 表
ALTER TABLE agents ADD COLUMN IF NOT EXISTS knowledge_status VARCHAR(30) DEFAULT 'up_to_date';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_knowledge_alert TIMESTAMPTZ;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS status_reason TEXT;

-- 知識更新觸發器
CREATE OR REPLACE FUNCTION notify_knowledge_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'knowledge_update',
        json_build_object(
            'file_id', NEW.id,
            'action', TG_OP,
            'updated_at', NEW.updated_at
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_knowledge_update
    AFTER INSERT OR UPDATE ON files
    FOR EACH ROW
    WHEN (NEW.gemini_state = 'SYNCED')
    EXECUTE FUNCTION notify_knowledge_update();
```

---

## 🚀 實施路線圖

### Phase 1-3: 基礎建設（已完成 ✅）

- ✅ 實作多維度知識索引系統
- ✅ 實作 Agent 知識路由系統
- ✅ 實作語義知識圖譜

### Phase 4: v3.0 進階子系統（規劃中 📋）

#### Phase 4.1: 知識時效性管理（預計 2-3 週）

| 優先序 | 功能 | 描述 | 預估工時 |
|-------|-----|------|---------|
| P0 | 知識衰減模型 | 依知識類型計算保鮮期 | 3 天 |
| P0 | 衰減類型自動推斷 | AI 分析文件類型 | 2 天 |
| P1 | 衰減狀態視覺化 | 在文件列表顯示衰減狀態 | 2 天 |
| P1 | 過期預警儀表板 | 集中顯示即將過期知識 | 3 天 |

#### Phase 4.2: 反饋學習系統（預計 3-4 週）

| 優先序 | 功能 | 描述 | 預估工時 |
|-------|-----|------|---------|
| P0 | 顯性反饋收集 | 使用者按讚/倒讚 UI | 2 天 |
| P0 | 反饋記錄與統計 | 資料庫與 API | 3 天 |
| P1 | 隱性反饋分析 | 行為模式推斷滿意度 | 5 天 |
| P1 | 學習引擎 | 從反饋調整品質評分 | 5 天 |

#### Phase 4.3: 知識聚合系統（預計 3-4 週）

| 優先序 | 功能 | 描述 | 預估工時 |
|-------|-----|------|---------|
| P0 | 概念提取 | 從文件提取核心概念 | 3 天 |
| P0 | 聚合候選發現 | 找出可整合的文件群 | 3 天 |
| P1 | 知識合成引擎 | AI 整合多份文件 | 5 天 |
| P1 | 衝突偵測 | 找出知識矛盾 | 3 天 |

#### Phase 4.4: 效能優化（預計 1-2 週）

| 優先序 | 功能 | 描述 | 預估工時 |
|-------|-----|------|---------|
| P0 | HNSW 索引建立 | pgvector 向量索引 | 1 天 |
| P0 | 語義搜尋 RPC | 優化搜尋函數 | 2 天 |
| P1 | 批量相似度計算 | 用於圖譜建構 | 2 天 |

#### Phase 4.5: 主動推送系統（預計 2-3 週）

| 優先序 | 功能 | 描述 | 預估工時 |
|-------|-----|------|---------|
| P0 | 通知資料模型 | 資料庫結構 | 1 天 |
| P0 | 知識更新觸發器 | 變更自動通知 | 2 天 |
| P1 | 通知中心 UI | 使用者通知介面 | 4 天 |

---


#### Phase 5: UX/UI Evolution (Galaxy 2.0)（規劃中 📋）

#### 5.0 全域佈局解放：全寬畫布 (Full-Width Canvas)

**核心問題**：目前的介面受限於中間窄版容器 (Centered Container)，導致「戰情中心」與「星系引力模型」缺乏足夠的展示空間，視覺上不夠震撼，操作也顯得侷促。

**解決方案**：打破傳統網頁的兩側留白，採用全螢幕寬度設計。
- **全域滿版**：將頂部導航列 (Navbar) 與主要內容區擴展至視窗邊緣 (100% Viewport Width)。
- **沉浸式體驗**：讓深色星系背景延伸至整個畫面，創造無邊際的宇宙感。
- **彈性空間**：為左側控制面板提供更寬裕的操作區，右側圖譜則擁有影院級的視覺張力。


#### 5.1 核心介面重構：戰情中心 (Control Center)

**核心問題**：純圖形介面在大量文件檢索時效率低落，操作體驗（縮放/平移）不佳。

**解決方案**：採用「雙全介面」，結合傳統列表的高效與圖譜的洞察。

- **左側：控制面板 (30% 寬度)**
  - 高效列表視圖：支援快速篩選、搜尋、排序。
  - 對焦互動 (Focus Interaction)：點擊列表項目，右側圖譜自動飛行對焦。
- **右側：星系視圖 (70% 寬度)**
  - 視覺化關聯：展示被選中項目的周邊知識。
  - 懸浮資訊卡 (Floating Details)：滑鼠懸停顯示摘要與關鍵數據。

#### 5.2 視覺演算法升級：引力星系模型 (Force-Directed Galaxy)

**核心問題**：目前的類神經網絡佈局（分層垂直排列）在節點增多時會形成無限垂直延伸的「摩天大樓」，難以瀏覽。

**解決方案**：導入 D3-Force 或各向異性力導向演算法 (Force-Directed)。

- **星系引力**：相關聯的知識節點（如同一品牌、同一主題）因引力自動聚集成團 (Cluster)。
- **語義互斥**：不相關的知識群體（如不同品牌）因斥力自動疏離，形成多星系分佈。
- **空間利用**：自動利用 3D/2D 全畫布空間，避免單一軸向過度延伸。

#### 5.3 DIKW 完整層級視覺化

**核心問題**：目前視覺上僅有 Data (藍) 與 Knowledge (綠)，缺乏 Information 與 Wisdom 層級。

**解決方案**：補全四層級定義與視覺實作。

| 層級 | 顏色 | 定義 | 實體範例 |
|-----|-----|-----|---------|
| **Data** | 🔵 藍色 | 原始文件 | 上傳的 PDF/Markdown 文件 |
| **Information** | 💠 青色 | 結構化事實 | 自動萃取的實體 (Entity)、關鍵字節點 |
| **Knowledge** | 🟢 綠色 | 結構化框架 | 價值主張畫布、SWOT 分析、知識圖譜關聯 |
| **Wisdom** | 🟣 紫色 | 決策/戰略 | Agent 產出的 Artifacts (如戰略規劃書)、決策建議 |

**實作路徑**：
1. **Information 層**：啟動 NLP Named Entity Recognition (NER)，從 Markdown 中抽取出關鍵實體作為獨立節點。
2. **Wisdom 層**：將 Agent 的輸出 (Artifacts) 視為獨立節點，連結其參考的 Knowledge 節點，形成決策支撐鏈。

---

## 🎖️ Phase 6: 企業戰情中樞 (Executive Command Center)

### 核心價值定位：從「被動儀表板」進化為「主動智慧中樞」

**核心理念**：拒絕「圖表墓地」 (Dashboard Graveyard)。
傳統戰情室往往堆砌大量數據與圖表，導致資訊過載且被忽略。
新型態的戰情中樞必須具備 **Agentic Workflow** 的特質，強調 **「AI 主動發現」** 與 **「對話式探查」**。

#### 系統定位對比

| 維度 | 傳統儀表板 (Passive) | 企業戰情中樞 (Agentic) |
|-----|-------------------|----------------------|
| **核心價值** | 呈現數據 (Data Presentation) | **主動洞察 (Active Insight)** |
| **觸發模式** | 坐等老闆查看 | **AI 主動推播異常與機會** |
| **互動深度** | 只能看，不能問 | **圖表即入口，點擊即對話** |
| **資料來源** | 必須是完美結構化數據 | **容納雜亂文件 (CSV/PDF)，AI 自動調和** |
| **決策邏輯** | 人找問題 -> 人找答案 | **AI 找問題 -> 人與 AI 共創答案** |

---

### 6.1 系統架構設計

#### 6.1.1 三層智慧架構

```
┌─────────────────────────────────────────────────────────────┐
│             🎖️ 企業戰情中樞 (Executive Command Center)          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃  Layer 1: 主動態勢感知 (Active Situational Awareness)    ┃  │
│  ┃  不只是 KPI 卡片，而是「異常」與「機會」的推播流             ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ 🎯 戰略   │ 📊 營運   │ 💰 財務   │ ⚠️ 風險   │ 🌐 情資   │  │
│  │ "落後5%!" │ "異常活躍" │ "毛利下滑" │ "合規警告" │ "對手降價" │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│                                                               │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃  Layer 2: 對話式部門情報 (Conversational Intelligence)   ┃  │
│  ┃  自動同步文件摘要 + 點擊即啟動深度對話                      ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│  ┌────────────────┬────────────────┬────────────────┐      │
│  │ 💼 業務部       │ 🏭 生產部       │ 💻 研發部       │      │
│  │ [AI 摘要串流]   │ [AI 摘要串流]   │ [AI 摘要串流]   │      │
│  │ • Q1報表(已讀)  │ • 產線事故報告   │ • 技術評估文件   │      │
│  │ [💬 詢問細節]   │ [💬 詢問細節]   │ [💬 詢問細節]   │      │
│  └────────────────┴────────────────┴────────────────┘      │
│                                                               │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃  Layer 3: 戰略預判與連結 (Strategic Foresight)           ┃  │
│  ┃  跨部門知識連結 + 模擬推演 + 決策建議                      ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🤖 AI 戰略預判 (Proactive Alerts)                      │  │
│  │ ─────────────────────────────────────────────────     │  │
│  │ 🔴 [異常] 財務部「成本上升」 與 採購部「供應商漲價」高度相關   │
│  │     → 建議立即啟動供應鏈議價會議                          │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### 6.1.2 關鍵核心：數據調和與情報層 (Data Harmonization & Intelligence Layer)

**核心問題**：
1.  **資料格式混亂**：財務部上傳的 CSV 格式每月都變，直接畫圖會崩潰。
2.  **缺乏觀點**：只存數據沒用，重點是「這代表什麼？」。

**解決方案**：在文件與戰情室之間，建立**「智慧中介層」**。

1.  **Metric Store (指標儲存庫)** - 處理「硬數據」
    *   **AI ETL**：當檔案 (CSV/Excel/PDF) 上傳，AI 自動辨識並擷取關鍵指標 (Key Metrics)。
    *   **標準化**：將 `Total Sales`, `Revenue`, `營業額` 統一映射為 `metric:revenue`。
    *   **衝突解決**：採 `Latest File Wins` 或 `Confidence Check` 機制，確保戰情室數據源單一且乾淨。

2.  **Insight Store (洞察儲存庫)** - 處理「軟情報」
    *   **摘要同步**：當文件被 AI 解讀分類後，其「摘要 (Summary)」與「關鍵發現 (Findings)」自動同步至戰情室。
    *   **主動推送**：若摘要中包含「風險」、「延遲」、「虧損」等關鍵字，提升優先級，主動推播給主管。

---

### 6.2 第一層：全局態勢感知 (5 大 KPI 模組)

#### 6.2.1 戰略執行度 (Strategy Execution)

**數據來源**：
- 從知識檔案中提取的 OKR 目標（使用 NLP 識別目標語句）
- 專案管理系統 API（若整合）
- 部門上傳的進度報告文件

**AI 計算邏輯**：
```typescript
// lib/war-room/kpi/strategy-execution.ts

export class StrategyExecutionCalculator {
    async calculateExecutionRate(userId: string): Promise<StrategyKPI> {
        // 1. 從知識庫提取本年度目標文件
        const goalDocs = await this.extractGoalDocuments(userId);

        // 2. AI 解析目標與完成狀態
        const objectives = await this.parseObjectivesWithAI(goalDocs);

        // 3. 計算完成率
        const completedCount = objectives.filter(o => o.status === 'completed').length;
        const executionRate = (completedCount / objectives.length) * 100;

        // 4. AI 生成洞察
        const insight = await this.generateInsight(objectives, executionRate);

        return {
            execution_rate: executionRate,
            total_objectives: objectives.length,
            completed: completedCount,
            on_track: objectives.filter(o => o.status === 'on_track').length,
            at_risk: objectives.filter(o => o.status === 'at_risk').length,
            ai_insight: insight,
            trend: this.calculateTrend(executionRate)
        };
    }
}
```

**視覺呈現**：
- **環形進度圖** (Radial Progress)：中央顯示總體達成率 82%
- **季度里程碑時間軸**：Q1 ✅ → Q2 🔄 → Q3 ⏸️ → Q4 📅
- **AI 洞察氣泡**：「Q1 超前 5%，建議提早啟動 Q2 關鍵專案」

---

#### 6.2.2 營運健康度 (Operational Health)

**數據來源**：
- 各部門文件上傳頻率與活躍度
- Agent 使用率與對話品質
- 知識庫更新頻率
- 跨部門知識引用次數（從語義圖譜取得）

**健康度評分公式**：
```typescript
// lib/war-room/kpi/operational-health.ts

export class OperationalHealthCalculator {
    async calculateHealthScore(userId: string): Promise<OperationalKPI> {
        const departments = await this.getUserDepartments(userId);

        let totalScore = 0;
        const deptScores: DepartmentScore[] = [];

        for (const dept of departments) {
            // 1. 文件活躍度 (40%)
            const docActivity = await this.calculateDocActivity(dept.id);

            // 2. Agent 使用率 (30%)
            const agentUsage = await this.calculateAgentUsage(dept.id);

            // 3. 知識流動性 (20%)：跨部門引用次數
            const knowledgeFlow = await this.calculateKnowledgeFlow(dept.id);

            // 4. 知識品質 (10%)
            const qualityScore = await this.calculateAverageQuality(dept.id);

            const deptScore =
                docActivity * 0.4 +
                agentUsage * 0.3 +
                knowledgeFlow * 0.2 +
                qualityScore * 0.1;

            deptScores.push({
                department_id: dept.id,
                department_name: dept.name,
                score: deptScore,
                metrics: { docActivity, agentUsage, knowledgeFlow, qualityScore }
            });

            totalScore += deptScore;
        }

        const overallHealth = totalScore / departments.length;

        return {
            overall_health: overallHealth,
            status: this.getHealthStatus(overallHealth),
            department_scores: deptScores,
            knowledge_flow_heatmap: await this.generateFlowHeatmap(departments),
            ai_alerts: await this.detectAnomalies(deptScores)
        };
    }

    private getHealthStatus(score: number): string {
        if (score >= 0.8) return 'excellent';
        if (score >= 0.6) return 'good';
        if (score >= 0.4) return 'fair';
        return 'needs_attention';
    }
}
```

**視覺呈現**：
- **雷達圖**：各部門活躍度比較
- **知識流動熱力圖**：部門間知識引用關係（力導向圖）
- **異常偵測**：「財務部本週上傳量 ↓30%，可能需關注」

---

#### 6.2.3 財務狀態 (Financial Status)

**數據來源**：
- 財務報表文件（AI 自動解析）
- 會計系統 API（若整合）
- 預算 vs 實際支出對比

**AI 財務分析**：
```typescript
// lib/war-room/kpi/financial-status.ts

export class FinancialStatusAnalyzer {
    async analyzeFinancials(userId: string): Promise<FinancialKPI> {
        // 1. 提取最新財務文件
        const financialDocs = await this.extractFinancialDocuments(userId);

        // 2. AI 解析關鍵數據
        const parsedData = await this.parseFinancialsWithAI(financialDocs);

        // 3. 計算關鍵指標
        const revenue = parsedData.revenue;
        const expenses = parsedData.expenses;
        const budgetVsActual = this.calculateBudgetVariance(parsedData);
        const burnRate = this.calculateBurnRate(parsedData);
        const runway = this.calculateRunway(parsedData);

        // 4. 預測未來趨勢
        const forecast = await this.generateForecast(parsedData);

        // 5. AI 風險偵測
        const risks = await this.detectFinancialRisks(parsedData);

        return {
            revenue,
            expenses,
            profit_margin: (revenue - expenses) / revenue,
            budget_variance: budgetVsActual,
            burn_rate: burnRate,
            runway_months: runway,
            forecast_next_quarter: forecast,
            risks,
            ai_insight: await this.generateFinancialInsight(parsedData, risks)
        };
    }
}
```

**視覺呈現**：
- **折線圖 + 預測區間**：營收趨勢（實際 vs 預算 vs AI 預測）
- **燃燒率儀表板**：資金可用月數（Runway）
- **成本結構樹狀圖**：各部門支出佔比

---

#### 6.2.4 風險預警 (Risk Alerts)

**風險來源**：
```typescript
// lib/war-room/kpi/risk-alerts.ts

export class RiskAlertSystem {
    async detectRisks(userId: string): Promise<RiskKPI> {
        const risks: Risk[] = [];

        // 1. 知識時效性風險
        const knowledgeRisks = await this.detectKnowledgeDecay(userId);
        risks.push(...knowledgeRisks);

        // 2. 外部新聞情資風險（供應鏈、競爭對手、法規）
        const externalRisks = await this.detectExternalRisks(userId);
        risks.push(...externalRisks);

        // 3. 合規文件到期風險
        const complianceRisks = await this.detectComplianceExpiry(userId);
        risks.push(...complianceRisks);

        // 4. 內部知識衝突
        const conflictRisks = await this.detectKnowledgeConflicts(userId);
        risks.push(...conflictRisks);

        // 5. 部門異常活動
        const operationalRisks = await this.detectOperationalAnomalies(userId);
        risks.push(...operationalRisks);

        // 排序：按影響度 × 緊急度
        risks.sort((a, b) => (b.impact * b.urgency) - (a.impact * a.urgency));

        return {
            total_risks: risks.length,
            critical: risks.filter(r => r.level === 'critical').length,
            high: risks.filter(r => r.level === 'high').length,
            medium: risks.filter(r => r.level === 'medium').length,
            risks: risks.slice(0, 10), // 顯示前 10 個最重要
            risk_matrix: this.generateRiskMatrix(risks),
            timeline: this.generateRiskTimeline(risks)
        };
    }
}
```

**視覺呈現**：
- **風險矩陣**：影響度 (Y 軸) vs 可能性 (X 軸)
- **時間軸預警**：未來 7/30/90 天風險事件
- **風險卡片**：
  ```
  🔴 高風險 | 15 天後
  ISO 認證即將到期，需立即申請續期
  [查看文件] [啟動流程] [委派負責人]
  ```

---

#### 6.2.5 外部情資中心 (External Intelligence)

**核心功能**：使用者自訂監控主題，AI 自動抓取與分析相關新聞

**資料模型**：
```typescript
// lib/war-room/intelligence/watch-topic.ts

export interface WatchTopic {
    id: string;
    user_id: string;
    name: string;                    // 如「半導體供應鏈動態」
    keywords: string[];              // ['台積電', '晶片短缺', 'ASML']
    news_sources: string[];          // ['Bloomberg', 'Reuters', 'TechCrunch']
    competitors: string[];           // 競爭對手名單
    suppliers: string[];             // 供應商名單
    customers: string[];             // 關鍵客戶名單
    risk_threshold: 'low' | 'medium' | 'high'; // 只推送達標的新聞
    notification_enabled: boolean;
    created_at: string;
}

export interface IntelligenceNews {
    id: string;
    topic_id: string;
    title: string;
    source: string;
    url: string;
    published_at: string;

    // AI 分析結果
    relevance_score: number;         // 0-1，與業務的相關度
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    impact_areas: string[];          // ['supply_chain', 'pricing', 'competition']
    sentiment: 'positive' | 'neutral' | 'negative';
    ai_summary: string;              // 100 字摘要
    key_points: string[];            // 3-5 個重點
    affected_entities: {             // 影響的實體
        competitors?: string[];
        suppliers?: string[];
        customers?: string[];
    };

    // 使用者互動
    is_read: boolean;
    is_bookmarked: boolean;
    user_notes?: string;
}
```

**AI 新聞分析流程**：
```typescript
// lib/war-room/intelligence/news-analyzer.ts

export class NewsIntelligenceAnalyzer {
    /**
     * 定時任務：每小時抓取與分析新聞
     */
    async fetchAndAnalyzeNews() {
        const topics = await this.getAllActiveTopics();

        for (const topic of topics) {
            // 1. 從 NewsAPI / Google News 抓取
            const rawNews = await this.fetchNewsFromAPIs(topic);

            // 2. AI 過濾相關性
            const relevantNews = await this.filterByRelevance(rawNews, topic);

            // 3. AI 深度分析
            for (const news of relevantNews) {
                const analysis = await this.analyzeWithAI(news, topic);

                // 4. 儲存到資料庫
                await this.saveIntelligence({
                    ...news,
                    ...analysis,
                    topic_id: topic.id
                });

                // 5. 高風險新聞立即推送
                if (analysis.risk_level === 'critical' || analysis.risk_level === 'high') {
                    await this.sendInstantNotification(topic.user_id, news, analysis);
                }
            }
        }
    }

    /**
     * AI 分析單一新聞
     */
    private async analyzeWithAI(
        news: RawNews,
        topic: WatchTopic
    ): Promise<NewsAnalysis> {
        const prompt = `
你是企業情報分析專家。請分析以下新聞對企業的影響：

【新聞內容】
標題：${news.title}
來源：${news.source}
內容：${news.content}

【企業背景】
監控主題：${topic.name}
關注關鍵字：${topic.keywords.join(', ')}
競爭對手：${topic.competitors.join(', ')}
供應商：${topic.suppliers.join(', ')}
關鍵客戶：${topic.customers.join(', ')}

請以 JSON 格式回覆：
{
  "relevance_score": 0-1 之間的數字,
  "risk_level": "low" | "medium" | "high" | "critical",
  "impact_areas": ["supply_chain", "pricing", "competition", "regulation", "technology"],
  "sentiment": "positive" | "neutral" | "negative",
  "ai_summary": "100字內的摘要",
  "key_points": ["重點1", "重點2", "重點3"],
  "affected_entities": {
    "competitors": ["受影響的競爭對手"],
    "suppliers": ["受影響的供應商"],
    "customers": ["受影響的客戶"]
  },
  "recommended_actions": ["建議的應對措施"]
}
        `;

        const response = await this.geminiAPI.generateContent(prompt);
        return JSON.parse(response);
    }
}
```

**視覺呈現**：
```
┌─────────────────────────────────────────────────────────┐
│ 🌐 外部情資中心 (5 則重要更新)                           │
│ [⚙️ 管理監控主題]                                        │
├─────────────────────────────────────────────────────────┤
│ 🔴 緊急 | 30 分鐘前 | 供應鏈風險                         │
│ 供應商 XYZ 宣布停產關鍵組件 ABC-123                      │
│ ────────────────────────────────────────────────────    │
│ 📍 影響領域：供應鏈、生產計畫                            │
│ 💡 AI 建議：                                             │
│    1. 立即聯繫供應商 B 詢問替代方案                      │
│    2. 評估庫存可支撐天數（預估 45 天）                   │
│    3. 通知生產部調整 Q2 排程                             │
│ [🔗 查看新聞] [💬 詢問 AI] [✅ 標記已處理]               │
├─────────────────────────────────────────────────────────┤
│ 🟡 重要 | 2 小時前 | 競爭動態                            │
│ 競爭對手推出低價方案，價格比我們低 20%                   │
│ ────────────────────────────────────────────────────    │
│ 📍 影響領域：定價策略、市場佔有率                        │
│ 💡 AI 建議：                                             │
│    1. 分析對方成本結構（可能犧牲利潤搶市場）             │
│    2. 評估是否跟進降價 vs 強化差異化                     │
│ [🔗 查看新聞] [💬 詢問 AI] [📊 競品分析]                │
└─────────────────────────────────────────────────────────┘
```

**使用者設定介面**：
```
┌─────────────────────────────────────────────────────────┐
│ ⚙️ 管理情資監控主題                                      │
├─────────────────────────────────────────────────────────┤
│ [+ 新增監控主題]                                         │
│                                                          │
│ 📌 半導體供應鏈動態                    [✏️ 編輯] [🗑️ 刪除]│
│    關鍵字：台積電, 晶片短缺, ASML                        │
│    供應商：XYZ Corp, ABC Ltd                             │
│    風險閾值：🟡 中等以上                                 │
│    本週新聞：12 則（3 則高風險）                         │
│                                                          │
│ 📌 AI 技術趨勢                         [✏️ 編輯] [🗑️ 刪除]│
│    關鍵字：GPT, Claude, LLM, AI Agent                   │
│    競爭對手：OpenAI, Google, Microsoft                  │
│    風險閾值：🟢 全部顯示                                 │
│    本週新聞：8 則（0 則高風險）                          │
└─────────────────────────────────────────────────────────┘
```

---

### 6.3 第二層：部門戰情模組

#### 部門卡片資料模型

```typescript
// lib/war-room/department/department-card.ts

export interface DepartmentCard {
    department_id: string;
    department_name: string;
    department_icon: string;

    // 即時統計
    stats: {
        total_files: number;
        files_updated_today: number;
        files_updated_this_week: number;
        active_agents: number;
        total_conversations_this_week: number;
        knowledge_health_score: number; // 0-100
    };

    // AI 自動生成的部門日報與情報流
    daily_brief: {
        generated_at: string;
        // 來自 Insight Store 的同步摘要
        synced_insights: Array<{
            source_file: string;    // 例如 "2024_Q1_Revenue.csv"
            summary: string;        // "營收成長 15%，但毛利下降 2%"
            detected_at: string;
            significance: 'high' | 'medium' | 'low';
        }>;
        top_3_updates: string[];        // 最重要的 3 個更新
        key_metrics: Array<{
            label: string;
            value: string;
            trend: 'up' | 'down' | 'stable';
            change_percentage?: number;
            source_id?: string;     // 連結回 Metric Store
        }>;
        urgent_items: string[];         // 需立即關注
        ai_summary: string;             // 100 字部門現況總結
    };

    // 互動功能
    actions: {
        start_conversation: boolean;
        view_full_report: boolean;
        download_pdf: boolean;
        view_knowledge_graph: boolean;
    };
}
```

#### AI 部門日報生成器

```typescript
// lib/war-room/department/daily-brief-generator.ts

export class DepartmentDailyBriefGenerator {
    /**
     * 為單一部門生成 AI 日報
     */
    async generateDailyBrief(departmentId: string): Promise<DailyBrief> {
        // 1. 取得部門近 7 天的所有文件更新
        const recentFiles = await this.getRecentFiles(departmentId, 7);

        // 2. 取得部門 Agent 的對話記錄
        const conversations = await this.getRecentConversations(departmentId, 7);

        // 3. 計算關鍵指標變化
        const metrics = await this.calculateMetrics(departmentId);

        // 4. AI 分析：提取重點
        const analysis = await this.analyzeWithAI(recentFiles, conversations, metrics);

        return {
            generated_at: new Date().toISOString(),
            top_3_updates: analysis.top_updates,
            key_metrics: metrics,
            urgent_items: analysis.urgent_items,
            ai_summary: analysis.summary
        };
    }

    /**
     * AI 分析部門動態
     */
    private async analyzeWithAI(
        files: File[],
        conversations: Conversation[],
        metrics: Metric[]
    ): Promise<AIAnalysis> {
        const prompt = `
你是企業管理顧問。請分析以下部門的本週動態並生成簡報：

【本週新增/更新文件】
${files.map(f => `- ${f.filename} (${f.category})`).join('\n')}

【本週 Agent 對話重點】
${conversations.map(c => `- ${c.summary}`).join('\n')}

【關鍵指標變化】
${metrics.map(m => `- ${m.label}: ${m.value} (${m.trend} ${m.change_percentage}%)`).join('\n')}

請以 JSON 格式回覆：
{
  "top_updates": ["最重要的更新1", "更新2", "更新3"],
  "urgent_items": ["需立即關注的事項"],
  "summary": "100字內的部門現況總結，專業且精煉",
  "insights": ["洞察1", "洞察2"]
}
        `;

        const response = await this.geminiAPI.generateContent(prompt);
        return JSON.parse(response);
    }
}
```

#### 對話式深入探查 (Conversational Drill-Down)

當使用者點擊「💬 對話」按鈕：

```typescript
// lib/war-room/department/conversation-modal.ts

export class DepartmentConversationModal {
    /**
     * 啟動部門對話（自動載入該部門所有知識）
     */
    async startConversation(departmentId: string): Promise<ConversationSession> {
        // 1. 取得部門所有文件
        const departmentFiles = await this.getDepartmentFiles(departmentId);

        // 2. 建立臨時 Agent（預載入部門知識）
        const tempAgent = await this.createDepartmentAgent(departmentId, departmentFiles);

        // 3. AI 生成建議問題
        const suggestedQuestions = await this.generateSuggestedQuestions(
            departmentId,
            departmentFiles
        );

        return {
            session_id: generateSessionId(),
            agent_id: tempAgent.id,
            department_id: departmentId,
            suggested_questions: suggestedQuestions,
            context_loaded: true
        };
    }

    /**
     * AI 生成建議問題
     */
    private async generateSuggestedQuestions(
        departmentId: string,
        files: File[]
    ): Promise<string[]> {
        const recentUpdates = files.slice(0, 5);

        const prompt = `
根據以下部門最近的文件更新，生成 5 個高階主管可能想問的問題：

【最近更新】
${recentUpdates.map(f => `- ${f.filename}`).join('\n')}

要求：
1. 問題要聚焦於決策支援（不是細節查詢）
2. 涵蓋趨勢分析、風險識別、機會發現
3. 每個問題不超過 20 字

範例：
- 本月業績下滑的主要原因是什麼？
- 哪些產品線表現最好？
- 競品分析中最大的威脅是什麼？
        `;

        const response = await this.geminiAPI.generateContent(prompt);
        return this.parseQuestions(response);
    }
}
```

**對話介面設計**：

```
┌─────────────────────────────────────────────────────────┐
│ 💬 與業務部對話                              [✕ 關閉]     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 🤖 已載入業務部的 23 份文件，您可以直接詢問任何問題     │
│                                                          │
│ 💡 建議問題：                                            │
│ ┌──────────────────────────────────────────────────┐   │
│ │ • 本月業績達成率為何？主要貢獻來自哪些產品？      │   │
│ │ • 本週簽約的大客戶 ABC，合約內容重點是什麼？     │   │
│ │ • 競品分析報告中，對手的最大優勢是什麼？         │   │
│ │ • 客戶反饋中最常提到的痛點是什麼？               │   │
│ │ • 預測 Q2 能否達成目標？                          │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 👤 您的問題：                                       │ │
│ │ [                                                  ]│ │
│ │                                            [📤 送出]│ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ 🔍 引用來源會自動標註在回答中                            │
└─────────────────────────────────────────────────────────┘
```

---

### 6.4 第三層：AI 智能洞察

#### 跨部門知識連結 (Cross-Department Insights)

```typescript
// lib/war-room/insights/cross-department-linker.ts

export class CrossDepartmentInsightEngine {
    /**
     * 發現跨部門的知識連結與機會
     */
    async discoverCrossDepartmentInsights(userId: string): Promise<Insight[]> {
        const insights: Insight[] = [];

        // 1. 取得所有部門最近的文件
        const departments = await this.getUserDepartments(userId);
        const recentFilesByDept = new Map<string, File[]>();

        for (const dept of departments) {
            recentFilesByDept.set(
                dept.id,
                await this.getRecentFiles(dept.id, 7)
            );
        }

        // 2. 兩兩比較部門，尋找語義關聯
        for (let i = 0; i < departments.length; i++) {
            for (let j = i + 1; j < departments.length; j++) {
                const deptA = departments[i];
                const deptB = departments[j];

                const filesA = recentFilesByDept.get(deptA.id) || [];
                const filesB = recentFilesByDept.get(deptB.id) || [];

                // 3. AI 分析關聯性
                const connections = await this.findConnections(
                    deptA, filesA,
                    deptB, filesB
                );

                insights.push(...connections);
            }
        }

        // 4. 按重要性排序
        insights.sort((a, b) => b.importance_score - a.importance_score);

        return insights.slice(0, 5); // 顯示前 5 個最重要
    }

    /**
     * AI 分析兩部門間的知識連結
     */
    private async findConnections(
        deptA: Department, filesA: File[],
        deptB: Department, filesB: File[]
    ): Promise<Insight[]> {
        const prompt = `
你是企業戰略顧問。請分析以下兩個部門的最新動態，找出潛在的協作機會或風險：

【${deptA.name}】
${filesA.map(f => `- ${f.filename}: ${f.ai_summary}`).join('\n')}

【${deptB.name}】
${filesB.map(f => `- ${f.filename}: ${f.ai_summary}`).join('\n')}

請找出：
1. 兩部門資訊的關聯性（如研發新技術可應用於業務推廣）
2. 潛在的協作機會
3. 資訊不一致或衝突

以 JSON 格式回覆（如無發現則回傳空陣列）：
[
  {
    "type": "opportunity" | "risk" | "conflict",
    "title": "簡短標題（不超過 30 字）",
    "description": "詳細說明",
    "departments": ["${deptA.id}", "${deptB.id}"],
    "related_files": ["file_id_1", "file_id_2"],
    "importance_score": 0-1,
    "recommended_action": "建議行動"
  }
]
        `;

        const response = await this.geminiAPI.generateContent(prompt);
        return JSON.parse(response);
    }
}
```

#### 戰略建議引擎 (Strategy Recommendation Engine)

```typescript
// lib/war-room/insights/strategy-recommender.ts

export class StrategyRecommendationEngine {
    /**
     * 生成本週戰略建議
     */
    async generateWeeklyRecommendations(userId: string): Promise<Recommendation[]> {
        const recommendations: Recommendation[] = [];

        // 1. 從各模組收集洞察
        const riskInsights = await this.getRiskInsights(userId);
        const opportunityInsights = await this.getOpportunityInsights(userId);
        const crossDeptInsights = await this.getCrossDeptInsights(userId);
        const externalInsights = await this.getExternalInsights(userId);

        // 2. AI 綜合分析，生成戰略建議
        const strategicRecommendations = await this.synthesizeRecommendations([
            ...riskInsights,
            ...opportunityInsights,
            ...crossDeptInsights,
            ...externalInsights
        ]);

        return strategicRecommendations;
    }

    private async synthesizeRecommendations(
        insights: Insight[]
    ): Promise<Recommendation[]> {
        const prompt = `
你是企業戰略顧問。基於以下洞察，生成 3-5 個戰略建議：

【洞察彙總】
${insights.map(i => `[${i.type}] ${i.title}: ${i.description}`).join('\n\n')}

要求：
1. 建議要可執行（不是空泛的「加強XXX」）
2. 標註優先級（高/中/低）
3. 說明預期效益
4. 列出依據的檔案來源

以 JSON 格式回覆：
[
  {
    "priority": "high" | "medium" | "low",
    "category": "risk_mitigation" | "opportunity" | "efficiency" | "innovation",
    "title": "建議標題",
    "problem": "解決什麼問題或抓住什麼機會",
    "recommendation": "具體建議行動",
    "expected_benefit": "預期效益",
    "evidence_files": ["file_id_1", "file_id_2"],
    "next_steps": ["步驟1", "步驟2"]
  }
]
        `;

        const response = await this.geminiAPI.generateContent(prompt);
        return JSON.parse(response);
    }
}
```

**視覺呈現**：
```
┌──────────────────────────────────────────────────────┐
│ 🤖 本週 AI 戰略建議 (3 項)                            │
├──────────────────────────────────────────────────────┤
│ 🔴 [高優先級] 供應鏈風險緩解                          │
│ ──────────────────────────────────────────────────   │
│ 📌 問題：供應商 A 價格上漲 15%，影響 Q2 成本          │
│ 💡 建議：                                             │
│    1. 聯繫供應商 B 與 C 詢價（預估可降低 8% 成本）    │
│    2. 評估提前採購 3 個月庫存以鎖定價格               │
│    3. 研發部評估替代材料可行性                        │
│ 📊 預期效益：節省 $50K 成本，降低供應風險             │
│ 📁 依據：採購部_供應商報價單.pdf、財務部_成本分析.xlsx│
│                                                       │
│ [✅ 標記執行中] [📅 設定提醒] [💬 討論] [⏭️ 延後]     │
├──────────────────────────────────────────────────────┤
│ 🟡 [中優先級] 產品創新機會                            │
│ ──────────────────────────────────────────────────   │
│ 📌 機會：客戶詢問「AI 整合」關鍵字增長 60% (本週)     │
│ 💡 建議：                                             │
│    1. 研發部評估在現有產品加入 AI 功能的技術可行性    │
│    2. 業務部調查客戶具體需求與付費意願               │
│    3. 產品部規劃 Roadmap，Q3 推出 MVP                │
│ 📊 預期效益：開拓新市場，預估增加 15% 營收            │
│ 📁 依據：業務部_客戶需求分析.pdf、研發部_技術評估.md │
│                                                       │
│ [✅ 標記執行中] [📅 設定提醒] [💬 討論] [⏭️ 延後]     │
└──────────────────────────────────────────────────────┘
```

---

### 6.5 權限分級設計

```typescript
// lib/war-room/permissions/access-control.ts

export enum WarRoomAccessLevel {
    DENIED = 'denied',           // 無權限
    DEPARTMENT = 'department',   // 部門主管：只能看本部門
    EXECUTIVE = 'executive',     // C-Level：可看所有部門
    OWNER = 'owner'              // 企業主：完整控制
}

export class WarRoomAccessControl {
    async checkAccess(userId: string): Promise<WarRoomAccessLevel> {
        const user = await this.getUserProfile(userId);

        // 企業主
        if (user.role === 'owner') {
            return WarRoomAccessLevel.OWNER;
        }

        // C-Level 高階主管
        if (['ceo', 'cfo', 'cto', 'coo'].includes(user.role)) {
            return WarRoomAccessLevel.EXECUTIVE;
        }

        // 部門主管
        if (user.is_department_head) {
            return WarRoomAccessLevel.DEPARTMENT;
        }

        // 一般員工無權限
        return WarRoomAccessLevel.DENIED;
    }

    async filterVisibleDepartments(
        userId: string,
        allDepartments: Department[]
    ): Promise<Department[]> {
        const accessLevel = await this.checkAccess(userId);

        if (accessLevel === WarRoomAccessLevel.OWNER ||
            accessLevel === WarRoomAccessLevel.EXECUTIVE) {
            return allDepartments; // 可見所有部門
        }

        if (accessLevel === WarRoomAccessLevel.DEPARTMENT) {
            const user = await this.getUserProfile(userId);
            const userDept = allDepartments.find(d => d.id === user.department_id);

            if (!userDept) return [];

            // 可見本部門 + 相關部門（摘要模式）
            return allDepartments.filter(d =>
                d.id === userDept.id ||
                userDept.related_departments.includes(d.id)
            );
        }

        return []; // 無權限
    }
}

/**
 * 6.1.5 數據調和與情報層實作 (Metric & Insight Store)
 */

// lib/war-room/intelligence/metric-store.ts

export interface MetricDefinition {
    id: string;               // e.g., 'finance_revenue'
    name: string;             // '月營收'
    unit: string;             // 'USD', 'NTD', 'Count'
    granularity: 'daily' | 'monthly' | 'quarterly';
    keywords: string[];       // ['Revenue', 'Sales', '營業額']
    conflict_policy: 'latest_wins' | 'human_review';
}

export interface MetricValue {
    id: string;
    metric_id: string;
    timestamp: string;        // 數據所屬時間
    value: number;
    dimensions: Record<string, string>; // { department: 'sales', region: 'asia' }
    source_file_id: string;
    confidence: number;
    is_active: boolean;
}

export interface InsightSnippet {
    id: string;
    source_file_id: string;
    department_id: string;
    content: string;         // AI 生成的短評
    tags: string[];          // ['risk', 'opportunity', 'financial']
    significance: number;    // 0-1
    created_at: string;
}

```

### 6.1.6 AI ETL 數據調和引擎 (AI-Driven ETL Engine)

這是不讓戰情室崩潰的核心邏輯。

```typescript
// lib/war-room/etl/ai-metric-etl.ts

export class AIMetricETLEngine {
    /**
     * 核心流程：從異質文件萃取標準指標
     * @param fileId 上傳的文件 ID
     */
    async processFileForMetrics(fileId: string): Promise<ETLResult> {
        // 1. 意圖識別：這份文件包含關鍵指標嗎？
        const fileContent = await this.getFileContent(fileId);
        const intent = await this.identifyMetricIntent(fileContent);
        
        if (!intent.hasMetrics) {
            return { status: 'skipped', reason: 'no_metrics_found' };
        }

        // 2. 獲取指標定義 (Schema)
        const definitions = await this.getMetricDefinitions(intent.detectedMetricTypes);

        // 3. AI 映射與萃取 (The "Magic" Step)
        // 讓 LLM 將 "csv_col_A", "pdf_table_row_2" 轉換為標準 metric_id
        const extractedMetrics = await this.extractAndMap(fileContent, definitions);

        // 4. 清洗與衝突檢測
        const cleansedMetrics = await this.cleanseAndResolveConflicts(extractedMetrics);

        // 5. 載入至 Metric Store
        await this.loadToStore(cleansedMetrics);

        return { status: 'success', count: cleansedMetrics.length };
    }

    /**
     * Step 4: 清洗與衝突檢測邏輯
     */
    private async cleanseAndResolveConflicts(
        metrics: RawMetricValue[]
    ): Promise<MetricValue[]> {
        const results: MetricValue[] = [];

        for (const m of metrics) {
            // A. 檢查是否存在舊數據 (例如: 1月營收)
            const existing = await this.metricStore.find({
                metric_id: m.metric_id,
                timestamp: m.timestamp,
                dimensions: m.dimensions
            });

            if (existing) {
                // B. 衝突解決策略：Latest Wins
                await this.metricStore.softDelete(existing.id);
                console.log(`[ETL] Overwriting metric ${m.metric_id} from ${existing.source_file_id}`);
            }

            // C. 異常值偵測 (Anomaly Detection)
            const isAnomaly = await this.detectAnomaly(m);
            if (isAnomaly) {
                // 標記為待審核，不直接生效
                m.is_active = false; 
                await this.createAlert('metric_anomaly', m);
            }

            results.push(m);
        }

        return results;
    }
}
```

---

### 6.6 資料庫結構

```sql
-- 戰情室配置表
CREATE TABLE IF NOT EXISTS war_room_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,

    -- 外部情資監控主題
    watch_topics JSONB DEFAULT '[]',

    -- 儀表板佈局偏好
    layout_config JSONB DEFAULT '{
        "kpi_order": ["strategy", "operations", "financial", "risk", "intelligence"],
        "department_display_mode": "grid",
        "show_ai_insights": true
    }',

    -- 通知偏好
    notification_preferences JSONB DEFAULT '{
        "email_daily_summary": true,
        "push_critical_risks": true,
        "push_high_opportunities": false
    }',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 指標定義表 (Metric Store Definitions)
CREATE TABLE IF NOT EXISTS metric_definitions (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'finance_revenue'
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20),
    granularity VARCHAR(20),
    keywords JSONB DEFAULT '[]',
    conflict_policy VARCHAR(20) DEFAULT 'latest_wins'
);

-- 指標數值表 (Metric Store Values)
CREATE TABLE IF NOT EXISTS metric_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_id VARCHAR(50) REFERENCES metric_definitions(id),
    value DECIMAL(20, 4) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL, -- 數據時間點
    dimensions JSONB DEFAULT '{}',  -- 維度
    
    source_file_id UUID REFERENCES files(id),
    confidence DECIMAL(3, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_metrics_query (metric_id, timestamp, is_active)
);

-- 洞察片段表 (Insight Store)
CREATE TABLE IF NOT EXISTS insight_snippets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_file_id UUID REFERENCES files(id),
    department_id UUID REFERENCES departments(id),
    
    content TEXT NOT NULL,
    tags JSONB DEFAULT '[]',
    significance DECIMAL(3, 2) DEFAULT 0.5, -- 重要性
    
    is_pushed BOOLEAN DEFAULT FALSE, -- 是否已推播
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_insights_dept (department_id, created_at DESC)
);

-- 外部新聞情資表
CREATE TABLE IF NOT EXISTS external_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    topic_id VARCHAR(255) NOT NULL,

    -- 新聞基本資訊
    title TEXT NOT NULL,
    source VARCHAR(255) NOT NULL,
    url TEXT,
    content TEXT,
    published_at TIMESTAMPTZ NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),

    -- AI 分析結果
    relevance_score DECIMAL(3,2) DEFAULT 0,
    risk_level VARCHAR(10),
    impact_areas JSONB DEFAULT '[]',
    sentiment VARCHAR(10),
    ai_summary TEXT,
    key_points JSONB DEFAULT '[]',
    affected_entities JSONB DEFAULT '{}',
    recommended_actions JSONB DEFAULT '[]',

    -- 使用者互動
    is_read BOOLEAN DEFAULT FALSE,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    user_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',

    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    INDEX idx_intelligence_user_topic (user_id, topic_id),
    INDEX idx_intelligence_risk (risk_level) WHERE status = 'pending',
    INDEX idx_intelligence_published (published_at DESC)
);

-- 部門日報表
CREATE TABLE IF NOT EXISTS department_daily_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    brief_date DATE NOT NULL,

    -- AI 生成內容
    top_updates JSONB DEFAULT '[]',
    key_metrics JSONB DEFAULT '[]',
    urgent_items JSONB DEFAULT '[]',
    ai_summary TEXT,
    insights JSONB DEFAULT '[]',

    -- 統計數據
    stats JSONB DEFAULT '{
        "total_files": 0,
        "files_updated_today": 0,
        "active_agents": 0,
        "conversations_count": 0,
        "knowledge_health_score": 0
    }',

    generated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(department_id, brief_date)
);

-- 戰略建議表
CREATE TABLE IF NOT EXISTS strategic_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,

    priority VARCHAR(10) NOT NULL,
    category VARCHAR(30) NOT NULL,
    title TEXT NOT NULL,
    problem TEXT,
    recommendation TEXT NOT NULL,
    expected_benefit TEXT,
    evidence_files UUID[] DEFAULT '{}',
    next_steps JSONB DEFAULT '[]',

    -- 使用者互動
    status VARCHAR(20) DEFAULT 'pending',
    assigned_to UUID REFERENCES user_profiles(id),
    due_date DATE,
    completed_at TIMESTAMPTZ,
    user_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    INDEX idx_recommendations_user_week (user_id, week_start_date),
    INDEX idx_recommendations_status (status)
);

-- 跨部門洞察表
CREATE TABLE IF NOT EXISTS cross_department_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

    type VARCHAR(20) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    departments UUID[] DEFAULT '{}',
    related_files UUID[] DEFAULT '{}',
    importance_score DECIMAL(3,2) DEFAULT 0,
    recommended_action TEXT,

    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,

    INDEX idx_insights_user (user_id),
    INDEX idx_insights_importance (importance_score DESC)
);
```

---

### 6.7 API 端點規劃

| 端點 | 方法 | 用途 |
|-----|-----|-----|
| `/api/war-room/overview` | GET | 取得戰情室總覽（5 大 KPI） |
| `/api/war-room/kpi/strategy` | GET | 戰略執行度詳細數據 |
| `/api/war-room/kpi/operations` | GET | 營運健康度詳細數據 |
| `/api/war-room/kpi/financial` | GET | 財務狀態詳細數據 |
| `/api/war-room/kpi/risks` | GET | 風險預警詳細數據 |
| `/api/war-room/intelligence` | GET | 外部情資列表 |
| `/api/war-room/intelligence/topics` | GET/POST | 管理監控主題 |
| `/api/war-room/intelligence/:id/analyze` | POST | 重新分析單一新聞 |
| `/api/war-room/departments` | GET | 取得部門戰情卡片列表 |
| `/api/war-room/departments/:id/brief` | GET | 取得部門日報 |
| `/api/war-room/departments/:id/chat` | POST | 啟動部門對話 |
| `/api/war-room/insights/cross-department` | GET | 跨部門洞察 |
| `/api/war-room/recommendations` | GET | 本週戰略建議 |
| `/api/war-room/recommendations/:id/update` | PATCH | 更新建議狀態 |
| `/api/war-room/export-pdf` | POST | 匯出戰情室 PDF 報告 |

---

### 6.8 排程任務

| 任務名稱 | 執行頻率 | 用途 | 實作 |
|---------|---------|-----|-----|
| `fetch_external_news` | 每小時 | 抓取並分析外部新聞 | Cron Job |
| `generate_department_briefs` | 每日 06:00 | 生成所有部門日報 | Cron Job |
| `calculate_kpi_metrics` | 每 15 分鐘 | 更新 5 大 KPI 指標 | Cron Job |
| `discover_cross_dept_insights` | 每日 07:00 | 發現跨部門洞察 | Cron Job |
| `generate_weekly_recommendations` | 每週一 08:00 | 生成本週戰略建議 | Cron Job |
| `send_daily_summary_email` | 每日 08:30 | 發送戰情室日報郵件 | Cron Job |

---

### 6.9 視覺設計規範

#### 色彩系統

```typescript
// styles/war-room-theme.ts

export const WAR_ROOM_THEME = {
    // 背景
    background: {
        primary: '#0A0E27',      // 深藍黑（主背景）
        secondary: '#12182E',    // 次要背景（卡片）
        tertiary: '#1A2238'      // 第三層背景（浮層）
    },

    // 主色調
    accent: {
        primary: '#00D9FF',      // 電光藍（重要數據）
        secondary: '#A78BFA'     // 紫光（AI 相關）
    },

    // 語義色彩
    semantic: {
        success: '#00FF88',      // 翠綠（正向指標）
        warning: '#FFB800',      // 琥珀黃（中風險）
        danger: '#FF3366',       // 霓虹紅（高風險）
        info: '#00D9FF'          // 電光藍（資訊）
    },

    // 文字
    text: {
        primary: '#FFFFFF',
        secondary: '#B4BCD0',
        tertiary: '#6B7280'
    },

    // 邊框與分隔
    border: {
        default: 'rgba(255, 255, 255, 0.1)',
        hover: 'rgba(0, 217, 255, 0.3)'
    }
};
```

#### 動畫效果

```typescript
// components/war-room/animations.ts

// 1. 數字動畫（CountUp）
export const animateNumber = (
    element: HTMLElement,
    from: number,
    to: number,
    duration: number = 1000
) => {
    // 使用 CountUp.js 或 Framer Motion
};

// 2. 脈衝光暈（新消息提示）
export const pulseGlow = keyframes`
    0%, 100% { box-shadow: 0 0 10px rgba(255, 51, 102, 0.5); }
    50% { box-shadow: 0 0 20px rgba(255, 51, 102, 0.8); }
`;

// 3. 卡片進場動畫
export const cardEnter = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;
```

#### 圖表庫選擇

| 圖表類型 | 推薦庫 | 用途 |
|---------|-------|-----|
| 折線圖、柱狀圖 | **Recharts** | KPI 趨勢、預測區間 |
| 環形進度圖 | **Recharts** | 戰略執行度 |
| 雷達圖 | **Recharts** | 營運健康度 |
| 力導向圖 | **D3.js** | 知識流動熱力圖 |
| 熱力圖 | **D3.js** | 風險矩陣 |

---

### 6.10 實施路線圖

#### Phase 6.1: 基礎建設（2 週）

| 優先序 | 功能 | 描述 | 預估工時 |
|-------|-----|------|---------|
| P0 | 資料庫結構建立 | 建立所有戰情室相關表 | 2 天 |
| P0 | 權限系統 | 實作三層權限控制 | 2 天 |
| P0 | 頁面路由與佈局 | 建立戰情室主頁架構 | 2 天 |
| P1 | 視覺主題系統 | 實作戰情室專屬配色 | 1 天 |

#### Phase 6.2: 第一層 KPI 模組（3 週）

| 優先序 | 功能 | 描述 | 預估工時 |
|-------|-----|------|---------|
| P0 | 戰略執行度計算器 | AI 解析目標文件 | 3 天 |
| P0 | 營運健康度計算器 | 部門活躍度分析 | 3 天 |
| P0 | 財務狀態分析器 | AI 解析財務文件 | 3 天 |
| P0 | 風險預警系統 | 整合多源風險偵測 | 4 天 |
| P1 | KPI 圖表視覺化 | Recharts 圖表實作 | 3 天 |

#### Phase 6.3: 外部情資系統（3 週）

| 優先序 | 功能 | 描述 | 預估工時 |
|-------|-----|------|---------|
| P0 | NewsAPI 整合 | 新聞抓取 API | 2 天 |
| P0 | AI 新聞分析引擎 | Gemini 分析新聞 | 3 天 |
| P0 | 監控主題管理 UI | CRUD 介面 | 3 天 |
| P1 | 排程抓取任務 | Cron Job 設定 | 1 天 |
| P1 | 即時推送通知 | 高風險新聞推送 | 2 天 |

#### Phase 6.4: 部門戰情模組（3 週）

| 優先序 | 功能 | 描述 | 預估工時 |
|-------|-----|------|---------|
| P0 | 部門日報生成器 | AI 自動生成摘要 | 4 天 |
| P0 | 部門卡片 UI | 動態卡片設計 | 3 天 |
| P0 | 對話式探查 | 啟動部門對話 | 3 天 |
| P1 | 建議問題生成 | AI 生成問題 | 2 天 |
| P1 | 完整報告匯出 | PDF 生成 | 2 天 |

#### Phase 6.5: AI 洞察引擎（3 週）

| 優先序 | 功能 | 描述 | 預估工時 |
|-------|-----|------|---------|
| P0 | 跨部門知識連結 | AI 發現協作機會 | 4 天 |
| P0 | 戰略建議引擎 | AI 生成建議 | 4 天 |
| P1 | 建議互動 UI | 標記、委派、追蹤 | 3 天 |
| P1 | 週報郵件系統 | 自動發送摘要 | 2 天 |

---

### 6.11 進階功能構想（未來擴充）

#### 1. 一鍵生成董事會簡報

```typescript
// lib/war-room/export/presentation-generator.ts

export class PresentationGenerator {
    async generateBoardMeeting(userId: string): Promise<string> {
        // 1. 收集本週所有數據
        const kpis = await this.getAllKPIs(userId);
        const insights = await this.getAllInsights(userId);
        const recommendations = await this.getRecommendations(userId);

        // 2. 使用 pptxgen 或類似庫生成 PPT
        const ppt = new PptxGenJS();

        // 封面
        ppt.addSlide().addText('企業戰情週報', { ... });

        // 5 大 KPI
        ppt.addSlide().addChart(kpis.strategy);
        // ... 其他投影片

        // 3. 匯出檔案
        return await ppt.writeFile('戰情週報.pptx');
    }
}
```

#### 2. 語音播報模式

```typescript
// lib/war-room/voice/narration.ts

export class VoiceNarration {
    async startNarration(userId: string): Promise<void> {
        const brief = await this.generateVoiceScript(userId);

        // 使用 Web Speech API 或 Google TTS
        const speech = new SpeechSynthesisUtterance(brief);
        speech.lang = 'zh-TW';
        window.speechSynthesis.speak(speech);
    }
}
```

#### 3. 時光機功能

```typescript
// lib/war-room/history/time-machine.ts

export class WarRoomTimeMachine {
    async getHistoricalSnapshot(
        userId: string,
        targetDate: Date
    ): Promise<WarRoomSnapshot> {
        // 重建指定日期的戰情室狀態
        // 需要保存歷史快照到資料庫
    }
}
```

#### 4. 競爭對手雷達

整合公開資訊：
- 競爭對手財報（公開資料）
- 新聞報導
- 產品發布
- 人才動向（LinkedIn）

#### 5. 情境模擬

```typescript
// lib/war-room/simulation/scenario-simulator.ts

export class ScenarioSimulator {
    async simulate(scenario: string): Promise<SimulationResult> {
        // AI 模擬「如果 X 發生，會影響什麼」
        // 例如：「供應商 A 斷貨會影響哪些產品線？」
    }
}
```

---

## 📈 預期效益

### 技術優勢

| 能力 | v2.0 | v3.0 | 提升幅度 |
|-----|------|------|---------|
| 知識時效性判斷 | 粗略（依天數） | 精準（依類型衰減） | **準確度 +40%** |
| 品質評估依據 | 靜態分析 | 動態反饋學習 | **持續優化** |
| 知識完整性 | 單一文件視角 | 聚合知識單元 | **覆蓋度 +60%** |
| 語義搜尋速度 | O(n²) | O(n log n) | **100 倍提升** |
| 知識異常發現 | 被動等待 | 主動推送通知 | **即時響應** |

### v3.0 特有效益

| 功能 | 業務場景 | 預期效益 |
|-----|---------|---------
| 知識衰減模型 | 報價 Agent 使用產品價格表 | 自動標記過期價格，避免報錯價 |
| 反饋學習迴路 | 客服 Agent 回答客戶問題 | 越用越準，減少人工介入 |
| 知識碎片聚合 | 離職流程涉及 HR/IT/財務 | 一次詢問獲得完整流程 |
| 高效能搜尋 | 萬份文件中找相關知識 | 從分鐘級降至秒級 |
| 主動推送 | 政策更新影響多個 Agent | 即時通知，同步更新 |

---

## 📋 附錄：技術規格總表

### 資料庫新增結構

| 表名 | 用途 | 新增/修改 |
|-----|-----|----------|
| `files` | 核心文件表 | 新增 10 個欄位 |
| `agents` | Agent 表 | 新增 3 個欄位 |
| `knowledge_feedback_events` | 反饋事件 | 新增表 |
| `knowledge_units` | 知識單元 | 新增表 |
| `knowledge_unit_files` | 單元-文件關聯 | 新增表 |
| `knowledge_notifications` | 通知 | 新增表 |
| `agent_knowledge_sources` | Agent-知識關聯 | 新增表 |
| `metric_definitions` | 指標定義 | **新增表 (Phase 6)** |
| `metric_values` | 指標數值 (Metric Store) | **新增表 (Phase 6)** |
| `insight_snippets` | 洞察片段 (Insight Store) | **新增表 (Phase 6)** |

### API 端點規劃

| 端點 | 方法 | 用途 |
|-----|-----|-----|
| `/api/knowledge/decay/calculate` | POST | 計算單一文件衰減分數 |
| `/api/knowledge/decay/batch-update` | POST | 批次更新所有衰減分數 |
| `/api/knowledge/feedback` | POST | 記錄反饋事件 |
| `/api/knowledge/feedback/stats/:fileId` | GET | 取得文件反饋統計 |
| `/api/knowledge/units` | GET/POST | 知識單元 CRUD |
| `/api/knowledge/units/discover` | POST | 發現可聚合的知識 |
| `/api/knowledge/search/semantic` | POST | 高效能語義搜尋 |
| `/api/notifications` | GET | 取得使用者通知 |
| `/api/notifications/:id/resolve` | POST | 解決通知 |
| `/api/war-room/metrics/etl/run` | POST | 手動觸發 ETL |
| `/api/war-room/metrics/query` | POST | 查詢指標數據 (Metric Store) |
| `/api/war-room/insights/stream` | GET | 取得即時情報串流 |

### 排程任務

| 任務 | 頻率 | 用途 |
|-----|-----|-----|
| `update_decay_scores` | 每日 02:00 | 更新所有文件衰減分數 |
| `check_approaching_expiry` | 每日 08:00 | 檢查即將過期知識並發送通知 |
| `run_daily_learning` | 每日 03:00 | 執行反饋學習分析 |
| `detect_conflicts` | 每週一 | 掃描知識衝突 |

---

**報告結束**

**文件版本**: v3.1
**更新日期**: 2026-01-06
**作者**: EAKAP 系統架構團隊

**v3.1 更新摘要**：
- 新增 Phase 6: 企業戰情中樞 (Executive Command Center) 完整技術規劃
- 定義三層架構：全局態勢感知、部門戰情模組、AI 智能洞察
- 規劃 5 大 KPI 模組：戰略執行度、營運健康度、財務狀態、風險預警、外部情資
- 設計外部新聞情資系統（AI 自動分析）
- 實作部門 AI 日報生成器與對話式探查
- 建立跨部門知識連結與戰略建議引擎
- 完整資料庫結構、API 端點、排程任務規劃
- 視覺設計規範與實施路線圖
