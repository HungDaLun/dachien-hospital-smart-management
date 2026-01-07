import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NotFoundError, toApiResponse } from '@/lib/errors';
import { getCurrentUserProfile, canAccessFile } from '@/lib/permissions';
import { getSignedUrlForS3 } from '@/lib/storage/s3';
import { logAudit } from '@/lib/actions/audit';

/**
 * GET /api/files/:id/download
 * 取得檔案下載連結 (Signed URL)
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

        // 查詢檔案資訊 (取得 S3 Path)
        const { data: file, error } = await supabase
            .from('files')
            .select('filename, s3_storage_path, department_id')
            .eq('id', id)
            .single();

        if (error || !file || !file.s3_storage_path) {
            throw new NotFoundError('檔案');
        }

        const searchParams = _request.nextUrl.searchParams;
        const isInline = searchParams.get('inline') === 'true';

        // 產生 Signed URL (有效期限 15 分鐘)
        // 若請求 inline=true，則設定 ResponseContentDisposition 為 inline (用於瀏覽器直接開啟)
        const signedUrl = await getSignedUrlForS3(
            file.s3_storage_path,
            900,
            isInline ? { responseContentDisposition: 'inline' } : undefined
        );

        // 記錄下載操作
        await logAudit({
            action: 'DOWNLOAD_FILE',
            resourceType: 'FILE',
            resourceId: id,
            details: {
                filename: file.filename,
                department_id: file.department_id,
            },
        });

        // 回傳下載連結
        return NextResponse.json({
            success: true,
            data: {
                url: signedUrl,
                filename: file.filename,
            },
        });

    } catch (error) {
        return toApiResponse(error);
    }
}
