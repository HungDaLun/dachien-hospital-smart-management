import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/lib/permissions';
import { toApiResponse, ValidationError } from '@/lib/errors';

/**
 * GET /api/favorites
 * 取得使用者的最愛清單
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const profile = await getCurrentUserProfile();

        const { searchParams } = new URL(request.url);
        const resourceType = searchParams.get('resource_type');

        let query = supabase
            .from('user_favorites')
            .select('*')
            .eq('user_id', profile.id);

        if (resourceType) {
            query = query.eq('resource_type', resourceType);
        }

        const { data: favorites, error } = await query;

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: favorites || []
        });
    } catch (error) {
        return toApiResponse(error);
    }
}

/**
 * POST /api/favorites
 * 切換最愛狀態 (Toggle)
 * Body: { resource_type: 'AGENT' | 'FILE', resource_id: UUID }
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const profile = await getCurrentUserProfile();

        const body = await request.json();
        const { resource_type, resource_id } = body;

        if (!resource_type || !resource_id) {
            throw new ValidationError('Resource type and ID are required');
        }

        // 1. 檢查是否已存在
        const { data: existing } = await supabase
            .from('user_favorites')
            .select('id')
            .eq('user_id', profile.id)
            .eq('resource_type', resource_type)
            .eq('resource_id', resource_id)
            .single();

        if (existing) {
            // 2. 若存在則刪除 (Remove from favorites)
            const { error: deleteError } = await supabase
                .from('user_favorites')
                .delete()
                .eq('id', existing.id);

            if (deleteError) throw deleteError;

            return NextResponse.json({
                success: true,
                data: { is_favorite: false }
            });
        } else {
            // 3. 若不存在則新增 (Add to favorites)
            const { error: insertError } = await supabase
                .from('user_favorites')
                .insert({
                    user_id: profile.id,
                    resource_type,
                    resource_id
                });

            if (insertError) throw insertError;

            return NextResponse.json({
                success: true,
                data: { is_favorite: true }
            });
        }
    } catch (error) {
        return toApiResponse(error);
    }
}
