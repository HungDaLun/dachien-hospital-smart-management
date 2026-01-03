/**
 * 單一檔案管理 API
 * 提供檔案詳情、更新、刪除功能
 * 遵循 EAKAP API 規範
 */
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, AuthorizationError, toApiResponse } from '@/lib/errors';
import { getCurrentUserProfile, canAccessFile, canUpdateFile, canDeleteFile } from '@/lib/permissions';
import { logAudit } from '@/lib/actions/audit';

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

        // 記錄查看檔案操作
        await logAudit({
            action: 'VIEW_FILE',
            resourceType: 'FILE',
            resourceId: id,
            details: {
                filename: file.filename,
                department_id: file.department_id,
            },
        });

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

        // 記錄更新檔案操作
        await logAudit({
            action: 'UPDATE_FILE',
            resourceType: 'FILE',
            resourceId: id,
            details: {
                filename: updatedFile?.filename,
                updated_fields: Object.keys(updateData),
            },
        });

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
 * 硬刪除檔案及其所有關聯資料（包括 S3 和 Gemini 儲存）
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

        // 5. 刪除使用者收藏中的此檔案（user_favorites）
        await supabase
            .from('user_favorites')
            .delete()
            .eq('resource_type', 'FILE')
            .eq('resource_id', id);

        // 6. 清理知識圖譜中的相關知識實例
        // 如果 knowledge_instances 的 source_file_ids 包含此檔案 ID，需要處理
        // 選項 A: 如果該實例只引用此檔案，則刪除該實例
        // 選項 B: 如果該實例還引用其他檔案，則從 source_file_ids 中移除此檔案 ID
        // 先取得所有 knowledge_instances，然後在 JavaScript 中過濾（因為 Supabase JS 對陣列查詢支援有限）
        const { data: allInstances } = await supabase
            .from('knowledge_instances')
            .select('id, source_file_ids');

        if (allInstances && allInstances.length > 0) {
            // 過濾出包含此檔案 ID 的實例
            const affectedInstances = allInstances.filter(instance => {
                const sourceFileIds = (instance.source_file_ids || []) as string[];
                return sourceFileIds.includes(id);
            });

            for (const instance of affectedInstances) {
                const sourceFileIds = (instance.source_file_ids || []) as string[];
                
                if (sourceFileIds.length === 1 && sourceFileIds[0] === id) {
                    // 如果該實例只引用此檔案，則刪除該實例
                    await supabase
                        .from('knowledge_instances')
                        .delete()
                        .eq('id', instance.id);
                } else {
                    // 如果該實例還引用其他檔案，則從 source_file_ids 中移除此檔案 ID
                    const updatedFileIds = sourceFileIds.filter(fileId => fileId !== id);
                    await supabase
                        .from('knowledge_instances')
                        .update({ source_file_ids: updatedFileIds })
                        .eq('id', instance.id);
                }
            }
        }

        // 7. 刪除檔案記錄 (Hard Delete)
        const { error: deleteError } = await supabase
            .from('files')
            .delete()
            .eq('id', id);

        if (deleteError) {
            return toApiResponse(deleteError);
        }

        // 記錄刪除檔案操作
        await logAudit({
            action: 'DELETE_FILE',
            resourceType: 'FILE',
            resourceId: id,
            details: {
                filename: file.filename,
                department_id: file.department_id,
            },
        });

        return NextResponse.json({
            success: true,
            data: { id, deleted: true },
        });

    } catch (error) {
        return toApiResponse(error);
    }
}
