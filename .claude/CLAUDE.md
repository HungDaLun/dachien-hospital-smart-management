# EAKAP 進階知識架構系統設計
**版本：** v3.0  
**建立日期：** 2026-01-01  
**最後更新：** 2026-01-05  
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

### 排程任務

| 任務 | 頻率 | 用途 |
|-----|-----|-----|
| `update_decay_scores` | 每日 02:00 | 更新所有文件衰減分數 |
| `check_approaching_expiry` | 每日 08:00 | 檢查即將過期知識並發送通知 |
| `run_daily_learning` | 每日 03:00 | 執行反饋學習分析 |
| `detect_conflicts` | 每週一 | 掃描知識衝突 |

---

**報告結束**

**文件版本**: v3.0  
**更新日期**: 2026-01-05  
**作者**: EAKAP 系統架構團隊
