import { createClient } from '@/lib/supabase/server';
import { generateContent, retryWithBackoff } from '@/lib/gemini/client';
import { DepartmentDailyBrief } from '../types';

export class DepartmentDailyBriefGenerator {

    /**
     * Generate AI Daily Brief for a Department
     */
    async generateDailyBrief(departmentId: string): Promise<DepartmentDailyBrief> {
        const supabase = await createClient();

        // 1. Fetch Department Context (Files & Conversations) from last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Recent Files
        const { data: files } = await supabase
            .from('files')
            .select('filename, ai_summary, created_at')
            .eq('department_id', departmentId)
            .gte('updated_at', oneWeekAgo.toISOString())
            .limit(10);

        // Helper interface
        interface RecentFile {
            filename: string;
            ai_summary: string | null;
            created_at: string;
        }

        const safeFiles = (files || []) as RecentFile[];

        // Recent Metrics (Mocking for now as we don't have direct linkage yet)
        // In real implementation: Query metric_values join department
        const metricsSummary = "Revenue: Stable, Costs: slightly up";

        // 2. AI Summarization Prompt
        const prompt = `
You are a Departmental Intelligence Officer. Generate a daily brief for the department head.

CONTEXT:
- Recent Files Uploaded: ${safeFiles.map((f: RecentFile) => f.filename).join(', ') || 'None'}
- File Summaries: ${safeFiles.map((f: RecentFile) => f.ai_summary || 'No summary').join('; ') || 'None'}
- Key Metrics Overview: ${metricsSummary}

TASK:
1. Identify Top 3 Updates.
2. Flag any Urgent Items (risks, deadlines).
3. Write a concise executive summary (max 100 words).
4. Generate 2 key insights.

Return JSON:
{
  "top_updates": ["Update 1", "Update 2"],
  "urgent_items": ["Urgent 1"],
  "ai_summary": "Executive summary...",
  "insights": ["Insight 1", "Insight 2"]
}
`;

        let aiResult;
        try {
            const response = await retryWithBackoff(() => generateContent(
                'gemini-3-flash-preview',
                prompt
            ));
            const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
            aiResult = JSON.parse(cleanJson);
        } catch (e) {
            console.error('[DailyBrief] AI generation failed:', e);
            aiResult = {
                top_updates: ['Unable to generate updates'],
                urgent_items: [],
                ai_summary: 'AI Service currently unavailable.',
                insights: []
            };
        }

        // 3. Construct Brief Object
        return {
            id: crypto.randomUUID(),
            department_id: departmentId,
            brief_date: new Date().toISOString().split('T')[0],
            top_updates: aiResult.top_updates,
            urgent_items: aiResult.urgent_items,
            ai_summary: aiResult.ai_summary,
            insights: aiResult.insights,
            key_metrics: [
                { label: 'Weekly Uploads', value: files?.length.toString() || '0', trend: 'stable' }
            ],
            stats: {
                total_files: 150, // Mock
                files_updated_today: safeFiles.filter((f: RecentFile) => f.created_at >= new Date().toISOString().split('T')[0]).length || 0,
                active_agents: 3,
                conversations_count: 12,
                knowledge_health_score: 85
            },
            generated_at: new Date().toISOString()
        };
    }
}
