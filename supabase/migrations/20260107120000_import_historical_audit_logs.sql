-- 匯入歷史操作紀錄到 audit_logs
-- 建立日期: 2026-01-07
-- 說明: 從現有資料表重建歷史稽核紀錄

-- ============================================
-- 1. 從 files 表匯入檔案上傳紀錄
-- ============================================
INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, details, created_at)
SELECT 
    f.uploaded_by as user_id,
    'UPLOAD_FILE' as action_type,
    'FILE' as resource_type,
    f.id as resource_id,
    jsonb_build_object(
        'filename', f.filename,
        'mime_type', f.mime_type,
        'size_bytes', f.size_bytes,
        'reconstructed', true,
        'note', '從歷史檔案記錄重建'
    ) as details,
    f.created_at
FROM files f
WHERE f.uploaded_by IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM audit_logs a 
    WHERE a.resource_id = f.id 
      AND a.action_type = 'UPLOAD_FILE'
  );

-- ============================================
-- 2. 從 agents 表匯入 Agent 創建紀錄
-- ============================================
INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, details, created_at)
SELECT 
    a.created_by as user_id,
    'CREATE_AGENT' as action_type,
    'AGENT' as resource_type,
    a.id as resource_id,
    jsonb_build_object(
        'name', a.name,
        'model_version', a.model_version,
        'reconstructed', true,
        'note', '從歷史 Agent 記錄重建'
    ) as details,
    a.created_at
FROM agents a
WHERE a.created_by IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM audit_logs al 
    WHERE al.resource_id = a.id 
      AND al.action_type = 'CREATE_AGENT'
  );

-- ============================================
-- 3. 從 departments 表匯入部門創建紀錄
-- ============================================
INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, details, created_at)
SELECT 
    (SELECT id FROM user_profiles WHERE role = 'SUPER_ADMIN' LIMIT 1) as user_id,
    'CREATE_DEPT' as action_type,
    'DEPARTMENT' as resource_type,
    d.id as resource_id,
    jsonb_build_object(
        'name', d.name,
        'description', d.description,
        'reconstructed', true,
        'note', '從歷史部門記錄重建（創建者未知，預設為 SUPER_ADMIN）'
    ) as details,
    d.created_at
FROM departments d
WHERE NOT EXISTS (
    SELECT 1 FROM audit_logs a 
    WHERE a.resource_id = d.id 
      AND a.action_type = 'CREATE_DEPT'
  );

-- ============================================
-- 4. 從 user_profiles 表匯入使用者創建紀錄
-- ============================================
INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, details, created_at)
SELECT 
    u.id as user_id,
    'CREATE_USER' as action_type,
    'USER' as resource_type,
    u.id as resource_id,
    jsonb_build_object(
        'email', u.email,
        'display_name', u.display_name,
        'role', u.role,
        'reconstructed', true,
        'note', '從歷史使用者記錄重建（自我註冊）'
    ) as details,
    u.created_at
FROM user_profiles u
WHERE NOT EXISTS (
    SELECT 1 FROM audit_logs a 
    WHERE a.resource_id = u.id 
      AND a.action_type = 'CREATE_USER'
  );

-- ============================================
-- 5. 從 categories 表匯入分類創建紀錄（如果表存在）
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
        INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, details, created_at)
        SELECT 
            (SELECT id FROM user_profiles WHERE role = 'SUPER_ADMIN' LIMIT 1) as user_id,
            'CREATE_CATEGORY' as action_type,
            'CATEGORY' as resource_type,
            c.id as resource_id,
            jsonb_build_object(
                'name', c.name,
                'reconstructed', true,
                'note', '從歷史分類記錄重建'
            ) as details,
            c.created_at
        FROM categories c
        WHERE NOT EXISTS (
            SELECT 1 FROM audit_logs a 
            WHERE a.resource_id = c.id 
              AND a.action_type = 'CREATE_CATEGORY'
          );
    END IF;
END $$;

-- ============================================
-- 6. 顯示匯入結果統計
-- ============================================
SELECT 
    action_type,
    COUNT(*) as count,
    MIN(created_at) as earliest,
    MAX(created_at) as latest
FROM audit_logs
WHERE details->>'reconstructed' = 'true'
GROUP BY action_type
ORDER BY action_type;
