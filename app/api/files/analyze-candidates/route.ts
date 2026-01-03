import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toApiResponse } from '@/lib/errors';
import { getCurrentUserProfile } from '@/lib/permissions';

// 此路由使用 cookies 進行身份驗證，必須為動態路由
export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest) {
    try {
        const supabase = await createClient();
        const profile = await getCurrentUserProfile();

        let query = supabase
            .from('files')
            .select('id')
            .eq('gemini_state', 'SYNCED')
            .eq('is_active', true);

        if (profile.role === 'EDITOR') {
            query = query.eq('uploaded_by', profile.id);
        }

        const { data: files, error } = await query;

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: files?.map(f => f.id) || []
        });

    } catch (error) {
        return toApiResponse(error);
    }
}
