
import { createAdminClient } from '@/lib/supabase/admin';
import { NewsFetcher } from './news-fetcher';
import { NewsAnalyzer } from './news-analyzer';
import { WatchTopic } from '../types';

export class IntelligenceAutoMonitor {
    private supabase = createAdminClient();
    private fetcher = new NewsFetcher();
    private analyzer = new NewsAnalyzer();

    /**
     * 執行自動監控任務
     * 找出所有需要更新的監控主題並執行同步
     */
    async runScheduledSync() {
        console.log('[AutoMonitor] Starting scheduled sync check...');

        // 1. 取得所有使用者的監控配置
        const { data: configs, error } = await this.supabase
            .from('war_room_config')
            .select('user_id, watch_topics')
            .not('watch_topics', 'is', null);

        if (error) {
            console.error('[AutoMonitor] Failed to fetch configs:', error);
            return;
        }

        const now = new Date();
        let totalUpdated = 0;

        for (const config of configs) {
            const topics = config.watch_topics as WatchTopic[];
            const userId = config.user_id;
            let needsUpdate = false;
            const updatedTopics = [...topics];

            for (let i = 0; i < updatedTopics.length; i++) {
                const topic = updatedTopics[i];
                if (this.shouldSync(topic, now)) {
                    console.log(`[AutoMonitor] Syncing topic "${topic.name}" for user ${userId}`);
                    try {
                        await this.syncTopic(topic, userId);
                        updatedTopics[i] = {
                            ...topic,
                            last_synced_at: now.toISOString()
                        };
                        needsUpdate = true;
                        totalUpdated++;
                    } catch (err) {
                        console.error(`[AutoMonitor] Sync failed for topic ${topic.name}:`, err);
                    }
                }
            }

            // 如果有主題更新了，存回資料庫
            if (needsUpdate) {
                await this.supabase
                    .from('war_room_config')
                    .update({ watch_topics: updatedTopics })
                    .eq('user_id', userId);
            }
        }

        console.log(`[AutoMonitor] Scheduled sync completed. ${totalUpdated} topics processed.`);
        return totalUpdated;
    }

    private shouldSync(topic: WatchTopic, now: Date): boolean {
        // 1. 檢查模式
        if (topic.sync_mode === 'manual') return false;

        // 2. 如果從未同步過，應立即同步
        if (!topic.last_synced_at) return true;

        const lastSynced = new Date(topic.last_synced_at);
        const diffMs = now.getTime() - lastSynced.getTime();
        const diffMinutes = diffMs / (1000 * 60);

        // 3. 獲取內部間隔值
        const value = topic.sync_interval_value || 24;
        const unit = topic.sync_interval_unit || 'hours';

        let thresholdMinutes = 0;
        switch (unit) {
            case 'minutes': thresholdMinutes = value; break;
            case 'hours': thresholdMinutes = value * 60; break;
            case 'days': thresholdMinutes = value * 60 * 24; break;
            case 'weeks': thresholdMinutes = value * 60 * 24 * 7; break;
            case 'months': thresholdMinutes = value * 60 * 24 * 30; break; // 近似值
        }

        return diffMinutes >= thresholdMinutes;
    }

    private async async_sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async syncTopic(topic: WatchTopic, userId: string) {
        // 這部分邏輯與 route.ts 相似，但使用傳入的 topic
        const query = topic.keywords.length > 0
            ? topic.keywords.slice(0, 3).join(' OR ')
            : topic.name;

        const rawNews = await this.fetcher.fetchNews(query);
        const selectedNews = rawNews.slice(0, 5); // 自動監控限制在 5 條，避免浪費 Token

        const allNewIntelligence = [];

        for (const news of selectedNews) {
            // 檢查是否已存在
            const { data: existing } = await this.supabase
                .from('external_intelligence')
                .select('id')
                .eq('title', news.title)
                .eq('user_id', userId)
                .maybeSingle();

            if (existing) continue;

            const analysis = await this.analyzer.analyzeNews(news, topic, userId);
            allNewIntelligence.push(analysis);

            // 稍微延遲避免 API Rate Limit
            await this.async_sleep(500);
        }

        if (allNewIntelligence.length > 0) {
            await this.supabase
                .from('external_intelligence')
                .insert(allNewIntelligence);
        }
    }
}
