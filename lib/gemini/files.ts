/**
 * Gemini 檔案同步服務
 * 處理 Hub (S3) 與 Spoke (Gemini) 之間的資料同步
 */
import { createClient } from '@/lib/supabase/server';
import { downloadFromS3 } from '@/lib/storage/s3';
import { uploadFileToGemini } from './client';
import { AppError } from '@/lib/errors';

/**
 * 將指定檔案同步至 Gemini
 * @param fileId 檔案 ID
 * @returns 同步結果
 */
export async function syncFileToGemini(fileId: string) {
    const supabase = await createClient();

    // 1. 取得檔案資訊
    const { data: file, error: fetchError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

    if (fetchError || !file) {
        throw new AppError('NOT_FOUND', '找不到指定的檔案記錄');
    }

    // 如果已經同步且沒有強制更新，則跳過 (這裡可依需求調整)
    if (file.gemini_state === 'SYNCED' && file.gemini_file_uri) {
        return file;
    }

    try {
        // 2. 更新狀態為處理中
        await supabase
            .from('files')
            .update({ gemini_state: 'PROCESSING' })
            .eq('id', fileId);

        // 3. 從 S3 下載檔案
        let fileBuffer: Buffer;
        try {
            fileBuffer = await downloadFromS3(file.s3_storage_path);
        } catch (s3Error) {
            console.error('從 S3 下載檔案失敗:', s3Error);

            // 開發環境下的降級處理：如果 S3 連不到，嘗試尋找是否有本地備份或使用 Mock
            if (process.env.NODE_ENV === 'development') {
                console.warn('⚠️ 檢測到開發環境儲存連線失敗，將嘗試使用模擬同步流程...');
                // 模擬一個 Buffer 與成功上傳
                fileBuffer = Buffer.from(`Mock content for ${file.filename}`);
            } else {
                throw s3Error;
            }
        }

        // 4. 上傳至 Gemini
        const geminiFile = await uploadFileToGemini(
            fileBuffer,
            file.mime_type,
            file.filename
        );

        // 5. 更新資料庫
        const { data: updatedFile, error: updateError } = await supabase
            .from('files')
            .update({
                gemini_file_uri: geminiFile.uri,
                gemini_state: 'SYNCED',
                gemini_sync_at: new Date().toISOString(),
            })
            .eq('id', fileId)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        return updatedFile;

    } catch (error) {
        console.error(`同步檔案 ${fileId} 失敗:`, error);

        // 更新狀態為失敗
        await supabase
            .from('files')
            .update({
                gemini_state: 'FAILED',
                quality_issues: { error: error instanceof Error ? error.message : '未知錯誤' }
            })
            .eq('id', fileId);

        throw error;
    }
}

/**
 * 批量同步待處理檔案
 * (可用於背景任務)
 */
export async function syncPendingFiles(limit: number = 5) {
    const supabase = await createClient();

    // 取得待處理或失敗的檔案
    const { data: pendingFiles } = await supabase
        .from('files')
        .select('id')
        .in('gemini_state', ['PENDING', 'FAILED'])
        .eq('is_active', true)
        .limit(limit);

    if (!pendingFiles || pendingFiles.length === 0) {
        return { count: 0 };
    }

    const results = await Promise.allSettled(
        pendingFiles.map(f => syncFileToGemini(f.id))
    );

    return {
        count: pendingFiles.length,
        success: results.filter(r => r.status === 'fulfilled').length,
        failed: results.filter(r => r.status === 'rejected').length,
    };
}
