import { NextRequest, NextResponse } from 'next/server';
import { submitFeedback, FeedbackEvent } from '@/lib/knowledge/feedback';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        // Allow anonymous feedback? Probably not for explicit actions.
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { fileId, type, score } = body;

        if (!fileId || !type || typeof score !== 'number') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const event: FeedbackEvent = {
            file_id: fileId,
            source: 'user_explicit',
            feedback_type: type,
            score: score,
            user_id: user.id
        };

        await submitFeedback(event);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Feedback API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
