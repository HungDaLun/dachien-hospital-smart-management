/**
 * 檔案同步 API
 * POST /api/files/[id]/sync
 */
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { syncFileToGemini } from '@/lib/gemini/files';
import { AuthenticationError, AuthorizationError, toApiResponse } from '@/lib/errors';

export async function POST(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const fileId = params.id;
        const supabase = await createClient();

        // 1. 驗證使用者身份
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new AuthenticationError();
        }

        // 2. 檢查使用權限 (僅限 SUPER_ADMIN, DEPT_ADMIN 或該檔案的上傳者)
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const { data: file } = await supabase
            .from('files')
            .select('uploaded_by')
            .eq('id', fileId)
            .single();

        if (!file) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: '找不到檔案' } },
                { status: 404 }
            );
        }

        const isOwner = file.uploaded_by === user.id;
        const isAdmin = profile && ['SUPER_ADMIN', 'DEPT_ADMIN'].includes(profile.role);

        if (!isOwner && !isAdmin) {
            throw new AuthorizationError('您沒有權限同步此檔案');
        }

        // 3. 執行同步
        const updatedFile = await syncFileToGemini(fileId);

        return NextResponse.json({
            success: true,
            data: updatedFile,
        });

    } catch (error) {
        return toApiResponse(error);
    }
}
