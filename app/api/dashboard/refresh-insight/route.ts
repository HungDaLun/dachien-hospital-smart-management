import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CorporateStrategyAnalyzer } from '@/lib/war-room/kpi/corporate-strategy';

/**
 * 手動觸發 AI 戰略分析
 * 供 Dashboard「立即更新」按鈕使用
 */
export async function POST() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { error: '請先登入' },
            { status: 401 }
        );
    }

    try {
        const analyzer = new CorporateStrategyAnalyzer();
        const insight = await analyzer.generateAndCacheInsight(user.id);

        return NextResponse.json({
            success: true,
            content: insight,
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Manual refresh failed:', error);
        return NextResponse.json(
            { error: '分析生成失敗，請稍後再試', details: String(error) },
            { status: 500 }
        );
    }
}
