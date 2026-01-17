/**
 * Knowledge Ingestion Pipeline
 * 負責處理檔案上傳後的自動化流程：
 * 1. 上傳至 Gemini (Spoke)
 * 2. 轉譯為 Markdown (Cleaning)
 * 3. 提取 Metadata (Governance)
 * 4. 寫回資料庫
 */
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SupabaseClient } from '@supabase/supabase-js';
import {
    uploadFileToGemini,
    generateContent,
    retryWithBackoff
} from '@/lib/gemini/client';
import { generateEmbedding } from './embedding';
import { downloadFromS3 } from '@/lib/storage/s3';
import { MARKDOWN_CONVERSION_PROMPT, METADATA_ANALYSIS_PROMPT } from './prompts';
import { autoMapDocumentToFrameworks } from './mapper';

/**
 * 處理已上傳的檔案
 * @param fileId 資料庫中的檔案 ID
 * @param fileBuffer (選填) 檔案 Buffer，如果有傳入則不需從 S3 下載
 */
export async function processUploadedFile(fileId: string, fileBuffer?: Buffer, supabaseClient?: SupabaseClient) {
    let supabase = supabaseClient;

    if (!supabase) {
        try {
            supabase = await createClient();
        } catch {
            // Fallback for scripts/cron where cookies() is not available
            console.log('[Ingestion] Falling back to Admin Client...');
            supabase = createAdminClient();
        }
    }

    // 1. 取得檔案記錄
    const { data: file, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

    if (error || !file) {
        console.error(`[Ingestion] File not found: ${fileId}`, error);
        return;
    }

    try {
        // Debug: Log start
        await supabase.from('files').update({
            gemini_state: 'PROCESSING',
            markdown_content: 'DEBUG: Starting ingestion...'
        }).eq('id', fileId);

        // 2. 準備檔案內容
        let buffer = fileBuffer;
        if (!buffer) {
            await supabase.from('files').update({ markdown_content: 'DEBUG: Fetching from S3...' }).eq('id', fileId);
            if (file.s3_etag && !file.s3_etag.startsWith('mock-')) {
                try {
                    buffer = await downloadFromS3(file.s3_storage_path);
                } catch {
                    throw new Error('無法取得檔案內容 (S3 下載失敗)');
                }
            } else {
                throw new Error('無法取得檔案內容 (無 S3 記錄且無 Buffer)');
            }
        }

        // 3. 上傳至 Gemini File API
        await supabase.from('files').update({ markdown_content: `DEBUG: Uploading to Gemini (${file.filename})...` }).eq('id', fileId);
        console.log(`[Ingestion] Uploading to Gemini: ${file.filename}`);
        const geminiFile = await uploadFileToGemini(buffer, file.mime_type, file.filename);

        // 更新 DB 記錄 Gemini URI
        await supabase.from('files').update({
            gemini_file_uri: geminiFile.uri,
            markdown_content: `DEBUG: Uploaded to Gemini. URI: ${geminiFile.uri}. Waiting...`
        }).eq('id', fileId);

        // 等待 Gemini 檔案處理完成
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 4. 執行轉譯 (File -> Markdown)
        await supabase.from('files').update({ markdown_content: `DEBUG: Generating Markdown (Model: gemini-3-flash-preview)...` }).eq('id', fileId);
        const markdown = await retryWithBackoff(() => generateContent(
            'gemini-3-flash-preview',
            MARKDOWN_CONVERSION_PROMPT,
            geminiFile.uri,
            file.mime_type
        ));

        // 5. 執行 Metadata 分析
        await supabase.from('files').update({ markdown_content: `DEBUG: Analyzing Metadata...` }).eq('id', fileId);

        // 取得分類列表以供 AI 參考
        const { data: categories } = await supabase.from('document_categories').select('name');
        const categoryListString = categories?.map(c => `- ${c.name}`).join('\n') || '(No categories defined yet)';

        const finalizedPrompt = METADATA_ANALYSIS_PROMPT.replace('{{ CATEGORY_LIST }}', categoryListString);

        const metadataJsonString = await retryWithBackoff(() => generateContent(
            'gemini-3-flash-preview',
            finalizedPrompt,
            geminiFile.uri,
            file.mime_type
        ));

        const cleanedJsonString = metadataJsonString.replace(/```json\n?|\n?```/g, '').trim();
        let metadata: Record<string, any> = {};
        try {
            metadata = JSON.parse(cleanedJsonString);
        } catch (e) {
            console.error('[Ingestion] JSON Parse Error:', e);
            metadata = { raw_analysis: cleanedJsonString };
        }

        // 5.5 生成 Embedding
        await supabase.from('files').update({ markdown_content: `DEBUG: Generating Embedding...` }).eq('id', fileId);
        let embedding: number[] | null = null;
        try {
            embedding = await generateEmbedding(markdown);
        } catch (embErr) {
            console.error('[Ingestion] Embedding generation failed:', embErr);
            // Non-blocking failure
        }

        // 6. 寫回資料庫
        await supabase.from('files').update({
            markdown_content: markdown,
            metadata_analysis: metadata,
            content_embedding: embedding,
            gemini_state: 'NEEDS_REVIEW', // Enforce Human-in-the-Loop
            dikw_level: metadata.dikw_level || 'data', // Default to 'data' if analysis fails to return level
        }).eq('id', fileId);

        // 7. 自動寫入標籤
        if (metadata.tags && Array.isArray(metadata.tags)) {
            const tagInserts = metadata.tags.map((t: string) => ({
                file_id: fileId,
                tag_key: 'topic',
                tag_value: t
            }));
            await supabase.from('file_tags').insert(tagInserts);
        }

        console.log(`[Ingestion] Completed for ${file.filename}`);

        // 8. 最終步驟：自動觸發「分析」(Mapper Agent)
        // 既然使用者希望自動化到底，我們就自動把檔案對映到知識星系
        console.log(`[Ingestion] Auto-triggering Analysis for ${file.id}`);
        try {
            await autoMapDocumentToFrameworks(fileId, supabase);
        } catch (mapErr) {
            console.error(`[Ingestion] Auto-mapping failed for ${fileId}:`, mapErr);
            // 分析失敗不影響前面的同步結果
        }

    } catch (err: unknown) {
        console.error(`[Ingestion] Failed for ${fileId}:`, err);
        const errorMessage = err instanceof Error ? err.message : String(err);

        // Append error to markdown content so we can see it
        await supabase.from('files').update({
            gemini_state: 'FAILED', // Keep FAILED
            metadata_analysis: { error: errorMessage, stage: 'ingestion_catch' },
            markdown_content: `DEBUG: FAILED. Error: ${errorMessage}`
        }).eq('id', fileId);
    }
}
