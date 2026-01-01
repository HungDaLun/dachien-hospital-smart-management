/**
 * 對話 API
 * 提供與 Agent 對話功能，支援串流回應
 * 遵循 EAKAP API 規範
 */
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationError, NotFoundError, ValidationError, toApiResponse } from '@/lib/errors';

/**
 * POST /api/chat
 * 發送訊息並取得 AI 回應
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // 驗證使用者身份
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new AuthenticationError();
        }

        // 解析請求
        const body = await request.json();
        const { agent_id, message, session_id } = body;

        if (!agent_id) {
            throw new ValidationError('請選擇要對話的 Agent');
        }

        if (!message || !message.trim()) {
            throw new ValidationError('請輸入訊息');
        }

        // 取得 Agent 資訊
        const { data: agent, error: agentError } = await supabase
            .from('agents')
            .select('id, name, system_prompt, model_version, temperature')
            .eq('id', agent_id)
            .eq('is_active', true)
            .single();

        if (agentError || !agent) {
            throw new NotFoundError('Agent');
        }

        // 取得或建立 Session
        let currentSessionId = session_id;

        if (!currentSessionId) {
            // 建立新 Session
            const { data: newSession, error: sessionError } = await supabase
                .from('chat_sessions')
                .insert({
                    agent_id: agent.id,
                    user_id: user.id,
                    title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
                })
                .select()
                .single();

            if (sessionError) {
                console.error('建立 Session 失敗:', sessionError);
                return NextResponse.json(
                    { success: false, error: { code: 'SESSION_ERROR', message: '建立對話失敗' } },
                    { status: 500 }
                );
            }

            currentSessionId = newSession.id;
        }

        // 儲存使用者訊息
        const { error: userMsgError } = await supabase
            .from('chat_messages')
            .insert({
                session_id: currentSessionId,
                agent_id: agent.id,
                role: 'user',
                content: message,
            });

        if (userMsgError) {
            console.error('儲存訊息失敗:', userMsgError);
        }

        // 取得 Agent 知識綁定規則
        const { data: rules } = await supabase
            .from('agent_knowledge_rules')
            .select('rule_value')
            .eq('agent_id', agent.id);

        let fileUris: Array<{ uri: string; mimeType: string }> = [];

        if (rules && rules.length > 0) {
            // 解析規則並查詢符合標籤的檔案
            // 規則格式為 "key:value"
            const tagFilters = rules.map(r => {
                const [key, value] = r.rule_value.split(':');
                return { key, value };
            });

            // 查詢符合標籤且已同步的檔案
            // 注意：這裡使用聯集 (OR) 的邏輯，只要符合任一標籤即可
            // 實務上可依需求調整為交集 (AND)
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

        // 取得對話歷史
        const { data: history } = await supabase
            .from('chat_messages')
            .select('role, content')
            .eq('session_id', currentSessionId)
            .order('created_at', { ascending: true })
            .limit(10); // 上取最近 10 則訊息

        // 呼叫 Gemini 串流介面
        const { chatWithGemini } = await import('@/lib/gemini/client');

        const stream = await chatWithGemini(
            agent.model_version,
            agent.system_prompt,
            message,
            fileUris,
            (history || []).map(msg => ({
                role: msg.role === 'assistant' ? 'model' : msg.role,
                content: msg.content
            }))
        );

        // 建立 SSE 串流回應
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        let fullAiResponse = '';

        const sseStream = new ReadableStream({
            async start(controller) {
                const reader = stream.getReader();
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunkText = decoder.decode(value);
                        fullAiResponse += chunkText;

                        // 正確的 SSE 格式: data: [JSON]\n\n
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`));
                    }

                    // 串流結束，發送完成訊號
                    controller.enqueue(encoder.encode(`data: [DONE]\n\n`));

                    // 異步儲存 AI 回應到資料庫
                    const { data: aiMessage } = await supabase
                        .from('chat_messages')
                        .insert({
                            session_id: currentSessionId,
                            agent_id: agent.id,
                            role: 'assistant',
                            content: fullAiResponse,
                        })
                        .select()
                        .single();

                    // 如果是新 Session，回傳 sessionId
                    if (!session_id && aiMessage) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ session_id: currentSessionId })}\n\n`));
                    }

                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            }
        });

        return new Response(sseStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        return toApiResponse(error);
    }
}
