/**
 * Apply Metadata API
 * 應用 AI 建議的 Metadata (檔名、標籤) 到檔案
 */
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserProfile, requireRole } from '@/lib/permissions';
import { toApiResponse } from '@/lib/errors';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const profile = await getCurrentUserProfile();
        requireRole(profile, ['SUPER_ADMIN', 'DEPT_ADMIN', 'EDITOR']);

        const id = params.id;
        const body = await request.json();
        const { filename, tags, categoryId } = body; // tags is string[]

        if (!filename) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'Filename is required' } },
                { status: 400 }
            );
        }

        // 1. Update File Record
        const { error: fileError } = await supabase
            .from('files')
            .update({
                filename: filename,
                gemini_state: 'SYNCED', // Mark as synced/reviewed
                category_id: categoryId || null, // Update category
            })
            .eq('id', id);

        if (fileError) throw fileError;

        // 2. Update Tags (Replace all)
        // First delete existing auto/governance tags? Or all tags?
        // Let's replace all for this file to match the review UI.
        const { error: deleteTagsError } = await supabase
            .from('file_tags')
            .delete()
            .eq('file_id', id);

        if (deleteTagsError) throw deleteTagsError;

        // Insert new tags
        if (tags && Array.isArray(tags) && tags.length > 0) {
            const tagInserts = tags.map((t: string) => {
                // Try to parse "key:value" if user typed it
                let key = 'tag';
                let value = t;
                if (t.includes(':')) {
                    const parts = t.split(':');
                    key = parts[0].trim();
                    value = parts.slice(1).join(':').trim();
                }
                return {
                    file_id: id,
                    tag_key: key,
                    tag_value: value,
                    created_by: profile.id
                };
            });

            const { error: insertTagsError } = await supabase
                .from('file_tags')
                .insert(tagInserts);

            if (insertTagsError) throw insertTagsError;
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        return toApiResponse(error);
    }
}
