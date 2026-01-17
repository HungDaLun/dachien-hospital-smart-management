import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, getCurrentUserProfile } from '@/lib/permissions';
import { toApiResponse } from '@/lib/errors';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Fix for Next.js 15+ Params
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { action, updates } = body; // action: 'APPROVE' | 'REJECT'

        const supabase = await createClient();
        const profile = await getCurrentUserProfile();

        // Verify permissions: Only DEPT_ADMIN (for their dept) or SUPER_ADMIN can review
        // EDITORs can self-review if we allow it, but let's stick to simple "Reviewer" role logic for now.
        // For MVP, lets say DEPT_ADMIN+ can review.
        requireRole(profile, ['SUPER_ADMIN', 'DEPT_ADMIN', 'EDITOR']); // Editors can review too for now

        // Fetch the file
        const { data: file, error: fetchError } = await supabase
            .from('files')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Role Check for Department
        if (profile.role !== 'SUPER_ADMIN' && file.department_id && file.department_id !== profile.department_id) {
            return NextResponse.json({ error: 'Unauthorized: Cross-department review not allowed' }, { status: 403 });
        }

        if (action === 'APPROVE') {
            const { filename, summary, tags, category } = updates || {};

            // Update metadata
            // 1. Update File Basic Info
            interface FileUpdateData {
                gemini_state: string;
                updated_at: string;
                filename?: string;
                metadata_analysis?: Record<string, unknown>;
            }
            const updateData: FileUpdateData = {
                gemini_state: 'SYNCED', // Move to active state
                updated_at: new Date().toISOString(),
            };

            if (filename) updateData.filename = filename;

            // Update JSON metadata if provided
            if (summary || category) {
                updateData.metadata_analysis = {
                    ...file.metadata_analysis,
                    summary: summary || file.metadata_analysis?.summary,
                    document_type: category || file.metadata_analysis?.document_type
                };
            }

            const { error: updateError } = await supabase
                .from('files')
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;

            // 2. Update Tags (Delete old, insert new)
            if (tags && Array.isArray(tags)) {
                // Delete existing tags
                await supabase.from('file_tags').delete().eq('file_id', id);

                // Insert new tags
                if (tags.length > 0) {
                    const tagInserts = tags.map((t: string) => ({
                        file_id: id,
                        tag_key: 'topic', // Default key for simplicity, or we could infer
                        tag_value: t
                    }));
                    await supabase.from('file_tags').insert(tagInserts);
                }
            }

            return NextResponse.json({ success: true, message: 'File approved and published' });

        } else if (action === 'REJECT') {
            // Soft delete or Mark Rejected
            const { error } = await supabase
                .from('files')
                .update({ gemini_state: 'REJECTED', is_active: false })
                .eq('id', id);

            if (error) throw error;

            return NextResponse.json({ success: true, message: 'File rejected' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: unknown) {
        return toApiResponse(error);
    }
}
