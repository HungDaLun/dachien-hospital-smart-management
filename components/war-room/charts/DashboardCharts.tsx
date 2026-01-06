'use client';

import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    LineChart, Line, ScatterChart, Scatter, ZAxis, ComposedChart
} from 'recharts';
import { WarRoomDataSet } from '@/lib/war-room/kpi/war-room-data-provider';
import { HelpCircle, X } from 'lucide-react';

interface DashboardChartsProps {
    data: WarRoomDataSet;
}

interface ChartInfo {
    title: string;
    description: string;
    source: string;
    meaning: string;
}

const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#10B981', '#06B6D4', '#84CC16', '#EAB308'];

// 圖表說明配置
const CHART_INFO: Record<string, ChartInfo> = {
    strategyTrend: {
        title: '戰略執行趨勢',
        description: '顯示過去 6 週的戰略執行率變化',
        source: 'metric_values 表中的 strategy_execution_rate 指標',
        meaning: '趨勢向上表示團隊持續推進戰略目標，向下則需檢視阻礙因素'
    },
    deptPerformance: {
        title: '部門營運效能對比',
        description: '各部門的整體績效評分',
        source: 'departments 表與 metric_values 中的 operational_efficiency 指標',
        meaning: '高分部門可作為標竿，低分部門需優先關注資源配置'
    },
    knowledgeDistribution: {
        title: '知識資產分布層級',
        description: '按文件類別統計的知識資產分布',
        source: 'files 表與 document_categories 表',
        meaning: '確保各類型知識均衡發展，避免知識盲區'
    },
    riskRadar: {
        title: '風險多維度評估',
        description: '按風險等級分布的雷達圖',
        source: 'external_intelligence 表的 risk_level 欄位',
        meaning: '雷達圖越平衡表示風險管理越全面'
    },
    knowledgeGrowth: {
        title: '企業大腦成長曲線',
        description: '知識庫檔案累積成長趨勢',
        source: 'files 表的 created_at 時間序列',
        meaning: '持續上升表示組織知識持續累積'
    },
    activityHeatmap: {
        title: '系統活動時段分析',
        description: '全公司各時段的系統使用頻率',
        source: 'files 表的 created_at 小時分布',
        meaning: '了解團隊工作節奏，優化系統維護時段'
    },
    aiEngagement: {
        title: 'AI Agent 互動頻次',
        description: '員工與 AI Agent 的互動統計',
        source: 'chat_sessions 表',
        meaning: '高互動率表示 AI 賦能程度高'
    },
    knowledgeDecay: {
        title: '知識時效性監控',
        description: '各文件的品質分數分布',
        source: 'files 表的 quality_score 欄位',
        meaning: '低分文件需優先更新或歸檔'
    },
    intelligenceSentiment: {
        title: '情報輿情正負向趨勢',
        description: '外部情報的情緒分析',
        source: 'external_intelligence 表的 sentiment 欄位',
        meaning: '負向趨勢上升需關注危機處理'
    },
    collaborationIndex: {
        title: '跨部門知識連結指數',
        description: '各部門間的知識共享程度',
        source: 'files 表的 category_id 與 department_id 交叉分析',
        meaning: '高連結度表示跨部門協作良好'
    },
    cashFlow: {
        title: '現金流趨勢',
        description: '月度現金流入流出變化',
        source: '財務相關文件的 ETL 萃取數據',
        meaning: '正向現金流表示財務健康'
    },
    profitMargin: {
        title: '毛利率變化',
        description: '季度毛利率趨勢',
        source: 'metric_values 中的 profit_margin 指標',
        meaning: '毛利率下滑需檢視成本結構'
    },
    budgetExecution: {
        title: '預算執行率',
        description: '各部門預算使用進度',
        source: '財務預算文件與實際支出比對',
        meaning: '超支或執行率過低都需關注'
    },
    costStructure: {
        title: '成本結構分析',
        description: '營運成本的組成比例',
        source: '財務報表相關文件',
        meaning: '了解成本重心，優化資源配置'
    },
    revenueSource: {
        title: '營收來源分佈',
        description: '各業務線的營收貢獻',
        source: '銷售與財務文件',
        meaning: '多元營收來源降低風險'
    },
    projectCompletion: {
        title: '專案完成率',
        description: '在進行專案的完成進度',
        source: '專案管理相關文件',
        meaning: '低完成率需檢視資源與時程'
    },
    taskTurnover: {
        title: '任務週轉率',
        description: '任務從創建到完成的平均時間',
        source: '任務追蹤系統數據',
        meaning: '週轉率越高效率越好'
    },
    resourceUtilization: {
        title: '資源利用率',
        description: '人力與設備的使用效率',
        source: '人力資源與營運文件',
        meaning: '過高或過低都不理想'
    },
    slaAchievement: {
        title: 'SLA 達成率',
        description: '服務水準協議的達成情況',
        source: '客服與營運報告',
        meaning: '低於標準需改善服務流程'
    },
    fileTypeDistribution: {
        title: '檔案類型分佈',
        description: '知識庫中各類型檔案佔比',
        source: 'files 表的 mime_type 統計',
        meaning: '了解知識資產的形式構成'
    },
    hotKnowledge: {
        title: '熱門知識排行',
        description: '被引用或查詢最多的文件',
        source: 'chat_sessions 中的檔案引用統計',
        meaning: '高熱度文件為核心資產'
    },
    knowledgeCoverage: {
        title: '知識覆蓋率',
        description: '各業務領域的知識完整度',
        source: 'document_categories 與 files 的覆蓋分析',
        meaning: '低覆蓋領域需優先補充'
    },
    teamActivity: {
        title: '團隊活躍度',
        description: '各團隊的系統使用頻率',
        source: 'user_profiles 與 files 的上傳統計',
        meaning: '低活躍度可能表示採用率問題'
    },
    skillDistribution: {
        title: '技能分佈圖',
        description: '組織內專業技能的分布',
        source: 'user_profiles 的 expertise 欄位',
        meaning: '識別技能缺口與人才優勢'
    },
    performanceTrend: {
        title: '績效趨勢',
        description: '員工績效評分的變化',
        source: '績效考核相關文件',
        meaning: '下滑趨勢需關注激勵措施'
    },
    turnoverRisk: {
        title: '離職風險指數',
        description: '根據多維度預測的離職風險',
        source: '人力資源分析模型',
        meaning: '高風險員工需優先關懷'
    },
    trainingCompletion: {
        title: '培訓完成率',
        description: '必修培訓的完成情況',
        source: '培訓系統數據',
        meaning: '低完成率影響合規與能力提升'
    },
    riskResponseTime: {
        title: '風險處理時效',
        description: '從風險識別到處理的平均時間',
        source: 'external_intelligence 的時間戳分析',
        meaning: '時效越短危機處理越有效'
    },
    complianceStatus: {
        title: '合規狀態監控',
        description: '各法規遵循的達成情況',
        source: '合規相關文件與檢核表',
        meaning: '紅燈項目需立即處理'
    },
    agentEfficiency: {
        title: 'Agent 效能評估',
        description: '各 AI Agent 的回應品質',
        source: 'agents 表與 chat_sessions 的滿意度',
        meaning: '低效能 Agent 需優化或重建'
    },
    responseQuality: {
        title: '回應滿意度',
        description: '使用者對 AI 回應的評分',
        source: 'chat_sessions 的 feedback 欄位',
        meaning: '持續監控 AI 服務品質'
    },
    knowledgeCitation: {
        title: '知識引用率',
        description: 'AI 回應中引用知識庫的比例',
        source: 'chat_sessions 的回應分析',
        meaning: '高引用率表示知識庫有效運用'
    },
    conversationDepth: {
        title: '對話深度分佈',
        description: '單次對話的輪數統計',
        source: 'chat_sessions 的訊息數統計',
        meaning: '深度對話表示複雜問題的處理'
    },
};

