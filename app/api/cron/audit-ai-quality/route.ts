import { NextResponse } from 'next/server';
import { generateAuditReport } from '@/lib/ai-safeguards/audit/unified-auditor';

/**
 * GET /api/cron/audit-ai-quality
 * 定期觸發 AI 品質審計報告生成
 */
export async function GET(request: Request) {
    // 驗證 Authorization Header (防止外部隨意呼叫)
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const report = await generateAuditReport();

        return NextResponse.json({
            success: true,
            generatedAt: report.generatedAt,
            summary: report.summary
        });
    } catch (error: unknown) {
        console.error('[Cron] AI Quality Audit Failed:', error);
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 });
    }
}
