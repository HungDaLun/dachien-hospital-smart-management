# EAKAP 進階知識架構系統設計
**版本：** v3.3
**建立日期：** 2026-01-01
**最後更新：** 2026-01-09
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

### 11. AI 回答品質防護機制（AI Response Quality Safeguards）

#### 11.1 設計理念

**核心問題**：AI Agent 的回答可能包含錯誤資訊、過時資料或缺乏來源依據，需要建立多層防護機制確保回答品質。

**解決方案**：建立 5 層防護機制，從技術強制到人工審計，確保 AI 回答的可信度與可追溯性。

#### 11.2 五層防護架構

```
┌─────────────────────────────────────────────────────────┐
│         AI 回答品質防護機制 (5-Layer Safeguards)          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Layer 1: 強制引用來源 (Mandatory Citations)             │
│  └─ 每個回答都必須標註來源檔案，可追溯                     │
│                                                           │
│  Layer 2: 信心度評分 (Confidence Scoring)                │
│  └─ AI 輸出信心度，低信心度主動警告                       │
│                                                           │
│  Layer 3: 人工覆核提示 (Manual Review Prompts)           │
│  └─ 涉及金額、交期等關鍵資訊時提醒覆核                   │
│                                                           │
│  Layer 4: 使用者反饋學習 (User Feedback Learning)        │
│  └─ 收集負評並調整知識庫權重，持續優化                   │
│                                                           │
│  Layer 5: 定期人工審計 (Scheduled Audit)                 │
│  └─ 每月自動篩選高風險回答供管理員審查                   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

#### 11.3 Layer 1: 強制引用來源（Mandatory Citations）

**技術實作**：使用 Gemini API 的 `groundingMetadata` 功能，強制提取引用來源。

```typescript
// app/api/chat/route.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
    // ... 現有程式碼 ...
    
    // 1. 取得知識庫檔案 URI（用於 Grounding）
    const { data: matchedFiles } = await supabase
        .from('files')
        .select('gemini_file_uri, filename')
        .in('id', Array.from(matchedFileIds))
        .eq('gemini_state', 'SYNCED');
    
    // 2. 建構檔案資料（用於 Grounding）
    const fileData = (matchedFiles || []).map(f => ({
        fileUri: f.gemini_file_uri,
        mimeType: 'application/pdf' // 或從 files 表取得實際 mime_type
    }));
    
    // 3. 使用 Gemini API 並啟用 Grounding
    const model = genAI.getGenerativeModel({
        model: agent.model_version || 'gemini-3-flash-preview',
        systemInstruction: fullSystemPrompt,
    });
    
    const chat = model.startChat({ history: historyMessages });
    
    // 4. 建構請求內容（包含檔案 URI）
    const parts = [
        ...fileData.map(f => ({
            fileData: {
                fileUri: f.fileUri,
                mimeType: f.mimeType
            }
        })),
        { text: message }
    ];
    
    // 5. 發送請求並提取 Grounding Metadata
    const result = await chat.sendMessageStream(parts);
    
    let fullAiResponse = '';
    let citations: Citation[] = [];
    
    for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
            fullAiResponse += text;
            // 串流發送給前端
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
    }
    
    // 6. 取得完整回應以提取 Grounding Metadata
    const fullResponse = await chat.sendMessage(parts);
    const response = await fullResponse.response;
    
    // 7. 提取引用來源
    if (response.groundingMetadata) {
        const { groundingChunks, groundingSupports } = response.groundingMetadata;
        
        citations = groundingChunks.map((chunk: any, index: number) => {
            // 從 URI 對應回檔案資訊
            const file = matchedFiles?.find(f => f.gemini_file_uri === chunk.uri);
            
            return {
                startIndex: groundingSupports[index]?.segment?.startIndex || 0,
                endIndex: groundingSupports[index]?.segment?.endIndex || 0,
                uri: chunk.uri,
                title: file?.filename || chunk.web?.title || '未知來源',
                content: chunk.chunk?.text || ''
            };
        });
    }
    
    // 8. 發送引用來源給前端
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ citations })}\n\n`));
    
    // ... 儲存到資料庫時也包含 citations ...
}
```

**資料庫結構擴充**：

```sql
-- 擴充 chat_messages 表以儲存引用來源
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS citations JSONB DEFAULT '[]';

-- 建立索引以加速查詢
CREATE INDEX IF NOT EXISTS idx_chat_messages_citations 
    ON chat_messages USING GIN (citations);
```

**前端顯示**：

```typescript
// components/chat/ChatBubble.tsx

// 已有 CitationList 元件，只需確保 citations 正確傳入
{citations && citations.length > 0 && (
    <div className="mt-8 pt-6 border-t border-white/5">
        <CitationList citations={citations} dict={dict} />
    </div>
)}
```

#### 11.4 Layer 2: 信心度評分（Confidence Scoring）

**技術實作**：要求 AI 在回應中輸出信心度分數，並根據知識庫匹配度計算綜合信心度。

```typescript
// app/api/chat/route.ts

// 1. 修改 System Prompt 要求輸出信心度
const fullSystemPrompt = `${agent.system_prompt}

