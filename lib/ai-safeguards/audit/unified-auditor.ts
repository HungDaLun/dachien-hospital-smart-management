import { createClient } from '@/lib/supabase/server';

interface AuditConfig {
    periodDays: number;
    maxSampleSize: number;
}

const DEFAULT_CONFIG: AuditConfig = {
    periodDays: 30,
    maxSampleSize: 100,
};

/**
 * 生成 AI 品質審計報告
 */
export async function generateAuditReport(config: AuditConfig = DEFAULT_CONFIG) {
    const supabase = await createClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - config.periodDays);

    // 1. 收集待審計的訊息 (Chat)
    const { data: chatMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`selected_for_audit.eq.true,needs_review.eq.true`)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(config.maxSampleSize);

    // 2. 收集待審計的訊息 (Meeting)
    const { data: meetingMessages } = await supabase
        .from('meeting_messages')
        .select('*')
        .eq('selected_for_audit', true)
        .gte('created_at', startDate.toISOString())
        .limit(config.maxSampleSize / 2);

    // 3. 計算統計資訊
    const chatStats = calculateStats(chatMessages);
    const meetingStats = calculateStats(meetingMessages);

    // 4. 生成報告結構
    const report = {
        generatedAt: new Date().toISOString(),
        periodStart: startDate.toISOString(),
        periodEnd: new Date().toISOString(),
        summary: {
            totalMessagesAudited: (chatMessages?.length || 0) + (meetingMessages?.length || 0),
            chat: chatStats,
            meeting: meetingStats,
            overallAvgConfidence: ((chatStats.avgConfidence * (chatMessages?.length || 0)) +
                (meetingStats.avgConfidence * (meetingMessages?.length || 0))) /
                ((chatMessages?.length || 0) + (meetingMessages?.length || 0) || 1)
        },
        criticalFindings: [
            ...(chatMessages?.filter(m => m.needs_review).map(m => ({ type: 'chat', id: m.id, triggers: m.review_triggers })) || []),
        ],
        samples: {
            chat: chatMessages?.slice(0, 10),
            meeting: meetingMessages?.slice(0, 10),
        },
    };

    // 5. 儲存報告至資料庫
    const { error: saveError } = await supabase
        .from('audit_reports')
        .insert({
            report_type: 'ai_quality_periodic',
            report_data: report,
        });

    if (saveError) {
        console.error('Failed to save audit report:', saveError);
    }

    return report;
}

function calculateStats(messages: any[] | null) {
    if (!messages || messages.length === 0) return { count: 0, avgConfidence: 0, reviewRate: 0 };

    const confidenceScores = messages
        .map(m => m.confidence_score)
        .filter(s => typeof s === 'number');

    const avgConfidence = confidenceScores.length > 0
        ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
        : 0;

    const reviewNeededCount = messages.filter(m => m.needs_review === true).length;

    return {
        count: messages.length,
        avgConfidence: parseFloat(avgConfidence.toFixed(4)),
        reviewRate: parseFloat((reviewNeededCount / messages.length).toFixed(4))
    };
}
