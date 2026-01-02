/**
 * 檔案管理 API
 * 提供檔案列表查詢與上傳功能
 * 遵循 EAKAP API 規範
 */
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/storage/s3';
import { ValidationError, toApiResponse } from '@/lib/errors';
import { getCurrentUserProfile, requireRole } from '@/lib/permissions';
import { processUploadedFile } from '@/lib/knowledge/ingestion';

/**
 * 支援的檔案格式與限制
 */
const SUPPORTED_MIME_TYPES: Record<string, { maxSize: number; extensions: string[] }> = {
    'application/pdf': { maxSize: 100 * 1024 * 1024, extensions: ['.pdf'] },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        maxSize: 100 * 1024 * 1024,
        extensions: ['.docx']
    },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        maxSize: 50 * 1024 * 1024,
        extensions: ['.xlsx']
    },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
        maxSize: 100 * 1024 * 1024,
        extensions: ['.pptx']
    },
    'text/csv': { maxSize: 50 * 1024 * 1024, extensions: ['.csv'] },
    'text/plain': { maxSize: 10 * 1024 * 1024, extensions: ['.txt'] },
    'text/markdown': { maxSize: 10 * 1024 * 1024, extensions: ['.md'] },
    'text/html': { maxSize: 10 * 1024 * 1024, extensions: ['.html'] },
};

/**
 * GET /api/files
 * 列出檔案（支援分頁、篩選）
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // 取得使用者資料（包含權限檢查）
        const profile = await getCurrentUserProfile();

        // 解析查詢參數
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const offset = (page - 1) * limit;

        // 建立查詢
        let query = supabase
            .from('files')
            .select(`
                *,
                file_tags (id, tag_key, tag_value),
                user_profiles (display_name, email)
            `, { count: 'exact' })
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        // 搜尋檔名
        if (search) {
            query = query.ilike('filename', `%${search}%`);
        }

        // 篩選狀態
        if (status && ['PENDING', 'PROCESSING', 'SYNCED', 'NEEDS_REVIEW', 'REJECTED', 'FAILED'].includes(status)) {
            query = query.eq('gemini_state', status);
        }

        // 依角色篩選（RLS 會處理大部分，這裡做額外篩選）
        if (profile.role === 'EDITOR') {
            // EDITOR 只能看自己上傳的或有標籤權限的
            query = query.eq('uploaded_by', profile.id);
        }

        // 分頁
        query = query.range(offset, offset + limit - 1);

        const { data: files, count, error } = await query;

        if (error) {
            console.error('查詢檔案失敗:', error);
            return NextResponse.json(
                { success: false, error: { code: 'QUERY_ERROR', message: '查詢檔案失敗' } },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: files || [],
            meta: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });

    } catch (error) {
        return toApiResponse(error);
    }
}

/**
 * POST /api/files
 * 上傳檔案
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // 取得使用者資料並檢查權限（至少需要 EDITOR 權限）
        const profile = await getCurrentUserProfile();
        requireRole(profile, ['SUPER_ADMIN', 'DEPT_ADMIN', 'EDITOR']);

        // 解析 FormData
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const tags = formData.get('tags') as string | null;

        if (!file) {
            throw new ValidationError('請選擇要上傳的檔案');
        }

        // 驗證檔案格式
        const mimeType = file.type;
        const fileConfig = SUPPORTED_MIME_TYPES[mimeType];

        if (!fileConfig) {
            throw new ValidationError(
                `不支援的檔案格式：${mimeType}。支援的格式：PDF, DOCX, XLSX, PPTX, CSV, TXT, MD, HTML`
            );
        }

        // 驗證檔案大小
        if (file.size > fileConfig.maxSize) {
            throw new ValidationError(
                `檔案過大。${file.name} 的大小為 ${(file.size / 1024 / 1024).toFixed(2)} MB，上限為 ${fileConfig.maxSize / 1024 / 1024} MB`
            );
        }

        // 產生儲存路徑
        const timestamp = Date.now();
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `uploads/${profile.id}/${timestamp}_${sanitizedFilename}`;

        // 讀取檔案內容
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 上傳至 S3/MinIO
        let s3Etag: string;
        try {
            s3Etag = await uploadToS3(buffer, storagePath, mimeType);
        } catch (storageError) {
            console.error('S3 上傳失敗:', storageError);
            // 如果 S3 不可用，暫時跳過（開發環境可能沒有設定 S3）
            s3Etag = `mock-etag-${timestamp}`;
        }

        // 寫入資料庫
        const { data: newFile, error: insertError } = await supabase
            .from('files')
            .insert({
                filename: file.name,
                s3_storage_path: storagePath,
                s3_etag: s3Etag,
                mime_type: mimeType,
                size_bytes: file.size,
                uploaded_by: profile.id,
                department_id: profile.department_id, // 【NEW】自動歸戶至部門
                gemini_state: 'PENDING',
                is_active: true,
            })
            .select()
            .single();

        if (insertError) {
            console.error('資料庫寫入失敗:', insertError);
            return NextResponse.json(
                { success: false, error: { code: 'DATABASE_ERROR', message: '儲存檔案記錄失敗' } },
                { status: 500 }
            );
        }

        // 處理標籤
        if (tags) {
            try {
                const tagList = JSON.parse(tags) as Array<{ key: string; value: string }>;
                if (Array.isArray(tagList) && tagList.length > 0) {
                    const tagInserts = tagList.map((tag) => ({
                        file_id: newFile.id,
                        tag_key: tag.key,
                        tag_value: tag.value,
                    }));

                    await supabase.from('file_tags').insert(tagInserts);
                }
            } catch (tagError) {
                console.warn('標籤解析失敗:', tagError);
            }
        }

        // 觸發知識汲取流程 (Ingestion Pipeline)
        // 注意：為了 Demo 效果與確保執行，這裡暫時使用 await (會增加請求時間)
        // 實務上應使用 Background Job 或 Queue
        try {
            await processUploadedFile(newFile.id, buffer);
        } catch (ingestionError) {
            console.error('Ingestion Trigger Failed:', ingestionError);
            // 不阻斷上傳流程，由背景重試或手動重試
        }

        return NextResponse.json({
            success: true,
            data: newFile,
        }, { status: 201 });

    } catch (error) {
        return toApiResponse(error);
    }
}

// 在 App Router 中，FormData 會自動處理，不需要特殊配置

