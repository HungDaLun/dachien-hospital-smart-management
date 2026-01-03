import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile, requireSuperAdmin } from '@/lib/permissions';
import { toApiResponse, ValidationError } from '@/lib/errors';

/**
 * POST /api/departments
 * 建立部門 (僅 SUPER_ADMIN)
 */
export async function POST(request: NextRequest) {
    try {
        const profile = await getCurrentUserProfile();
        requireSuperAdmin(profile);

        const body = await request.json();
        const { name, code, description } = body;

        if (!name) {
            throw new ValidationError('Department name is required');
        }

        const supabase = await createClient();
        const { data, error } = await supabase
            .from('departments')
            .insert({ name, code, description })
            .select()
            .single();

        if (error) throw error;

        // ...existing code...
        return NextResponse.json({
            success: true,
            data,
        }, { status: 201 });

    } catch (error) {
        return toApiResponse(error);
    }
}

/**
 * GET /api/departments
 * 取得部門列表
 */
export async function GET() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('departments')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data,
        });

    } catch (error) {
        return toApiResponse(error);
    }
}
