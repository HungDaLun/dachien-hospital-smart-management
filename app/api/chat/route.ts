/**
 * 對話 API
 * 提供與 Agent 對話功能，支援串流回應
 * 遵循 EAKAP API 規範
 * 
 * 🔧 修正：改用向量搜尋 + markdown_content 作為知識來源
 *    不再依賴 gemini_file_uri（48 小時後會過期）
 */
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, ValidationError, toApiResponse } from '@/lib/errors';
import { getCurrentUserProfile, canAccessAgent } from '@/lib/permissions';
import { generateEmbedding } from '@/lib/knowledge/embedding';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * POST /api/chat
 * 發送訊息並取得 AI 回應
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // 取得使用者資料（包含權限檢查）
        const profile = await getCurrentUserProfile();

        // 解析請求
        const body = await request.json();
        const { agent_id, message, session_id } = body;

        if (!agent_id) {
            throw new ValidationError('請選擇要對話的 Agent');
        }

        if (!message || !message.trim()) {
            throw new ValidationError('請輸入訊息');
        }

        // 取得 Agent 資訊（新增 enabled_tools 欄位）
        const { data: agent, error: agentError } = await supabase
            .from('agents')
            .select('id, name, system_prompt, model_version, temperature, knowledge_files, enabled_tools')
            .eq('id', agent_id)
            .eq('is_active', true)
            .single();

        if (agentError || !agent) {
            throw new NotFoundError('Agent');
        }

        // 檢查使用者是否有權限存取此 Agent
        const hasAccess = await canAccessAgent(profile, agent_id);
        if (!hasAccess) {
            throw new NotFoundError('Agent'); // 為了安全，不透露 Agent 是否存在
        }

        // 取得或建立 Session
        let currentSessionId = session_id;

        if (!currentSessionId) {
            // 建立新 Session
            const { data: newSession, error: sessionError } = await supabase
                .from('chat_sessions')
                .insert({
                    agent_id: agent.id,
                    user_id: profile.id,
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

        // ============================================
        // 知識檢索邏輯 (保持原樣，用於構建 System Prompt)
        // ============================================
        // 取得 Agent 知識綁定規則
        const { data: rules } = await supabase
            .from('agent_knowledge_rules')
            .select('rule_type, rule_value')
            .eq('agent_id', agent.id);

        let matchedFileIds: Set<string> = new Set(agent.knowledge_files || []);
        const adminSupabase = createAdminClient();
        let departmentIds: string[] = [];

        if (rules && rules.length > 0) {
            const tagRules = rules.filter(r => r.rule_type === 'TAG');
            const categoryRules = rules.filter(r => r.rule_type === 'CATEGORY');
            const deptRules = rules.filter(r => r.rule_type === 'DEPARTMENT');

            if (tagRules.length > 0) {
                const tagFilters = tagRules.map(r => {
                    const [key, value] = r.rule_value.split(':');
                    return { key, value };
                });
                const { data: tagFiles } = await adminSupabase
                    .from('file_tags')
                    .select('file_id')
                    .or(tagFilters.map(f => `and(tag_key.eq.${f.key},tag_value.eq.${f.value})`).join(','));
                tagFiles?.forEach(f => matchedFileIds.add(f.file_id));
            }

            if (deptRules.length > 0) {
                const deptValues = deptRules.map(r => r.rule_value);
                const { data: departments } = await adminSupabase
                    .from('departments')
                    .select('id')
                    .or(`code.in.(${deptValues.map(v => `"${v}"`).join(',')}),name.in.(${deptValues.map(v => `"${v}"`).join(',')})`);

                if (departments && departments.length > 0) {
                    departmentIds = departments.map(d => d.id);
                    const { data: deptFiles } = await adminSupabase
                        .from('files')
                        .select('id')
                        .in('department_id', departmentIds)
                        .in('gemini_state', ['SYNCED', 'NEEDS_REVIEW', 'APPROVED']);
                    deptFiles?.forEach(f => matchedFileIds.add(f.id));
                }
            }

            if (categoryRules.length > 0) {
                const catIds = categoryRules.map(r => r.rule_value);
                const { data: catFiles } = await adminSupabase
                    .from('files')
                    .select('id')
                    .in('category_id', catIds)
                    .in('gemini_state', ['SYNCED', 'NEEDS_REVIEW', 'APPROVED']);
                catFiles?.forEach(f => matchedFileIds.add(f.id));
            }
        }

        let knowledgeContext = '';
        let retrievedFiles: any[] = [];

        try {
            const embedding = await generateEmbedding(message);

            if (departmentIds.length > 0) {
                for (const deptId of departmentIds) {
                    const { data: vectorMatches, error: rpcError } = await adminSupabase.rpc('search_knowledge_by_embedding', {
                        query_embedding: embedding,
                        match_threshold: 0.1,
                        match_count: 5,
                        filter_department: deptId
                    });
                    if (!rpcError && vectorMatches) retrievedFiles.push(...vectorMatches);
                }
            } else if (matchedFileIds.size > 0) {
                const { data: files } = await adminSupabase
                    .from('files')
                    .select('id, filename, markdown_content, metadata_analysis, department_id')
                    .in('id', Array.from(matchedFileIds))
                    .in('gemini_state', ['SYNCED', 'NEEDS_REVIEW', 'APPROVED']);

                if (files) {
                    retrievedFiles = files.map(f => ({
                        id: f.id,
                        filename: f.filename,
                        content: f.markdown_content,
                        summary: f.metadata_analysis?.summary,
                        department_id: f.department_id
                    }));
                }
            } else {
                const { data: vectorMatches, error: rpcError } = await adminSupabase.rpc('search_knowledge_global', {
                    query_embedding: embedding,
                    match_threshold: 0.1,
                    match_count: 8
                });
                if (!rpcError && vectorMatches) retrievedFiles = vectorMatches;
            }
        } catch (vectorErr) {
            console.error('[Agent Chat] 向量搜尋失敗:', vectorErr);
        }

        if (retrievedFiles.length > 0) {
            knowledgeContext = retrievedFiles.map((f: any, i: number) => {
                const content = f.content || f.markdown_content || '';
                const summary = f.summary || '';
                const truncatedContent = content.length > 8000
                    ? content.substring(0, 8000) + '...(內容已截斷)'
                    : content;

                return `【知識文件 ${i + 1}：${f.filename || f.source || '未命名'}】\n` +
                    (summary ? `摘要：${summary}\n` : '') +
                    `內容：\n${truncatedContent}`;
            }).join('\n\n---\n\n');
        }

        // 取得對話歷史
        const { data: history } = await supabase
            .from('chat_messages')
            .select('role, content')
            .eq('session_id', currentSessionId)
            .order('created_at', { ascending: true })
            .limit(10);

        // 建構完整的系統提示詞
        const fullSystemPrompt = `${agent.system_prompt}

${knowledgeContext ? `
【已載入的知識庫內容】
${knowledgeContext}

【回答準則】
1. 優先引用上述知識庫中的具體事實進行回答。
2. 即使知識庫中有具體檔案，也請結合您的專業邏輯進行分析。
3. 引用時請標註來源文件名稱。
4. 以繁體中文回答，語氣專業、精準。
` : `
【系統提示：知識庫未掛載】
目前此 Agent 尚未掛載特定的「靜態資產」或找不到相關的知識預選。
請直接根據您的內部專業知識 (Persona) 回答使用者的問題，並在適當時機提示使用者可以掛載相關文件來提供更精準的業務分析。
`}`;

        // ============================================
        // 🔧 新增：工具呼叫處理邏輯
        // ============================================
        const enabledTools = agent.enabled_tools || [];

        // 如果有啟用工具，使用 chatWithTools
        if (enabledTools.length > 0) {
            const { chatWithTools } = await import('@/lib/gemini/function-calling');

            const toolStream = await chatWithTools(
                process.env.GEMINI_API_KEY || '',
                agent.model_version || 'gemini-1.5-flash',
                fullSystemPrompt,
                message,
                enabledTools,
                {
                    userId: profile.id,
                    agentId: agent.id,
                    sessionId: currentSessionId,
                    // organizationId: profile.organization_id // Assumed prompt might have this
                },
                (history || []).map(msg => ({ role: msg.role, content: msg.content }))
            );

            // 處理工具執行的 Stream Response
            // 因為 chatWithTools 已經回傳 ReadableStream，我們需要攔截 [DONE] 前的內容並存到資料庫
            const [clientStream, dbStream] = toolStream.tee();

            // 啟動一個非同步任務來監聽 dbStream 並儲存最後的文字回應
            // 注意：工具執行的過程 logs 已經在 executor 中寫入 DB，這裡只存 AI 的最終文字回應
            (async () => {
                const reader = dbStream.getReader();
                const decoder = new TextDecoder();
                let fullAiResponse = '';

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const text = decoder.decode(value);
                        // 解析 SSE 格式: data: {...}
                        const lines = text.split('\n\n');
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const dataStr = line.replace('data: ', '');
                                if (dataStr === '[DONE]') continue;
                                try {
                                    const data = JSON.parse(dataStr);
                                    if (data.type === 'text' && data.content) {
                                        fullAiResponse += data.content;
                                    }
                                } catch (e) {
                                    // ignore parse error for chunks
                                }
                            }
                        }
                    }

                    // 儲存最終回應
                    if (fullAiResponse) {
                        await supabase
                            .from('chat_messages')
                            .insert({
                                session_id: currentSessionId,
                                agent_id: agent.id,
                                role: 'assistant',
                                content: fullAiResponse,
                            });
                    }

                } catch (e) {
                    console.error('Error saving tool chat response:', e);
                }
            })();

            return new Response(clientStream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });

        } else {
            // ============================================
            // 原有的純文字對話邏輯 (無工具)
            // ============================================
            const model = genAI.getGenerativeModel({
                model: agent.model_version || 'gemini-3-flash-preview',
                systemInstruction: fullSystemPrompt,
            });

            const chat = model.startChat({
                history: (history || []).map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }],
                })),
            });

            const result = await chat.sendMessageStream([{ text: message }]);
            const encoder = new TextEncoder();
            let fullAiResponse = '';

            const sseStream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of result.stream) {
                            const chunkText = chunk.text();
                            if (chunkText) {
                                fullAiResponse += chunkText;
                                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`));
                            }
                        }
                        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));

                        await supabase
                            .from('chat_messages')
                            .insert({
                                session_id: currentSessionId,
                                agent_id: agent.id,
                                role: 'assistant',
                                content: fullAiResponse,
                            });

                        // New session ID return
                        if (!session_id) {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ session_id: currentSessionId })}\n\n`));
                        }

                        controller.close();
                    } catch (error) {
                        console.error('[Agent Chat] Streaming error:', error);
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
        }

    } catch (error) {
        return toApiResponse(error);
    }
}