${knowledgeContext ? `
【已載入的知識庫內容】
${knowledgeContext}

【回答準則】
1. 優先引用上述知識庫中的具體事實。
2. 標註來源文件名稱。
3. 以繁體中文回答，語氣專業、精準。
4. 若資訊不足，請坦白告知。
5. **必須在回答結尾以 JSON 格式輸出信心度**：
   {"confidence": 0.0-1.0, "reasoning": "信心度說明"}
` : ''}`;

// 2. 解析回應中的信心度
function extractConfidence(response: string): { confidence: number; reasoning: string } {
    // 嘗試從 JSON 格式提取
    const jsonMatch = response.match(/\{"confidence":\s*([\d.]+),\s*"reasoning":\s*"([^"]+)"\}/);
    if (jsonMatch) {
        return {
            confidence: parseFloat(jsonMatch[1]),
            reasoning: jsonMatch[2]
        };
    }
    
    // 備用：根據知識庫匹配度計算
    return {
        confidence: calculateConfidenceFromMatches(matchedFiles),
        reasoning: '根據知識庫匹配度計算'
    };
}

// 3. 計算知識庫匹配度信心度
function calculateConfidenceFromMatches(files: any[]): number {
    if (!files || files.length === 0) return 0.3; // 無來源，低信心度
    
    // 根據匹配檔案數量與品質評分計算
    const avgQuality = files.reduce((sum, f) => sum + (f.feedback_score || 0.5), 0) / files.length;
    const fileCountScore = Math.min(files.length / 5, 1.0); // 最多 5 個來源為滿分
    
    return (avgQuality * 0.7 + fileCountScore * 0.3);
}

// 4. 儲存信心度到資料庫
const { confidence, reasoning } = extractConfidence(fullAiResponse);
await supabase.from('chat_messages').insert({
    // ... 其他欄位 ...
    confidence_score: confidence,
    confidence_reasoning: reasoning
});

// 5. 低信心度警告（< 0.6）
if (confidence < 0.6) {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
        warning: 'low_confidence',
        message: '此回答的信心度較低，建議人工覆核',
        confidence,
        reasoning
    })}\n\n`));
}
```

**資料庫結構擴充**：

```sql
-- 擴充 chat_messages 表
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2);
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS confidence_reasoning TEXT;

-- 建立索引以加速查詢低信心度回答
CREATE INDEX IF NOT EXISTS idx_chat_messages_low_confidence 
    ON chat_messages(confidence_score) 
    WHERE confidence_score < 0.6;
```

**前端顯示低信心度警告**：

```typescript
// components/chat/ChatBubble.tsx

{message.confidence_score !== undefined && message.confidence_score < 0.6 && (
    <div className="mt-4 p-4 bg-warning-500/10 border border-warning-500/30 rounded-xl">
        <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning-500" />
            <span className="text-sm text-warning-500 font-semibold">
                低信心度警告
            </span>
        </div>
        <p className="text-xs text-text-tertiary mt-2">
            此回答的信心度為 {Math.round(message.confidence_score * 100)}%，
            建議人工覆核。{message.confidence_reasoning && `原因：${message.confidence_reasoning}`}
        </p>
    </div>
)}
```

#### 11.5 Layer 3: 人工覆核提示（Manual Review Prompts）

**技術實作**：檢測關鍵字（金額、交期等），自動顯示覆核提示。

```typescript
// lib/chat/review-detector.ts

export interface ReviewTrigger {
    keywords: string[];
    category: 'financial' | 'delivery' | 'legal' | 'safety';
    severity: 'high' | 'medium' | 'low';
    message: string;
}

export const REVIEW_TRIGGERS: ReviewTrigger[] = [
    {
        keywords: ['金額', '價格', '成本', '報價', '$', '元', '萬', '百萬', '千萬', '預算', '費用'],
        category: 'financial',
        severity: 'high',
        message: '此回答涉及金額資訊，建議人工覆核確認'
    },
    {
        keywords: ['交期', '交貨', '交付', '期限', 'deadline', 'lead time', '交貨日期', '完成日期'],
        category: 'delivery',
        severity: 'high',
        message: '此回答涉及交期資訊，建議人工覆核確認'
    },
    {
        keywords: ['合約', '協議', '條款', '違約', '賠償', '法律'],
        category: 'legal',
        severity: 'high',
        message: '此回答涉及法律條款，建議人工覆核確認'
    },
    {
        keywords: ['安全', '風險', '危險', '事故', '傷害'],
        category: 'safety',
        severity: 'high',
        message: '此回答涉及安全相關資訊，建議人工覆核確認'
    }
];

export function detectReviewTriggers(content: string): ReviewTrigger[] {
    const detected: ReviewTrigger[] = [];
    const lowerContent = content.toLowerCase();
    
    for (const trigger of REVIEW_TRIGGERS) {
        const found = trigger.keywords.some(keyword => 
            lowerContent.includes(keyword.toLowerCase())
        );
        
        if (found) {
            detected.push(trigger);
        }
    }
    
    return detected;
}
```

**API 整合**：

```typescript
// app/api/chat/route.ts

import { detectReviewTriggers } from '@/lib/chat/review-detector';

// 在回應完成後檢測
const reviewTriggers = detectReviewTriggers(fullAiResponse);

if (reviewTriggers.length > 0) {
    // 發送覆核提示給前端
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
        review_required: true,
        triggers: reviewTriggers,
        message: reviewTriggers[0].message // 顯示第一個觸發的訊息
    })}\n\n`));
    
    // 標記訊息需要覆核
    await supabase.from('chat_messages').update({
        needs_review: true,
        review_triggers: reviewTriggers.map(t => t.category)
    }).eq('id', aiMessage.id);
}
```

**前端顯示覆核提示**：

```typescript
// components/chat/ChatBubble.tsx

{message.review_required && (
    <div className="mt-4 p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
        <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-primary-400" />
            <span className="text-sm text-primary-400 font-semibold">
                建議人工覆核
            </span>
        </div>
        <p className="text-xs text-text-tertiary mt-2">
            {message.review_message}
        </p>
        <button 
            onClick={() => markAsReviewed(message.id)}
            className="mt-2 text-xs text-primary-400 hover:text-primary-300"
        >
            標記為已覆核
        </button>
    </div>
)}
```

**資料庫結構擴充**：

```sql
-- 擴充 chat_messages 表
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS review_triggers TEXT[];
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES user_profiles(id);

-- 建立索引以加速查詢需要覆核的訊息
CREATE INDEX IF NOT EXISTS idx_chat_messages_needs_review 
    ON chat_messages(needs_review) 
    WHERE needs_review = TRUE;
```

#### 11.6 Layer 4: 使用者反饋學習（User Feedback Learning）

**技術實作**：根據使用者負評調整知識庫權重，標記低品質檔案。

