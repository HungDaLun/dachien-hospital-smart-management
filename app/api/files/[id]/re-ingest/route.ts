
import { NextRequest, NextResponse } from 'next/server';
import { processUploadedFile } from '@/lib/knowledge/ingestion';
import { toApiResponse } from '@/lib/errors';
import { getCurrentUserProfile, requireRole } from '@/lib/permissions';

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const profile = await getCurrentUserProfile();
        requireRole(profile, ['SUPER_ADMIN', 'DEPT_ADMIN', 'EDITOR']);

        // Trigger ingestion without buffer (it will fetch from S3)
        await processUploadedFile(id);

        return NextResponse.json({
            success: true,
            message: 'Re-ingestion triggered successfully'
        });
    } catch (error) {
        return toApiResponse(error);
    }
}
