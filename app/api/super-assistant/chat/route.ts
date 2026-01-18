import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUnifiedGateway, createOrchestratorAgent } from '@/lib/super-assistant';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { text, sessionId } = body;

        if (!text) {
            return NextResponse.json({ error: 'Missing text' }, { status: 400 });
        }

        // Initialize Gateway and Orchestrator
        const gateway = getUnifiedGateway();
        const orchestrator = createOrchestratorAgent({
            systemUserId: user.id
            // We could fetch department_id if needed, but for now user.id is sufficient for basic context
        });

        // Process message
        const unifiedMessage = await gateway.processWebMessage({
            userId: user.id,
            text,
            sessionId: sessionId || crypto.randomUUID()
        });

        const response = await orchestrator.processMessage(unifiedMessage);

        return NextResponse.json({
            text: response.content.text || '我可能需要更多資訊才能回答您。'
        });

    } catch (error) {
        console.error('[SuperAssistant API] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
