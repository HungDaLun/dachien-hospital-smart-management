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
     * 
     * @param agentDescription Agent 任務描述
     * @param agentSkills Agent 技能列表
     * @param departmentId 部門 ID（用於權限過濾）
     * @returns 推薦的知識來源列表（按相關度排序）
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
            maxPerFramework: 3,      // 每個框架最多 3 個
            maxPerCategory: 5,       // 每個類別最多 5 個
            minTotalSources: 5,      // 最少 5 個來源
            maxTotalSources: 20      // 最多 20 個來源
        });
        
        return diversified;
    }
    
    /**
     * 語義匹配（使用 Embedding 相似度）
     */
    private async findSemanticMatches(
        description: string,
        skills: AgentSkill[],
        departmentId: string | null
    ): Promise<KnowledgeRoute[]> {
        // 1. 生成 Agent 描述的 Embedding
        const agentEmbedding = await generateEmbedding(description);
        
        // 2. 查詢相似度最高的知識
        const { data: files } = await supabase
            .from('files')
            .select('*, content_embedding, metadata_analysis')
            .eq('gemini_state', 'SYNCED')
            .not('content_embedding', 'is', null);
        
        // 3. 計算相似度
        const matches = files
            .map(file => ({
                file,
                similarity: cosineSimilarity(agentEmbedding, file.content_embedding)
            }))
            .filter(m => m.similarity > 0.7) // 相似度閾值
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 20); // Top 20
        
        return matches.map(m => ({
            type: 'file',
            id: m.file.id,
            relevance_score: m.similarity,
            reason: '語義相似度高'
        }));
    }
    
    /**
     * 框架匹配（根據 Agent Skills 匹配知識框架）
     */
    private async findFrameworkMatches(
        skills: AgentSkill[],
        departmentId: string | null
    ): Promise<KnowledgeRoute[]> {
        // 1. 提取技能對應的框架代碼
        const frameworkCodes = this.extractFrameworkCodes(skills);
        
        // 2. 查詢對應的知識實例
        const { data: instances } = await supabase
            .from('knowledge_instances')
            .select('*, knowledge_frameworks(code, name)')
            .in('knowledge_frameworks.code', frameworkCodes)
            .gte('completeness', 0.7)  // 完整性 >= 70%
            .gte('confidence', 0.8);   // 信心度 >= 80%
        
        return instances.map(inst => ({
            type: 'instance',
            id: inst.id,
            framework_code: inst.knowledge_frameworks.code,
            relevance_score: inst.completeness * inst.confidence,
            reason: `符合 ${inst.knowledge_frameworks.name} 框架`
        }));
    }
    
    /**
     * DIKW 層級過濾
     */
    private filterByDIKWLevel(
        routes: KnowledgeRoute[],
        preferredLevels: DIKWLevel[]
    ): KnowledgeRoute[] {
        // 優先選擇 Knowledge 和 Wisdom 層級
        const preferred = routes.filter(r => 
            r.dikw_level && preferredLevels.includes(r.dikw_level)
        );
        
        // 如果優先層級不足，再補充 Information 層級
        if (preferred.length < 5) {
            const additional = routes.filter(r => 
                r.dikw_level === 'information' && !preferred.includes(r)
            );
            return [...preferred, ...additional.slice(0, 5 - preferred.length)];
        }
        
        return preferred;
    }
    
    /**
     * 品質過濾
     */
    private filterByQuality(
        routes: KnowledgeRoute[],
        thresholds: { minCompleteness: number; minAccuracy: number }
    ): KnowledgeRoute[] {
        return routes.filter(r => 
            r.quality.completeness_score >= thresholds.minCompleteness &&
            r.quality.accuracy_score >= thresholds.minAccuracy
        );
    }
    
    /**
     * 時效性過濾
     */
    private filterByTemporal(
        routes: KnowledgeRoute[],
        options: { maxAge: number }
    ): KnowledgeRoute[] {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - options.maxAge);
        
        return routes.filter(r => {
            if (!r.temporal.updated_at) return false;
            const updatedDate = new Date(r.temporal.updated_at);
            return updatedDate >= cutoffDate;
        });
    }
    
    /**
     * 權重排序
     */
    private rankByWeight(
        routes: KnowledgeRoute[],
        weights: { relevanceWeight: number; authorityWeight: number; usageWeight: number }
    ): KnowledgeRoute[] {
        return routes
            .map(r => ({
                ...r,
                composite_score: 
                    r.weight.relevance_score * weights.relevanceWeight +
                    r.weight.authority_score * weights.authorityWeight +
                    (r.weight.usage_frequency / 100) * weights.usageWeight
            }))
            .sort((a, b) => b.composite_score - a.composite_score);
    }
    
    /**
     * 多樣性平衡
     */
    private ensureDiversity(
        routes: KnowledgeRoute[],
        options: {
            maxPerFramework: number;
            maxPerCategory: number;
            minTotalSources: number;
            maxTotalSources: number;
        }
    ): KnowledgeRoute[] {
        const frameworkCounts = new Map<string, number>();
        const categoryCounts = new Map<string, number>();
        const result: KnowledgeRoute[] = [];
        
        for (const route of routes) {
            // 檢查框架限制
            if (route.framework_code) {
                const count = frameworkCounts.get(route.framework_code) || 0;
                if (count >= options.maxPerFramework) continue;
                frameworkCounts.set(route.framework_code, count + 1);
            }
            
            // 檢查類別限制
            if (route.category_id) {
                const count = categoryCounts.get(route.category_id) || 0;
                if (count >= options.maxPerCategory) continue;
                categoryCounts.set(route.category_id, count + 1);
            }
            
            result.push(route);
            
            if (result.length >= options.maxTotalSources) break;
        }
        
        // 確保最少來源數
        if (result.length < options.minTotalSources) {
            const additional = routes
                .filter(r => !result.includes(r))
                .slice(0, options.minTotalSources - result.length);
            result.push(...additional);
        }
        
        return result;
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
    
    /**
     * 完整性評估
     * 
     * 檢查知識是否包含必要的資訊
     */
    private async assessCompleteness(
        content: string,
        metadata: any
    ): Promise<CompletenessScore> {
        const checks = {
            hasTitle: !!metadata.title,
            hasSummary: !!metadata.summary,
            hasTags: metadata.tags && metadata.tags.length > 0,
            hasCategory: !!metadata.category_suggestion,
            hasGovernance: !!metadata.governance,
            hasStructure: content.length > 500, // 內容長度
            hasKeywords: this.extractKeywords(content).length > 5,
            hasEntities: this.extractEntities(content).length > 0
        };
        
        const score = Object.values(checks).filter(Boolean).length / Object.keys(checks).length;
        
        return {
            score,
            checks,
            missing: Object.entries(checks)
                .filter(([_, value]) => !value)
                .map(([key]) => key)
        };
    }
    
    /**
     * 準確性評估
     * 
     * 使用 AI 檢查內容的邏輯一致性、事實正確性
     */
    private async assessAccuracy(
        content: string,
        metadata: any
    ): Promise<AccuracyScore> {
        const prompt = `
請評估以下知識文件的準確性：

文件標題：${metadata.title || '未提供'}
文件摘要：${metadata.summary || '未提供'}
文件內容（前 2000 字）：${content.slice(0, 2000)}

請從以下維度評估：
1. 邏輯一致性：內容是否邏輯一致，沒有矛盾？
2. 事實正確性：陳述的事實是否合理？
3. 專業性：內容是否專業、可信？
4. 完整性：關鍵資訊是否完整？

請回傳 JSON 格式：
{
  "logical_consistency": 0.0-1.0,
  "factual_correctness": 0.0-1.0,
  "professionalism": 0.0-1.0,
  "completeness": 0.0-1.0,
  "overall_score": 0.0-1.0,
  "issues": ["問題 1", "問題 2"],
  "recommendations": ["建議 1", "建議 2"]
}
`;
        
        const result = await generateContent('gemini-3-flash-preview', prompt);
        const assessment = JSON.parse(result);
        
        return {
            score: assessment.overall_score,
            logical_consistency: assessment.logical_consistency,
            factual_correctness: assessment.factual_correctness,
            professionalism: assessment.professionalism,
            issues: assessment.issues || [],
            recommendations: assessment.recommendations || []
        };
    }
    
    /**
     * 時效性評估
     */
    private async assessFreshness(metadata: any): Promise<FreshnessScore> {
        const now = new Date();
        const created = new Date(metadata.created_at || now);
        const updated = new Date(metadata.updated_at || created);
        const validUntil = metadata.valid_until ? new Date(metadata.valid_until) : null;
        
        const ageInDays = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
        
        let score = 1.0;
        if (ageInDays > 365) score = 0.5;
        if (ageInDays > 730) score = 0.2;
        if (ageInDays > 1095) score = 0.0;
        
        // 如果已過期，分數為 0
        if (validUntil && now > validUntil) {
            score = 0.0;
        }
        
        return {
            score,
            age_in_days: ageInDays,
            is_expired: validUntil ? now > validUntil : false,
            last_updated: updated.toISOString()
        };
    }
    
    /**
     * 一致性評估
     * 
     * 檢查檔名、標籤、類別、內容是否一致
     */
    private async assessConsistency(
        content: string,
        metadata: any
    ): Promise<ConsistencyScore> {
        const checks = {
            filename_category_match: this.checkFilenameCategoryMatch(
                metadata.suggested_filename,
                metadata.category_suggestion
            ),
            tags_content_match: this.checkTagsContentMatch(
                metadata.tags || [],
                content
            ),
            governance_consistency: this.checkGovernanceConsistency(metadata.governance),
            dikw_level_appropriate: this.checkDIKWLevelAppropriate(
                metadata.dikw_level,
                content
            )
        };
        
        const score = Object.values(checks).filter(Boolean).length / Object.keys(checks).length;
        
        return {
            score,
            checks,
            inconsistencies: Object.entries(checks)
                .filter(([_, value]) => !value)
                .map(([key]) => key)
        };
    }
    
    /**
     * 結構化程度評估
     */
    private async assessStructure(content: string): Promise<StructureScore> {
        const hasHeaders = /^#+\s/.test(content);
        const hasLists = /^[-*+]\s/.test(content) || /^\d+\.\s/.test(content);
        const hasTables = /\|.*\|/.test(content);
        const hasCodeBlocks = /```/.test(content);
        const paragraphCount = content.split('\n\n').length;
        
        const structureScore = (
            (hasHeaders ? 0.3 : 0) +
            (hasLists ? 0.2 : 0) +
            (hasTables ? 0.2 : 0) +
            (hasCodeBlocks ? 0.1 : 0) +
            (paragraphCount > 5 ? 0.2 : paragraphCount * 0.04)
        );
        
        return {
            score: Math.min(structureScore, 1.0),
            has_headers: hasHeaders,
            has_lists: hasLists,
            has_tables: hasTables,
            has_code_blocks: hasCodeBlocks,
            paragraph_count: paragraphCount
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
            
            // 關聯的知識實例
            const instances = await this.getInstancesForFile(fileId);
            for (const inst of instances) {
                nodes.push({
                    id: inst.id,
                    type: 'instance',
                    label: inst.title,
                    data: {
                        framework: inst.framework_id,
                        completeness: inst.completeness,
                        confidence: inst.confidence
                    }
                });
                
                // 檔案 -> 實例的邊
                edges.push({
                    id: `e-${fileId}-${inst.id}`,
                    source: fileId,
                    target: inst.id,
                    type: 'derived_from',
                    weight: inst.confidence
                });
            }
        }
        
        // 2. 發現語義關聯
        const semanticEdges = await this.discoverSemanticRelations(nodes);
        edges.push(...semanticEdges);
        
        // 3. 發現依賴關係
        const dependencyEdges = await this.discoverDependencies(nodes);
        edges.push(...dependencyEdges);
        
        // 4. 發現框架關聯
        const frameworkEdges = await this.discoverFrameworkRelations(nodes);
        edges.push(...frameworkEdges);
        
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
    
    /**
     * 發現語義關聯
     * 
     * 使用 Embedding 相似度發現語義相關的知識
     */
    private async discoverSemanticRelations(
        nodes: GraphNode[]
    ): Promise<GraphEdge[]> {
        const fileNodes = nodes.filter(n => n.type === 'file');
        const edges: GraphEdge[] = [];
        
        // 兩兩比較 Embedding 相似度
        for (let i = 0; i < fileNodes.length; i++) {
            for (let j = i + 1; j < fileNodes.length; j++) {
                const node1 = fileNodes[i];
                const node2 = fileNodes[j];
                
                const similarity = await this.calculateSimilarity(
                    node1.id,
                    node2.id
                );
                
                if (similarity > 0.75) { // 相似度閾值
                    edges.push({
                        id: `e-semantic-${node1.id}-${node2.id}`,
                        source: node1.id,
                        target: node2.id,
                        type: 'semantic_related',
                        weight: similarity
                    });
                }
            }
        }
        
        return edges;
    }
    
    /**
     * 發現依賴關係
     * 
     * 分析內容中的引用、參考、依賴關係
     */
    private async discoverDependencies(
        nodes: GraphNode[]
    ): Promise<GraphEdge[]> {
        const edges: GraphEdge[] = [];
        
        for (const node of nodes.filter(n => n.type === 'file')) {
            const file = await this.getFile(node.id);
            const content = file.markdown_content || '';
            
            // 使用 AI 分析依賴關係
            const prompt = `
請分析以下文件內容，找出它引用了哪些其他文件或知識：

文件標題：${file.filename}
文件內容（前 2000 字）：${content.slice(0, 2000)}

請找出：
1. 明確引用的文件名稱
2. 參考的知識框架
3. 依賴的其他知識

請回傳 JSON 格式：
{
  "referenced_files": ["文件名 1", "文件名 2"],
  "referenced_frameworks": ["框架 1", "框架 2"],
  "dependencies": ["依賴 1", "依賴 2"]
}
`;
            
            const result = await generateContent('gemini-3-flash-preview', prompt);
            const analysis = JSON.parse(result);
            
            // 建立依賴邊
            for (const refFile of analysis.referenced_files || []) {
                const targetNode = nodes.find(n => 
                    n.type === 'file' && n.label.includes(refFile)
                );
                
                if (targetNode) {
                    edges.push({
                        id: `e-dep-${node.id}-${targetNode.id}`,
                        source: node.id,
                        target: targetNode.id,
                        type: 'depends_on',
                        weight: 0.8
                    });
                }
            }
        }
        
        return edges;
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
    
    /**
     * 分析變更內容
     */
    private async analyzeChanges(
        versions: FileVersion[]
    ): Promise<ChangeAnalysis[]> {
        const changes: ChangeAnalysis[] = [];
        
        for (let i = 1; i < versions.length; i++) {
            const prev = versions[i - 1];
            const curr = versions[i];
            
            // 使用 AI 分析變更
            const prompt = `
請比較以下兩個版本的知識文件，分析變更內容：

版本 ${prev.version}：
${prev.content.slice(0, 2000)}

版本 ${curr.version}：
${curr.content.slice(0, 2000)}

請分析：
1. 新增的內容
2. 刪除的內容
3. 修改的內容
4. 變更的影響範圍

請回傳 JSON 格式：
{
  "added": ["新增內容 1", "新增內容 2"],
  "removed": ["刪除內容 1", "刪除內容 2"],
  "modified": ["修改內容 1", "修改內容 2"],
  "impact_scope": "影響範圍描述",
  "change_type": "major|minor|patch"
}
`;
            
            const result = await generateContent('gemini-3-flash-preview', prompt);
            const analysis = JSON.parse(result);
            
            changes.push({
                from_version: prev.version,
                to_version: curr.version,
                change_type: analysis.change_type,
                added: analysis.added || [],
                removed: analysis.removed || [],
                modified: analysis.modified || [],
                impact_scope: analysis.impact_scope
            });
        }
        
        return changes;
    }
    
    /**
     * 追蹤依賴影響
     */
    private async trackDependencyImpact(
        fileId: string
    ): Promise<DependencyImpact> {
        // 1. 找出依賴此檔案的知識
        const dependents = await this.findDependents(fileId);
        
        // 2. 評估影響範圍
        const impact = {
            affected_files: dependents.files.length,
            affected_instances: dependents.instances.length,
            affected_agents: dependents.agents.length,
            risk_level: this.calculateRiskLevel(dependents)
        };
        
        return impact;
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

/**
 * 知識衰減模型
 * 
 * 不同類型知識有不同的「半衰期」，就像不同食物有不同的保鮮期
 */

export enum KnowledgeDecayType {
    STABLE = 'stable',         // 穩定型（如法規、政策）
    TECHNICAL = 'technical',   // 技術型（如 API 文件）
    MARKET = 'market',         // 市場型（如競品分析）
    EVENT = 'event',           // 事件型（如會議記錄）
    PROCEDURAL = 'procedural', // 流程型（如 SOP）
    REFERENCE = 'reference'    // 參考型（如百科知識）
}

export interface DecayCurve {
    type: KnowledgeDecayType;
    halfLife: number;           // 半衰期（天）
    minValidScore: number;      // 最低有效分數閾值
    decayFunction: 'exponential' | 'linear' | 'step';
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

#### 6.3 衰減分數計算引擎

```typescript
// lib/knowledge/decay/decay-calculator.ts

/**
 * 知識衰減分數計算器
 */
export class KnowledgeDecayCalculator {
    /**
     * 計算知識的時效性分數
     * 
     * @param decayType   知識衰減類型
     * @param updatedAt   最後更新時間
     * @param validUntil  明確的失效時間（可選）
     * @returns           時效性分數（0-1）
     */
    calculateDecayScore(
        decayType: KnowledgeDecayType,
        updatedAt: Date,
        validUntil?: Date | null
    ): DecayScore {
        // 1. 如果有明確失效時間且已過期，直接返回 0
        if (validUntil && new Date() > validUntil) {
            return {
                score: 0,
                status: 'expired',
                reason: '已超過明確設定的失效日期',
                suggestedAction: 'archive_or_update'
            };
        }
        
        // 2. 取得對應的衰減曲線
        const curve = DECAY_CURVES.get(decayType) || DECAY_CURVES.get(KnowledgeDecayType.REFERENCE)!;
        
        // 3. 計算經過的天數
        const now = new Date();
        const ageInDays = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
        
        // 4. 根據衰減函數計算分數
        let score: number;
        switch (curve.decayFunction) {
            case 'exponential':
                // 指數衰減：score = (1/2)^(age/halfLife)
                score = Math.pow(0.5, ageInDays / curve.halfLife);
                break;
                
            case 'linear':
                // 線性衰減：score = 1 - age / (halfLife * 2)
                score = Math.max(0, 1 - ageInDays / (curve.halfLife * 2));
                break;
                
            case 'step':
                // 階梯衰減：超過半衰期直接降到最低
                score = ageInDays <= curve.halfLife ? 1 : curve.minValidScore;
                break;
                
            default:
                score = Math.pow(0.5, ageInDays / curve.halfLife);
        }
        
        // 5. 判斷狀態
        let status: DecayStatus;
        let suggestedAction: string;
        
        if (score >= 0.8) {
            status = 'fresh';
            suggestedAction = 'none';
        } else if (score >= 0.5) {
            status = 'aging';
            suggestedAction = 'review_recommended';
        } else if (score >= curve.minValidScore) {
            status = 'stale';
            suggestedAction = 'update_required';
        } else {
            status = 'expired';
            suggestedAction = 'archive_or_update';
        }
        
        return {
            score: Math.round(score * 100) / 100,
            status,
            reason: this.generateDecayReason(ageInDays, curve, status),
            suggestedAction,
            daysUntilExpiry: this.calculateDaysUntilExpiry(score, curve),
            decayType: decayType
        };
    }
    
    /**
     * 自動推斷知識的衰減類型
     */
    async inferDecayType(
        content: string,
        metadata: any,
        categoryCode?: string
    ): Promise<KnowledgeDecayType> {
        // 1. 優先使用類別代碼推斷
        if (categoryCode) {
            const categoryMapping: Record<string, KnowledgeDecayType> = {
                'GOV': KnowledgeDecayType.STABLE,      // 治理類
                'POLICY': KnowledgeDecayType.STABLE,   // 政策類
                'TECH': KnowledgeDecayType.TECHNICAL,  // 技術類
                'API': KnowledgeDecayType.TECHNICAL,   // API 文件
                'MARKET': KnowledgeDecayType.MARKET,   // 市場類
                'COMPETITOR': KnowledgeDecayType.MARKET, // 競品分析
                'MEETING': KnowledgeDecayType.EVENT,   // 會議記錄
                'NEWS': KnowledgeDecayType.EVENT,      // 新聞資訊
                'SOP': KnowledgeDecayType.PROCEDURAL,  // 標準流程
                'GUIDE': KnowledgeDecayType.REFERENCE  // 指南參考
            };
            
            const inferredType = categoryMapping[categoryCode.toUpperCase()];
            if (inferredType) return inferredType;
        }
        
        // 2. 使用 AI 推斷
        const prompt = `
請分析以下知識內容，判斷它的「知識類型」用於計算時效性：

標題：${metadata.title || '未提供'}
摘要：${metadata.summary || '未提供'}
內容片段：${content.slice(0, 1000)}

請從以下類型中選擇最適合的：
- stable：穩定型知識（法規、政策、章程，變化週期 3 年以上）
- technical：技術型知識（API 文件、技術規格，變化週期 1 年左右）
- market：市場型知識（競品分析、市場趨勢，變化週期 3 個月）
- event：事件型知識（會議記錄、新聞事件，時效性 1 個月）
- procedural：流程型知識（SOP、操作手冊，需要精確遵守）
- reference：參考型知識（百科、教學資料，變化週期 2 年）

請只回傳類型代碼（如 stable），不要其他內容。
`;
        
        const result = await generateContent('gemini-3-flash-preview', prompt);
        const typeCode = result.trim().toLowerCase();
        
        return (Object.values(KnowledgeDecayType).includes(typeCode as KnowledgeDecayType))
            ? typeCode as KnowledgeDecayType
            : KnowledgeDecayType.REFERENCE;
    }
}

type DecayStatus = 'fresh' | 'aging' | 'stale' | 'expired';

interface DecayScore {
    score: number;
    status: DecayStatus;
    reason: string;
    suggestedAction: string;
    daysUntilExpiry?: number;
    decayType?: KnowledgeDecayType;
}
```

#### 6.4 資料庫結構擴充

```sql
-- 新增欄位到 files 表
ALTER TABLE files ADD COLUMN IF NOT EXISTS 
    decay_type VARCHAR(20) DEFAULT 'reference';
    
ALTER TABLE files ADD COLUMN IF NOT EXISTS 
    decay_score DECIMAL(3,2) DEFAULT 1.0;
    
ALTER TABLE files ADD COLUMN IF NOT EXISTS 
    decay_status VARCHAR(20) DEFAULT 'fresh';
    
ALTER TABLE files ADD COLUMN IF NOT EXISTS 
    valid_until TIMESTAMPTZ DEFAULT NULL;

-- 建立索引以加速衰減狀態查詢
CREATE INDEX IF NOT EXISTS idx_files_decay_status 
    ON files(decay_status) WHERE gemini_state = 'SYNCED';
    
-- 定期更新衰減分數的函數（可用 pg_cron 排程）
CREATE OR REPLACE FUNCTION update_all_decay_scores()
RETURNS void AS $$
BEGIN
    -- 透過應用層 API 呼叫更新
    -- 此處僅作為觸發點
    RAISE NOTICE 'Decay scores update triggered';
END;
$$ LANGUAGE plpgsql;
```

---

### 7. 反饋學習迴路（Feedback Learning Loop）

#### 7.1 設計理念

**核心問題**：系統只記錄知識被使用次數，但不知道使用效果好不好。

**解決方案**：建立完整的反饋收集與學習機制，讓知識品質評分能夠持續優化。

#### 7.2 反饋類型定義

```typescript
// lib/knowledge/feedback/feedback-types.ts

/**
 * 反饋來源類型
 */
export enum FeedbackSource {
    USER_EXPLICIT = 'user_explicit',     // 使用者明確反饋（按讚/倒讚）
    USER_IMPLICIT = 'user_implicit',     // 使用者隱性反饋（繼續對話/重新提問）
    AGENT_SELF = 'agent_self',           // Agent 自我評估
    SYSTEM_AUDIT = 'system_audit'        // 系統審計
}

/**
 * 反饋事件類型
 */
export interface KnowledgeFeedbackEvent {
    id: string;
    file_id: string;
    agent_id?: string;
    session_id?: string;
    
    // 反饋內容
    source: FeedbackSource;
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;  // -1 到 1
    
    // 詳細反饋
    feedback_type: FeedbackType;
    details?: {
        user_correction?: string;      // 使用者修正內容
        issue_category?: string;       // 問題類別
        improvement_suggestion?: string; // 改進建議
    };
    
    // 上下文
    context: {
        query?: string;                 // 原始查詢
        response_snippet?: string;      // 回應片段
        knowledge_used?: string;        // 使用的知識片段
    };
    
    created_at: string;
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

#### 7.3 反饋學習引擎

```typescript
// lib/knowledge/feedback/feedback-learning-engine.ts

/**
 * 反饋學習引擎
 * 
 * 從使用反饋中學習，持續優化知識品質評分
 */
export class FeedbackLearningEngine {
    /**
     * 記錄反饋事件
     */
    async recordFeedback(event: KnowledgeFeedbackEvent): Promise<void> {
        // 1. 儲存反饋事件
        await supabase.from('knowledge_feedback_events').insert(event);
        
        // 2. 即時更新知識統計
        await this.updateKnowledgeStats(event.file_id);
        
        // 3. 觸發學習流程（非同步）
        this.triggerLearningProcess(event.file_id).catch(console.error);
    }
    
    /**
     * 更新知識統計
     */
    private async updateKnowledgeStats(fileId: string): Promise<void> {
        // 計算最近 90 天的反饋統計
        const { data: stats } = await supabase.rpc('calculate_feedback_stats', {
            p_file_id: fileId,
            p_days: 90
        });
        
        // 更新 files 表
        await supabase
            .from('files')
            .update({
                feedback_score: stats.weighted_score,
                feedback_count: stats.total_count,
                positive_ratio: stats.positive_ratio,
                last_feedback_at: new Date().toISOString()
            })
            .eq('id', fileId);
    }
    
    /**
     * 觸發學習流程
     * 
     * 當負面反饋累積到閾值時，自動調整知識品質評分
     */
    private async triggerLearningProcess(fileId: string): Promise<void> {
        const file = await getFile(fileId);
        
        // 檢查是否需要降級
        if (file.positive_ratio < 0.5 && file.feedback_count >= 5) {
            // 負面反饋過多，降低品質分數
            const penaltyFactor = Math.max(0.5, file.positive_ratio);
            
            await supabase
                .from('files')
                .update({
                    'quality_score': file.quality_score * penaltyFactor,
                    'needs_review': true,
                    'review_reason': '負面反饋累積，建議人工審查'
                })
                .eq('id', fileId);
            
            // 發送通知
            await this.notifyKnowledgeOwner(fileId, 'quality_degradation');
        }
        
        // 檢查是否需要升級
        if (file.positive_ratio > 0.9 && file.feedback_count >= 10) {
            // 正面反饋很多，提升權威性分數
            const boostFactor = Math.min(1.2, 1 + (file.positive_ratio - 0.9));
            
            await supabase
                .from('files')
                .update({
                    'authority_score': Math.min(1.0, file.authority_score * boostFactor)
                })
                .eq('id', fileId);
        }
    }
    
    /**
     * 從反饋中學習並調整權重
     * 
     * 定期執行（每日），分析整體反饋模式
     */
    async runDailyLearning(): Promise<LearningReport> {
        const report: LearningReport = {
            date: new Date().toISOString(),
            files_analyzed: 0,
            quality_adjustments: [],
            patterns_detected: []
        };
        
        // 1. 分析過去 7 天的反饋模式
        const { data: feedbackPatterns } = await supabase.rpc(
            'analyze_feedback_patterns',
            { p_days: 7 }
        );
        
        // 2. 識別問題類別模式
        for (const pattern of feedbackPatterns) {
            if (pattern.issue_count >= 3) {
                report.patterns_detected.push({
                    file_id: pattern.file_id,
                    issue_category: pattern.issue_category,
                    occurrence_count: pattern.issue_count,
                    suggested_action: this.suggestAction(pattern)
                });
            }
        }
        
        // 3. 更新全域學習模型
        await this.updateGlobalModel(feedbackPatterns);
        
        return report;
    }
    
    /**
     * 收集隱性反饋
     * 
     * 分析使用者行為推斷滿意度
     */
    async collectImplicitFeedback(
        sessionId: string,
        fileId: string,
        behavior: UserBehavior
    ): Promise<void> {
        let implicitScore = 0;
        
        // 行為分析
        if (behavior.followUpQuestions > 0) {
            // 有追問 = 可能不太滿意
            implicitScore -= 0.2 * behavior.followUpQuestions;
        }
        
        if (behavior.sessionDuration > 60) {
            // 長時間對話 = 可能在尋找答案
            implicitScore -= 0.1;
        }
        
        if (behavior.taskCompleted) {
            // 完成任務 = 滿意
            implicitScore += 0.5;
        }
        
        if (behavior.copiedResponse) {
            // 複製回應 = 認為有用
            implicitScore += 0.3;
        }
        
        // 正規化分數
        implicitScore = Math.max(-1, Math.min(1, implicitScore));
        
        // 記錄隱性反饋
        await this.recordFeedback({
            id: generateId(),
            file_id: fileId,
            session_id: sessionId,
            source: FeedbackSource.USER_IMPLICIT,
            sentiment: implicitScore > 0 ? 'positive' : implicitScore < 0 ? 'negative' : 'neutral',
            score: implicitScore,
            feedback_type: implicitScore > 0 ? FeedbackType.HELPFUL : FeedbackType.NOT_HELPFUL,
            context: {},
            created_at: new Date().toISOString()
        });
    }
}

interface UserBehavior {
    followUpQuestions: number;
    sessionDuration: number;  // 秒
    taskCompleted: boolean;
    copiedResponse: boolean;
}
```

#### 7.4 資料庫結構

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

-- 建立索引
CREATE INDEX idx_feedback_file_id ON knowledge_feedback_events(file_id);
CREATE INDEX idx_feedback_created_at ON knowledge_feedback_events(created_at DESC);

-- 新增欄位到 files 表
ALTER TABLE files ADD COLUMN IF NOT EXISTS feedback_score DECIMAL(3,2) DEFAULT 0.5;
ALTER TABLE files ADD COLUMN IF NOT EXISTS feedback_count INTEGER DEFAULT 0;
ALTER TABLE files ADD COLUMN IF NOT EXISTS positive_ratio DECIMAL(3,2) DEFAULT 0.5;
ALTER TABLE files ADD COLUMN IF NOT EXISTS last_feedback_at TIMESTAMPTZ;
ALTER TABLE files ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS review_reason TEXT;

-- 計算反饋統計的函數
CREATE OR REPLACE FUNCTION calculate_feedback_stats(
    p_file_id UUID,
    p_days INTEGER
)
RETURNS TABLE(
    total_count INTEGER,
    positive_count INTEGER,
    negative_count INTEGER,
    positive_ratio DECIMAL,
    weighted_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_count,
        COUNT(*) FILTER (WHERE sentiment = 'positive')::INTEGER as positive_count,
        COUNT(*) FILTER (WHERE sentiment = 'negative')::INTEGER as negative_count,
        COALESCE(
            COUNT(*) FILTER (WHERE sentiment = 'positive')::DECIMAL / 
            NULLIF(COUNT(*)::DECIMAL, 0),
            0.5
        ) as positive_ratio,
        COALESCE(AVG(score), 0)::DECIMAL as weighted_score
    FROM knowledge_feedback_events
    WHERE file_id = p_file_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;
```

---

### 8. 知識碎片聚合（Knowledge Fragment Aggregation）

#### 8.1 設計理念

**核心問題**：企業知識往往分散在多份文件中，Agent 只能獲取片段視角。

**解決方案**：自動發現討論同一概念的文件，聚合成完整的「知識單元」。

#### 8.2 知識單元定義

```typescript
// lib/knowledge/aggregation/knowledge-unit.ts

/**
 * 知識單元（Knowledge Unit）
 * 
 * 將多份相關文件整合為一個完整的知識視角
 */
export interface KnowledgeUnit {
    id: string;
    
    // 概念識別
    concept_id: string;           // 核心概念 ID
    concept_name: string;         // 概念名稱（如「員工離職流程」）
    concept_description: string;  // 概念描述
    
    // 來源文件
    source_files: SourceFile[];   // 組成此知識單元的文件
    
    // 聚合內容
    synthesized_knowledge: string;  // AI 合成的統一知識
    
    // 衝突處理
    conflicts: ConflictRecord[];    // 發現的衝突
    conflict_resolution: string;    // 衝突解決說明
    
    // 品質指標
    completeness_score: number;     // 知識完整度
    confidence_score: number;       // 綜合信心度
    coverage_map: CoverageMap;      // 知識覆蓋地圖
    
    // 後設資料
    created_at: string;
    updated_at: string;
    auto_generated: boolean;
}

interface SourceFile {
    file_id: string;
    filename: string;
    contribution: string;         // 此文件的貢獻（如「提供 HR 流程」）
    coverage_areas: string[];     // 覆蓋的知識面向
    weight: number;               // 權重（0-1）
}

interface ConflictRecord {
    type: 'contradiction' | 'inconsistency' | 'ambiguity';
    description: string;
    file_ids: string[];           // 涉及的文件
    resolved: boolean;
    resolution_method?: string;
}

interface CoverageMap {
    total_aspects: number;        // 總共需要覆蓋的面向
    covered_aspects: number;      // 已覆蓋的面向
    missing_aspects: string[];    // 缺失的面向
    aspect_details: AspectDetail[];
}

interface AspectDetail {
    aspect_name: string;          // 面向名稱（如「權限關閉」）
    covered_by: string[];         // 由哪些文件覆蓋
    coverage_quality: number;     // 覆蓋品質（0-1）
}
```

#### 8.3 知識聚合引擎

```typescript
// lib/knowledge/aggregation/aggregation-engine.ts

/**
 * 知識聚合引擎
 * 
 * 自動發現並整合分散的知識碎片
 */
export class KnowledgeAggregationEngine {
    /**
     * 發現可聚合的知識概念
     */
    async discoverAggregationCandidates(): Promise<AggregationCandidate[]> {
        const candidates: AggregationCandidate[] = [];
        
        // 1. 取得所有已同步的文件
        const { data: files } = await supabase
            .from('files')
            .select('id, filename, markdown_content, content_embedding, metadata_analysis')
            .eq('gemini_state', 'SYNCED')
            .not('content_embedding', 'is', null);
        
        // 2. 使用 AI 提取每份文件的核心概念
        const filesConcepts = await Promise.all(
            files.map(f => this.extractConcepts(f))
        );
        
        // 3. 聚類相似概念
        const conceptClusters = this.clusterConcepts(filesConcepts);
        
        // 4. 識別可聚合的候選
        for (const cluster of conceptClusters) {
            if (cluster.files.length >= 2) {
                candidates.push({
                    concept_name: cluster.concept,
                    file_ids: cluster.files.map(f => f.id),
                    similarity_score: cluster.avgSimilarity,
                    estimated_completeness: this.estimateCompleteness(cluster)
                });
            }
        }
        
        return candidates.sort((a, b) => 
            b.estimated_completeness - a.estimated_completeness
        );
    }
    
    /**
     * 執行知識聚合
     */
    async aggregateKnowledge(
        conceptName: string,
        fileIds: string[]
    ): Promise<KnowledgeUnit> {
        // 1. 取得所有來源文件
        const files = await this.getFiles(fileIds);
        
        // 2. 分析每份文件的貢獻
        const contributions = await this.analyzeContributions(conceptName, files);
        
        // 3. 發現衝突
        const conflicts = await this.detectConflicts(conceptName, files);
        
        // 4. 合成統一知識
        const synthesized = await this.synthesizeKnowledge(
            conceptName,
            files,
            contributions,
            conflicts
        );
        
        // 5. 計算覆蓋地圖
        const coverageMap = await this.calculateCoverageMap(conceptName, files);
        
        // 6. 建立知識單元
        const knowledgeUnit: KnowledgeUnit = {
            id: generateId(),
            concept_id: generateConceptId(conceptName),
            concept_name: conceptName,
            concept_description: synthesized.description,
            source_files: contributions,
            synthesized_knowledge: synthesized.content,
            conflicts: conflicts,
            conflict_resolution: synthesized.conflictResolution,
            completeness_score: coverageMap.covered_aspects / coverageMap.total_aspects,
            confidence_score: this.calculateConfidence(files, conflicts),
            coverage_map: coverageMap,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            auto_generated: true
        };
        
        // 7. 儲存知識單元
        await supabase.from('knowledge_units').insert(knowledgeUnit);
        
        return knowledgeUnit;
    }
    
    /**
     * 合成統一知識
     */
    private async synthesizeKnowledge(
        conceptName: string,
        files: FileData[],
        contributions: SourceFile[],
        conflicts: ConflictRecord[]
    ): Promise<SynthesisResult> {
        const filesContent = files.map(f => `
### 文件：${f.filename}
${f.markdown_content?.slice(0, 3000) || '無內容'}
---
`).join('\n');
        
        const conflictsDescription = conflicts.length > 0
            ? `\n發現的衝突：\n${conflicts.map(c => `- ${c.description}`).join('\n')}`
            : '';
        
        const prompt = `
你是一位專業的知識整合專家。請將以下多份文件整合為一份完整、一致的知識文件。

**整合主題**：${conceptName}

**來源文件**：
${filesContent}

${conflictsDescription}

**整合要求**：
1. 綜合所有文件的資訊，形成完整的知識描述
2. 如果有衝突，請選擇最新、最權威的版本，並說明理由
3. 補充各文件之間的邏輯連結
4. 標示仍然缺失的知識面向

**輸出格式（JSON）**：
{
    "description": "概念的簡短描述（100字內）",
    "content": "完整的整合知識內容（Markdown 格式）",
    "conflictResolution": "衝突解決的說明（如無衝突則為空）",
    "missingAspects": ["缺失面向1", "缺失面向2"]
}
`;
        
        const result = await generateContent('gemini-3-pro-preview', prompt);
        return JSON.parse(result);
    }
    
    /**
     * 偵測知識衝突
     */
    private async detectConflicts(
        conceptName: string,
        files: FileData[]
    ): Promise<ConflictRecord[]> {
        const prompt = `
請分析以下文件，找出關於「${conceptName}」的資訊衝突：

${files.map(f => `
### ${f.filename}
${f.markdown_content?.slice(0, 2000) || '無內容'}
`).join('\n---\n')}

請找出：
1. 直接矛盾（contradiction）：兩份文件說法相反
2. 不一致（inconsistency）：數字、日期、步驟順序不同
3. 模糊（ambiguity）：同一概念在不同文件有不同定義

輸出 JSON 格式：
{
    "conflicts": [
        {
            "type": "contradiction|inconsistency|ambiguity",
            "description": "衝突描述",
            "files": ["文件名1", "文件名2"]
        }
    ]
}

如果沒有衝突，回傳 {"conflicts": []}
`;
        
        const result = await generateContent('gemini-3-flash-preview', prompt);
        const parsed = JSON.parse(result);
        
        return parsed.conflicts.map((c: any) => ({
            type: c.type,
            description: c.description,
            file_ids: files
                .filter(f => c.files.includes(f.filename))
                .map(f => f.id),
            resolved: false
        }));
    }
}
```

#### 8.4 資料庫結構

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

-- 建立索引
CREATE INDEX idx_knowledge_units_concept ON knowledge_units(concept_name);
CREATE INDEX idx_knowledge_unit_files_unit ON knowledge_unit_files(unit_id);
CREATE INDEX idx_knowledge_unit_files_file ON knowledge_unit_files(file_id);
```

---

### 9. 高效能語義搜尋（High-Performance Semantic Search）

#### 9.1 設計理念

**核心問題**：兩兩比較 Embedding 的 O(n²) 演算法在萬級文件時極慢。

**解決方案**：使用 Approximate Nearest Neighbor (ANN) 演算法實現近似即時搜尋。

#### 9.2 ANN 索引實作

```typescript
// lib/knowledge/search/ann-semantic-search.ts

/**
 * 高效能語義搜尋引擎
 * 
 * 使用 pgvector 的 IVFFlat 或 HNSW 索引實現快速向量搜尋
 */
export class ANNSemanticSearchEngine {
    /**
     * 語義搜尋（使用 ANN 索引）
     * 
     * @param query      搜尋查詢
     * @param topK       返回前 K 個結果
     * @param filters    額外過濾條件
     */
    async semanticSearch(
        query: string,
        topK: number = 10,
        filters?: SearchFilters
    ): Promise<SearchResult[]> {
        // 1. 生成查詢向量
        const queryEmbedding = await generateEmbedding(query);
        
        // 2. 使用 pgvector 的向量搜尋（已建立 HNSW 索引）
        const { data: results } = await supabase.rpc('semantic_search_ann', {
            query_embedding: queryEmbedding,
            similarity_threshold: 0.7,
            match_count: topK,
            filter_department: filters?.departmentId || null,
            filter_category: filters?.categoryId || null,
            filter_dikw_level: filters?.dikwLevel || null
        });
        
        return results.map((r: any) => ({
            file_id: r.id,
            filename: r.filename,
            similarity: r.similarity,
            snippet: r.snippet,
            dikw_level: r.dikw_level,
            decay_score: r.decay_score
        }));
    }
    
    /**
     * 批量相似度搜尋
     * 
     * 用於建構知識圖譜時的批量關聯發現
     */
    async batchSimilaritySearch(
        fileIds: string[],
        similarityThreshold: number = 0.75
    ): Promise<SimilarityEdge[]> {
        const edges: SimilarityEdge[] = [];
        
        // 使用 SQL 批量計算（比應用層兩兩比較快 100 倍）
        const { data: similarities } = await supabase.rpc('batch_similarity_matrix', {
            file_ids: fileIds,
            threshold: similarityThreshold
        });
        
        for (const sim of similarities) {
            edges.push({
                source_id: sim.file_id_1,
                target_id: sim.file_id_2,
                similarity: sim.similarity
            });
        }
        
        return edges;
    }
    
    /**
     * 增量更新索引
     * 
     * 新文件上傳時，只需更新增量部分
     */
    async updateIndex(fileId: string, embedding: number[]): Promise<void> {
        // HNSW 索引支援增量更新
        await supabase
            .from('files')
            .update({ content_embedding: embedding })
            .eq('id', fileId);
        
        // 觸發相關性計算（非同步）
        this.recalculateRelations(fileId).catch(console.error);
    }
    
    /**
     * 重新計算與新文件的關聯
     */
    private async recalculateRelations(newFileId: string): Promise<void> {
        // 只計算與新文件相關的邊，不重算整個圖
        const { data: newFile } = await supabase
            .from('files')
            .select('content_embedding')
            .eq('id', newFileId)
            .single();
        
        if (!newFile?.content_embedding) return;
        
        // 找出與新文件相似的現有文件
        const { data: similarFiles } = await supabase.rpc('find_similar_files', {
            query_embedding: newFile.content_embedding,
            threshold: 0.75,
            limit_count: 20,
            exclude_id: newFileId
        });
        
        // 建立關聯邊
        const edges = similarFiles.map((f: any) => ({
            source_file_id: newFileId,
            target_file_id: f.id,
            relation_type: 'semantic_similar',
            weight: f.similarity,
            created_at: new Date().toISOString()
        }));
        
        if (edges.length > 0) {
            await supabase.from('knowledge_relations').upsert(edges, {
                onConflict: 'source_file_id,target_file_id,relation_type'
            });
        }
    }
}

interface SearchFilters {
    departmentId?: string;
    categoryId?: string;
    dikwLevel?: string;
    decayStatus?: string[];
}

interface SimilarityEdge {
    source_id: string;
    target_id: string;
    similarity: number;
}
```

#### 9.3 PostgreSQL + pgvector 優化配置

```sql
-- 確保 pgvector 擴展已啟用
CREATE EXTENSION IF NOT EXISTS vector;

-- 為 content_embedding 建立 HNSW 索引（推薦用於高維向量）
-- HNSW 比 IVFFlat 更快，但佔用更多空間
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

-- 批量相似度矩陣計算函數
CREATE OR REPLACE FUNCTION batch_similarity_matrix(
    file_ids UUID[],
    threshold FLOAT DEFAULT 0.75
)
RETURNS TABLE(
    file_id_1 UUID,
    file_id_2 UUID,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f1.id as file_id_1,
        f2.id as file_id_2,
        1 - (f1.content_embedding <=> f2.content_embedding) as similarity
    FROM files f1
    CROSS JOIN files f2
    WHERE f1.id = ANY(file_ids)
    AND f2.id = ANY(file_ids)
    AND f1.id < f2.id  -- 避免重複計算
    AND 1 - (f1.content_embedding <=> f2.content_embedding) >= threshold;
END;
$$ LANGUAGE plpgsql;

-- 效能配置建議
-- 在 postgresql.conf 中設定：
-- effective_cache_size = 4GB（或系統記憶體的 50-75%）
-- maintenance_work_mem = 1GB（建立索引時）
-- hnsw.ef_search = 100（搜尋時的遍歷深度，越大越準但越慢）
```

#### 9.4 效能對比

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

/**
 * 知識變更通知類型
 */
export enum KnowledgeNotificationType {
    // 緊急通知（需立即處理）
    KNOWLEDGE_EXPIRED = 'knowledge_expired',           // 知識已過期
    CRITICAL_UPDATE = 'critical_update',               // 關鍵知識更新
    CONFLICT_DETECTED = 'conflict_detected',           // 發現知識衝突
    
    // 重要通知（建議當日處理）
    KNOWLEDGE_UPDATED = 'knowledge_updated',           // 知識已更新
    QUALITY_DEGRADATION = 'quality_degradation',       // 品質下降
    APPROACHING_EXPIRY = 'approaching_expiry',         // 即將過期
    
    // 資訊通知（可稍後處理）
    NEW_RELATED_KNOWLEDGE = 'new_related_knowledge',   // 新增相關知識
    AGGREGATION_AVAILABLE = 'aggregation_available',   // 可進行知識聚合
    FEEDBACK_SUMMARY = 'feedback_summary'              // 反饋摘要
}

/**
 * 通知事件
 */
export interface KnowledgeNotification {
    id: string;
    type: KnowledgeNotificationType;
    priority: 'urgent' | 'high' | 'normal' | 'low';
    
    // 受影響的對象
    affected_files: string[];
    affected_agents: string[];
    affected_users: string[];
    
    // 通知內容
    title: string;
    message: string;
    details: Record<string, any>;
    
    // 建議動作
    suggested_actions: SuggestedAction[];
    
    // 狀態
    status: 'pending' | 'sent' | 'read' | 'resolved';
    created_at: string;
    resolved_at?: string;
}

interface SuggestedAction {
    action_type: string;
    label: string;
    url?: string;
    params?: Record<string, any>;
}
```

#### 10.3 主動推送引擎

```typescript
// lib/knowledge/push/proactive-push-engine.ts

/**
 * 主動推送引擎
 * 
 * 監控知識變化，自動通知相關 Agent 和使用者
 */
export class ProactivePushEngine {
    /**
     * 處理知識更新事件
     */
    async handleKnowledgeUpdate(
        fileId: string,
        changeType: 'created' | 'updated' | 'deleted'
    ): Promise<void> {
        // 1. 找出使用此知識的 Agent
        const affectedAgents = await this.findAffectedAgents(fileId);
        
        // 2. 找出相關的知識單元
        const affectedUnits = await this.findAffectedUnits(fileId);
        
        // 3. 評估影響程度
        const impact = await this.assessImpact(fileId, changeType);
        
        // 4. 建立通知
        const notification = this.createNotification(
            changeType === 'deleted' 
                ? KnowledgeNotificationType.CRITICAL_UPDATE
                : KnowledgeNotificationType.KNOWLEDGE_UPDATED,
            fileId,
            affectedAgents,
            affectedUnits,
            impact
        );
        
        // 5. 發送通知
        await this.sendNotification(notification);
        
        // 6. 觸發後續動作
        if (impact.severity === 'critical') {
            await this.triggerEmergencyActions(notification);
        }
    }
    
    /**
     * 檢查即將過期的知識（定期執行）
     */
    async checkApproachingExpiry(): Promise<void> {
        // 找出 7 天內即將過期的知識
        const { data: expiringFiles } = await supabase
            .from('files')
            .select('id, filename, decay_score, decay_status, valid_until')
            .or(`decay_status.eq.stale,valid_until.lte.${addDays(new Date(), 7).toISOString()}`)
            .eq('gemini_state', 'SYNCED');
        
        for (const file of expiringFiles) {
            const affectedAgents = await this.findAffectedAgents(file.id);
            
            if (affectedAgents.length > 0) {
                const notification = this.createNotification(
                    KnowledgeNotificationType.APPROACHING_EXPIRY,
                    file.id,
                    affectedAgents,
                    [],
                    {
                        severity: 'warning',
                        days_until_expiry: this.calculateDaysUntilExpiry(file)
                    }
                );
                
                await this.sendNotification(notification);
            }
        }
    }
    
    /**
     * 偵測知識衝突
     */
    async detectAndNotifyConflicts(): Promise<void> {
        // 找出有衝突的知識單元
        const { data: conflictedUnits } = await supabase
            .from('knowledge_units')
            .select('*')
            .containedBy('conflicts', [{ resolved: false }])
            .eq('needs_human_review', true);
        
        for (const unit of conflictedUnits) {
            const notification = this.createNotification(
                KnowledgeNotificationType.CONFLICT_DETECTED,
                null,
                [],
                [unit.id],
                {
                    severity: 'high',
                    conflict_count: unit.conflicts.length,
                    concept_name: unit.concept_name
                }
            );
            
            // 通知知識擁有者
            const owners = await this.findKnowledgeOwners(unit.source_files);
            notification.affected_users = owners;
            
            await this.sendNotification(notification);
        }
    }
    
    /**
     * 找出使用特定知識的 Agent
     */
    private async findAffectedAgents(fileId: string): Promise<string[]> {
        const { data: agentFiles } = await supabase
            .from('agent_knowledge_sources')
            .select('agent_id')
            .eq('file_id', fileId);
        
        return agentFiles?.map(af => af.agent_id) || [];
    }
    
    /**
     * 發送通知
     */
    private async sendNotification(
        notification: KnowledgeNotification
    ): Promise<void> {
        // 1. 儲存通知
        await supabase.from('knowledge_notifications').insert(notification);
        
        // 2. 根據優先級選擇通知方式
        if (notification.priority === 'urgent') {
            // 緊急：即時推送 + Email
            await this.sendPushNotification(notification);
            await this.sendEmailNotification(notification);
        } else if (notification.priority === 'high') {
            // 重要：即時推送
            await this.sendPushNotification(notification);
        }
        
        // 3. 更新 Agent 狀態（如果適用）
        for (const agentId of notification.affected_agents) {
            await supabase
                .from('agents')
                .update({
                    knowledge_status: 'needs_review',
                    last_knowledge_alert: new Date().toISOString()
                })
                .eq('id', agentId);
        }
    }
    
    /**
     * 觸發緊急動作
     */
    private async triggerEmergencyActions(
        notification: KnowledgeNotification
    ): Promise<void> {
        // 對於關鍵更新，自動將受影響的 Agent 標記為需要重新訓練
        for (const agentId of notification.affected_agents) {
            await supabase
                .from('agents')
                .update({
                    status: 'needs_retraining',
                    status_reason: `關鍵知識更新：${notification.title}`
                })
                .eq('id', agentId);
        }
    }
    
    /**
     * 建立通知物件
     */
    private createNotification(
        type: KnowledgeNotificationType,
        fileId: string | null,
        affectedAgents: string[],
        affectedUnits: string[],
        impactDetails: Record<string, any>
    ): KnowledgeNotification {
        const priorityMap: Record<KnowledgeNotificationType, 'urgent' | 'high' | 'normal' | 'low'> = {
            [KnowledgeNotificationType.KNOWLEDGE_EXPIRED]: 'urgent',
            [KnowledgeNotificationType.CRITICAL_UPDATE]: 'urgent',
            [KnowledgeNotificationType.CONFLICT_DETECTED]: 'high',
            [KnowledgeNotificationType.KNOWLEDGE_UPDATED]: 'normal',
            [KnowledgeNotificationType.QUALITY_DEGRADATION]: 'high',
            [KnowledgeNotificationType.APPROACHING_EXPIRY]: 'normal',
            [KnowledgeNotificationType.NEW_RELATED_KNOWLEDGE]: 'low',
            [KnowledgeNotificationType.AGGREGATION_AVAILABLE]: 'low',
            [KnowledgeNotificationType.FEEDBACK_SUMMARY]: 'low'
        };
        
        return {
            id: generateId(),
            type,
            priority: priorityMap[type],
            affected_files: fileId ? [fileId] : [],
            affected_agents: affectedAgents,
            affected_users: [],
            title: this.getNotificationTitle(type),
            message: this.getNotificationMessage(type, impactDetails),
            details: impactDetails,
            suggested_actions: this.getSuggestedActions(type),
            status: 'pending',
            created_at: new Date().toISOString()
        };
    }
}
```

#### 10.4 資料庫結構

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

-- Agent 知識來源關聯表（用於追蹤影響範圍）
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

-- 建立索引
CREATE INDEX idx_notifications_status ON knowledge_notifications(status);
CREATE INDEX idx_notifications_priority ON knowledge_notifications(priority);
CREATE INDEX idx_notifications_created ON knowledge_notifications(created_at DESC);
CREATE INDEX idx_agent_knowledge_sources_agent ON agent_knowledge_sources(agent_id);
CREATE INDEX idx_agent_knowledge_sources_file ON agent_knowledge_sources(file_id);

-- 知識更新觸發器
CREATE OR REPLACE FUNCTION notify_knowledge_update()
RETURNS TRIGGER AS $$
BEGIN
    -- 發送通知到應用層（透過 Supabase Realtime）
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

## 🎯 Agent 整合設計

### Agent 知識路由整合

當使用者建立 Agent 時，系統會自動：

1. **分析 Agent 任務描述**
2. **匹配相關知識框架**
3. **選擇最相關的知識來源**
4. **生成 Agent System Prompt**

```typescript
// app/api/agents/architect/route.ts (擴充版)

export async function POST(request: NextRequest) {
    const { description, skills, department_id } = await request.json();
    
    // 1. 使用知識路由系統選擇知識來源
    const router = new AgentKnowledgeRouter();
    const knowledgeRoutes = await router.routeKnowledgeForAgent(
        description,
        skills,
        department_id
    );
    
    // 2. 建構知識上下文
    const knowledgeContext = await buildKnowledgeContext(knowledgeRoutes);
    
    // 3. 生成 Agent System Prompt
    const systemPrompt = generateSystemPrompt({
        description,
        skills,
        knowledgeContext,
        knowledgeRoutes
    });
    
    // 4. 建立 Agent
    const agent = await createAgent({
        name: extractAgentName(description),
        system_prompt: systemPrompt,
        knowledge_source_ids: knowledgeRoutes.map(r => r.id),
        skills
    });
    
    return NextResponse.json({ success: true, data: agent });
}
```

---

## 📊 技術門檻分析

### 1. 複雜度門檻

- **多層次 AI 推理**：需要理解 AI Agent 運作機制、Prompt Engineering、多步驟推理
- **語義分析技術**：需要理解 Embedding、向量相似度、語義搜尋
- **圖譜演算法**：需要理解知識圖譜、關聯發現、路徑搜尋
- **品質評估模型**：需要理解多維度評估、權重設計、閾值設定

### 2. 內容門檻

- **DIKW 理論**：需要深度理解 Data-Information-Knowledge-Wisdom 層級
- **知識管理最佳實踐**：需要理解企業知識管理、文件治理、版本控制
- **企業治理標準**：需要理解 Metadata Trinity、命名規範、分類架構

### 3. 實作門檻

- **系統整合複雜度**：需要整合多個子系統（索引、路由、品質、圖譜）
- **效能優化**：需要處理大規模資料、優化查詢效能
- **可擴展性設計**：需要設計可擴展的架構、支援未來擴充

---

## 🚀 實施路線圖

### Phase 1: 基礎建設（已完成 ✅）

1. ✅ 實作多維度知識索引系統
2. ✅ 實作知識品質評估系統
3. ✅ 建立知識圖譜基礎架構

### Phase 2: 智能路由（已完成 ✅）

1. ✅ 實作 Agent 知識路由系統
2. ✅ 整合到 Agent 建立流程
3. ✅ 優化路由演算法

### Phase 3: 進階功能（已完成 ✅）

1. ✅ 實作語義知識圖譜
2. ✅ 實作知識演化追蹤
3. ✅ 建立知識品質監控儀表板

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
| P2 | 每日學習報告 | 自動化學習分析 | 3 天 |

#### Phase 4.3: 知識聚合系統（預計 3-4 週）

| 優先序 | 功能 | 描述 | 預估工時 |
|-------|-----|------|---------|
| P0 | 概念提取 | 從文件提取核心概念 | 3 天 |
| P0 | 聚合候選發現 | 找出可整合的文件群 | 3 天 |
| P1 | 知識合成引擎 | AI 整合多份文件 | 5 天 |
| P1 | 衝突偵測 | 找出知識矛盾 | 3 天 |
| P2 | 知識單元管理 UI | CRUD 介面 | 4 天 |

#### Phase 4.4: 效能優化（預計 1-2 週）

| 優先序 | 功能 | 描述 | 預估工時 |
|-------|-----|------|---------|
| P0 | HNSW 索引建立 | pgvector 向量索引 | 1 天 |
| P0 | 語義搜尋 RPC | 優化搜尋函數 | 2 天 |
| P1 | 批量相似度計算 | 用於圖譜建構 | 2 天 |
| P2 | 效能監控 | 查詢時間追蹤 | 2 天 |

#### Phase 4.5: 主動推送系統（預計 2-3 週）

| 優先序 | 功能 | 描述 | 預估工時 |
|-------|-----|------|---------|
| P0 | 通知資料模型 | 資料庫結構 | 1 天 |
| P0 | 知識更新觸發器 | 變更自動通知 | 2 天 |
| P0 | Agent 影響追蹤 | 知識-Agent 關聯 | 2 天 |
| P1 | 通知中心 UI | 使用者通知介面 | 4 天 |
| P1 | 過期檢查排程 | 定時掃描 | 2 天 |
| P2 | Email 通知整合 | 緊急通知發送 | 3 天 |

### Phase 5: 優化與擴展（持續進行中 🔄）

1. 🔄 持續優化演算法
2. 🔄 擴展知識框架支援
3. 🔄 建立知識治理最佳實踐
4. 🔄 多語言支援
5. 🔄 多租戶隔離強化

---

## 📊 v3.0 技術落地總覽

### 系統架構圖

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EAKAP v3.0 知識架構引擎                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         展示層 (Presentation Layer)                   │   │
│  │                                                                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │ 通知中心  │ │ 知識地圖  │ │ 品質儀表板│ │ 聚合管理  │ │ 反饋收集  │   │   │
│  │  │    UI    │ │    UI    │ │    UI    │ │    UI    │ │    UI    │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                       │                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         服務層 (Service Layer)                        │   │
│  │                                                                       │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │   │
│  │  │ v2.0 核心服務  │  │ v3.0 進階服務  │  │  排程任務服務  │            │   │
│  │  │               │  │               │  │               │            │   │
│  │  │ - 多維度索引   │  │ - 衰減計算器   │  │ - 每日衰減更新 │            │   │
│  │  │ - 智能路由    │  │ - 反饋學習器   │  │ - 過期檢查    │            │   │
│  │  │ - 品質評估    │  │ - 聚合引擎    │  │ - 學習模型訓練 │            │   │
│  │  │ - 語義圖譜    │  │ - ANN 搜尋    │  │ - 衝突掃描    │            │   │
│  │  │ - 演化追蹤    │  │ - 推送引擎    │  │               │            │   │
│  │  └───────────────┘  └───────────────┘  └───────────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                       │                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         資料層 (Data Layer)                           │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │                        PostgreSQL + pgvector                    │ │   │
│  │  │                                                                  │ │   │
│  │  │  核心表                     │  v3.0 新增表                        │ │   │
│  │  │  ├── files                 │  ├── knowledge_feedback_events     │ │   │
│  │  │  ├── knowledge_instances   │  ├── knowledge_units               │ │   │
│  │  │  ├── knowledge_frameworks  │  ├── knowledge_unit_files          │ │   │
│  │  │  ├── knowledge_relations   │  ├── knowledge_notifications       │ │   │
│  │  │  └── agents                │  └── agent_knowledge_sources       │ │   │
│  │  │                            │                                     │ │   │
│  │  │  新增欄位 (files 表)                                              │ │   │
│  │  │  ├── decay_type, decay_score, decay_status, valid_until         │ │   │
│  │  │  ├── feedback_score, feedback_count, positive_ratio             │ │   │
│  │  │  └── needs_review, review_reason                                │ │   │
│  │  │                                                                  │ │   │
│  │  │  向量索引                                                         │ │   │
│  │  │  └── HNSW index on content_embedding (vector_cosine_ops)        │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 資料流架構圖

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           v3.0 資料流架構                                    │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  1. 知識衰減流程                                                            │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│  │ 文件上傳  │ → │ AI 推斷  │ → │ 衰減計算  │ → │ 狀態更新  │            │
│  │          │    │ 知識類型  │    │ 衰減分數  │    │ 資料庫   │            │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘            │
│                                                        ↓                   │
│                                              ┌──────────────────┐         │
│                                              │ 每日批次更新     │         │
│                                              │ (pg_cron)       │         │
│                                              └──────────────────┘         │
│                                                                            │
│  2. 反饋學習流程                                                            │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│  │ 使用者   │ → │ 反饋收集  │ → │ 統計計算  │ → │ 品質調整  │            │
│  │ 👍👎    │    │ 顯性+隱性 │    │ 正負比例  │    │ 學習引擎  │            │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘            │
│                                                        ↓                   │
│                                              ┌──────────────────┐         │
│                                              │ 需審查通知      │         │
│                                              │ (知識擁有者)    │         │
│                                              └──────────────────┘         │
│                                                                            │
│  3. 知識聚合流程                                                            │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│  │ 概念提取  │ → │ 聚類分析  │ → │ 衝突偵測  │ → │ 知識合成  │            │
│  │ (每文件)  │    │ (相似概念)│    │ (矛盾識別)│    │ (AI 整合) │            │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘            │
│                                                        ↓                   │
│                                              ┌──────────────────┐         │
│                                              │ 知識單元        │         │
│                                              │ (完整知識視角)   │         │
│                                              └──────────────────┘         │
│                                                                            │
│  4. 主動推送流程                                                            │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│  │ 知識變更  │ → │ 影響評估  │ → │ 通知建立  │ → │ 多管道發送 │            │
│  │ (觸發器)  │    │ (Agent)   │    │ (優先級)  │    │ 推送/Email │            │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘            │
│        ↑                                                                   │
│  ┌──────────┐                                                             │
│  │ 定時掃描  │ → 過期檢查、衝突偵測、品質下降                                │
│  │ (pg_cron)│                                                             │
│  └──────────┘                                                             │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 遷移腳本彙總

```sql
-- ============================================================
-- EAKAP v3.0 資料庫遷移腳本
-- 版本: 3.0
-- 日期: 2026-01-05
-- ============================================================

-- 1. 確保擴展已啟用
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. files 表新增欄位
ALTER TABLE files ADD COLUMN IF NOT EXISTS decay_type VARCHAR(20) DEFAULT 'reference';
ALTER TABLE files ADD COLUMN IF NOT EXISTS decay_score DECIMAL(3,2) DEFAULT 1.0;
ALTER TABLE files ADD COLUMN IF NOT EXISTS decay_status VARCHAR(20) DEFAULT 'fresh';
ALTER TABLE files ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE files ADD COLUMN IF NOT EXISTS feedback_score DECIMAL(3,2) DEFAULT 0.5;
ALTER TABLE files ADD COLUMN IF NOT EXISTS feedback_count INTEGER DEFAULT 0;
ALTER TABLE files ADD COLUMN IF NOT EXISTS positive_ratio DECIMAL(3,2) DEFAULT 0.5;
ALTER TABLE files ADD COLUMN IF NOT EXISTS last_feedback_at TIMESTAMPTZ;
ALTER TABLE files ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS review_reason TEXT;

-- 3. agents 表新增欄位
ALTER TABLE agents ADD COLUMN IF NOT EXISTS knowledge_status VARCHAR(30) DEFAULT 'up_to_date';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_knowledge_alert TIMESTAMPTZ;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS status_reason TEXT;

-- 4. 建立 HNSW 向量索引（取代原有索引）
DROP INDEX IF EXISTS idx_files_embedding;
CREATE INDEX IF NOT EXISTS idx_files_embedding_hnsw 
    ON files 
    USING hnsw (content_embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- 5. 建立新表（見各子系統的 SQL）
-- ... (反饋事件表、知識單元表、通知表等)

-- 6. 建立索引
CREATE INDEX IF NOT EXISTS idx_files_decay_status ON files(decay_status) WHERE gemini_state = 'SYNCED';

-- 7. 執行後驗證
SELECT 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'decay_type') as decay_type_added,
    (SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'idx_files_embedding_hnsw') as hnsw_index_created;
```

---

## 📈 預期效益

### 1. 技術優勢

| 能力 | v2.0 | v3.0 | 提升幅度 |
|-----|------|------|---------|
| 知識時效性判斷 | 粗略（依天數） | 精準（依類型衰減） | **準確度 +40%** |
| 品質評估依據 | 靜態分析 | 動態反饋學習 | **持續優化** |
| 知識完整性 | 單一文件視角 | 聚合知識單元 | **覆蓋度 +60%** |
| 語義搜尋速度 | O(n²) | O(n log n) | **100 倍提升** |
| 知識異常發現 | 被動等待 | 主動推送通知 | **即時響應** |

### 2. 商業價值

- **競爭優勢**：技術門檻極高，融合 AI 推理、知識管理、圖譜技術，不易被複製
- **客戶價值**：
  - 減少因過時知識導致的 Agent 錯誤回答
  - 自動整合分散知識，提升 Agent 回答完整性
  - 主動預警機制，避免重大業務失誤
- **市場定位**：企業級 AI 知識架構平台的標竿產品

### 3. 長期價值

- **知識資產化**：將企業知識轉化為可量化、可追蹤、可持續優化的數位資產
- **AI Agent 生態**：建立完整的 AI Agent 知識生命週期管理體系
- **持續優化**：透過反饋學習迴路，系統會越用越聰明
- **風險控管**：主動推送機制確保關鍵知識變更即時同步

### 4. v3.0 特有效益

| 功能 | 業務場景 | 預期效益 |
|-----|---------|---------|
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
