/**
 * 單一檔案管理 API
 * 提供檔案詳情、更新、刪除功能
 * 遵循 EAKAP API 規範
 */
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, AuthorizationError, toApiResponse } from '@/lib/errors';
import { getCurrentUserProfile, canAccessFile, canUpdateFile, canDeleteFile } from '@/lib/permissions';

/**
 * GET /api/files/:id
 * 取得單一檔案詳情
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const profile = await getCurrentUserProfile();

        // 檢查存取權限
        const hasAccess = await canAccessFile(profile, id);
        if (!hasAccess) {
            throw new NotFoundError('檔案');
        }

        const supabase = await createClient();

        // 查詢檔案
        const { data: file, error } = await supabase
            .from('files')
            .select(`
                *,
                file_tags (
                  id,
                  tag_key,
                  tag_value
                ),
                user_profiles!uploaded_by (
                  id,
                  display_name,
                  email
                )
            `)
            .eq('id', id)
            .eq('is_active', true)
            .single();

        if (error || !file) {
            throw new NotFoundError('檔案');
        }

        return NextResponse.json({
            success: true,
            data: file,
        });

    } catch (error) {
        return toApiResponse(error);
    }
}

/**
 * PUT /api/files/:id
 * 更新檔案元資料
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const profile = await getCurrentUserProfile();

        // 檢查更新權限
        const canUpdate = await canUpdateFile(profile, id);
        if (!canUpdate) {
            throw new AuthorizationError('您沒有權限更新此檔案');
        }

        const supabase = await createClient();

        // 解析請求內容
        const body = await request.json();
        const { filename, tags } = body;

        // 更新檔案名稱
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (filename) {
            updateData.filename = filename;
        }

        const { data: updatedFile, error: updateError } = await supabase
            .from('files')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return toApiResponse(updateError);
        }

        // 更新標籤（如果提供）
        if (tags !== undefined) {
            // 刪除舊標籤 (不刪除系統標籤如 department 如果需要保留的話，但這裡實作是全換)
            await supabase.from('file_tags').delete().eq('file_id', id);

            // 新增新標籤
            if (Array.isArray(tags) && tags.length > 0) {
                const tagInserts = tags.map((tag: { key: string; value: string }) => ({
                    file_id: id,
                    tag_key: tag.key,
                    tag_value: tag.value,
                }));

                await supabase.from('file_tags').insert(tagInserts);
            }
        }

        return NextResponse.json({
            success: true,
            data: updatedFile,
        });

    } catch (error) {
        return toApiResponse(error);
    }
}

/**
 * DELETE /api/files/:id
 * 刪除檔案（軟刪除）
 */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const profile = await getCurrentUserProfile();

        // 檢查刪除權限
        const canDelete = await canDeleteFile(profile, id);
        if (!canDelete) {
            throw new AuthorizationError('您沒有權限刪除此檔案');
        }

        const supabase = await createClient();

        // 1. 取得完整檔案資訊 (為了刪除儲顯)
        const { data: file, error: fetchError } = await supabase
            .from('files')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !file) {
            // Already gone or error
            throw new NotFoundError('檔案');
        }

        // 2. 刪除 S3 檔案
        if (file.s3_storage_path) {
            try {
                // Dynamic import to avoid circular dependency issues if any, keeping it clean
                const { deleteFromS3 } = await import('@/lib/storage/s3');
                await deleteFromS3(file.s3_storage_path);
            } catch (e) {
                console.error('S3 刪除失敗 (非致命):', e);
            }
        }

        // 3. 刪除 Gemini 檔案
        if (file.gemini_file_uri) {
            try {
                const { deleteFileFromGemini } = await import('@/lib/gemini/client');
                await deleteFileFromGemini(file.gemini_file_uri);
            } catch (e) {
                console.error('Gemini 刪除失敗 (非致命):', e);
            }
        }

        // 4. 刪除關聯標籤 (Hard Delete)
        await supabase.from('file_tags').delete().eq('file_id', id);

        // 5. 刪除檔案記錄 (Hard Delete)
        const { error: deleteError } = await supabase
            .from('files')
            .delete()
            .eq('id', id);

        if (deleteError) {
            return toApiResponse(deleteError);
        }



        return NextResponse.json({
            success: true,
            data: { id, deleted: true },
        });

    } catch (error) {
        return toApiResponse(error);
    }
}