```typescript
// lib/knowledge/feedback-learning.ts

export class FeedbackLearningEngine {
    /**
     * 處理使用者反饋並調整知識庫權重
     */
    async processFeedback(feedbackEvent: {
        message_id: string;
        rating: 1 | -1;
        reason_code?: string;
        comment?: string;
    }): Promise<void> {
        const supabase = await createClient();
        
        // 1. 取得訊息相關的知識來源
        const { data: message } = await supabase
            .from('chat_messages')
            .select('id, citations, agent_id')
            .eq('id', feedbackEvent.message_id)
            .single();
        
        if (!message || !message.citations) return;
        
        // 2. 從 citations 提取檔案 ID
        const fileIds = this.extractFileIdsFromCitations(message.citations);
        
        // 3. 根據負評調整檔案權重
        if (feedbackEvent.rating === -1) {
            await this.adjustFileWeights(fileIds, -0.1); // 降低權重
            
            // 標記檔案需要審查
            await supabase
                .from('files')
                .update({ needs_review: true })
                .in('id', fileIds);
            
            // 記錄反饋事件
            await supabase.from('knowledge_feedback_events').insert({
                file_id: fileIds[0], // 主要來源檔案
                agent_id: message.agent_id,
                source: 'user_explicit',
                sentiment: 'negative',
                score: -1,
                feedback_type: feedbackEvent.reason_code || 'not_helpful',
                details: {
                    comment: feedbackEvent.comment,
                    message_id: feedbackEvent.message_id
                }
            });
        } else {
            // 正評：提升權重
            await this.adjustFileWeights(fileIds, 0.05);
        }
        
        // 4. 更新檔案統計
        for (const fileId of fileIds) {
            await updateFileFeedbackStats(fileId);
        }
    }
    
    /**
     * 調整檔案權重（影響知識檢索優先順序）
     */
    private async adjustFileWeights(fileIds: string[], delta: number): Promise<void> {
        const supabase = await createClient();
        
        // 更新檔案的 relevance_weight（如果有的話）
        // 或透過 feedback_score 影響檢索
        for (const fileId of fileIds) {
            const { data: file } = await supabase
                .from('files')
                .select('feedback_score')
                .eq('id', fileId)
                .single();
            
            if (file) {
                const newScore = Math.max(0, Math.min(1, (file.feedback_score || 0.5) + delta));
                await supabase
                    .from('files')
                    .update({ feedback_score: newScore })
                    .eq('id', fileId);
            }
        }
    }
    
    /**
     * 從 citations 提取檔案 ID
     */
    private extractFileIdsFromCitations(citations: any[]): string[] {
        // 從 citation URI 或 title 對應回檔案 ID
        // 實作細節：需要建立 URI 到 file_id 的映射表
        return [];
    }
}
```

**知識檢索時應用權重**：

```typescript
// lib/knowledge/search.ts

export async function searchKnowledgeWithWeights(
    query: string,
    agentId: string
): Promise<SearchResult[]> {
    const supabase = await createClient();
    
    // 1. 向量搜尋
    const embedding = await generateEmbedding(query);
    const { data: matches } = await supabase.rpc('search_knowledge_global', {
        query_embedding: embedding,
        match_threshold: 0.1,
        match_count: 20
    });
    
    // 2. 取得檔案反饋分數
    const fileIds = matches.map((m: any) => m.file_id);
    const { data: files } = await supabase
        .from('files')
        .select('id, feedback_score, needs_review')
        .in('id', fileIds);
    
    const fileScores = new Map(
        files?.map(f => [f.id, f.feedback_score || 0.5]) || []
    );
    
    // 3. 加權排序：相似度 * 反饋分數
    const weightedResults = matches.map((match: any) => ({
        ...match,
        weighted_score: match.similarity * (fileScores.get(match.file_id) || 0.5)
    })).sort((a, b) => b.weighted_score - a.weighted_score);
    
    return weightedResults.slice(0, 10); // 返回前 10 個
}
```

#### 11.7 Layer 5: 定期人工審計（Scheduled Audit）

**技術實作**：建立 Cron Job 每月自動篩選高風險回答。

```typescript
// app/api/cron/audit-high-risk-responses/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * 定期審計：每月 1 號自動篩選高風險回答
 * Vercel Cron 設定：0 0 1 * * (每月 1 號 00:00 UTC)
 */
export async function GET(request: Request) {
    // 1. 驗證 Cron 密鑰
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    
    if (!isVercelCron && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = createAdminClient();
    
    try {
        // 2. 查詢過去一個月的高風險回答
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const { data: highRiskMessages } = await supabase
            .from('chat_messages')
            .select(`
                id,
                content,
                confidence_score,
                needs_review,
                review_triggers,
                created_at,
                agent_id,
                agents(name),
                chat_sessions(user_id, user_profiles(display_name, email))
            `)
            .gte('created_at', oneMonthAgo.toISOString())
            .or(`
                confidence_score.lt.0.6,
                needs_review.eq.true,
                review_triggers.neq.[]
            `)
            .order('created_at', { ascending: false })
            .limit(100);
        
        // 3. 統計負評率
        const messageIds = highRiskMessages?.map(m => m.id) || [];
        
        const { data: feedbacks } = await supabase
            .from('chat_feedback')
            .select('message_id, rating')
            .in('message_id', messageIds);
        
        // 計算每個訊息的負評率
        const negativeRateMap = new Map<string, number>();
        for (const msg of highRiskMessages || []) {
            const msgFeedbacks = feedbacks?.filter(f => f.message_id === msg.id) || [];
            const negativeCount = msgFeedbacks.filter(f => f.rating === -1).length;
            const totalCount = msgFeedbacks.length;
            
            if (totalCount > 0) {
                negativeRateMap.set(msg.id, negativeCount / totalCount);
            }
        }
        
        // 4. 篩選真正高風險的回答（負評率 > 20% 或低信心度）
        const auditList = (highRiskMessages || []).filter(msg => {
            const negativeRate = negativeRateMap.get(msg.id) || 0;
            return negativeRate > 0.2 || (msg.confidence_score || 1) < 0.6;
        });
        
        // 5. 生成審計報告
        const auditReport = {
            period: {
                start: oneMonthAgo.toISOString(),
                end: new Date().toISOString()
            },
            total_messages_scanned: highRiskMessages?.length || 0,
            high_risk_count: auditList.length,
            breakdown: {
                low_confidence: auditList.filter(m => (m.confidence_score || 1) < 0.6).length,
                needs_review: auditList.filter(m => m.needs_review).length,
                high_negative_rate: auditList.filter(m => (negativeRateMap.get(m.id) || 0) > 0.2).length
            },
            high_risk_messages: auditList.map(msg => ({
                id: msg.id,
                content_preview: msg.content.substring(0, 200),
                confidence_score: msg.confidence_score,
                negative_rate: negativeRateMap.get(msg.id) || 0,
                review_triggers: msg.review_triggers || [],
                agent_name: (msg.agents as any)?.name,
                user_name: (msg.chat_sessions as any)?.user_profiles?.display_name,
                created_at: msg.created_at
            }))
        };
        
        // 6. 儲存審計報告
        const { data: report } = await supabase
            .from('audit_reports')
            .insert({
                report_type: 'high_risk_responses',
                period_start: oneMonthAgo.toISOString(),
                period_end: new Date().toISOString(),
                report_data: auditReport,
                generated_at: new Date().toISOString()
            })
            .select()
            .single();
        
        // 7. 發送 Email 給管理員（如果設定）
        if (process.env.AUDIT_REPORT_EMAIL) {
            await sendAuditReportEmail(auditReport);
        }
        
        return NextResponse.json({
            success: true,
            report_id: report?.id,
            summary: {
                total_scanned: auditReport.total_messages_scanned,
                high_risk_count: auditReport.high_risk_count
            }
        });
        
    } catch (error) {
        console.error('[Audit] Failed:', error);
        return NextResponse.json(
            { error: 'Audit failed', details: String(error) },
            { status: 500 }
        );
    }
}
```

