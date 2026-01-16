-- ============================================================================
-- 啟用 files 表的 Realtime 功能
-- 用於前端 FileList 監聽檔案狀態變更（替代輪詢）
-- ============================================================================

-- 1. 將 files 表加入 Realtime Publication
-- 這讓前端可以透過 Supabase Realtime 訂閱此表的變更
ALTER PUBLICATION supabase_realtime ADD TABLE files;

-- 2. 如果 publication 不存在，則建立它（Supabase 預設已有，但以防萬一）
-- 注意：這個語句可能會在 publication 已存在時報錯，可以忽略
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
    END IF;
END $$;

-- 3. 確保 Replica Identity 設為 FULL，這樣 Realtime 可以取得完整的舊/新記錄
-- 這對於 UPDATE 事件特別重要
ALTER TABLE files REPLICA IDENTITY FULL;

-- ============================================================================
-- 說明：
-- - 此遷移啟用 files 表的 Realtime 訂閱功能
-- - 前端使用 supabase.channel('file-status-updates').on('postgres_changes', ...) 訂閱
-- - 當 files 表有 INSERT/UPDATE/DELETE 時，訂閱者會即時收到通知
-- - 這取代了原本每 3 秒輪詢 API 的做法，大幅減少 API 請求
-- ============================================================================
