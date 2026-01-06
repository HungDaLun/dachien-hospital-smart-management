import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateEmbedding } from '@/lib/knowledge/embedding';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();

        const supabase = await createClient();

        // 1. Perform Knowledge Retrieval (Global Search)
        let knowledgeContext = "";
        let vectorSearchHadResults = false;

        try {
            const embedding = await generateEmbedding(message);
            // Call the new global search RPC
            const { data: vectorMatches, error: rpcError } = await supabase.rpc('search_knowledge_global', {
                query_embedding: embedding,
                match_threshold: 0.1,
                match_count: 8 // Increase count for broader context
            });

            if (!rpcError && vectorMatches && vectorMatches.length > 0) {
                knowledgeContext = vectorMatches.map((m: any) =>
                    `【${m.type === 'framework' ? '知識架構' : '企業文件'}：${m.source}】(相關度: ${Math.round(m.similarity * 100)}%)\n內容：${m.content || "無內容"}`
                ).join('\n\n');
                vectorSearchHadResults = true;
            } else {
                if (rpcError) console.error("Global vector search RPC error:", rpcError);
            }
        } catch (err) {
            console.error("Vector search failing, using fallback:", err);
        }

        if (!vectorSearchHadResults) {
            // Fallback: Get latest 10 files from ANY department
            const { data: allFiles } = await supabase
                .from('files')
                .select('filename, metadata_analysis')
                .order('created_at', { ascending: false })
                .limit(10);

            if (allFiles && allFiles.length > 0) {
                knowledgeContext = allFiles.map((f: any) =>
                    `【最新文件：${f.filename}】\n內容分析：${f.metadata_analysis?.summary || "尚無詳細摘要"}`
                ).join('\n\n');
            } else {
                knowledgeContext = "目前系統中未發現任何已分析的文件。";
            }
        }

        // 2. Construct System Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const prompt = `
你現在是【企業全域戰略參謀】(Corporate Strategic Brain)。
你的任務是根據「全公司所有已上傳的文件內容」來回答企業主的問題，協助掌握全公司狀況。

【當前檢索到的全域知識】：
${knowledgeContext}

【回答準則】：
1. 你擁有跨部門的視野，請嘗試整合不同文件中的資訊。
2. 優先引用上述搜尋結果中的具體事實。
3. 標註來源文件名稱。
4. 以繁體中文回答，語氣專業、精準、具有洞察力。
5. 若資訊不足，請坦白告知，並建議查詢的方向。

使用者提問：
${message}
`;

        // 3. Generate Streamed Response
        const result = await model.generateContentStream(prompt);

        // Construct a ReadableStream to stream chunks to the client
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            controller.enqueue(encoder.encode(chunkText));
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

    } catch (error: any) {
        console.error('Corporate Chat Error:', error);
        return NextResponse.json({
            reply: `(連線異常) ${error.message || '請稍後再試'}`
        }, { status: 500 });
    }
}