**資料庫結構**：

```sql
-- 審計報告表
CREATE TABLE IF NOT EXISTS audit_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(50) NOT NULL, -- 'high_risk_responses', 'user_activity', etc.
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    report_data JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_audit_reports_type_period 
    ON audit_reports(report_type, period_start DESC);
```

**管理員查看審計報告**：

```typescript
// app/api/audit/reports/route.ts

export async function GET(request: NextRequest) {
    const profile = await getCurrentUserProfile();
    requireRole(profile, ['SUPER_ADMIN', 'DEPT_ADMIN']);
    
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'high_risk_responses';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const supabase = await createClient();
    
    const { data: reports } = await supabase
        .from('audit_reports')
        .select('*')
        .eq('report_type', reportType)
        .order('generated_at', { ascending: false })
        .limit(limit);
    
    return NextResponse.json({ success: true, reports });
}
```

#### 11.8 資料庫結構總覽

```sql
-- chat_messages 表擴充欄位
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS citations JSONB DEFAULT '[]';
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2);
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS confidence_reasoning TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS review_triggers TEXT[];
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES user_profiles(id);

-- 審計報告表
CREATE TABLE IF NOT EXISTS audit_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(50) NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    report_data JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_chat_messages_citations 
    ON chat_messages USING GIN (citations);
CREATE INDEX IF NOT EXISTS idx_chat_messages_low_confidence 
    ON chat_messages(confidence_score) WHERE confidence_score < 0.6;
CREATE INDEX IF NOT EXISTS idx_chat_messages_needs_review 
    ON chat_messages(needs_review) WHERE needs_review = TRUE;
CREATE INDEX IF NOT EXISTS idx_audit_reports_type_period 
    ON audit_reports(report_type, period_start DESC);
```

#### 11.9 API 端點規劃

| 端點 | 方法 | 用途 |
|-----|-----|-----|
| `/api/chat` | POST | 對話 API（已擴充支援引用來源、信心度） |
| `/api/chat/feedback` | POST | 記錄使用者反饋（已存在，需整合學習機制） |
| `/api/chat/messages/:id/review` | POST | 標記訊息為已覆核 |
| `/api/audit/reports` | GET | 取得審計報告列表 |
| `/api/audit/reports/:id` | GET | 取得單一審計報告詳情 |
| `/api/cron/audit-high-risk-responses` | GET | 定期審計排程（Cron Job） |

#### 11.10 實施優先順序

| 優先級 | 功能 | 預估時間 | 狀態 |
|--------|------|----------|------|
| P0 | Layer 1: 強制引用來源 | 2-3 小時 | 待實作 |
| P0 | Layer 2: 信心度評分 | 1-2 小時 | 待實作 |
| P0 | Layer 3: 人工覆核提示 | 1 小時 | 待實作 |
| P1 | Layer 4: 使用者反饋學習 | 3-4 小時 | 待實作 |
| P1 | Layer 5: 定期人工審計 | 2-3 小時 | 待實作 |

**總預估時間**：9-13 小時（1-2 個工作天）

---

### 12. AI 決策可解釋性系統（Explainable AI Decision System）

#### 12.1 設計理念

**核心問題**：企業主與高階主管面對 AI Agent 的決策建議時，往往缺乏「安全感」，因為：
1. **黑盒子疑慮**：不知道 AI 如何得出這個結論
2. **無法驗證**：無法追溯決策邏輯，難以判斷建議是否可信
3. **缺乏信心**：即使建議很好，但沒有理解過程就不敢採行

**解決方案**：建立完整的「決策可解釋性系統」，透過視覺化呈現 AI 的思考過程，讓決策建議變得「透明、可追溯、可驗證」。

#### 12.2 系統架構

