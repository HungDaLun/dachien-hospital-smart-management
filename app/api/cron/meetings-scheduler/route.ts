import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MeetingService } from '@/lib/meeting/service';

// 使用 service role key 來繞過 RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Cron Job: 自動啟動到期的預約會議並執行對談
 * 
 * 這個 API 應該由外部 Cron 服務（如 Vercel Cron, GitHub Actions, 或 cron-job.org）定期呼叫
 * 建議頻率：每 1 分鐘執行一次
 * 
 * GET /api/cron/meetings-scheduler
 */
export async function GET(req: NextRequest) {
    // 驗證 Cron 密鑰（防止未授權呼叫）
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        console.warn('[Cron] Unauthorized cron request');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date().toISOString();
    console.log(`[Cron] 執行會議排程檢查: ${now}`);

    try {
        // 1. 查詢所有到期但尚未啟動的預約會議
        const { data: dueMeetings, error: fetchError } = await supabaseAdmin
            .from('meetings')
            .select('id, title, topic, user_id, scheduled_start_time, mode, duration_minutes')
            .eq('status', 'scheduled')
            .lte('scheduled_start_time', now);

        if (fetchError) {
            console.error('[Cron] 查詢預約會議失敗:', fetchError);
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!dueMeetings || dueMeetings.length === 0) {
            console.log('[Cron] 沒有到期的預約會議');
            return NextResponse.json({ message: 'No due meetings', processed: 0 });
        }

        console.log(`[Cron] 發現 ${dueMeetings.length} 個到期會議，開始處理...`);

        const results = [];

        for (const meeting of dueMeetings) {
            console.log(`[Cron] 處理會議: ${meeting.title || meeting.topic} (${meeting.id})`);

            try {
                // 2. 更新會議狀態為進行中
                const { error: updateError } = await supabaseAdmin
                    .from('meetings')
                    .update({
                        status: 'in_progress',
                        started_at: new Date().toISOString()
                    })
                    .eq('id', meeting.id);

                if (updateError) {
                    console.error(`[Cron] 更新會議 ${meeting.id} 狀態失敗:`, updateError);
                    results.push({ id: meeting.id, status: 'error', error: updateError.message });
                    continue;
                }

                // 3. 執行會議對談直到完成
                const service = new MeetingService();
                await runMeetingToCompletion(service, meeting.id, meeting.duration_minutes || 5);

                results.push({ id: meeting.id, status: 'completed' });
                console.log(`[Cron] 會議 ${meeting.id} 已完成執行`);

            } catch (error: unknown) {
                console.error(`[Cron] 處理會議 ${meeting.id} 時發生錯誤:`, error);
                results.push({ id: meeting.id, status: 'error', error: (error as Error).message });
            }
        }

        return NextResponse.json({
            message: `Processed ${dueMeetings.length} meetings`,
            results
        });

    } catch (error: unknown) {
        console.error('[Cron] 排程器執行失敗:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

/**
 * 執行會議直到完成或超時
 */
async function runMeetingToCompletion(service: MeetingService, meetingId: string, durationMinutes: number) {
    const startTime = Date.now();
    const maxDuration = durationMinutes * 60 * 1000; // 轉換為毫秒
    const maxTurns = 50; // 安全限制：最多 50 輪對話
    let turnCount = 0;

    console.log(`[Cron] 開始執行會議 ${meetingId}，預計時長 ${durationMinutes} 分鐘`);

    while (turnCount < maxTurns) {
        const elapsed = Date.now() - startTime;

        // 檢查是否超時
        if (elapsed >= maxDuration) {
            console.log(`[Cron] 會議 ${meetingId} 時間到，結束會議`);
            break;
        }

        try {
            // 執行下一輪對話
            const stream = await service.processNextTurn(meetingId);

            if (!stream) {
                // 沒有下一位發言者，可能會議已自然結束
                console.log(`[Cron] 會議 ${meetingId} 沒有下一位發言者，結束`);
                break;
            }

            // 消耗串流（等待完成）
            const reader = stream.getReader();
            while (true) {
                const { done } = await reader.read();
                if (done) break;
            }

            turnCount++;
            console.log(`[Cron] 會議 ${meetingId} 完成第 ${turnCount} 輪對話`);

            // 短暫延遲，避免過快
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error: unknown) {
            console.error(`[Cron] 會議 ${meetingId} 對話輪次失敗:`, error);
            // 繼續下一輪，不中斷整個會議
        }
    }

    // 結束會議並生成記錄
    try {
        await service.endMeeting(meetingId);
        console.log(`[Cron] 會議 ${meetingId} 已結束，會議記錄已生成`);
    } catch (error: unknown) {
        console.error(`[Cron] 結束會議 ${meetingId} 時發生錯誤:`, error);
    }
}

// 也支援 POST 方法（某些 Cron 服務使用 POST）
export async function POST(req: NextRequest) {
    return GET(req);
}
