-- ============================================
-- 同步刪除 files 和 file_tags 的清理腳本
-- ============================================
-- 此腳本用於：
-- 1. 清理孤兒 file_tags 記錄（引用不存在的 files）
-- 2. 確保資料一致性
-- 
-- ⚠️ 警告：執行前請先備份資料庫

-- ============================================
-- 第一部分：檢查和清理孤兒記錄
-- ============================================

-- 1. 檢查孤兒記錄數量
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphaned_count
    FROM file_tags ft
    LEFT JOIN files f ON ft.file_id = f.id
    WHERE f.id IS NULL;
    
    RAISE NOTICE '發現 % 筆孤兒 file_tags 記錄', orphaned_count;
    
    -- 如果有孤兒記錄，則刪除
    IF orphaned_count > 0 THEN
        DELETE FROM file_tags
        WHERE file_id NOT IN (SELECT id FROM files);
        
        RAISE NOTICE '已刪除 % 筆孤兒記錄', orphaned_count;
    ELSE
        RAISE NOTICE '沒有發現孤兒記錄，資料一致性正常';
    END IF;
END $$;

-- ============================================
-- 第二部分：驗證清理結果
-- ============================================

-- 2. 驗證清理後的狀態
SELECT 
    (SELECT COUNT(*) FROM files) as total_files,
    (SELECT COUNT(*) FROM file_tags) as total_tags,
    (SELECT COUNT(DISTINCT file_id) FROM file_tags) as files_with_tags,
    (SELECT COUNT(*) 
     FROM file_tags ft 
     LEFT JOIN files f ON ft.file_id = f.id 
     WHERE f.id IS NULL) as remaining_orphaned_tags;

-- ============================================
-- 第三部分：如果需要刪除所有檔案（可選）
-- ============================================
-- ⚠️ 注意：以下操作會刪除所有檔案和標籤
-- 由於有 ON DELETE CASCADE 約束，刪除 files 會自動刪除相關的 file_tags
-- 
-- 如果需要執行，請取消註解以下程式碼：

/*
-- 刪除所有檔案（會自動觸發 CASCADE 刪除 file_tags）
DELETE FROM files;

-- 驗證刪除結果
SELECT 
    (SELECT COUNT(*) FROM files) as remaining_files,
    (SELECT COUNT(*) FROM file_tags) as remaining_tags;
*/
