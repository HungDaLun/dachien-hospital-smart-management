import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NewsFetcher } from '@/lib/war-room/intelligence/news-fetcher';
import { NewsAnalyzer } from '@/lib/war-room/intelligence/news-analyzer';
import { WatchTopic } from '@/lib/war-room/types';

/**
 * 手動觸發外部情報同步
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
        // 1. 取得使用者的監控主題
        const { data: config } = await supabase
            .from('war_room_config')
            .select('watch_topics')
            .eq('user_id', user.id)
            .single();

        if (!config || !config.watch_topics || (config.watch_topics as WatchTopic[]).length === 0) {
            return NextResponse.json({
                success: true,
                message: '目前沒有設定監控主題，請先新增主題。',
                count: 0
            });
        }

        const topics = config.watch_topics as WatchTopic[];
        console.log(`[Sync] Starting sync for user ${user.id} with ${topics.length} topics`);

        const fetcher = new NewsFetcher();
        const analyzer = new NewsAnalyzer();

        const allNewIntelligence = [];

        for (const topic of topics) {
            // 將關鍵字改用 OR 連接，增加搜尋成功率
            const query = topic.keywords.length > 0
                ? topic.keywords.slice(0, 3).join(' OR ')
                : topic.name;

            console.log(`[Sync] Fetching news for topic: ${topic.name}, query: ${query}`);
            const rawNews = await fetcher.fetchNews(query);
            console.log(`[Sync] Found ${rawNews.length} raw news items for ${topic.name}`);

            // 限制數量 (由 5 條增加至 10 條，深度分析該主題的關鍵動態)
            const selectedNews = rawNews.slice(0, 10);

            for (const news of selectedNews) {
                // 檢查是否已存在 (以 URL 為準)
                if (news.url && news.url !== '#') {
                    const { data: existing } = await supabase
                        .from('external_intelligence')
                        .select('id')
                        .eq('url', news.url)
                        .eq('user_id', user.id)
                        .maybeSingle();

                    if (existing) continue;
                } else if (news.url === '#') {
                    // 對於 mock 數據，我們檢查標題是否已存在
                    const { data: existing } = await supabase
                        .from('external_intelligence')
                        .select('id')
                        .eq('title', news.title)
                        .eq('user_id', user.id)
                        .maybeSingle();

                    if (existing) continue;
                }

                // AI 分析
                console.log(`[Sync] Analyzing news: ${news.title}`);
                const analysis = await analyzer.analyzeNews(news, topic, user.id);
                allNewIntelligence.push(analysis);
            }
        }

        console.log(`[Sync] Total new intelligence to insert: ${allNewIntelligence.length}`);

        // 3. 寫入資料庫
        if (allNewIntelligence.length > 0) {
            const { error: insertError } = await supabase
                .from('external_intelligence')
                .insert(allNewIntelligence);

            if (insertError) {
                console.error('[Sync] Insert error:', insertError);
                throw insertError;
            }
        }

        // 4. 更新最後同步時間 (用於自動監控頻率判斷)
        const updatedTopics = topics.map(t => ({
            ...t,
            last_synced_at: new Date().toISOString()
        }));

        await supabase
            .from('war_room_config')
            .update({ watch_topics: updatedTopics })
            .eq('user_id', user.id);

        // 5. 記錄稽核日誌
        try {
            const { logAudit } = await import('@/lib/actions/audit');
            await logAudit({
                action: 'SYNC_INTELLIGENCE',
                resourceType: 'AUTH',
                details: {
                    topic_count: topics.length,
                    new_items: allNewIntelligence.length,
                    success: true
                }
            });
        } catch (auditErr) {
            console.warn('[Sync] Audit log failed:', auditErr);
        }

        return NextResponse.json({
            success: true,
            count: allNewIntelligence.length,
            message: allNewIntelligence.length > 0 ? `成功更新 ${allNewIntelligence.length} 條情報動態。` : '目前已是最新狀態。'
        });

    } catch (error) {
        console.error('[Intelligence Sync] Error:', error);
        return NextResponse.json(
            { error: '情報同步失敗，請檢查 API 配置。', details: String(error) },
            { status: 500 }
        );
    }
}
