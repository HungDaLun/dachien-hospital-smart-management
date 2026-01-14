import { NextRequest, NextResponse } from 'next/server';
import { analyzeImplicitFeedback } from '@/lib/feedback/implicit-analyzer';

export async function POST(request: NextRequest) {
    try {
        const { session_id, messages, involved_file_ids } = await request.json();

        if (!session_id || !messages || !involved_file_ids) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fire and forget - don't await analysis to return response quickly
        analyzeImplicitFeedback(session_id, messages, involved_file_ids).catch(e =>
            console.error('Background analysis failed:', e)
        );

        return NextResponse.json({ success: true, status: 'analysis_started' });

    } catch (error) {
        console.error('Error triggering analysis:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