```
┌─────────────────────────────────────────────────────────┐
│      AI 決策可解釋性系統 (Explainable AI System)          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Layer 1: 決策推理鏈追蹤 (Reasoning Chain Tracking)      │
│  └─ 記錄 AI 的每一步思考過程                              │
│                                                           │
│  Layer 2: 知識來源路徑圖 (Knowledge Source Path)         │
│  └─ 視覺化展示知識來源與引用關係                          │
│                                                           │
│  Layer 3: 信心度分解 (Confidence Breakdown)             │
│  └─ 展示每個決策點的信心度與依據                          │
│                                                           │
│  Layer 4: 假設驗證 (Assumption Validation)              │
│  └─ 列出 AI 的假設與驗證方法                              │
│                                                           │
│  Layer 5: 替代方案比較 (Alternative Comparison)         │
│  └─ 展示其他可能的決策方案與優劣比較                       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

#### 12.3 Layer 1: 決策推理鏈追蹤（Reasoning Chain Tracking）

**技術實作**：要求 AI 輸出結構化的推理過程，並儲存為可視覺化的推理鏈。

```typescript
// lib/chat/reasoning-tracker.ts

export interface ReasoningStep {
    step_id: string;
    step_type: 'observation' | 'analysis' | 'inference' | 'conclusion';
    content: string;
    confidence: number;
    knowledge_sources: string[]; // 檔案 ID 或知識框架 ID
    assumptions?: string[];
    next_steps?: string[]; // 指向下一個步驟的 ID
}

export interface ReasoningChain {
    chain_id: string;
    message_id: string;
    query: string;
    steps: ReasoningStep[];
    final_conclusion: string;
    overall_confidence: number;
    created_at: string;
}

/**
 * 要求 AI 輸出結構化推理過程
 */
export async function generateReasoningChain(
    query: string,
    knowledgeContext: string,
    agentPrompt: string
): Promise<ReasoningChain> {
    const reasoningPrompt = `${agentPrompt}

【使用者問題】
${query}

【可用知識庫】
${knowledgeContext}

【任務要求】
請以結構化的方式展示你的思考過程。你必須：
1. 逐步分析問題
2. 引用具體的知識來源
3. 標註每個步驟的信心度
4. 列出你的假設
5. 最終給出結論

請以 JSON 格式回覆：
{
  "reasoning_chain": [
    {
      "step_id": "step_1",
      "step_type": "observation",
      "content": "觀察到的具體事實...",
      "confidence": 0.9,
      "knowledge_sources": ["file_id_1", "framework_id_1"],
      "assumptions": []
    },
    {
      "step_id": "step_2",
      "step_type": "analysis",
      "content": "分析過程...",
      "confidence": 0.85,
      "knowledge_sources": ["file_id_2"],
      "assumptions": ["假設市場趨勢持續"],
      "next_steps": ["step_3"]
    },
    {
      "step_id": "step_3",
      "step_type": "inference",
      "content": "推論結果...",
      "confidence": 0.8,
      "knowledge_sources": ["file_id_1", "file_id_2"],
      "assumptions": ["假設供應鏈穩定"],
      "next_steps": ["step_4"]
    },
    {
      "step_id": "step_4",
      "step_type": "conclusion",
      "content": "最終結論與建議...",
      "confidence": 0.75,
      "knowledge_sources": ["file_id_1", "file_id_2", "file_id_3"],
      "assumptions": []
    }
  ],
  "final_conclusion": "完整的結論與建議",
  "overall_confidence": 0.78,
  "key_assumptions": [
    "假設市場趨勢持續",
    "假設供應鏈穩定"
  ]
}`;

    const genAI = createGeminiClient();
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-3-pro-preview' // 使用 Pro 模型以獲得更好的推理能力
    });
    
    const result = await model.generateContent(reasoningPrompt);
    const response = await result.response;
    const text = response.text();
    
    // 解析 JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('無法解析推理鏈 JSON');
    }
    
    const reasoningData = JSON.parse(jsonMatch[0]);
    
    return {
        chain_id: crypto.randomUUID(),
        message_id: '', // 稍後填入
        query,
        steps: reasoningData.reasoning_chain,
        final_conclusion: reasoningData.final_conclusion,
        overall_confidence: reasoningData.overall_confidence,
        created_at: new Date().toISOString()
    };
}
```

**API 整合**：

```typescript
// app/api/chat/route.ts

import { generateReasoningChain } from '@/lib/chat/reasoning-tracker';

export async function POST(request: NextRequest) {
    // ... 現有程式碼 ...
    
    // 在生成回應時，同時生成推理鏈
    const reasoningChain = await generateReasoningChain(
        message,
        knowledgeContext,
        fullSystemPrompt
    );
    
    // 儲存推理鏈到資料庫
    const { data: savedChain } = await supabase
        .from('reasoning_chains')
        .insert({
            chain_id: reasoningChain.chain_id,
            message_id: aiMessage.id,
            query: message,
            steps: reasoningChain.steps,
            final_conclusion: reasoningChain.final_conclusion,
            overall_confidence: reasoningChain.overall_confidence
        })
        .select()
        .single();
    
    // 發送推理鏈給前端
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
        reasoning_chain: reasoningChain 
    })}\n\n`));
}
```

#### 12.4 Layer 2: 知識來源路徑圖（Knowledge Source Path Visualization）

**視覺化元件**：使用 React Flow 繪製知識來源的引用關係圖。

