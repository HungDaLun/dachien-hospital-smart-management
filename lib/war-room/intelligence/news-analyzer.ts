import { generateContent, retryWithBackoff } from '@/lib/gemini/client';
import { RawNews } from './news-fetcher';
import { WatchTopic, ExternalIntelligence } from '../types';

export class NewsAnalyzer {

    async analyzeNews(
        news: RawNews,
        topic: WatchTopic,
        userId: string
    ): Promise<Partial<ExternalIntelligence>> {
        const prompt = `
You are a Corporate Intelligence Analyst. Analyze the following news article for its impact on our business.

CONTEXT:
- Watch Topic: "${topic.name}"
- Keywords: ${topic.keywords.join(', ')}
- Competitors: ${topic.competitors.join(', ')}
- Suppliers: ${topic.suppliers.join(', ')}

NEWS ARTICLE:
- Title: ${news.title}
- Source: ${news.source}
- Content: ${news.description}

TASK:
1. Determine Relevance Score (0-1): How relevant is this to our business context?
2. Assess Risk Level: 'low', 'medium', 'high', or 'critical'.
3. Identify Impact Areas (e.g., Supply Chain, Competition, Regulation).
4. Summarize: A 1-sentence executive summary.
5. Recommend Actions: 2-3 specific steps we should take.

Return JSON:
{
  "relevance_score": 0.85,
  "risk_level": "medium",
  "impact_areas": ["Supply Chain"],
  "sentiment": "negative",
  "ai_summary": "Summary text...",
  "key_points": ["Point 1", "Point 2"],
  "affected_entities": { "suppliers": ["Name"] },
  "recommended_actions": ["Action 1", "Action 2"]
}
`;

        try {
            const response = await retryWithBackoff(() => generateContent(
                'gemini-3-flash-preview',
                prompt
            ));

            const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
            const analysis = JSON.parse(cleanJson);

            return {
                user_id: userId,
                topic_id: topic.id,
                title: news.title,
                source: news.source,
                url: news.url,
                content: news.content,
                published_at: news.publishedAt,
                fetched_at: new Date().toISOString(),

                relevance_score: analysis.relevance_score || 0,
                risk_level: analysis.risk_level || 'low',
                impact_areas: analysis.impact_areas || [],
                sentiment: analysis.sentiment || 'neutral',
                ai_summary: analysis.ai_summary || news.description,
                key_points: analysis.key_points || [],
                affected_entities: analysis.affected_entities || {},
                recommended_actions: analysis.recommended_actions || [],

                is_read: false,
                is_bookmarked: false,
                status: 'pending'
            };

        } catch (error) {
            console.error('[NewsAnalyzer] Analysis failed:', error);
            // Fallback
            return {
                user_id: userId,
                topic_id: topic.id,
                title: news.title,
                source: news.source,
                url: news.url,
                content: news.content,
                published_at: news.publishedAt,
                fetched_at: new Date().toISOString(),
                relevance_score: 0,
                risk_level: 'low',
                ai_summary: 'AI Analysis Failed: ' + (error instanceof Error ? error.message : String(error))
            };
        }
    }
}
