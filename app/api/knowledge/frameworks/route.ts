import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile, requireRole } from '@/lib/permissions';
import { toApiResponse } from '@/lib/errors';

/**
 * GET /api/knowledge/frameworks
 * List all available knowledge frameworks
 */
export async function GET() {
    try {
        const supabase = await createClient();

        // Everyone can list frameworks
        const { data: frameworks, error } = await supabase
            .from('knowledge_frameworks')
            .select('*')
            .order('name');

        if (error) throw error;

        return NextResponse.json(frameworks);
    } catch (error) {
        return toApiResponse(error);
    }
}

/**
 * POST /api/knowledge/frameworks
 * Create a new knowledge framework (Admin only)
 */
export async function POST(request: NextRequest) {
    try {
        const profile = await getCurrentUserProfile();
        requireRole(profile, ['SUPER_ADMIN', 'DEPT_ADMIN']);

        const body = await request.json();
        const { code, name, description, schema, ui_config, visual_type } = body;

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('knowledge_frameworks')
            .insert({
                code,
                name,
                description,
                schema,
                ui_config,
                visual_type,
                created_by: profile.id
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return toApiResponse(error);
    }
}
