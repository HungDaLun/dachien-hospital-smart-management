import { NextRequest, NextResponse } from 'next/server';
import { autoMapDocumentToFrameworks } from '@/lib/knowledge/mapper';
import { toApiResponse } from '@/lib/errors';
import { getCurrentUserProfile } from '@/lib/permissions';


export async function POST(
    _: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await getCurrentUserProfile(); // Ensure auth

        // Optional: Check if user has access to file (Mapper logic does a check but good to do here too)

        const result = await autoMapDocumentToFrameworks(id);

        if (!result.success) {
            return NextResponse.json({ error: result.message }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        return toApiResponse(error);
    }
}
