-- ============================================
-- 清理孤兒 file_tags 記錄
-- ============================================
-- 此腳本用於清理 file_tags 表中引用不存在 files 的記錄
-- 執行前請先備份資料庫

-- 1. 檢查孤兒記錄數量
SELECT 
    COUNT(*) as orphaned_tags_count,
    'file_tags 中引用不存在 files 的記錄數' as description
FROM file_tags ft
LEFT JOIN files f ON ft.file_id = f.id
WHERE f.id IS NULL;

-- 2. 顯示孤兒記錄詳情（前 10 筆）
SELECT 
    ft.id,
    ft.file_id,
    ft.tag_key,
    ft.tag_value,
    ft.created_at
FROM file_tags ft
LEFT JOIN files f ON ft.file_id = f.id
WHERE f.id IS NULL
LIMIT 10;

-- 3. 刪除孤兒記錄
-- ⚠️ 警告：此操作會永久刪除孤兒記錄，請確認後再執行
DELETE FROM file_tags
WHERE file_id NOT IN (SELECT id FROM files);

-- 4. 驗證清理結果
SELECT 
    COUNT(*) as remaining_orphaned_tags,
    '清理後剩餘的孤兒記錄數（應為 0）' as description
FROM file_tags ft
LEFT JOIN files f ON ft.file_id = f.id
WHERE f.id IS NULL;

-- 5. 統計清理後的狀態
SELECT 
    (SELECT COUNT(*) FROM files) as total_files,
    (SELECT COUNT(*) FROM file_tags) as total_tags,
    (SELECT COUNT(DISTINCT file_id) FROM file_tags) as files_with_tags;
