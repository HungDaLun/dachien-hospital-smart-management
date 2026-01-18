/**
 * Calendar Events API
 * GET  /api/calendar - 取得行事曆事件
 * POST /api/calendar - 建立新事件
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

// ==================== Types ====================

interface CalendarEventInput {
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time: string;
    timezone?: string;
    is_all_day?: boolean;
    participants?: Array<{ user_id: string; email?: string; name?: string }>;
    department_id?: string;
    visibility?: 'private' | 'department' | 'company';
    reminders?: Array<{ type: 'line' | 'email'; minutes: number }>;
}

// ==================== GET ====================

export async function GET(request: NextRequest) {
    try {
        const profile = await getCurrentUserProfile();
        const supabase = await createClient();

        // 取得查詢參數
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('start');
        const endDate = searchParams.get('end');
        const limit = parseInt(searchParams.get('limit') || '50');

        // 建立查詢
        let query = supabase
            .from('calendar_events')
            .select(`
        id,
        title,
        description,
        location,
        start_time,
        end_time,
        timezone,
        is_all_day,
        organizer_id,
        participants,
        department_id,
        visibility,
        status,
        reminders,
        created_at,
        updated_at
      `)
            .order('start_time', { ascending: true })
            .limit(limit);

        // 日期範圍篩選
        if (startDate) {
            query = query.gte('start_time', startDate);
        }
        if (endDate) {
            query = query.lte('end_time', endDate);
        }

        // 只取得使用者有權限看到的事件 (RLS 會處理)
        const { data: events, error } = await query;

        if (error) {
            console.error('[Calendar API] GET error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: events,
            meta: {
                count: events?.length || 0,
                user_id: profile.id,
            },
        });
    } catch (error) {
        console.error('[Calendar API] GET error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

// ==================== POST ====================

export async function POST(request: NextRequest) {
    try {
        const profile = await getCurrentUserProfile();
        const supabase = await createClient();

        const body: CalendarEventInput = await request.json();

        // 驗證必填欄位
        if (!body.title) {
            return NextResponse.json({ error: '標題為必填' }, { status: 400 });
        }
        if (!body.start_time || !body.end_time) {
            return NextResponse.json({ error: '開始與結束時間為必填' }, { status: 400 });
        }

        // 驗證時間邏輯
        const startTime = new Date(body.start_time);
        const endTime = new Date(body.end_time);
        if (endTime < startTime) {
            return NextResponse.json({ error: '結束時間不能早於開始時間' }, { status: 400 });
        }

        // 建立事件
        const { data: event, error } = await supabase
            .from('calendar_events')
            .insert({
                title: body.title,
                description: body.description || null,
                location: body.location || null,
                start_time: body.start_time,
                end_time: body.end_time,
                timezone: body.timezone || 'Asia/Taipei',
                is_all_day: body.is_all_day || false,
                organizer_id: profile.id,
                participants: body.participants || [],
                department_id: body.department_id || profile.department_id || null,
                visibility: body.visibility || 'department',
                status: 'scheduled',
                reminders: body.reminders || [],
            })
            .select()
            .single();

        if (error) {
            console.error('[Calendar API] POST error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: event,
            message: '行事曆事件已建立',
        });
    } catch (error) {
        console.error('[Calendar API] POST error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
