import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MeetingService } from '@/lib/meeting/service';

// GET /api/meetings - List meetings
export async function GET(_req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: meetings, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(meetings);
}

// POST /api/meetings - Create meeting
export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, topic, departmentIds, consultantAgentIds, durationMinutes, scheduledStartTime, mode } = body;

        // Topic (Agenda) is strictly required for AI context
        if (!topic) {
            return NextResponse.json({ error: 'Agenda (topic) is required' }, { status: 400 });
        }

        const service = new MeetingService();
        const meetingId = await service.createMeeting(
            user.id,
            title || topic, // Use topic as title if not provided
            topic,
            departmentIds || [],
            consultantAgentIds || [],
            durationMinutes,
            scheduledStartTime,
            mode || 'quick_sync'
        );

        return NextResponse.json({ id: meetingId });
    } catch (error: unknown) {
        console.error('Error creating meeting:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
