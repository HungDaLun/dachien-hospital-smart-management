import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toApiResponse } from '@/lib/errors';

/**
 * GET /api/skills
 * 取得可用技能列表
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category');

        let query = supabase
            .from('skills_library')
            .select('*')
            .eq('is_active', true)
            .order('category', { ascending: true })
            .order('display_name', { ascending: true });

        if (category) {
            query = query.eq('category', category);
        }

        const { data: skills, error } = await query;

        if (error) {
            return toApiResponse(error);
        }

        return NextResponse.json({
            success: true,
            data: skills || []
        });
    } catch (error) {
        return toApiResponse(error);
    }
}
