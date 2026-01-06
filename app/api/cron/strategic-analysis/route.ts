import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CorporateStrategyAnalyzer } from '@/lib/war-room/kpi/corporate-strategy';

/**
 * Cron API：每日戰略分析排程
 * 建議設定為每日凌晨 5:00 (UTC+8) 執行
 * 
 * Vercel Cron 設定範例（vercel.json）：
 * {
 *   "crons": [{
 *     "path": "/api/cron/strategic-analysis",
 *     "schedule": "0 21 * * *"  // UTC 21:00 = 台北時間 05:00
 *   }]
 * }
 */
export async function GET(request: Request) {
    // 1. 驗證 Cron 密鑰（防止未授權存取）
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // 允許 Vercel Cron 或帶有正確密鑰的請求
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const hasValidSecret = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isVercelCron && !hasValidSecret) {
        return NextResponse.json(
            { error: '未授權的存取' },
            { status: 401 }
        );
    }

    // 2. 使用 Service Role 連接資料庫
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json(
            { error: '缺少 Supabase 設定' },
            { status: 500 }
        );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // 3. 取得所有活躍使用者
        const { data: users, error: usersError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('status', 'ACTIVE');

        if (usersError) {
            console.error('Failed to fetch users:', usersError);
            return NextResponse.json(
                { error: '無法取得使用者列表' },
                { status: 500 }
            );
        }

        // 4. 為每位使用者生成分析
        const analyzer = new CorporateStrategyAnalyzer();
        const results = [];

        for (const user of users || []) {
            try {
                console.log(`[Cron] Generating insight for user: ${user.id}`);
                await analyzer.generateAndCacheInsight(user.id);
                results.push({ userId: user.id, status: 'success' });
            } catch (error) {
                console.error(`[Cron] Failed for user ${user.id}:`, error);
                results.push({ userId: user.id, status: 'failed', error: String(error) });
            }
        }

        // 5. 回傳執行結果
        const successCount = results.filter(r => r.status === 'success').length;
        const failCount = results.filter(r => r.status === 'failed').length;

        console.log(`[Cron] Strategic analysis completed. Success: ${successCount}, Failed: ${failCount}`);

        return NextResponse.json({
            message: '每日戰略分析已完成',
            timestamp: new Date().toISOString(),
            summary: {
                total: results.length,
                success: successCount,
                failed: failCount
            },
            details: results
        });

    } catch (error) {
        console.error('[Cron] Strategic analysis failed:', error);
        return NextResponse.json(
            { error: '戰略分析執行失敗', details: String(error) },
            { status: 500 }
        );
    }
}
