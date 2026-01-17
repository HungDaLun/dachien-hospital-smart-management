/**
 * 檔案標籤管理 API
 * PUT /api/files/[id]/tags
 */
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { ValidationError, AuthenticationError, toApiResponse } from '@/lib/errors';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = params;

        // 驗證使用者身份
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new AuthenticationError();
        }

        // 解析 JSON 內容
        const { tags } = await request.json();
        if (!Array.isArray(tags)) {
            throw new ValidationError('標籤格式不正確');
        }

        // 1. 刪除現有標籤
        const { error: deleteError } = await supabase
            .from('file_tags')
            .delete()
            .eq('file_id', id);

        if (deleteError) {
            throw new Error(`刪除舊標籤失敗: ${deleteError.message}`);
        }

        // 2. 插入新標籤
        if (tags.length > 0) {
            interface TagInput {
                tag_key: string;
                tag_value: string;
            }
            const tagInserts = (tags as TagInput[]).map((t) => ({
                file_id: id,
                tag_key: t.tag_key,
                tag_value: t.tag_value,
            }));

            const { error: insertError } = await supabase
                .from('file_tags')
                .insert(tagInserts);

            if (insertError) {
                throw new Error(`更新標籤失敗: ${insertError.message}`);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return toApiResponse(error);
    }
}
