import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUnifiedGateway, createOrchestratorAgent } from '@/lib/super-assistant';
import { Content } from '@google/generative-ai';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // 1. Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse request
        const body = await request.json();
        const { text, sessionId } = body;

        if (!text) {
            return NextResponse.json({ error: 'Missing text' }, { status: 400 });
        }

        const currentSessionId = sessionId || crypto.randomUUID();

        // 3. Initialize Gateway and Orchestrator
        const gateway = getUnifiedGateway();
        const orchestrator = createOrchestratorAgent({
            systemUserId: user.id
        });

        // 4. Load Conversation History
        const { data: historyData } = await supabase
            .from('chat_messages')
            .select('role, content')
            .eq('session_id', currentSessionId)
            .order('created_at', { ascending: true })
            .limit(10);

        const history: Content[] = (historyData || []).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // 5. Process Message via Gateway
        const unifiedMessage = await gateway.processWebMessage({
            userId: user.id,
            text,
            sessionId: currentSessionId
        });

        // 6. Save User Message to DB
        await supabase.from('chat_messages').insert({
            session_id: currentSessionId,
            user_id: user.id,
            role: 'user',
            content: text,
            agent_id: null // Super Assistant doesn't have a specific agent_id in 'agents' table yet, or we use a reserved one
        });

        // 7. Execute Orchestration with Context
        const response = await orchestrator.processMessage(unifiedMessage, history);

        // 8. Save Assistant Response to DB
        await supabase.from('chat_messages').insert({
            session_id: currentSessionId,
            user_id: user.id,
            role: 'assistant',
            content: response.content.text || '',
            agent_id: null
        });

        return NextResponse.json({
            text: response.content.text || '我可能需要更多資訊才能回答您。',
            sessionId: currentSessionId
        });

    } catch (error) {
        console.error('[SuperAssistant API] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
