/**
 * OpenAI 相容 API
 * 提供與 OpenAI Chat Completion API 相容的介面
 * 
 * 🔧 修正：改用向量搜尋 + markdown_content 作為知識來源
 *    不再依賴 gemini_file_uri（48 小時後會過期）
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { checkAuth } from '@/lib/auth/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateEmbedding } from '@/lib/knowledge/embedding';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 類型定義
interface KnowledgeRule {
    rule_type: string;
    rule_value: string;
}

interface FileWithId {
    id: string;
    file_id?: string;
}

interface DepartmentWithId {
    id: string;
}

interface RetrievedFile {
    filename?: string;
    source?: string;
    content?: string;
    markdown_content?: string;
    summary?: string;
    metadata_analysis?: { summary?: string };
}

interface FileRecord {
    filename: string;
    markdown_content: string;
    metadata_analysis?: { summary?: string };
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

        console.log('[DEBUG] Request Stream param:', stream, typeof stream);

        if (!model) {
            return NextResponse.json(
                { error: { message: 'Model (Agent ID) is required', type: 'invalid_request_error', param: 'model', code: null } },
                { status: 400 }
            );
        }

        // 1. Fetch Agent (Model)
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

        // 2. Fetch Knowledge Context (RAG - 使用向量搜尋 + markdown_content)
        const { data: rules } = await supabase
            .from('agent_knowledge_rules')
            .select('rule_type, rule_value')
            .eq('agent_id', agent.id);

        let knowledgeContext = '';
        const matchedFileIds: Set<string> = new Set();
        let departmentIds: string[] = [];

        if (rules && rules.length > 0) {
            const tagRules = rules.filter((r: KnowledgeRule) => r.rule_type === 'TAG');
            const deptRules = rules.filter((r: KnowledgeRule) => r.rule_type === 'DEPARTMENT');
            const categoryRules = rules.filter((r: KnowledgeRule) => r.rule_type === 'CATEGORY');

            // 處理 TAG 規則
            if (tagRules.length > 0) {
                const tagFilters = tagRules.map((r: KnowledgeRule) => {
                    const [key, value] = r.rule_value.split(':');
                    return { key, value };
                });

                const { data: tagFiles } = await supabase
                    .from('file_tags')
                    .select('file_id')
                    .or(tagFilters.map(f => `and(tag_key.eq.${f.key},tag_value.eq.${f.value})`).join(','));

                (tagFiles as FileWithId[] | null)?.forEach((f) => matchedFileIds.add(f.file_id || f.id));
            }

            // 處理 DEPARTMENT 規則
            if (deptRules.length > 0) {
                const deptValues = deptRules.map((r: KnowledgeRule) => r.rule_value);
                const { data: departments } = await supabase
                    .from('departments')
                    .select('id')
                    .or(`code.in.(${deptValues.map(v => `"${v}"`).join(',')}),name.in.(${deptValues.map(v => `"${v}"`).join(',')})`);

                if (departments && departments.length > 0) {
                    departmentIds = (departments as DepartmentWithId[]).map((d) => d.id);
                    const { data: deptFiles } = await supabase
                        .from('files')
                        .select('id')
                        .in('department_id', departmentIds)
                        .in('gemini_state', ['SYNCED', 'NEEDS_REVIEW', 'APPROVED']);

                    (deptFiles as FileWithId[] | null)?.forEach((f) => matchedFileIds.add(f.id));
                }
            }

            // 處理 CATEGORY 規則
            if (categoryRules.length > 0) {
                const catIds = categoryRules.map((r: KnowledgeRule) => r.rule_value);
                const { data: catFiles } = await supabase
                    .from('files')
                    .select('id')
                    .in('category_id', catIds)
                    .in('gemini_state', ['SYNCED', 'NEEDS_REVIEW', 'APPROVED']);

                (catFiles as FileWithId[] | null)?.forEach((f) => matchedFileIds.add(f.id));
            }
        }

        // 使用向量搜尋或直接查詢檔案內容
        const lastMessage = messages[messages.length - 1];
        let retrievedFiles: RetrievedFile[] = [];

        try {
            const embedding = await generateEmbedding(lastMessage.content);

            if (departmentIds.length > 0) {
                for (const deptId of departmentIds) {
                    const { data: vectorMatches, error: rpcError } = await supabase.rpc('search_knowledge_by_embedding', {
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
                const { data: files } = await supabase
                    .from('files')
                    .select('id, filename, markdown_content, metadata_analysis')
                    .in('id', Array.from(matchedFileIds))
                    .in('gemini_state', ['SYNCED', 'NEEDS_REVIEW', 'APPROVED']);

                if (files) {
                    retrievedFiles = (files as FileRecord[]).map((f) => ({
                        filename: f.filename,
                        content: f.markdown_content,
                        summary: f.metadata_analysis?.summary
                    }));
                }
            } else {
                // 無規則時使用全域搜尋
                const { data: vectorMatches, error: rpcError } = await supabase.rpc('search_knowledge_global', {
                    query_embedding: embedding,
                    match_threshold: 0.1,
                    match_count: 8
                });

                if (!rpcError && vectorMatches && vectorMatches.length > 0) {
                    retrievedFiles = vectorMatches;
                }
            }
        } catch (vectorErr) {
            console.error('[OpenAI API] 向量搜尋失敗:', vectorErr);
        }

        // 建構知識上下文
        if (retrievedFiles.length > 0) {
            knowledgeContext = retrievedFiles.map((f: RetrievedFile, i: number) => {
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

        // 3. 建構完整的系統提示詞
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

        // 4. Prepare Chat History
        interface MessageItem {
            role: string;
            content: string;
        }
        const historyMessages = messages.slice(0, messages.length - 1) as MessageItem[];
        const geminiHistory = historyMessages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        // 5. 使用 Gemini（不再傳入 fileData）
        const geminiModel = genAI.getGenerativeModel({
            model: agent.model_version || 'gemini-3-flash-preview',
            systemInstruction: fullSystemPrompt,
        });

        const chat = geminiModel.startChat({ history: geminiHistory });

        // 6. Handle Response
        if (stream) {
            const result = await chat.sendMessageStream([{ text: lastMessage.content }]);
            const encoder = new TextEncoder();

            const streamIterator = async function* () {
                const created = Math.floor(Date.now() / 1000);
                const id = `chatcmpl-${Math.random().toString(36).slice(2)}`;

                try {
                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        if (text) {
                            const chunkData = {
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
                            yield encoder.encode(`data: ${JSON.stringify(chunkData)}\n\n`);
                        }
                    }
                    yield encoder.encode('data: [DONE]\n\n');
                } catch (err) {
                    console.error('Stream Error:', err);
                }
            };

            // @ts-expect-error - streaming response type mismatch
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
            const result = await chat.sendMessage([{ text: lastMessage.content }]);
            const fullText = result.response.text();

            return NextResponse.json({
                id: `chatcmpl-${Math.random().toString(36).slice(2)}`,
                object: 'chat.completion',
                created: Math.floor(Date.now() / 1000),
                model: model,
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
                    prompt_tokens: 0,
                    completion_tokens: 0,
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

