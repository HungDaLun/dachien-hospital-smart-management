import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 清理 Markdown 格式，使文字更易閱讀
 */
function stripMarkdown(text: string): string {
    return text
        .replace(/###\s*/g, '')      // 移除 h3 標題
        .replace(/##\s*/g, '')       // 移除 h2 標題
        .replace(/#\s*/g, '')        // 移除 h1 標題
        .replace(/\*\*\*/g, '')      // 移除粗斜體
        .replace(/\*\*/g, '')        // 移除粗體
        .replace(/\*/g, '')          // 移除斜體
        .replace(/`/g, '')           // 移除行內程式碼
        .replace(/- /g, '• ')        // 將列表符號改為圓點
        .trim();
}

export class CorporateStrategyAnalyzer {
    private genAI: GoogleGenerativeAI;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }

    /**
     * 從快取取得最新的戰略分析（Dashboard 頁面使用）
     * 如果快取不存在或過期，返回預設訊息
     */
    async getLatestInsight(userId: string): Promise<string> {
        const supabase = await createClient();

        const { data: insight } = await supabase
            .from('ai_strategic_insights')
            .select('content, generated_at')
            .eq('user_id', userId)
            .single();

        if (insight && insight.content) {
            const generatedAt = new Date(insight.generated_at);
            const now = new Date();
            const hoursDiff = (now.getTime() - generatedAt.getTime()) / (1000 * 60 * 60);

            // 如果快取超過 24 小時，顯示更新提示
            if (hoursDiff > 24) {
                return `${insight.content}\n\n（此分析生成於 ${generatedAt.toLocaleDateString('zh-TW')}，系統將於凌晨 5:00 自動更新）`;
            }

            return insight.content;
        }

        // 沒有快取時的預設訊息
        return "企業戰略分析報告尚未生成。系統將於每日凌晨 5:00 自動執行全域分析，屆時您將看到完整的跨部門戰略洞察。您也可以手動觸發分析更新。";
    }

    /**
     * 生成戰略分析並寫入快取（由 Cron Job 呼叫）
     */
    async generateAndCacheInsight(userId: string): Promise<string> {
        const supabase = await createClient();

        // 1. 收集多維度數據
        const { data: recentFiles } = await supabase
            .from('files')
            .select('filename, ai_summary, metadata_analysis')
            .eq('is_active', true)
            .not('ai_summary', 'is', null)
            .order('updated_at', { ascending: false })
            .limit(15);

        const { data: risks } = await supabase
            .from('external_intelligence')
            .select('title, ai_summary, risk_level')
            .in('risk_level', ['critical', 'high'])
            .limit(5);

        const { data: metrics } = await supabase
            .from('metric_values')
            .select('metric_id, value, dimensions')
            .order('timestamp', { ascending: false })
            .limit(20);

        const { data: deptStats } = await supabase
            .from('departments')
            .select('name, id');

        // 2. 建構分析情境
        const context = `
### 內部資產與近期更新
${recentFiles?.map(f => `- ${f.filename}: ${f.ai_summary}`).join('\n') || '暫無資料'}

### 外部威脅與情報
${risks?.map(r => `- [${r.risk_level}] ${r.title}: ${r.ai_summary}`).join('\n') || '暫無高風險情報'}

### 營運指標
${metrics?.map(m => `- ${m.metric_id}: ${m.value}`).join('\n') || '暫無指標數據'}

### 組織架構
活躍部門數：${deptStats?.length || 0}
`;

        // 3. 呼叫 AI 生成分析
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

            const prompt = `
你是一位具備頂尖麥肯錫顧問背景與 CEO 管理思維的「企業戰略情報引擎」。
你的任務是從上述高度分散的企業數據（包含內部檔案摘要、外部情資、營運指標）中，挖掘出「企業主看不見的隱形危機與機會」。

請遵循以下思考框架：
1. 跨維度洞察：結合內部檔案（如預算）與外部風險（如市場變動）進行關聯分析。
2. 具體執行建議：不要只給大方向，給出具備具體下一步的具體建議。
3. 語氣：專業、冷靜、果斷。你是 CEO 的大腦，不是輔助。

內容限制：
- 約 300-400 字。
- 使用繁體中文。
- 不要使用 Markdown 格式（不要用 #, *, - 等符號），直接用純文字敘述。
- 分段落書寫，每段開頭用中文數字編號（一、二、三...）。

請開始產出今日的「AI 全域戰略情報總體報告」。
`;

            const result = await model.generateContent([
                { text: prompt },
                { text: `今日分析情境：\n${context}` }
            ]);
            const response = await result.response;
            const rawContent = response.text().trim();
            const cleanContent = stripMarkdown(rawContent);

            // 4. 寫入快取
            const contextSnapshot = {
                file_count: recentFiles?.length || 0,
                risk_count: risks?.length || 0,
                metric_count: metrics?.length || 0,
                dept_count: deptStats?.length || 0,
                generated_at: new Date().toISOString()
            };

            await supabase
                .from('ai_strategic_insights')
                .upsert({
                    user_id: userId,
                    content: cleanContent,
                    raw_content: rawContent,
                    model_version: 'gemini-3-pro-preview',
                    context_snapshot: contextSnapshot,
                    generated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            return cleanContent;

        } catch (error) {
            console.error('Error generating strategy insight:', error);
            return "全域戰略分析引擎目前正在處理大量跨部門數據，請稍後刷新以取得最新洞察。";
        }
    }

    /**
     * 舊版方法保留相容性（已棄用）
     * @deprecated 請使用 getLatestInsight() 或 generateAndCacheInsight()
     */
    async generateStrategicInsight(): Promise<string> {
        // 為了向後相容，嘗試從 session 獲取 user_id
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            return this.getLatestInsight(user.id);
        }

        return "請先登入以查看戰略分析報告。";
    }
}
