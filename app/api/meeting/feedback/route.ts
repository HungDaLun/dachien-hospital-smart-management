import { NextRequest, NextResponse } from 'next/server';
import { ValidationError, toApiResponse } from '@/lib/errors';
import { getCurrentUserProfile } from '@/lib/permissions';
import { recordMeetingFeedback } from '@/lib/ai-safeguards/layers/feedback-recorder';

/**
 * POST /api/meeting/feedback
 * 記錄使用者對會議訊息的回饋
 */
export async function POST(request: NextRequest) {
    try {
        const profile = await getCurrentUserProfile();
        const body = await request.json();
        const { message_id, rating, reason_code, comment } = body;

        if (!message_id) throw new ValidationError('請提供訊息 ID');
        if (!rating || (rating !== 1 && rating !== -1)) throw new ValidationError('請提供有效的評分');

        const result = await recordMeetingFeedback({
            messageId: message_id,
            userId: profile.id,
            rating: rating as 1 | -1,
            reasonCode: reason_code,
            comment: comment
        });

        return NextResponse.json({
            success: true,
            message: '感謝您的回饋！',
            data: result
        });

    } catch (error) {
        return toApiResponse(error);
    }
}
