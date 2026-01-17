import { createClient } from '@/lib/supabase/server';

export type FeedbackSource = 'user_explicit' | 'user_implicit' | 'agent_self';
export type FeedbackType = 'helpful' | 'not_helpful' | 'outdated' | 'inaccurate';

export interface FeedbackEvent {
    file_id: string;
    source: FeedbackSource;
    feedback_type: FeedbackType;
    score: number; // -1.0 to 1.0
    user_id?: string;
    agent_id?: string;
    details?: Record<string, unknown>;
}

/**
 * Submit a feedback event and trigger statistics update
 */
export async function submitFeedback(event: FeedbackEvent) {
    const supabase = await createClient();

    // 1. Insert event
    const { error: insertError } = await supabase
        .from('knowledge_feedback_events')
        .insert({
            file_id: event.file_id,
            source: event.source,
            feedback_type: event.feedback_type,
            score: event.score,
            user_id: event.user_id,
            agent_id: event.agent_id,
            details: event.details || {}
        });

    if (insertError) {
        console.error('Error submitting feedback:', insertError);
        throw insertError;
    }

    // 2. Trigger async stats update (Fire and forget in a real queue system, but await here for simplicity in Vercel)
    await updateFileFeedbackStats(event.file_id);

    return { success: true };
}

/**
 * Recalculate and update feedback metrics for a file
 */
export async function updateFileFeedbackStats(fileId: string) {
    const supabase = await createClient();

    // 1. Fetch all feedback for the file
    const { data: events, error } = await supabase
        .from('knowledge_feedback_events')
        .select('score, feedback_type')
        .eq('file_id', fileId);

    if (error || !events) {
        console.error('Error fetching feedback for stats:', error);
        return;
    }

    // 2. Calculate metrics
    const totalCount = events.length;
    if (totalCount === 0) return;

    const positiveEvents = events.filter(e => e.score > 0).length;
    const positiveRatio = positiveEvents / totalCount;

    // Simple weighted score: just average score mapped to 0-1 range for now
    // Original score is -1 to 1. 
    // Average = sum / count (-1 to 1)
    // Normalized = (Average + 1) / 2 (0 to 1)
    const sumScore = events.reduce((acc, curr) => acc + curr.score, 0);
    const avgScore = sumScore / totalCount;
    const normalizedScore = (avgScore + 1) / 2;

    // 3. Update file
    const { error: updateError } = await supabase
        .from('files')
        .update({
            feedback_score: Number(normalizedScore.toFixed(2)),
            feedback_count: totalCount,
            positive_ratio: Number(positiveRatio.toFixed(2))
        })
        .eq('id', fileId);

    if (updateError) {
        console.error('Error updating file feedback stats:', updateError);
    }
}
