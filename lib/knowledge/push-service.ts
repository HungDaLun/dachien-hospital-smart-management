import { createClient } from '@/lib/supabase/server';
import { ANNSemanticSearchEngine } from './ann-search';

export interface Recommendation {
    file_id: string;
    filename: string;
    reason: string;
    score: number;
}

export class KnowledgePushService {
    private searchEngine = new ANNSemanticSearchEngine();

    /**
     * Analyze user interests based on their feedback history
     * In a real system, this would also analyze logs, chat history, etc.
     */
    async analyzeUserInterests(userId: string): Promise<void> {
        const supabase = await createClient();

        // 1. Fetch recent positive feedback
        const { data: events } = await supabase
            .from('knowledge_feedback_events')
            .select('details, score')
            .eq('user_id', userId)
            .gt('score', 0.5) // Positive feedback
            .limit(50);

        if (!events || events.length === 0) return;

        // 2. Extract concepts (Simplified: counting keywords/tags would be better)
        // Here we just mock taking a "tag" from details if available, or using dummy inference
        const interestMap: Record<string, number> = {};

        events.forEach(e => {
            // Assuming 'details' might contain tags or we infer from file content eventually
            // For now, let's pretend we extract a "topic"
            const topic = (e.details as any)?.topic || 'General';
            interestMap[topic] = (interestMap[topic] || 0) + 0.1;
        });

        // 3. Upsert interests
        for (const [concept, score] of Object.entries(interestMap)) {
            // Normalize score cap at 1.0
            const finalScore = Math.min(score + 0.5, 1.0);

            await supabase
                .from('user_interests')
                .upsert({
                    user_id: userId,
                    concept: concept,
                    score: finalScore,
                    source: 'feedback_inference'
                }, { onConflict: 'user_id, concept' });
        }
    }

    /**
     * Generate knowledge recommendations for a user
     */
    async generateRecommendations(userId: string): Promise<Recommendation[]> {
        const supabase = await createClient();

        // 1. Get user interests
        const { data: interests } = await supabase
            .from('user_interests')
            .select('concept, score')
            .eq('user_id', userId)
            .order('score', { ascending: false })
            .limit(5);

        if (!interests || interests.length === 0) return [];

        const recommendations: Recommendation[] = [];
        const seenFiles = new Set<string>();

        // 2. Search for each interest
        for (const interest of interests) {
            try {
                const results = await this.searchEngine.search(interest.concept, 3);

                results.forEach(res => {
                    if (!seenFiles.has(res.file_id)) {
                        recommendations.push({
                            file_id: res.file_id,
                            filename: res.filename,
                            reason: `Matches your interest in "${interest.concept}"`,
                            score: res.similarity * interest.score
                        });
                        seenFiles.add(res.file_id);
                    }
                });
            } catch (e) {
                console.error(`Error searching for interest ${interest.concept}`, e);
            }
        }

        // 3. Filter out things already pushed/seen (Optional, omitted for simplicity)

        // Sort by score
        return recommendations.sort((a, b) => b.score - a.score).slice(0, 5);
    }
}
