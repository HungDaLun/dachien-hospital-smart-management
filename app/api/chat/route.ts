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

        // 取得 Agent 資訊
        const { data: agent, error: agentError } = await supabase
            .from('agents')
            .select('id, name, system_prompt, model_version, temperature, knowledge_files')
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

        // 取得 Agent 知識綁定規則
        const { data: rules } = await supabase
            .from('agent_knowledge_rules')
            .select('rule_type, rule_value')
            .eq('agent_id', agent.id);

        let matchedFileIds: Set<string> = new Set(agent.knowledge_files || []);

        // 使用 Admin 客戶端進行檢索，確保能存取規則所定義的檔案範圍
        const adminSupabase = createAdminClient();

        // 收集部門 ID 列表（用於向量搜尋過濾）
        let departmentIds: string[] = [];

        if (rules && rules.length > 0) {
            // 分類規則
            const tagRules = rules.filter(r => r.rule_type === 'TAG');
            const categoryRules = rules.filter(r => r.rule_type === 'CATEGORY');
            const deptRules = rules.filter(r => r.rule_type === 'DEPARTMENT');

            // 1. 處理 TAG 規則
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

            // 2. 處理 DEPARTMENT 規則
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

            // 3. 處理 CATEGORY 規則
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

        // ============================================
        // 🔧 修正：使用向量搜尋 + markdown_content
        //    不再依賴會過期的 gemini_file_uri
        // ============================================
        let knowledgeContext = '';
        let retrievedFiles: any[] = [];

        // 方式 1: 使用向量搜尋找出最相關的內容
        try {
            const embedding = await generateEmbedding(message);

            // 如果有限定部門，使用部門過濾搜尋
            if (departmentIds.length > 0) {
                // 對每個部門進行搜尋
                for (const deptId of departmentIds) {
                    const { data: vectorMatches, error: rpcError } = await adminSupabase.rpc('search_knowledge_by_embedding', {
                        query_embedding: embedding,
                        match_threshold: 0.1,
                        match_count: 5,
                        filter_department: deptId
                    });

                    if (!rpcError && vectorMatches && vectorMatches.length > 0) {
                        retrievedFiles.push(...vectorMatches);
                    }
                }
            } else if (matchedFileIds.size > 0) {
                // 如果有特定檔案 ID，直接查詢這些檔案的內容
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
                // 無特定規則時，使用全域搜尋
                const { data: vectorMatches, error: rpcError } = await adminSupabase.rpc('search_knowledge_global', {
                    query_embedding: embedding,
                    match_threshold: 0.1,
                    match_count: 8
                });

                if (!rpcError && vectorMatches && vectorMatches.length > 0) {
                    retrievedFiles = vectorMatches;
                }
            }
        } catch (vectorErr) {
            console.error('[Agent Chat] 向量搜尋失敗，使用 fallback:', vectorErr);
        }

        // Fallback: 如果向量搜尋失敗，直接查詢檔案內容
        if (retrievedFiles.length === 0 && matchedFileIds.size > 0) {
            const { data: files } = await adminSupabase
                .from('files')
                .select('id, filename, markdown_content, metadata_analysis, department_id')
                .in('id', Array.from(matchedFileIds))
                .in('gemini_state', ['SYNCED', 'NEEDS_REVIEW', 'APPROVED'])
                .limit(10);

            if (files) {
                retrievedFiles = files.map(f => ({
                    id: f.id,
                    filename: f.filename,
                    content: f.markdown_content,
                    summary: f.metadata_analysis?.summary,
                    department_id: f.department_id
                }));
            }
        }

        // 建構知識上下文
        if (retrievedFiles.length > 0) {
            knowledgeContext = retrievedFiles.map((f: any, i: number) => {
                const content = f.content || f.markdown_content || '';
                const summary = f.summary || '';
                // 截取內容以避免 token 超限（每個檔案最多 8000 字元）
                const truncatedContent = content.length > 8000
                    ? content.substring(0, 8000) + '...(內容已截斷)'
                    : content;

                return `【知識文件 ${i + 1}：${f.filename || f.source || '未命名'}】\n` +
                    (summary ? `摘要：${summary}\n` : '') +
                    `內容：\n${truncatedContent}`;
            }).join('\n\n---\n\n');

            // 記錄 Agent 查詢操作
            const { logAudit } = await import('@/lib/actions/audit');
            for (const file of retrievedFiles) {
                if (file.id) {
                    await logAudit({
                        action: 'AGENT_QUERY',
                        resourceType: 'FILE',
                        resourceId: file.id,
                        details: {
                            agent_id: agent.id,
                            agent_name: agent.name,
                            file_department_id: file.department_id,
                        },
                    });
                }
            }
        }

        // 取得對話歷史
        const { data: history } = await supabase
            .from('chat_messages')
            .select('role, content')
            .eq('session_id', currentSessionId)
            .order('created_at', { ascending: true })
            .limit(10); // 上取最近 10 則訊息

        // 建構完整的系統提示詞（包含知識上下文）
        const fullSystemPrompt = `${agent.system_prompt}

${knowledgeContext ? `
【已載入的知識庫內容】
${knowledgeContext}

【回答準則】
1. 優先引用上述知識庫中的具體事實。
2. 標註來源文件名稱。
3. 以繁體中文回答，語氣專業、精準。
4. 若資訊不足，請坦白告知。
` : ''}`;

        // 使用 Gemini 進行對話（不再傳入 fileData）
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

        // 開始串流
        const result = await chat.sendMessageStream([{ text: message }]);

        // 建立 SSE 串流回應
        const encoder = new TextEncoder();
        let fullAiResponse = '';

        const sseStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            fullAiResponse += chunkText;
                            // 正確的 SSE 格式: data: [JSON]\n\n
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`));
                        }
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

    } catch (error) {
        return toApiResponse(error);
    }
}