```typescript
// components/chat/ReasoningChainVisualizer.tsx

'use client';

import ReactFlow, { Node, Edge } from 'reactflow';
import { ReasoningChain } from '@/lib/chat/reasoning-tracker';
import { FileText, Brain, Target, CheckCircle } from 'lucide-react';

interface ReasoningChainVisualizerProps {
    chain: ReasoningChain;
    onStepClick?: (stepId: string) => void;
}

export default function ReasoningChainVisualizer({ 
    chain, 
    onStepClick 
}: ReasoningChainVisualizerProps) {
    // 1. 建構節點（每個推理步驟 + 知識來源）
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // 2. 添加推理步驟節點
    chain.steps.forEach((step, index) => {
        const stepNode: Node = {
            id: step.step_id,
            type: 'reasoningStep',
            position: { x: index * 300, y: 0 },
            data: {
                label: step.content.substring(0, 100) + '...',
                stepType: step.step_type,
                confidence: step.confidence,
                stepNumber: index + 1
            },
            style: {
                background: getStepColor(step.step_type),
                color: '#fff',
                border: '2px solid',
                borderColor: getConfidenceColor(step.confidence),
                borderRadius: '12px',
                padding: '16px',
                width: 280,
                minHeight: 120
            }
        };
        nodes.push(stepNode);
        
        // 3. 添加知識來源節點
        step.knowledge_sources.forEach((sourceId, sourceIndex) => {
            const sourceNodeId = `source_${step.step_id}_${sourceIndex}`;
            const sourceNode: Node = {
                id: sourceNodeId,
                type: 'knowledgeSource',
                position: { 
                    x: index * 300 + (sourceIndex - step.knowledge_sources.length / 2) * 100, 
                    y: 200 
                },
                data: {
                    label: `來源 ${sourceIndex + 1}`,
                    sourceId
                },
                style: {
                    background: '#1e293b',
                    color: '#94a3b8',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '8px',
                    width: 80,
                    height: 60
                }
            };
            nodes.push(sourceNode);
            
            // 4. 連接推理步驟與知識來源
            edges.push({
                id: `edge_${step.step_id}_${sourceNodeId}`,
                source: step.step_id,
                target: sourceNodeId,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#64748b', strokeWidth: 2 }
            });
        });
        
        // 5. 連接推理步驟（形成鏈）
        if (step.next_steps && step.next_steps.length > 0) {
            step.next_steps.forEach(nextStepId => {
                edges.push({
                    id: `edge_${step.step_id}_${nextStepId}`,
                    source: step.step_id,
                    target: nextStepId,
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: '#3b82f6', strokeWidth: 3 }
                });
            });
        } else if (index < chain.steps.length - 1) {
            // 預設連接下一個步驟
            edges.push({
                id: `edge_${step.step_id}_${chain.steps[index + 1].step_id}`,
                source: step.step_id,
                target: chain.steps[index + 1].step_id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#3b82f6', strokeWidth: 3 }
            });
        }
    });
    
    // 6. 添加最終結論節點
    const conclusionNode: Node = {
        id: 'conclusion',
        type: 'conclusion',
        position: { x: chain.steps.length * 300, y: 0 },
        data: {
            label: chain.final_conclusion,
            confidence: chain.overall_confidence
        },
        style: {
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            color: '#fff',
            border: '3px solid #a78bfa',
            borderRadius: '16px',
            padding: '20px',
            width: 320,
            minHeight: 150,
            fontSize: '14px',
            fontWeight: '600'
        }
    };
    nodes.push(conclusionNode);
    
    // 連接最後一步到結論
    if (chain.steps.length > 0) {
        const lastStep = chain.steps[chain.steps.length - 1];
        edges.push({
            id: `edge_${lastStep.step_id}_conclusion`,
            source: lastStep.step_id,
            target: 'conclusion',
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 4 }
        });
    }
    
    return (
        <div className="w-full h-[600px] bg-background-secondary/50 rounded-2xl border border-white/10 p-4">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-primary">
                    AI 決策推理過程
                </h3>
                <div className="flex items-center gap-2 text-sm text-text-tertiary">
                    <span>整體信心度：</span>
                    <span className="font-bold text-primary-400">
                        {Math.round(chain.overall_confidence * 100)}%
                    </span>
                </div>
            </div>
            
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                nodeTypes={{
                    reasoningStep: ReasoningStepNode,
                    knowledgeSource: KnowledgeSourceNode,
                    conclusion: ConclusionNode
                }}
            />
        </div>
    );
}

function getStepColor(stepType: string): string {
    const colors = {
        observation: '#06b6d4', // Cyan
        analysis: '#3b82f6',     // Blue
        inference: '#10b981',    // Green
        conclusion: '#8b5cf6'    // Purple
    };
    return colors[stepType as keyof typeof colors] || '#64748b';
}

function getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return '#10b981'; // Green
    if (confidence >= 0.6) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
}
```

#### 12.5 Layer 3: 信心度分解（Confidence Breakdown）

**視覺化元件**：展示每個決策點的信心度與依據。

