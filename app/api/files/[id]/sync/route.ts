/**
 * 檔案同步 API
 * POST /api/files/[id]/sync
 */
import { NextRequest, NextResponse } from 'next/server';
import { syncFileToGemini } from '@/lib/gemini/files';
import { toApiResponse } from '@/lib/errors';
import { getCurrentUserProfile, canUpdateFile } from '@/lib/permissions';

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const profile = await getCurrentUserProfile();

        // 檢查權限 (同步視為一種更新操作)
        const canSync = await canUpdateFile(profile, id);
        if (!canSync) {
            return toApiResponse(new Error('您沒有權限同步此檔案'));
        }

        // 執行同步
        const updatedFile = await syncFileToGemini(id);

        return NextResponse.json({
            success: true,
            data: updatedFile,
        });

    } catch (error) {
        return toApiResponse(error);
    }
}
