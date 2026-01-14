import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncPendingFiles } from '@/lib/gemini/files';

export const dynamic = 'force-dynamic'; // 確保 API 不會被快取

export async function GET(req: NextRequest) {
    // 1. 驗證 Secret (僅支援 Header)
    const authHeader = req.headers.get('authorization');
    const validSecret = process.env.CRON_SECRET;

    // Vercel Cron 會自動帶入正確的 Header
    const isVercelCron = req.headers.get('x-vercel-cron') === '1';
    const isValidAuth = authHeader === `Bearer ${validSecret}`;

    if (!validSecret || (!isValidAuth && !isVercelCron)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. 初始化 Admin Client (繞過 RLS)
        const adminClient = createAdminClient();

        // 3. 執行同步 (每次最多 10 個，避免 Timeout)
        const result = await syncPendingFiles(10, adminClient);

        return NextResponse.json({
            success: true,
            message: `Processed ${result.count} files`,
            details: result
        });
    } catch (error) {
        console.error('Cron job failed:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Internal Server Error'
            },
            { status: 500 }
        );
    }
}
