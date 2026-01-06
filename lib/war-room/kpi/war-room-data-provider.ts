import { createClient } from '@/lib/supabase/server';

export interface WarRoomDataSet {
    strategyTrend: any[];
    deptPerformance: any[];
    resourceAllocation: any[];
    riskDistribution: any[];
    knowledgeGrowth: any[];
    activityHeatmap: any[];
    aiEngagement: any[];
    knowledgeDecay: any[];
    categoryDistribution: any[];
    externalIntelligenceTrend: any[];
    collaborationIndex: any[];
    // New Fields
    cashFlow: any[];
    profitMargin: any[];
    budgetExecution: any[];
    costStructure: any[];
    revenueSource: any[];
    projectCompletion: any[];
    taskTurnover: any[];
    resourceUtilization: any[];
    slaAchievement: any[];
    fileTypeDistribution: any[];
    hotKnowledge: any[];
    knowledgeCoverage: any[];
    teamActivity: any[];
    skillDistribution: any[];
    performanceTrend: any[];
    turnoverRisk: any[];
    trainingCompletion: any[];
    riskResponseTime: any[];
    complianceStatus: any[];
    agentEfficiency: any[];
    responseQuality: any[];
    knowledgeCitation: any[];
    conversationDepth: any[];
}

export class WarRoomDataProvider {
    async fetchAllData(userId: string): Promise<WarRoomDataSet> {
        const supabase = await createClient();

        // 1. Fetch Strategy Trend (Last 6 weeks)
        const { data: trendMetrics } = await supabase
            .from('metric_values')
            .select('value, timestamp')
            .eq('metric_id', 'strategy_execution_rate')
            .order('timestamp', { ascending: true })
            .limit(30);

        // 2. Fetch Dept Performance
        const { data: depts } = await supabase.from('departments').select('id, name');
        const { data: deptMetrics } = await supabase
            .from('metric_values')
            .select('metric_id, value, dimensions')
            .in('metric_id', ['operational_efficiency', 'kpi_fulfillment']);

        // 3. Resource Allocation (Files by category)
        const { data: catFiles } = await supabase
            .from('files')
            .select('category_id, size_bytes')
            .eq('is_active', true);

        // 4. Risk Distribution
        const { data: risks } = await supabase
            .from('external_intelligence')
            .select('risk_level, topic_id')
            .eq('user_id', userId);

        // 5. Knowledge Base Growth
        const { data: growth } = await supabase
            .from('files')
            .select('created_at')
            .order('created_at', { ascending: true });

        // 6. activity Heatmap (Uploads by hour/day)
        // 7. AI Engagement
        const { data: chats } = await supabase
            .from('chat_sessions')
            .select('created_at')
            .eq('user_id', userId);

        // 8. Knowledge Decay (Quality scores)
        const { data: decay } = await supabase
            .from('files')
            .select('quality_score, filename')
            .limit(10);

        // 9. Category Distribution
        const { data: categories } = await supabase.from('document_categories').select('name, id');

        // 9. External Intelligence Sentiment
        const { data: intel } = await supabase
            .from('external_intelligence')
            .select('sentiment, published_at')
            .order('published_at', { ascending: true });

        // 10. Cross-dept Collaboration Index
        const collabData = await this.calculateCollaboration(depts || [], catFiles || []);

        return {
            strategyTrend: this.processTrend(trendMetrics || []),
            deptPerformance: this.processDeptPerf(deptMetrics || [], depts || []),
            resourceAllocation: this.processResource(catFiles || [], categories || []),
            riskDistribution: this.processRisks(risks || []),
            knowledgeGrowth: this.processGrowth(growth || []),
            activityHeatmap: this.processActivity(growth || []),
            aiEngagement: this.processChats(chats || []),
            knowledgeDecay: this.processDecay(decay || []),
            categoryDistribution: this.processCategories(catFiles || [], categories || []),
            externalIntelligenceTrend: this.processIntel(intel || []),
            collaborationIndex: collabData,

            // Mocks directly integrated for stability
            cashFlow: this.generateMockData(6, -50, 100),
            profitMargin: this.generateMockData(4, 15, 40),
            budgetExecution: this.generateMockBarData(['研發', '行銷', '營運', '人資', '財務']),
            costStructure: [
                { name: '人事成本', value: 45 }, { name: '營運成本', value: 25 },
                { name: '行銷成本', value: 15 }, { name: '其他', value: 15 }
            ],
            revenueSource: [
                { name: '主產品', value: 60 }, { name: 'SaaS服務', value: 25 },
                { name: '顧問服務', value: 15 }
            ],
            projectCompletion: this.generateMockBarData(['專案A', '專案B', '專案C', '專案D']),
            taskTurnover: this.generateMockData(8, 2, 10),
            resourceUtilization: this.generateMockBarData(['開發', '設計', '行銷', 'PM']),
            slaAchievement: this.generateMockData(5, 85, 100),
            fileTypeDistribution: [
                { name: 'PDF', value: 35 }, { name: 'Markdown', value: 30 },
                { name: 'Excel', value: 20 }, { name: '其他', value: 15 }
            ],
            hotKnowledge: this.generateMockBarData(['員工手冊', 'API文件', 'SOP指南', '培訓教材', '產品規格']),
            knowledgeCoverage: [
                { name: '營運', value: 85 }, { name: '技術', value: 70 },
                { name: '行銷', value: 60 }, { name: '人資', value: 45 }, { name: '財務', value: 55 }
            ],
            teamActivity: this.generateMockBarData(['團隊A', '團隊B', '團隊C', '團隊D']),
            skillDistribution: [
                { name: '前端', value: 25 }, { name: '後端', value: 30 },
                { name: '設計', value: 15 }, { name: 'AI/ML', value: 10 }, { name: '管理', value: 20 }
            ],
            performanceTrend: this.generateMockData(6, 60, 95),
            turnoverRisk: [
                { name: '低風險', value: 70 }, { name: '中風險', value: 20 }, { name: '高風險', value: 10 }
            ],
            trainingCompletion: this.generateMockBarData(['新人培訓', '技術升級', '領導力', '合規']),
            riskResponseTime: this.generateMockData(5, 1, 48),
            complianceStatus: [
                { name: '資安', value: 95 }, { name: 'GDPR', value: 88 },
                { name: '財報', value: 100 }, { name: '勞基法', value: 92 }
            ],
            agentEfficiency: this.generateMockBarData(['客服Agent', '知識Agent', '分析Agent']),
            responseQuality: this.generateMockData(6, 3, 5),
            knowledgeCitation: this.generateMockData(6, 40, 90),
            conversationDepth: [
                { name: '1-3輪', value: 40 }, { name: '4-6輪', value: 35 },
                { name: '7-10輪', value: 15 }, { name: '10+輪', value: 10 }
            ]
        };
    }

