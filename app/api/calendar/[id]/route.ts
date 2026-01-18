/**
 * Calendar Event Detail API
 * GET    /api/calendar/[id] - 取得單一事件
 * PUT    /api/calendar/[id] - 更新事件
 * DELETE /api/calendar/[id] - 刪除事件
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/lib/permissions';

// ==================== GET ====================

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await getCurrentUserProfile();
        const supabase = await createClient();

        const { data: event, error } = await supabase
            .from('calendar_events')
            .select('*')
            .eq('id', params.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: '事件不存在' }, { status: 404 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: event,
        });
    } catch (error) {
        console.error('[Calendar API] GET [id] error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

// ==================== PUT ====================

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const profile = await getCurrentUserProfile();
        const supabase = await createClient();

        // 先檢查事件是否存在且使用者是主辦人
        const { data: existing, error: fetchError } = await supabase
            .from('calendar_events')
            .select('organizer_id')
            .eq('id', params.id)
            .single();

        if (fetchError || !existing) {
            return NextResponse.json({ error: '事件不存在' }, { status: 404 });
        }

        if (existing.organizer_id !== profile.id) {
            return NextResponse.json({ error: '只有主辦人可以修改事件' }, { status: 403 });
        }

        const body = await request.json();

        // 驗證時間邏輯 (如果有更新)
        if (body.start_time && body.end_time) {
            const startTime = new Date(body.start_time);
            const endTime = new Date(body.end_time);
            if (endTime < startTime) {
                return NextResponse.json({ error: '結束時間不能早於開始時間' }, { status: 400 });
            }
        }

        // 更新事件
        const { data: event, error } = await supabase
            .from('calendar_events')
            .update({
                ...body,
                updated_at: new Date().toISOString(),
            })
            .eq('id', params.id)
            .select()
            .single();

        if (error) {
            console.error('[Calendar API] PUT error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: event,
            message: '行事曆事件已更新',
        });
    } catch (error) {
        console.error('[Calendar API] PUT error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

// ==================== DELETE ====================

export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const profile = await getCurrentUserProfile();
        const supabase = await createClient();

        // 先檢查事件是否存在且使用者是主辦人
        const { data: existing, error: fetchError } = await supabase
            .from('calendar_events')
            .select('organizer_id')
            .eq('id', params.id)
            .single();

        if (fetchError || !existing) {
            return NextResponse.json({ error: '事件不存在' }, { status: 404 });
        }

        if (existing.organizer_id !== profile.id) {
            return NextResponse.json({ error: '只有主辦人可以刪除事件' }, { status: 403 });
        }

        // 刪除事件
        const { error } = await supabase
            .from('calendar_events')
            .delete()
            .eq('id', params.id);

        if (error) {
            console.error('[Calendar API] DELETE error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: '行事曆事件已刪除',
        });
    } catch (error) {
        console.error('[Calendar API] DELETE error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
