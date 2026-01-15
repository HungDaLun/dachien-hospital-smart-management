import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MeetingService } from '@/lib/meeting/service';

// POST /api/meetings/[id]/turn - Trigger next turn (streaming)
export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
    const meetingId = resolvedParams.id;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const service = new MeetingService();

        // Verify ownership/access
        const { data: meeting } = await supabase.from('meetings').select('user_id').eq('id', meetingId).single();
        if (!meeting || meeting.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const stream = await service.processNextTurn(meetingId);

        if (!stream) {
            // 沒有下一位發言者（可能會議已結束或等待使用者）
            return NextResponse.json({ message: null });
        }

        // 返回 SSE 串流
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error: any) {
        console.error('Error processing turn:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
