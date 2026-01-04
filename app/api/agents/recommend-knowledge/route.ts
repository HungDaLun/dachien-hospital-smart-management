/**
 * AI 智能推薦知識來源 API (語義搜尋版)
 *
 * 核心邏輯:
 * 1. 向量化使用者意圖 (using Gemini Embedding)
 * 2. 呼叫 Database RPC 進行向量相似度搜尋
 * 3. 回傳推薦檔案
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/knowledge/embedding';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 驗證使用者
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { user_intent, department_id, match_threshold = 0.6, match_count = 20, filter_dikw_levels } = body;

    if (!user_intent || typeof user_intent !== 'string') {
      return NextResponse.json(
        { success: false, error: { message: 'user_intent is required' } },
        { status: 400 }
      );
    }

    if (!department_id) {
      return NextResponse.json(
        { success: false, error: { message: 'department_id is required' } },
        { status: 400 }
      );
    }

    // Step 1: 向量化使用者意圖
    console.log('[AI Recommend] Generating embedding for:', user_intent);
    const intentEmbedding = await generateEmbedding(user_intent);

    // Step 2: 語義搜尋 (使用 Supabase RPC)
    console.log('[AI Recommend] Searching knowledge by embedding...');
    const { data: recommendedFiles, error: searchError } = await supabase.rpc('search_knowledge_by_embedding', {
      query_embedding: intentEmbedding,
      match_threshold: match_threshold,
      match_count: match_count,
      filter_department: department_id,
      filter_dikw_levels: filter_dikw_levels || null // Pass null if undefined to allow all levels (RPC logic handles null)
    });

    if (searchError) {
      console.error('[AI Recommend] Database search error:', searchError);
      return NextResponse.json(
        { success: false, error: { message: 'Database search failed', details: searchError.message } },
        { status: 500 }
      );
    }

    // Step 3: 格式化回傳結果
    const formattedFiles = (recommendedFiles || []).map((file: any) => ({
      id: file.id,
      filename: file.filename,
      title: file.title || file.filename,
      summary: file.summary,
      relevance_score: file.similarity,
      reason: generateReason(file.similarity)
    }));

    return NextResponse.json({
      success: true,
      data: {
        files: formattedFiles,
        total: formattedFiles.length
      }
    });

  } catch (error: any) {
    console.error('[AI Recommend] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error', details: error.message } },
      { status: 500 }
    );
  }
}

// 生成推薦原因
function generateReason(score: number): string {
  if (score > 0.85) return '🔥 高度相關：核心知識來源';
  if (score > 0.75) return '✅ 相關：建議參考';
  return 'ℹ️ 可能相關：輔助資料';
}
