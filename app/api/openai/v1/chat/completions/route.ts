import { createAdminClient } from '@/lib/supabase/admin';
import { checkAuth } from '@/lib/auth/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { chatWithGemini } from '@/lib/gemini/client';

export const runtime = 'nodejs'; // Ensure Node.js runtime for SSE optimization
export const dynamic = 'force-dynamic'; // Disable static caching

/**
 * Authorization Check
 * For this MVP, we accept requests with a valid Bearer token.
 * A more robust implementation would verify the token against Supabase Auth.
 */

export async function POST(req: NextRequest) {
    if (!checkAuth(req)) {
        return NextResponse.json(
            { error: { message: 'Missing or invalid Authorization header', type: 'invalid_request_error', param: null, code: null } },
            { status: 401 }
        );
    }

    try {
        const supabase = createAdminClient();
        const body = await req.json();
        const { model, messages, stream = true } = body;
        // const stream = false; // Enabled streaming

        console.log('[DEBUG] Request Stream param:', stream, typeof stream);

        if (!model) {
            return NextResponse.json(
                { error: { message: 'Model (Agent ID) is required', type: 'invalid_request_error', param: 'model', code: null } },
                { status: 400 }
            );
        }

        // 1. Fetch Agent (Model)
        // Check if input is a valid UUID, otherwise treat as Name
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(model);

        let query = supabase
            .from('agents')
            .select('id, name, system_prompt, model_version, temperature');

        if (isUUID) {
            query = query.eq('id', model);
        } else {
            query = query.eq('name', model);
        }

        const { data: agent, error: agentError } = await query.single();

        if (agentError || !agent) {
            return NextResponse.json(
                { error: { message: `Model (Agent) '${model}' not found. Please ensure the agent name is exact.`, type: 'invalid_request_error', param: 'model', code: 'model_not_found' } },
                { status: 404 }
            );
        }

        // 2. Fetch Knowledge Context (RAG)
        // Similar logic to api/chat/route.ts
        const { data: rules } = await supabase
            .from('agent_knowledge_rules')
            .select('rule_value')
            .eq('agent_id', agent.id);

        let fileUris: Array<{ uri: string; mimeType: string }> = [];

        if (rules && rules.length > 0) {
            // Parse rules "key:value"
            const tagFilters = rules.map(r => {
                const [key, value] = r.rule_value.split(':');
                return { key, value };
            });

            // Find files that match tags (OR logic for simplicity)
            const { data: files } = await supabase
                .from('files')
                .select('id, gemini_file_uri, mime_type')
                .eq('gemini_state', 'SYNCED')
                .in('id', (
                    await supabase
                        .from('file_tags')
                        .select('file_id')
                        .or(tagFilters.map(f => `and(tag_key.eq.${f.key},tag_value.eq.${f.value})`).join(','))
                ).data?.map(t => t.file_id) || []);

            if (files) {
                fileUris = files.map(f => ({
                    uri: f.gemini_file_uri!,
                    mimeType: f.mime_type
                }));
            }
        }

        // 3. Prepare Chat History
        // OpenAI messages are already in [{ role, content }] format.
        // We need to separate the *latest* user message from the *history*.
        const lastMessage = messages[messages.length - 1];
        const historyMessages = messages.slice(0, messages.length - 1);

        // Map OpenAI roles to Gemini roles if needed (user/assistant -> user/model)
        // chatWithGemini expects { role: 'user' | 'model', content: string }
        const geminiHistory = historyMessages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : m.role,
            content: m.content
        }));

        // 4. Call Gemini
        // Note: chatWithGemini returns a ReadableStream
        const geminiStream = await chatWithGemini(
            agent.model_version,
            agent.system_prompt,
            lastMessage.content,
            fileUris,
            geminiHistory
        );

        // 5. Handle Response
        if (stream) {
            const encoder = new TextEncoder();
            const decoder = new TextDecoder('utf-8');

            // Use AsyncGenerator for better SSE compatibility with Open WebUI/Node.js
            const streamIterator = async function* () {
                const reader = geminiStream.getReader();
                const created = Math.floor(Date.now() / 1000);
                const id = `chatcmpl-${Math.random().toString(36).slice(2)}`;

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) {
                            yield encoder.encode('data: [DONE]\n\n');
                            break;
                        }

                        const text = decoder.decode(value, { stream: true });

                        const chunk = {
                            id,
                            object: 'chat.completion.chunk',
                            created,
                            model: model,
                            choices: [
                                {
                                    index: 0,
                                    delta: { content: text },
                                    finish_reason: null,
                                },
                            ],
                        };

                        yield encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`);
                    }
                } catch (err) {
                    console.error('Stream Error:', err);
                }
            };

            // @ts-ignore - Next.js/Node supports passing iterator to Response in modern runtimes
            return new Response(streamIterator(), {
                headers: {
                    'Content-Type': 'text/event-stream; charset=utf-8',
                    'Cache-Control': 'no-cache, no-transform',
                    'Connection': 'keep-alive',
                    'X-Accel-Buffering': 'no',
                },
            });

        } else {
            // Non-streaming response
            console.log('[Non-Stream] Starting to read from Gemini stream...');
            const reader = geminiStream.getReader();
            const decoder = new TextDecoder();
            let fullText = '';
            let chunkCount = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log(`[Non-Stream] Stream finished. Total chunks: ${chunkCount}`);
                    break;
                }
                chunkCount++;
                const chunkText = decoder.decode(value, { stream: true });
                // console.log(`[Non-Stream] Chunk ${chunkCount}:`, chunkText.substring(0, 20) + '...');
                fullText += chunkText;
            }
            console.log('[Non-Stream] Full text assembled. Length:', fullText.length);

            return NextResponse.json({
                id: `chatcmpl-${Math.random().toString(36).slice(2)}`,
                object: 'chat.completion',
                created: Math.floor(Date.now() / 1000),
                model: model, // Echo back the exact model ID requested by the client
                choices: [
                    {
                        index: 0,
                        message: {
                            role: 'assistant',
                            content: fullText,
                        },
                        finish_reason: 'stop',
                    },
                ],
                usage: {
                    prompt_tokens: 0, // Placeholder
                    completion_tokens: 0, // Placeholder
                    total_tokens: 0
                }
            });
        }

    } catch (error) {
        console.error('Chat Completion API Error:', error);
        return NextResponse.json(
            { error: { message: 'Internal Server Error', type: 'server_error', param: null, code: null } },
            { status: 500 }
        );
    }
}
