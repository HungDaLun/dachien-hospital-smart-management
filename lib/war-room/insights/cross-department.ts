import { createClient } from '@/lib/supabase/server';
import { generateContent, retryWithBackoff } from '@/lib/gemini/client';
import { CrossDepartmentInsight } from '../types';

export class CrossDepartmentInsightEngine {

    /**
     * Discover insights by comparing recent activities of two departments
     */
    async discoverCrossDepartmentInsights(userId: string): Promise<CrossDepartmentInsight[]> {
        const supabase = await createClient();

        // 1. Fetch all departments (simplified)
        const { data: departments } = await supabase.from('departments').select('id, name');
        if (!departments || departments.length < 2) return [];

        const insights: CrossDepartmentInsight[] = [];

        // 2. Compare Dept A vs Dept B (Pairwise)
        // For prototype, we just compare the first two found
        const deptA = departments[0];
        const deptB = departments[1];


        // Helper interface for local use
        interface RecentFile {
            filename: string;
            ai_summary: string | null;
        }

        // 3. Fetch recent files for both
        const [filesA, filesB] = await Promise.all([
            this.getRecentFiles(deptA.id) as Promise<RecentFile[]>,
            this.getRecentFiles(deptB.id) as Promise<RecentFile[]>
        ]);

        if (filesA.length === 0 || filesB.length === 0) return [];

        // 4. AI Analysis Prompt
        const prompt = `
You are a Strategic Connection Finder. Analyze the recent work of two departments to find hidden opportunities.

Department A (${deptA.name}) Recent Context:
${filesA.map((f: RecentFile) => `- ${f.filename}: ${f.ai_summary || 'No summary'}`).join('\n')}

Department B (${deptB.name}) Recent Context:
${filesB.map((f: RecentFile) => `- ${f.filename}: ${f.ai_summary || 'No summary'}`).join('\n')}

TASK:
1. Identify if Dept A's work is relevant to Dept B's goals.
2. Find ONE major collaboration opportunity or risk of duplicated work.
3. Ignore routine administrative tasks.

Return JSON array (max 1 item):
[
  {
    "type": "opportunity" | "risk" | "conflict",
    "title": "Short Title",
    "description": "Explanation of the connection",
    "importance_score": 0.85,
    "recommended_action": "What should they do?"
  }
]
`;

        try {
            const response = await retryWithBackoff(() => generateContent(
                'gemini-3-flash-preview',
                prompt
            ));
            const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
            const results = JSON.parse(cleanJson);

            // Define result type
            interface AIAnalysisResult {
                type: 'opportunity' | 'risk' | 'conflict';
                title: string;
                description: string;
                importance_score: number;
                recommended_action: string;
            }

            if (Array.isArray(results)) {
                results.forEach((res: AIAnalysisResult) => {
                    insights.push({
                        id: crypto.randomUUID(),
                        user_id: userId,
                        type: res.type,
                        title: res.title,
                        description: res.description,
                        departments: [deptA.id, deptB.id],
                        related_files: [], // In real app, we'd identity specific files
                        importance_score: res.importance_score,
                        recommended_action: res.recommended_action,
                        status: 'active',
                        created_at: new Date().toISOString()
                    });
                });
            }

        } catch (e) {
            console.error('[CrossDept] Analysis failed:', e);
        }

        return insights;
    }

    private async getRecentFiles(deptId: string) {
        const supabase = await createClient();
        const { data } = await supabase
            .from('files')
            .select('filename, ai_summary')
            .eq('department_id', deptId)
            .limit(5);
        return data || [];
    }
}
