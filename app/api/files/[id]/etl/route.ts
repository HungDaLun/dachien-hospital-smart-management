/**
 * ETL API - AI 知識清洗與結構化
 * 
 * 🔧 修正：當 Gemini File URI 過期時，自動從 S3 重新上傳
 *    這確保即使超過 48 小時，使用者仍可重新分析任何檔案
 */
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateContent, uploadFileToGemini } from '@/lib/gemini/client';
import { uploadToS3, downloadFromS3 } from '@/lib/storage/s3';
import { syncFileToGemini } from '@/lib/gemini/files';

export async function POST(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const fileId = params.id;

        // 1. Fetch original file details
        const { data: file, error: fetchError } = await supabase
            .from('files')
            .select('*')
            .eq('id', fileId)
            .single();

        if (fetchError || !file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // ============================================
        // 🔧 修正：確保有有效的 Gemini File URI
        //    如果沒有或已過期，從 S3 重新上傳
        // ============================================
        let geminiFileUri = file.gemini_file_uri;
        let needsReupload = !geminiFileUri || file.gemini_state !== 'SYNCED';

        // 嘗試使用現有 URI，如果失敗則重新上傳
        if (geminiFileUri && !needsReupload) {
            try {
                // 先嘗試用現有 URI 進行簡單測試
                await generateContent(
                    'gemini-3-flash-preview',
                    '請簡單描述這個檔案的格式。只需回答一個詞。',
                    geminiFileUri,
                    file.mime_type
                );
            } catch (testError: any) {
                // 如果錯誤是 403 (權限問題/檔案不存在)，需要重新上傳
                if (testError.message?.includes('403') ||
                    testError.message?.includes('permission') ||
                    testError.message?.includes('not exist')) {
                    console.log(`[ETL] Gemini URI 已過期，將重新上傳: ${fileId}`);
                    needsReupload = true;
                } else {
                    throw testError;
                }
            }
        }

        // 如果需要重新上傳
        if (needsReupload) {
            console.log(`[ETL] 從 S3 下載並重新上傳到 Gemini: ${file.filename}`);

            // 從 S3 下載檔案
            if (!file.s3_storage_path || !file.s3_etag || file.s3_etag.startsWith('mock-')) {
                return NextResponse.json({
                    error: '檔案無法重新處理：找不到原始檔案。請重新上傳檔案。'
                }, { status: 400 });
            }

            const buffer = await downloadFromS3(file.s3_storage_path);

            // 上傳到 Gemini
            const geminiFile = await uploadFileToGemini(buffer, file.mime_type, file.filename);
            geminiFileUri = geminiFile.uri;

            // 更新資料庫中的 URI
            await supabase.from('files').update({
                gemini_file_uri: geminiFileUri,
                gemini_state: 'SYNCED'
            }).eq('id', fileId);

            // 等待 Gemini 處理完成
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Detect Data Files (CSV/Excel)
        const isDataFile = file.mime_type.includes('csv') ||
            file.mime_type.includes('spreadsheet') ||
            file.mime_type.includes('excel');

        let prompt = '';

        if (isDataFile) {
            // STRATEGY: Raw Data Injection
            prompt = `
            You are an expert Data Engineer AI.
            Your task is to Clean and Standardize the attached dataset.
            
            Guidelines:
            1. Fix encoding issues (ensure UTF-8).
            2. Standardize headers (trim spaces, clear meaning).
            3. Remove empty rows or completely corrupted lines.
            4. Output the result strictly as **valid CSV format** inside a code block (\`\`\`csv ... \`\`\`).
            5. CRITICAL: Do NOT convert to a Markdown visuals table (ASCII table). Keep it as efficient Comma Separated Values.
            `;
        } else {
            // STRATEGY: Document Digitization
            prompt = `
            You are an expert AI Knowledge Librarian.
            Your task is to convert the attached document into a clean, structured Markdown file.
            
            Guidelines:
            1. Remove all noise (headers, footers, page numbers, repeated disclaimers).
            2. Use standard Markdown headers (#, ##, ###) to represent the document structure.
            3. Preserve all key information, numerical data, and tables (convert to Markdown tables).
            4. If the document is long, ensure logical flow is maintained.
            5. Output ONLY the Markdown content. Do not include introductory text like "Here is the markdown...".
            `;
        }

        // Create Gemini Client
        const modelVersion = process.env.GEMINI_MODEL_VERSION || 'gemini-3-flash-preview';

        const structuredContent = await generateContent(
            modelVersion,
            prompt,
            geminiFileUri!,
            file.mime_type
        );

        if (!structuredContent) {
            return NextResponse.json({ error: 'Gemini generated empty content' }, { status: 500 });
        }

        // 3. Save the new structured file
        const newFilename = `[Structured] ${file.filename}.md`;
        const newFileBuffer = Buffer.from(structuredContent, 'utf-8');
        const s3Key = `librarian/${fileId}/${newFilename}`;
        const contentType = 'text/markdown';

        // Upload to S3 (Hub)
        const etag = await uploadToS3(newFileBuffer, s3Key, contentType);

        // Insert into DB
        const { data: newFile, error: insertError } = await supabase
            .from('files')
            .insert({
                filename: newFilename,
                s3_storage_path: s3Key,
                s3_etag: etag,
                mime_type: contentType,
                size_bytes: newFileBuffer.length,
                uploaded_by: user.id,
                is_active: true,
                gemini_state: 'PENDING'
            })
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        // 4. Sync the new structured file back to Gemini (Spoke)
        await syncFileToGemini(newFile.id, supabase);

        return NextResponse.json({
            success: true,
            original_file_id: fileId,
            structured_file_id: newFile.id,
            message: 'AI Librarian ETL completed successfully',
            reuploadedToGemini: needsReupload
        });

    } catch (error: any) {
        console.error('ETL Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
