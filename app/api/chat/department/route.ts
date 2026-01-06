import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateEmbedding } from '@/lib/knowledge/embedding';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { departmentId, message } = await req.json();

        const supabase = await createClient();

        // 1. Fetch Department Details
        const { data: dept } = await supabase
            .from('departments')
            .select('*')
            .eq('id', departmentId)
            .single();

        if (!dept) {
            return NextResponse.json({ reply: "找不到部門資訊。" }, { status: 404 });
        }

        // 2. Perform Knowledge Retrieval (RAG - Option B with Fallback)
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
                knowledgeContext = vectorMatches.map((m: any) =>
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
                knowledgeContext = allFiles.map((f: any) =>
                    `【部門文件：${f.filename}】\n內容分析：${f.metadata_analysis?.summary || "尚無詳細摘要"}`
                ).join('\n\n');
            } else {
                knowledgeContext = "目前對話中未發現該部門有任何已上傳並分析的文件。";
            }
        }

        // 3. Construct System Prompt
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

使用者提問：
${message}
`;

        // 4. Generate Streamed Response
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
        console.error('Dept Chat Error:', error);
        return NextResponse.json({
            reply: `(連線異常) ${error.message || '請稍後再試'}`
        }, { status: 500 });
    }
}
