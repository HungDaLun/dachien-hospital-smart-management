import { generateContent, retryWithBackoff } from '@/lib/gemini/client';
import { StrategicRecommendation } from '../types';
import { RiskAlertSystem } from '../kpi/risk-alerts';
import { CrossDepartmentInsightEngine } from './cross-department';

export class StrategyRecommendationEngine {

    private riskSystem = new RiskAlertSystem();
    private crossDeptEngine = new CrossDepartmentInsightEngine();

    async generateWeeklyRecommendations(userId: string): Promise<StrategicRecommendation[]> {
        // 1. Gather Inputs
        const [risks, crossDeptInsights] = await Promise.all([
            this.riskSystem.detectRisks(userId),
            this.crossDeptEngine.discoverCrossDepartmentInsights(userId)
        ]);

        // 2. Synthesize Prompt
        const prompt = `
You are a Chief Strategy Officer AI. Synthesize the following intelligence into 3 textual strategic recommendations.

INPUTS:
- Critical Risks: ${risks.critical_count} (Top: ${risks.risks[0]?.title || 'None'})
- Cross-Dept Insights: ${crossDeptInsights.map((i: any) => i.title).join(', ') || 'None'}

TASK:
1. Create 2-3 High Priority Recommendations.
2. Focus on "Risk Mitigation" or "Efficiency".
3. Be specific and actionable.

Return JSON:
[
  {
    "priority": "high",
    "category": "risk_mitigation",
    "title": "Title",
    "recommendation": "Detailed recommendation...",
    "expected_benefit": "Benefit description",
    "next_steps": ["Step 1", "Step 2"]
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

            return results.map((res: any) => ({
                id: crypto.randomUUID(),
                user_id: userId,
                week_start_date: new Date().toISOString(),
                priority: res.priority,
                category: res.category,
                title: res.title,
                recommendation: res.recommendation,
                expected_benefit: res.expected_benefit,
                evidence_files: [],
                next_steps: res.next_steps,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }));

        } catch (e) {
            console.error('[Strategy] Generation failed:', e);
            return [];
        }
    }
}
