-- ============================================
-- 清理孤兒 knowledge_instances 記錄
-- ============================================
-- 此腳本用於清理 knowledge_instances 中引用已刪除檔案的記錄
-- 
-- 邏輯：
-- 1. 如果 knowledge_instances 的 source_file_ids 中所有檔案都已不存在，則刪除該實例
-- 2. 如果 source_file_ids 中部分檔案不存在，則更新 source_file_ids 移除不存在的檔案 ID
-- 
-- ⚠️ 警告：執行前請先備份資料庫

-- ============================================
-- 第一部分：檢查孤兒記錄
-- ============================================

-- 1. 檢查有多少 knowledge_instances 引用了不存在的檔案
SELECT 
    COUNT(DISTINCT ki.id) as instances_with_missing_files,
    '引用已刪除檔案的知識實例數量' as description
FROM knowledge_instances ki
CROSS JOIN LATERAL unnest(ki.source_file_ids) AS file_id
LEFT JOIN files f ON f.id = file_id
WHERE f.id IS NULL;

-- 2. 顯示詳細資訊（前 10 筆）
SELECT 
    ki.id,
    ki.title,
    ki.source_file_ids as original_file_ids,
    array_agg(f.id) FILTER (WHERE f.id IS NOT NULL) as existing_file_ids,
    array_agg(file_id) FILTER (WHERE f.id IS NULL) as missing_file_ids
FROM knowledge_instances ki
CROSS JOIN LATERAL unnest(ki.source_file_ids) AS file_id
LEFT JOIN files f ON f.id = file_id
GROUP BY ki.id, ki.title, ki.source_file_ids
HAVING array_agg(f.id) FILTER (WHERE f.id IS NOT NULL) IS DISTINCT FROM ki.source_file_ids
   OR array_length(ki.source_file_ids, 1) > COALESCE(array_length(array_agg(f.id) FILTER (WHERE f.id IS NOT NULL), 1), 0)
LIMIT 10;

-- ============================================
-- 第二部分：清理孤兒記錄
-- ============================================

DO $$
DECLARE
    instance_record RECORD;
    updated_file_ids UUID[];
    existing_count INTEGER;
    total_deleted INTEGER := 0;
    total_updated INTEGER := 0;
BEGIN
    -- 遍歷所有 knowledge_instances
    FOR instance_record IN 
        SELECT id, source_file_ids, title
        FROM knowledge_instances
        WHERE source_file_ids IS NOT NULL AND array_length(source_file_ids, 1) > 0
    LOOP
        -- 檢查哪些檔案 ID 仍然存在
        SELECT array_agg(f.id)
        INTO updated_file_ids
        FROM unnest(instance_record.source_file_ids) AS file_id
        LEFT JOIN files f ON f.id = file_id
        WHERE f.id IS NOT NULL;
        
        -- 計算存在的檔案數量
        existing_count := COALESCE(array_length(updated_file_ids, 1), 0);
        
        -- 如果所有檔案都不存在，則刪除該實例
        IF existing_count = 0 THEN
            DELETE FROM knowledge_instances WHERE id = instance_record.id;
            total_deleted := total_deleted + 1;
            RAISE NOTICE '已刪除知識實例: % (標題: %) - 所有來源檔案都已不存在', instance_record.id, instance_record.title;
        -- 如果部分檔案不存在，則更新 source_file_ids
        ELSIF existing_count < array_length(instance_record.source_file_ids, 1) THEN
            UPDATE knowledge_instances
            SET source_file_ids = updated_file_ids,
                updated_at = NOW()
            WHERE id = instance_record.id;
            total_updated := total_updated + 1;
            RAISE NOTICE '已更新知識實例: % (標題: %) - 移除了 % 個不存在的檔案 ID', 
                instance_record.id, 
                instance_record.title,
                array_length(instance_record.source_file_ids, 1) - existing_count;
        END IF;
    END LOOP;
    
    RAISE NOTICE '清理完成：刪除 % 個知識實例，更新 % 個知識實例', total_deleted, total_updated;
END $$;

-- ============================================
-- 第三部分：驗證清理結果
-- ============================================

-- 3. 驗證清理後的狀態
SELECT 
    (SELECT COUNT(*) FROM knowledge_instances) as total_instances,
    (SELECT COUNT(*) 
     FROM knowledge_instances ki
     CROSS JOIN LATERAL unnest(ki.source_file_ids) AS file_id
     LEFT JOIN files f ON f.id = file_id
     WHERE f.id IS NULL) as remaining_orphaned_references,
    '清理後剩餘的孤兒引用數（應為 0）' as description;

-- 4. 顯示清理後的知識實例統計
SELECT 
    COUNT(*) as total_instances,
    COUNT(*) FILTER (WHERE source_file_ids IS NULL OR array_length(source_file_ids, 1) = 0) as instances_without_files,
    COUNT(*) FILTER (WHERE source_file_ids IS NOT NULL AND array_length(source_file_ids, 1) > 0) as instances_with_files
FROM knowledge_instances;
