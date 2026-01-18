/**
 * Meeting Reminder Cron Job
 * 定期檢查即將開始的會議並發送提醒
 * 
 * 建議設定：每 5 分鐘執行一次
 * Vercel Cron 格式: 每5分鐘 (cron/vercel.json)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getNotificationService } from '@/lib/super-assistant/notification';

export const dynamic = 'force-dynamic';

// ==================== Supabase Admin Client ====================

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// ==================== Handler ====================

export async function GET(request: NextRequest) {
    try {
        // 驗證 Cron Secret（防止未授權呼叫）
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getSupabaseAdmin();
        const notificationService = getNotificationService();

        // 計算時間範圍（接下來 15-20 分鐘內開始的會議）
        const now = new Date();
        const reminderWindowStart = new Date(now.getTime() + 15 * 60 * 1000); // 15 分鐘後
        const reminderWindowEnd = new Date(now.getTime() + 20 * 60 * 1000); // 20 分鐘後

        // 查詢即將開始的會議
        const { data: upcomingEvents, error } = await supabase
            .from('calendar_events')
            .select(`
        id,
        title,
        start_time,
        organizer_id,
        participants,
        reminders
      `)
            .eq('status', 'scheduled')
            .gte('start_time', reminderWindowStart.toISOString())
            .lte('start_time', reminderWindowEnd.toISOString());

        if (error) {
            console.error('[Meeting Reminder] Query error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!upcomingEvents || upcomingEvents.length === 0) {
            return NextResponse.json({
                success: true,
                message: '沒有即將開始的會議',
                processed: 0,
            });
        }

        console.log(`[Meeting Reminder] Found ${upcomingEvents.length} upcoming events`);

        let sentCount = 0;
        const errors: string[] = [];

        for (const event of upcomingEvents) {
            try {
                const startTime = new Date(event.start_time);
                const minutesBefore = Math.round((startTime.getTime() - now.getTime()) / 60000);

                // 發送提醒給主辦人
                await notificationService.sendMeetingReminder({
                    userId: event.organizer_id,
                    meetingTitle: event.title,
                    startTime,
                    minutesBefore,
                });
                sentCount++;

                // 發送提醒給參與者
                const participants = event.participants as Array<{ user_id?: string }> || [];
                for (const participant of participants) {
                    if (participant.user_id && participant.user_id !== event.organizer_id) {
                        try {
                            await notificationService.sendMeetingReminder({
                                userId: participant.user_id,
                                meetingTitle: event.title,
                                startTime,
                                minutesBefore,
                            });
                            sentCount++;
                        } catch (participantError) {
                            // 參與者提醒失敗不影響其他人
                            console.warn(`[Meeting Reminder] Failed to notify participant:`, participantError);
                        }
                    }
                }
            } catch (eventError) {
                const errorMsg = eventError instanceof Error ? eventError.message : 'Unknown error';
                errors.push(`Event ${event.id}: ${errorMsg}`);
                console.error(`[Meeting Reminder] Error processing event ${event.id}:`, eventError);
            }
        }

        return NextResponse.json({
            success: true,
            message: `已處理 ${upcomingEvents.length} 個會議，發送 ${sentCount} 則提醒`,
            processed: upcomingEvents.length,
            sent: sentCount,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error('[Meeting Reminder] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