// 快速說明彈出視窗
const InfoModal: React.FC<{ info: ChartInfo; onClose: () => void }> = ({ info, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div
            className="bg-slate-900 p-6 rounded-2xl border border-white/10 max-w-md mx-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white">{info.title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>
            <div className="space-y-4 text-sm">
                <div>
                    <div className="text-blue-400 font-semibold mb-1">說明</div>
                    <p className="text-gray-300">{info.description}</p>
                </div>
                <div>
                    <div className="text-green-400 font-semibold mb-1">數據來源</div>
                    <p className="text-gray-300">{info.source}</p>
                </div>
                <div>
                    <div className="text-purple-400 font-semibold mb-1">指標意義</div>
                    <p className="text-gray-300">{info.meaning}</p>
                </div>
            </div>
        </div>
    </div>
);

// 帶說明按鈕的圖表卡片
const ChartCard: React.FC<{
    title: string;
    children: React.ReactNode;
    infoKey?: string;
    className?: string
}> = ({ title, children, infoKey, className }) => {
    const [showInfo, setShowInfo] = useState(false);
    const info = infoKey ? CHART_INFO[infoKey] : null;

    return (
        <>
            <div
                className={`p-6 rounded-2xl border border-white/5 backdrop-blur-md transition-all hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] ${className}`}
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
            >
                <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-500 rounded-full" />
                        <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">{title}</h3>
                    </div>
                    {info && (
                        <button
                            onClick={() => setShowInfo(true)}
                            className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1 text-xs"
                        >
                            <HelpCircle size={14} />
                            <span>快速說明</span>
                        </button>
                    )}
                </div>
                <div className="h-[200px] w-full">
                    {children}
                </div>
            </div>
            {showInfo && info && <InfoModal info={info} onClose={() => setShowInfo(false)} />}
        </>
    );
};

// 生成模擬數據的輔助函式
const generateMockData = (count: number, min: number, max: number) => {
    return Array.from({ length: count }, (_, i) => ({
        name: `T${i + 1}`,
        value: Math.floor(Math.random() * (max - min) + min)
    }));
};

const generateMockBarData = (names: string[]) => {
    return names.map(name => ({
        name,
        value: Math.floor(Math.random() * 80 + 20)
    }));
};

const DashboardCharts: React.FC<DashboardChartsProps> = ({ data }) => {
    // 模擬數據 - 實際應從 WarRoomDataProvider 擴充
    const cashFlowData = generateMockData(6, -50, 100);
    const profitData = generateMockData(4, 15, 40);
    const budgetData = generateMockBarData(['研發', '行銷', '營運', '人資', '財務']);
    const costData = [
        { name: '人事成本', value: 45 },
        { name: '營運成本', value: 25 },
        { name: '行銷成本', value: 15 },
        { name: '其他', value: 15 }
    ];
    const revenueData = [
        { name: '主產品', value: 60 },
        { name: 'SaaS服務', value: 25 },
        { name: '顧問服務', value: 15 }
    ];
    const projectData = generateMockBarData(['專案A', '專案B', '專案C', '專案D']);
    const taskData = generateMockData(8, 2, 10);
    const resourceData = generateMockBarData(['開發', '設計', '行銷', 'PM']);
    const slaData = generateMockData(5, 85, 100);
    const fileTypeData = [
        { name: 'PDF', value: 35 },
        { name: 'Markdown', value: 30 },
        { name: 'Excel', value: 20 },
        { name: '其他', value: 15 }
    ];
    const hotKnowledgeData = generateMockBarData(['員工手冊', 'API文件', 'SOP指南', '培訓教材', '產品規格']);
    const coverageData = [
        { name: '營運', value: 85 },
        { name: '技術', value: 70 },
        { name: '行銷', value: 60 },
        { name: '人資', value: 45 },
        { name: '財務', value: 55 }
    ];
    const teamActivityData = generateMockBarData(['團隊A', '團隊B', '團隊C', '團隊D']);
    const skillData = [
        { name: '前端', value: 25 },
        { name: '後端', value: 30 },
        { name: '設計', value: 15 },
        { name: 'AI/ML', value: 10 },
        { name: '管理', value: 20 }
    ];
    const performanceData = generateMockData(6, 60, 95);
    const turnoverData = [
        { name: '低風險', value: 70 },
        { name: '中風險', value: 20 },
        { name: '高風險', value: 10 }
    ];
    const trainingData = generateMockBarData(['新人培訓', '技術升級', '領導力', '合規']);
    const riskTimeData = generateMockData(5, 1, 48);
    const complianceData = [
        { name: '資安', value: 95 },
        { name: 'GDPR', value: 88 },
        { name: '財報', value: 100 },
        { name: '勞基法', value: 92 }
    ];
    const agentData = generateMockBarData(['客服Agent', '知識Agent', '分析Agent']);
    const qualityData = generateMockData(6, 3, 5);
    const citationData = generateMockData(6, 40, 90);
    const depthData = [
        { name: '1-3輪', value: 40 },
        { name: '4-6輪', value: 35 },
        { name: '7-10輪', value: 15 },
        { name: '10+輪', value: 10 }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6 mt-8 w-full">

            {/* === 財務健康類 === */}
            <ChartCard title="戰略執行趨勢" infoKey="strategyTrend">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.strategyTrend}>
                        <defs>
                            <linearGradient id="colorStrategy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="value" stroke="#3B82F6" fillOpacity={1} fill="url(#colorStrategy)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="現金流趨勢" infoKey="cashFlow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashFlowData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                        <YAxis stroke="#ffffff40" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="毛利率變化" infoKey="profitMargin">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={profitData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                        <YAxis stroke="#ffffff40" fontSize={10} unit="%" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B' }} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="預算執行率" infoKey="budgetExecution">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                        <XAxis type="number" stroke="#ffffff40" fontSize={10} domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" stroke="#ffffff80" fontSize={10} width={50} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="成本結構分析" infoKey="costStructure">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={costData} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                            {costData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="營收來源分佈" infoKey="revenueSource">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={revenueData} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                            {revenueData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* === 營運效率類 === */}
            <ChartCard title="部門營運效能對比" infoKey="deptPerformance">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.deptPerformance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                        <XAxis type="number" stroke="#ffffff40" fontSize={10} hide />
                        <YAxis dataKey="name" type="category" stroke="#ffffff80" fontSize={10} width={60} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="專案完成率" infoKey="projectCompletion">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                        <YAxis stroke="#ffffff40" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Bar dataKey="value" fill="#EC4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="任務週轉率" infoKey="taskTurnover">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={taskData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                        <YAxis stroke="#ffffff40" fontSize={10} unit="天" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Line type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="資源利用率" infoKey="resourceUtilization">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resourceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                        <YAxis stroke="#ffffff40" fontSize={10} unit="%" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Bar dataKey="value" fill="#84CC16" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="SLA 達成率" infoKey="slaAchievement">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={slaData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                        <YAxis stroke="#ffffff40" fontSize={10} domain={[80, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="value" stroke="#F43F5E" fill="#F43F5E" fillOpacity={0.2} />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* === 知識資產類 === */}
            <ChartCard title="知識資產分布層級" infoKey="knowledgeDistribution">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data.resourceAllocation} innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                            {data.resourceAllocation.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="企業大腦成長曲線" infoKey="knowledgeGrowth">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.knowledgeGrowth}>
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} />
                        <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Line type="stepAfter" dataKey="value" stroke="#10B981" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="檔案類型分佈" infoKey="fileTypeDistribution">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={fileTypeData} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                            {fileTypeData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="熱門知識排行" infoKey="hotKnowledge">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hotKnowledgeData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                        <XAxis type="number" stroke="#ffffff40" fontSize={10} hide />
                        <YAxis dataKey="name" type="category" stroke="#ffffff80" fontSize={9} width={70} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Bar dataKey="value" fill="#EAB308" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="知識覆蓋率" infoKey="knowledgeCoverage">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={coverageData}>
                        <PolarGrid stroke="#ffffff10" />
                        <PolarAngleAxis dataKey="name" stroke="#ffffff60" fontSize={10} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#ffffff20" />
                        <Radar name="覆蓋率" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.5} />
                    </RadarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="知識時效性監控" infoKey="knowledgeDecay">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                        <YAxis dataKey="value" stroke="#ffffff40" fontSize={10} unit="%" />
                        <ZAxis range={[50, 400]} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Scatter name="Quality" data={data.knowledgeDecay} fill="#3B82F6" />
                    </ScatterChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* === 人力資源類 === */}
            <ChartCard title="團隊活躍度" infoKey="teamActivity">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamActivityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                        <YAxis stroke="#ffffff40" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="技能分佈圖" infoKey="skillDistribution">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={skillData} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                            {skillData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="績效趨勢" infoKey="performanceTrend">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                        <YAxis stroke="#ffffff40" fontSize={10} domain={[50, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Line type="monotone" dataKey="value" stroke="#EC4899" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="離職風險指數" infoKey="turnoverRisk">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={turnoverData} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                            <Cell fill="#10B981" />
                            <Cell fill="#F59E0B" />
                            <Cell fill="#EF4444" />
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="培訓完成率" infoKey="trainingCompletion">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trainingData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={9} />
                        <YAxis stroke="#ffffff40" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Bar dataKey="value" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* === 風險管理類 === */}
            <ChartCard title="風險多維度評估" infoKey="riskRadar">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.riskDistribution}>
                        <PolarGrid stroke="#ffffff10" />
                        <PolarAngleAxis dataKey="name" stroke="#ffffff60" fontSize={10} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#ffffff20" />
                        <Radar name="Risk" dataKey="value" stroke="#EF4444" fill="#EF4444" fillOpacity={0.5} />
                    </RadarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="情報輿情正負向趨勢" infoKey="intelligenceSentiment">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.externalIntelligenceTrend}>
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                        <YAxis stroke="#ffffff40" fontSize={10} hide />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Bar dataKey="pos" stackId="a" fill="#10B981" />
                        <Bar dataKey="neg" stackId="a" fill="#F43F5E" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="風險處理時效" infoKey="riskResponseTime">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={riskTimeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                        <YAxis stroke="#ffffff40" fontSize={10} unit="hr" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="合規狀態監控" infoKey="complianceStatus">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={complianceData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                        <XAxis type="number" stroke="#ffffff40" fontSize={10} domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" stroke="#ffffff80" fontSize={10} width={50} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* === AI 互動類 === */}
            <ChartCard title="系統活動時段分析" infoKey="activityHeatmap">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.activityHeatmap}>
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={8} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Bar dataKey="value" fill="#F59E0B" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="AI Agent 互動頻次" infoKey="aiEngagement">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.aiEngagement}>
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                        <YAxis stroke="#ffffff40" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Bar dataKey="value" barSize={20} fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="value" stroke="#EC4899" />
                    </ComposedChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Agent 效能評估" infoKey="agentEfficiency">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agentData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={9} />
                        <YAxis stroke="#ffffff40" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="回應滿意度" infoKey="responseQuality">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={qualityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                        <YAxis stroke="#ffffff40" fontSize={10} domain={[0, 5]} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="知識引用率" infoKey="knowledgeCitation">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={citationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                        <YAxis stroke="#ffffff40" fontSize={10} unit="%" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                        <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="對話深度分佈" infoKey="conversationDepth">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={depthData} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                            {depthData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* === 跨部門協作類 === */}
            <ChartCard title="跨部門知識連結指數" infoKey="collaborationIndex">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.collaborationIndex}>
                        <PolarGrid stroke="#ffffff10" />
                        <PolarAngleAxis dataKey="name" stroke="#ffffff60" fontSize={10} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#ffffff20" />
                        <Radar name="Connectivity" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                    </RadarChart>
                </ResponsiveContainer>
            </ChartCard>

        </div>
    );
};

export default DashboardCharts;
