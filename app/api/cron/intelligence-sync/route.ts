
import { NextResponse } from 'next/server';
import { IntelligenceAutoMonitor } from '@/lib/war-room/intelligence/auto-monitor';

/**
 * 自動監控排程觸發點
 * 建議設定每小時執行一次 (也可在 Vercel Cron 設定)
 */
export async function GET(request: Request) {
    // 簡單的安全檢查 (可選：檢查 Header 中的 CRON 密鑰)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const monitor = new IntelligenceAutoMonitor();

    try {
        const updatedCount = await monitor.runScheduledSync();
        return NextResponse.json({
            success: true,
            processed_topics: updatedCount,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[Cron] Intelligence sync failed:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}

// 支援 POST 觸發 (手動測試)
export async function POST(request: Request) {
    return GET(request);
}