```typescript
// components/chat/ConfidenceBreakdown.tsx

interface ConfidenceBreakdownProps {
    chain: ReasoningChain;
}

export default function ConfidenceBreakdown({ chain }: ConfidenceBreakdownProps) {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                信心度分解
            </h4>
            
            {/* 整體信心度 */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">整體信心度</span>
                    <span className="text-lg font-bold text-primary-400">
                        {Math.round(chain.overall_confidence * 100)}%
                    </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                    <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${chain.overall_confidence * 100}%` }}
                    />
                </div>
            </div>
            
            {/* 各步驟信心度 */}
            {chain.steps.map((step, index) => (
                <div key={step.step_id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text-tertiary">
                                步驟 {index + 1}
                            </span>
                            <span className="text-xs px-2 py-1 bg-primary-500/20 text-primary-400 rounded">
                                {getStepTypeLabel(step.step_type)}
                            </span>
                        </div>
                        <span className="text-sm font-bold text-text-primary">
                            {Math.round(step.confidence * 100)}%
                        </span>
                    </div>
                    
                    <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
                        <div 
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                step.confidence >= 0.8 ? 'bg-green-500' :
                                step.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${step.confidence * 100}%` }}
                        />
                    </div>
                    
                    <p className="text-xs text-text-tertiary line-clamp-2">
                        {step.content}
                    </p>
                    
                    {/* 知識來源數量 */}
                    {step.knowledge_sources.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-text-tertiary">
                            <FileText size={12} />
                            <span>{step.knowledge_sources.length} 個知識來源</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function getStepTypeLabel(stepType: string): string {
    const labels = {
        observation: '觀察',
        analysis: '分析',
        inference: '推論',
        conclusion: '結論'
    };
    return labels[stepType as keyof typeof labels] || stepType;
}
```

#### 12.6 Layer 4: 假設驗證（Assumption Validation）

**視覺化元件**：列出 AI 的假設與驗證方法。

```typescript
// components/chat/AssumptionValidator.tsx

interface AssumptionValidatorProps {
    assumptions: string[];
    knowledgeSources: string[];
}

export default function AssumptionValidator({ 
    assumptions, 
    knowledgeSources 
}: AssumptionValidatorProps) {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                關鍵假設與驗證
            </h4>
            
            {assumptions.map((assumption, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-yellow-400">
                                {index + 1}
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-text-primary mb-2">
                                {assumption}
                            </p>
                            
                            {/* 驗證狀態 */}
                            <div className="flex items-center gap-2 text-xs">
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                                    可驗證
                                </span>
                                <span className="text-text-tertiary">
                                    基於 {knowledgeSources.length} 個知識來源
                                </span>
                            </div>
                            
                            {/* 驗證建議 */}
                            <div className="mt-2 p-2 bg-white/5 rounded text-xs text-text-tertiary">
                                💡 建議：可透過實際數據或市場調研驗證此假設
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
```

#### 12.7 Layer 5: 替代方案比較（Alternative Comparison）

**技術實作**：要求 AI 輸出多個決策方案並比較優劣。

```typescript
// lib/chat/alternative-generator.ts

export interface AlternativeOption {
    option_id: string;
    title: string;
    description: string;
    pros: string[];
    cons: string[];
    confidence: number;
    risk_level: 'low' | 'medium' | 'high';
    expected_outcome: string;
    required_resources: string[];
}

export interface AlternativeComparison {
    query: string;
    recommended_option: string; // option_id
    alternatives: AlternativeOption[];
    comparison_criteria: string[];
}

/**
 * 生成替代方案比較
 */
export async function generateAlternatives(
    query: string,
    knowledgeContext: string,
    recommendedSolution: string
): Promise<AlternativeComparison> {
    const prompt = `
你是一位戰略顧問。針對以下問題，請提供 3-4 個不同的決策方案，並進行優劣比較。

【問題】
${query}

【AI 推薦方案】
${recommendedSolution}

【可用知識庫】
${knowledgeContext}

【任務要求】
1. 生成 3-4 個可行的替代方案
2. 每個方案需包含：優點、缺點、風險等級、預期結果、所需資源
3. 比較各方案的優劣
4. 說明為什麼推薦某個方案

請以 JSON 格式回覆：
{
  "recommended_option": "option_1",
  "alternatives": [
    {
      "option_id": "option_1",
      "title": "方案一：...",
      "description": "詳細描述...",
      "pros": ["優點1", "優點2"],
      "cons": ["缺點1", "缺點2"],
      "confidence": 0.85,
      "risk_level": "medium",
      "expected_outcome": "預期結果...",
      "required_resources": ["資源1", "資源2"]
    }
  ],
  "comparison_criteria": ["成本", "時效", "風險", "效益"]
}`;

    // ... 呼叫 Gemini API 並解析 ...
}
```

**視覺化元件**：

```typescript
// components/chat/AlternativeComparison.tsx

export default function AlternativeComparison({ 
    comparison 
}: { comparison: AlternativeComparison }) {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                替代方案比較
            </h4>
            
            {/* 比較表格 */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left p-3 text-xs font-bold text-text-tertiary">
                                方案
                            </th>
                            {comparison.comparison_criteria.map(criterion => (
                                <th key={criterion} className="text-center p-3 text-xs font-bold text-text-tertiary">
                                    {criterion}
                                </th>
                            ))}
                            <th className="text-center p-3 text-xs font-bold text-text-tertiary">
                                推薦度
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {comparison.alternatives.map((option, index) => (
                            <tr 
                                key={option.option_id}
                                className={`border-b border-white/5 ${
                                    option.option_id === comparison.recommended_option 
                                        ? 'bg-primary-500/10' 
                                        : ''
                                }`}
                            >
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        {option.option_id === comparison.recommended_option && (
                                            <CheckCircle size={16} className="text-primary-400" />
                                        )}
                                        <span className="text-sm text-text-primary font-semibold">
                                            {option.title}
                                        </span>
                                    </div>
                                </td>
                                {/* 各項評分 */}
                                <td className="p-3 text-center">
                                    <span className="text-xs text-text-secondary">
                                        {option.risk_level === 'low' ? '低' : 
                                         option.risk_level === 'medium' ? '中' : '高'}
                                    </span>
                                </td>
                                <td className="p-3 text-center">
                                    <span className="text-xs text-text-secondary">
                                        {Math.round(option.confidence * 100)}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
```

#### 12.8 整合 UI：決策可解釋性面板

**完整整合元件**：

```typescript
// components/chat/DecisionExplainabilityPanel.tsx

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, Brain, Target } from 'lucide-react';
import ReasoningChainVisualizer from './ReasoningChainVisualizer';
import ConfidenceBreakdown from './ConfidenceBreakdown';
import AssumptionValidator from './AssumptionValidator';
import AlternativeComparison from './AlternativeComparison';
import { ReasoningChain } from '@/lib/chat/reasoning-tracker';

interface DecisionExplainabilityPanelProps {
    messageId: string;
    chain: ReasoningChain;
    alternatives?: any;
}

export default function DecisionExplainabilityPanel({
    messageId,
    chain,
    alternatives
}: DecisionExplainabilityPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'reasoning' | 'confidence' | 'assumptions' | 'alternatives'>('reasoning');
    
    return (
        <div className="mt-6 border-t border-white/10 pt-6">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
            >
                <div className="flex items-center gap-3">
                    <Brain size={20} className="text-primary-400" />
                    <span className="text-sm font-bold text-text-primary">
                        查看 AI 決策過程
                    </span>
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {isExpanded && (
                <div className="mt-4 space-y-4">
                    {/* 標籤頁 */}
                    <div className="flex gap-2 border-b border-white/10">
                        {[
                            { id: 'reasoning', label: '推理鏈', icon: Brain },
                            { id: 'confidence', label: '信心度', icon: Target },
                            { id: 'assumptions', label: '假設', icon: Eye },
                            { id: 'alternatives', label: '替代方案', icon: Target }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                                    activeTab === tab.id
                                        ? 'border-primary-400 text-primary-400'
                                        : 'border-transparent text-text-tertiary hover:text-text-secondary'
                                }`}
                            >
                                <tab.icon size={16} className="inline mr-2" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    
                    {/* 內容區域 */}
                    <div className="min-h-[400px]">
                        {activeTab === 'reasoning' && (
                            <ReasoningChainVisualizer chain={chain} />
                        )}
                        {activeTab === 'confidence' && (
                            <ConfidenceBreakdown chain={chain} />
                        )}
                        {activeTab === 'assumptions' && (
                            <AssumptionValidator 
                                assumptions={chain.steps.flatMap(s => s.assumptions || [])}
                                knowledgeSources={chain.steps.flatMap(s => s.knowledge_sources)}
                            />
                        )}
                        {activeTab === 'alternatives' && alternatives && (
                            <AlternativeComparison comparison={alternatives} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
```

#### 12.9 資料庫結構

```sql
-- 推理鏈表
CREATE TABLE IF NOT EXISTS reasoning_chains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id VARCHAR(255) UNIQUE NOT NULL,
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    steps JSONB NOT NULL, -- ReasoningStep[]
    final_conclusion TEXT NOT NULL,
    overall_confidence DECIMAL(3,2) NOT NULL,
    key_assumptions TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 替代方案比較表
CREATE TABLE IF NOT EXISTS alternative_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    recommended_option_id VARCHAR(255) NOT NULL,
    alternatives JSONB NOT NULL, -- AlternativeOption[]
    comparison_criteria TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_reasoning_chains_message_id 
    ON reasoning_chains(message_id);
CREATE INDEX IF NOT EXISTS idx_alternative_comparisons_message_id 
    ON alternative_comparisons(message_id);
```

#### 12.10 API 端點規劃

| 端點 | 方法 | 用途 |
|-----|-----|-----|
| `/api/chat` | POST | 對話 API（已擴充支援推理鏈） |
| `/api/chat/messages/:id/reasoning` | GET | 取得訊息的推理鏈 |
| `/api/chat/messages/:id/alternatives` | GET | 取得訊息的替代方案比較 |
| `/api/chat/explain` | POST | 手動觸發決策解釋（針對已存在的訊息） |

#### 12.11 實施優先順序

| 優先級 | 功能 | 預估時間 | 狀態 |
|--------|------|----------|------|
| P0 | Layer 1: 決策推理鏈追蹤 | 4-6 小時 | 待實作 |
| P0 | Layer 2: 知識來源路徑圖 | 3-4 小時 | 待實作 |
| P1 | Layer 3: 信心度分解 | 2 小時 | 待實作 |
| P1 | Layer 4: 假設驗證 | 2 小時 | 待實作 |
| P2 | Layer 5: 替代方案比較 | 3-4 小時 | 待實作 |

**總預估時間**：14-18 小時（2-3 個工作天）

#### 12.12 使用場景範例

**場景：企業主詢問「是否應該擴展新市場？」**

1. **AI 回答**：「建議先進行小規模測試，原因如下...」

2. **點擊「查看 AI 決策過程」**，展開面板：

   - **推理鏈標籤**：顯示 5 個推理步驟
     - 步驟 1（觀察）：當前市場飽和度 85%
     - 步驟 2（分析）：競爭對手動態
     - 步驟 3（推論）：新市場機會評估
     - 步驟 4（結論）：建議小規模測試
   
   - **信心度標籤**：整體信心度 78%
     - 步驟 1：90%（數據充分）
     - 步驟 2：85%（有競爭情報）
     - 步驟 3：70%（部分假設）
     - 步驟 4：75%（綜合評估）
   
   - **假設標籤**：
     - 假設 1：市場趨勢持續（可驗證）
     - 假設 2：競爭對手不會立即反應（需監控）
   
   - **替代方案標籤**：
     - 方案 A：小規模測試（推薦）✓
     - 方案 B：直接大規模進入（高風險）
     - 方案 C：暫緩擴展（保守）

3. **企業主可以**：
   - 查看每個推理步驟的依據
   - 驗證 AI 的假設是否合理
   - 比較不同方案的優劣
   - 決定是否採行建議

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

**文件版本**: v3.3
**更新日期**: 2026-01-09
**作者**: EAKAP 系統架構團隊

**v3.3 更新摘要**：
- 新增 12. AI 決策可解釋性系統（Explainable AI Decision System）
- Layer 1: 決策推理鏈追蹤（結構化推理過程記錄）
- Layer 2: 知識來源路徑圖（React Flow 視覺化）
- Layer 3: 信心度分解（各步驟信心度展示）
- Layer 4: 假設驗證（關鍵假設與驗證方法）
- Layer 5: 替代方案比較（多方案優劣比較）
- 完整視覺化元件設計（ReasoningChainVisualizer、ConfidenceBreakdown 等）
- 資料庫結構與 API 端點規劃
- 使用場景範例與實施優先順序

**v3.2 更新摘要**：
- 新增 11. AI 回答品質防護機制（5 層防護架構）
- Layer 1: 強制引用來源（使用 Gemini Grounding Metadata）
- Layer 2: 信心度評分（AI 輸出 + 知識庫匹配度計算）
- Layer 3: 人工覆核提示（關鍵字檢測：金額、交期、法律、安全）
- Layer 4: 使用者反饋學習（根據負評調整知識庫權重）
- Layer 5: 定期人工審計（每月自動篩選高風險回答）
- 完整技術實作方案、資料庫結構、API 端點規劃
- 實施優先順序與時間估算

**v3.1 更新摘要**：
- 新增 Phase 6: 企業戰情中樞 (Executive Command Center) 完整技術規劃
- 定義三層架構：全局態勢感知、部門戰情模組、AI 智能洞察
- 規劃 5 大 KPI 模組：戰略執行度、營運健康度、財務狀態、風險預警、外部情資
- 設計外部新聞情資系統（AI 自動分析）
- 實作部門 AI 日報生成器與對話式探查
- 建立跨部門知識連結與戰略建議引擎
- 完整資料庫結構、API 端點、排程任務規劃
- 視覺設計規範與實施路線圖
