import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateEmbedding } from '@/lib/knowledge/embedding';
import { createMediumRiskProcessor } from '@/lib/ai-safeguards';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { departmentId, message, session_id } = await req.json();

        const supabase = await createClient();

        // 取得使用者資料
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Fetch Department Details
        const { data: dept } = await supabase
            .from('departments')
            .select('*')
            .eq('id', departmentId)
            .single();

        if (!dept) {
            return NextResponse.json({ reply: "找不到部門資訊。" }, { status: 404 });
        }

        // 2. Perform Knowledge Retrieval
        let knowledgeContext = "";
        let vectorSearchHadResults = false;

        try {
            const embedding = await generateEmbedding(message);
            const { data: vectorMatches, error: rpcError } = await supabase.rpc('search_knowledge_by_embedding', {
                query_embedding: embedding,
                match_threshold: 0.1,
                match_count: 5,
                filter_department: departmentId
            });

            if (!rpcError && vectorMatches && vectorMatches.length > 0) {
                interface VectorMatch {
                    filename: string;
                    similarity: number;
                    summary?: string;
                }
                knowledgeContext = (vectorMatches as VectorMatch[]).map((m) =>
                    `【核心文件：${m.filename}】(相關度: ${Math.round(m.similarity * 100)}%)\n內容摘要：${m.summary || "無摘要"}`
                ).join('\n\n');
                vectorSearchHadResults = true;
            }
        } catch (err) {
            console.error("Vector search failing, using fallback:", err);
        }

        if (!vectorSearchHadResults) {
            const { data: allFiles } = await supabase
                .from('files')
                .select('filename, metadata_analysis')
                .eq('department_id', departmentId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (allFiles && allFiles.length > 0) {
                interface FileWithMetadata {
                    filename: string;
                    metadata_analysis?: { summary?: string };
                }
                knowledgeContext = (allFiles as FileWithMetadata[]).map((f) =>
                    `【部門文件：${f.filename}】\n內容分析：${f.metadata_analysis?.summary || "尚無詳細摘要"}`
                ).join('\n\n');
            } else {
                knowledgeContext = "目前對話中未發現該部門有任何已上傳並分析的文件。";
            }
        }

        // 3. 初始化品質防護 (部門對話視為中風險)
        const processor = createMediumRiskProcessor();

        // 4. Construct System Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const prompt = `
你現在是【${dept.name}】的專屬 AI 戰略顧問 (Department Brain)。
你的任務是根據「真實上傳的文件內容」來回答使用者的問題。

【當前部門知識庫內容】：
${knowledgeContext}

【回答準則】：
1. 優先引用上述搜尋結果中的具體事實。
2. 標註來源文件名稱。
3. 以繁體中文回答，語氣專業、精準。
${processor.getSystemPromptSuffix()}

使用者提問：
${message}
`;

        // 5. Generate Streamed Response
        const result = await model.generateContentStream(prompt);
        const encoder = new TextEncoder();
        let fullAiResponse = '';

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            fullAiResponse += chunkText;
                            controller.enqueue(encoder.encode(chunkText));
                        }
                    }

                    // 6. 品質防護後處理
                    const safeguardResult = await processor.process(fullAiResponse);

                    // 7. 儲存訊息記錄
                    if (user) {
                        let currentSessionId = session_id;
                        if (!currentSessionId) {
                            const { data: session } = await supabase
                                .from('chat_sessions')
                                .insert({
                                    user_id: user.id,
                                    agent_id: null, // 部門對話非特定 Agent
                                    department_id: departmentId,
                                    title: message.slice(0, 50)
                                })
                                .select()
                                .single();
                            currentSessionId = session?.id;
                        }

                        if (currentSessionId) {
                            await supabase.from('chat_messages').insert([
                                { session_id: currentSessionId, role: 'user', content: message },
                                {
                                    session_id: currentSessionId,
                                    role: 'assistant',
                                    content: safeguardResult.cleanContent,
                                    citations: safeguardResult.citations,
                                    confidence_score: safeguardResult.confidenceScore,
                                    confidence_reasoning: safeguardResult.confidenceReasoning,
                                    selected_for_audit: safeguardResult.selectedForAudit
                                }
                            ]);
                        }
                    }

                    controller.close();
                } catch (e) {
                    controller.error(e);
                }
            }
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error: unknown) {
        console.error('Dept Chat Error:', error);
        return NextResponse.json({
            reply: `(連線異常) ${(error as Error).message || '請稍後再試'}`
        }, { status: 500 });
    }
}