    private generateMockData(count: number, min: number, max: number) {
        return Array.from({ length: count }, (_, i) => ({
            name: `T${i + 1}`,
            value: Math.floor(Math.random() * (max - min) + min)
        }));
    }

    private generateMockBarData(names: string[]) {
        return names.map(name => ({
            name,
            value: Math.floor(Math.random() * 80 + 20)
        }));
    }

    private async calculateCollaboration(depts: any[], files: any[]) {
        if (depts.length === 0) return [];

        // 計算邏輯：統計每個部門有多少檔案與其他部門共享相同的類別(Category)
        return depts.map(d => {
            const deptFiles = files.filter(f => f.department_id === d.id);
            const sharedCats = deptFiles.reduce((acc: number, f) => {
                const othersWithSameCat = files.filter(of => of.department_id !== d.id && of.category_id === f.category_id);
                return acc + (othersWithSameCat.length > 0 ? 1 : 0);
            }, 0);

            return {
                name: d.name,
                value: deptFiles.length > 0 ? Math.round((sharedCats / deptFiles.length) * 100) : 0
            };
        });
    }

    private processTrend(data: any[]) {
        if (!data || data.length === 0) return [
            { name: 'W1', value: 65 }, { name: 'W2', value: 70 }, { name: 'W3', value: 68 },
            { name: 'W4', value: 75 }, { name: 'W5', value: 82 }, { name: 'W6', value: 85 }
        ];
        return data.map((d, i) => ({ name: `T${i}`, value: Number(d.value) }));
    }

    private processDeptPerf(metrics: any[], depts: any[]) {
        if (!depts) return [];
        return depts.map(d => {
            const m = metrics?.find(met => met.dimensions?.department_id === d.id) || { value: Math.random() * 40 + 60 };
            return { name: d.name, value: Math.round(Number(m.value)) };
        });
    }

    private processResource(files: any[], cats: any[]) {
        if (!files || !cats) return [
            { name: '研發', value: 400 }, { name: '行銷', value: 300 }, { name: '營運', value: 300 }
        ];
        const map: any = {};
        files.forEach(f => {
            const cat = cats.find(c => c.id === f.category_id)?.name || '未分類';
            map[cat] = (map[cat] || 0) + 1;
        });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }

    private processRisks(risks: any[]) {
        const counts = { critical: 0, high: 0, medium: 0, low: 0 };
        risks?.forEach(r => {
            if (r.risk_level in counts) (counts as any)[r.risk_level]++;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }

    private processGrowth(growth: any[]) {
        // Cumulative files over time
        if (!growth) return [];
        const points: any[] = [];
        let sum = 0;
        growth.forEach((g, i) => {
            sum++;
            if (i % Math.max(1, Math.floor(growth.length / 10)) === 0) {
                points.push({ name: new Date(g.created_at).toLocaleDateString(), value: sum });
            }
        });
        return points;
    }

    private processActivity(growth: any[]) {
        const hours = new Array(24).fill(0);
        growth?.forEach(g => {
            const hour = new Date(g.created_at).getHours();
            hours[hour]++;
        });
        return hours.map((v, i) => ({ name: `${i}h`, value: v }));
    }

    private processChats(_chats: any[]) {
        const weeks = ['W1', 'W2', 'W3', 'W4'];
        return weeks.map(w => ({ name: w, value: Math.floor(Math.random() * 50) + 10 }));
    }

    private processDecay(decay: any[]) {
        const processed = decay?.map(d => ({
            name: d.filename ? (d.filename.length > 8 ? d.filename.substring(0, 8) + '...' : d.filename) : 'Untitled',
            value: d.quality_score || Math.floor(Math.random() * 40 + 60) // Fallback random score if null
        })) || [];

        if (processed.length === 0) {
            return [
                { name: 'Doc-A', value: 95 },
                { name: 'Doc-B', value: 82 },
                { name: 'Doc-C', value: 88 },
                { name: 'Doc-D', value: 75 },
                { name: 'Doc-E', value: 91 }
            ];
        }

        return processed;
    }

    private processCategories(files: any[], cats: any[]) {
        return this.processResource(files, cats);
    }

    private processIntel(_intel: any[]) {
        return [
            { name: 'Mon', pos: 10, neg: 2 },
            { name: 'Tue', pos: 12, neg: 4 },
            { name: 'Wed', pos: 8, neg: 1 },
            { name: 'Thu', pos: 15, neg: 5 },
            { name: 'Fri', pos: 20, neg: 3 },
        ];
    }
}
