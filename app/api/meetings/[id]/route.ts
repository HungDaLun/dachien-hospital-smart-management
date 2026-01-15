import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MeetingService } from '@/lib/meeting/service';

// PATCH /api/meetings/[id] - Update status
export async function PATCH(
    req: NextRequest,
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
        const body = await req.json();
        const { status } = body;

        // Verify ownership
        const { data: meeting } = await supabase.from('meetings').select('user_id').eq('id', meetingId).single();
        if (!meeting || meeting.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (status === 'in_progress') {
            const service = new MeetingService();
            await service.startMeeting(meetingId);
        } else if (status === 'completed') {
            const service = new MeetingService();
            // This will generate minutes and save to knowledge base
            await service.endMeeting(meetingId);
        } else {
            await supabase.from('meetings').update({ status }).eq('id', meetingId);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/meetings/[id] - Delete meeting
export async function DELETE(
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
        // Verify ownership
        const { data: meeting } = await supabase.from('meetings').select('user_id').eq('id', meetingId).single();
        if (!meeting) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        if (meeting.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { error } = await supabase.from('meetings').delete().eq('id', meetingId);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting meeting:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
