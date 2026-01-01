/**
 * 單一檔案管理 API
 * 提供檔案詳情、更新、刪除功能
 * 遵循 EAKAP API 規範
 */
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationError, NotFoundError, toApiResponse } from '@/lib/errors';

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
        const supabase = await createClient();

        // 驗證使用者身份
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new AuthenticationError();
        }

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
        const supabase = await createClient();

        // 驗證使用者身份
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new AuthenticationError();
        }

        // 取得使用者資料
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, department_id')
            .eq('id', user.id)
            .single();

        // 檢查檔案是否存在
        const { data: existingFile } = await supabase
            .from('files')
            .select('id, uploaded_by')
            .eq('id', id)
            .eq('is_active', true)
            .single();

        if (!existingFile) {
            throw new NotFoundError('檔案');
        }

        // 權限檢查：EDITOR 只能編輯自己上傳的
        if (
            profile?.role === 'EDITOR' &&
            existingFile.uploaded_by !== user.id
        ) {
            return NextResponse.json(
                { success: false, error: { code: 'PERMISSION_DENIED', message: '您只能編輯自己上傳的檔案' } },
                { status: 403 }
            );
        }

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
            console.error('更新檔案失敗:', updateError);
            return NextResponse.json(
                { success: false, error: { code: 'UPDATE_ERROR', message: '更新檔案失敗' } },
                { status: 500 }
            );
        }

        // 更新標籤（如果提供）
        if (tags !== undefined) {
            // 刪除舊標籤
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
        const supabase = await createClient();

        // 驗證使用者身份
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new AuthenticationError();
        }

        // 取得使用者資料
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, department_id')
            .eq('id', user.id)
            .single();

        // 檢查檔案是否存在
        const { data: existingFile } = await supabase
            .from('files')
            .select('id, uploaded_by, s3_storage_path, gemini_file_uri')
            .eq('id', id)
            .eq('is_active', true)
            .single();

        if (!existingFile) {
            throw new NotFoundError('檔案');
        }

        // 權限檢查：EDITOR 只能刪除自己上傳的
        if (
            profile?.role === 'EDITOR' &&
            existingFile.uploaded_by !== user.id
        ) {
            return NextResponse.json(
                { success: false, error: { code: 'PERMISSION_DENIED', message: '您只能刪除自己上傳的檔案' } },
                { status: 403 }
            );
        }

        // 軟刪除：設定 is_active = false
        const { error: updateError } = await supabase
            .from('files')
            .update({
                is_active: false,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (updateError) {
            console.error('刪除檔案失敗:', updateError);
            return NextResponse.json(
                { success: false, error: { code: 'DELETE_ERROR', message: '刪除檔案失敗' } },
                { status: 500 }
            );
        }

        // 非同步清理 S3 檔案（可選，軟刪除情境下可能想保留）
        // 如果要硬刪除，可以取消以下註解
        /*
        if (existingFile.s3_storage_path) {
          try {
            await deleteFromS3(existingFile.s3_storage_path);
          } catch (s3Error) {
            console.warn('S3 檔案刪除失敗:', s3Error);
          }
        }
        */

        return NextResponse.json({
            success: true,
            data: { id, deleted: true },
        });

    } catch (error) {
        return toApiResponse(error);
    }
}
