import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateEmbedding } from '@/lib/knowledge/embedding';
import { createHighRiskProcessor } from '@/lib/ai-safeguards';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { message, session_id } = await req.json();

        const supabase = await createClient();

        // 取得使用者資料用於記錄
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Perform Knowledge Retrieval (Global Search)
        let knowledgeContext = "";
        let vectorSearchHadResults = false;

        try {
            const embedding = await generateEmbedding(message);
            const { data: vectorMatches, error: rpcError } = await supabase.rpc('search_knowledge_global', {
                query_embedding: embedding,
                match_threshold: 0.1,
                match_count: 8
            });

            if (!rpcError && vectorMatches && vectorMatches.length > 0) {
                interface VectorMatch {
                    type?: string;
                    source?: string;
                    similarity: number;
                    content?: string;
                }
                knowledgeContext = (vectorMatches as VectorMatch[]).map((m) =>
                    `【${m.type === 'framework' ? '知識架構' : '企業文件'}：${m.source}】(相關度: ${Math.round(m.similarity * 100)}%)\n內容：${m.content || "無內容"}`
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
                .order('created_at', { ascending: false })
                .limit(10);

            if (allFiles && allFiles.length > 0) {
                interface FileWithMetadata {
                    filename: string;
                    metadata_analysis?: { summary?: string };
                }
                knowledgeContext = (allFiles as FileWithMetadata[]).map((f) =>
                    `【最新文件：${f.filename}】\n內容分析：${f.metadata_analysis?.summary || "尚無詳細摘要"}`
                ).join('\n\n');
            } else {
                knowledgeContext = "目前系統中未發現任何已分析的文件。";
            }
        }

        // 2. 初始化品質防護
        const processor = createHighRiskProcessor();

        // 3. Construct System Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const prompt = `
你現在是【企業全域戰略參謀】(Corporate Strategic Brain)。
你的任務是根據「全公司所有已上傳的文件內容」來回答企業主的問題，協助掌握全公司狀況。

【當前檢索到的全域知識】：
${knowledgeContext}

【回答準則】：
1. 你擁有跨部門的視野，請嘗試整合不同文件中的資訊。
2. 優先引用上述搜尋結果中的具體事實。
3. 以繁體中文回答，語氣專業、精準、具有洞察力。
${processor.getSystemPromptSuffix()}

使用者提問：
${message}
`;

        // 4. Generate Streamed Response
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

                    // 5. 品質防護後處理
                    const safeguardResult = await processor.process(fullAiResponse);

                    // 6. 儲存訊息至資料庫
                    if (user) {
                        // 嘗試尋找或建立 session
                        let currentSessionId = session_id;
                        if (!currentSessionId) {
                            const { data: session } = await supabase
                                .from('chat_sessions')
                                .insert({
                                    user_id: user.id,
                                    title: message.slice(0, 50),
                                    is_corporate: true // 標記為全域參謀對話
                                })
                                .select()
                                .single();
                            currentSessionId = session?.id;
                        }

                        // 儲存使用者訊息 (如果還沒存過)
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
                                    needs_review: safeguardResult.needsReview,
                                    review_triggers: safeguardResult.reviewTriggers,
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
        console.error('Corporate Chat Error:', error);
        return NextResponse.json({
            reply: `(連線異常) ${(error as Error).message || '請稍後再試'}`
        }, { status: 500 });
    }
}
