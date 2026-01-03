import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/lib/permissions';
import { toApiResponse } from '@/lib/errors';

/**
 * DELETE /api/knowledge/instances/[id]
 * Delete a knowledge instance
 */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const supabase = await createClient();
        const profile = await getCurrentUserProfile();

        // 1. Fetch the instance to check ownership or permissions
        const { data: instance, error: fetchError } = await supabase
            .from('knowledge_instances')
            .select('id, created_by, department_id')
            .eq('id', id)
            .single();

        if (fetchError || !instance) {
            return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
        }

        // 2. Permission Check
        // Allow if user is Super Admin or the creator or Dept Admin of that department
        const canDelete =
            profile.role === 'SUPER_ADMIN' ||
            instance.created_by === profile.id ||
            (profile.role === 'DEPT_ADMIN' && instance.department_id === profile.department_id);

        if (!canDelete) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 3. Perform Deletion
        const { error: deleteError } = await supabase
            .from('knowledge_instances')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        return NextResponse.json({ success: true, message: 'Instance deleted successfully' });

    } catch (error) {
        return toApiResponse(error);
    }
}
