
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toApiResponse } from '@/lib/errors';

// DELETE /api/skills/[id]
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // 1. Check permission
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Check user role directly
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'SUPER_ADMIN') {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // 2. Perform Delete
        const { error } = await supabase
            .from('skills_library')
            .delete()
            .eq('id', id);

        if (error) {
            return toApiResponse(error);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        return toApiResponse(error);
    }
}
