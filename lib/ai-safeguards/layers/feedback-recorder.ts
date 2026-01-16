import { createClient } from '@/lib/supabase/server';

export interface FeedbackData {
    messageId: string;
    userId: string;
    rating: 1 | -1;
    reasonCode?: string;
    comment?: string;
}

/**
 * 記錄對話訊息的反饋
 */
export async function recordChatFeedback(data: FeedbackData) {
    const supabase = await createClient();

    const { data: result, error } = await supabase
        .from('chat_feedback')
        .upsert({
            message_id: data.messageId,
            user_id: data.userId,
            rating: data.rating,
            reason_code: data.reasonCode,
            comment: data.comment,
            updated_at: new Date().toISOString()
        }, { onConflict: 'message_id,user_id' })
        .select()
        .single();

    if (error) throw error;
    return result;
}

/**
 * 記錄會議訊息的反饋
 */
export async function recordMeetingFeedback(data: FeedbackData) {
    const supabase = await createClient();

    const { data: result, error } = await supabase
        .from('meeting_feedback')
        .upsert({
            message_id: data.messageId,
            user_id: data.userId,
            rating: data.rating,
            reason_code: data.reasonCode,
            comment: data.comment,
            updated_at: new Date().toISOString()
        }, { onConflict: 'message_id,user_id' })
        .select()
        .single();

    if (error) throw error;
    return result;
}
