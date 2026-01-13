-- ============================================
-- 修復 audit_logs 表結構不一致問題
-- 建立日期: 2026-01-27
-- 目的: 統一欄位名稱（action -> action_type）並確保歷史資料正確匯入
-- ============================================

-- ============================================
-- 1. 檢查並修復欄位名稱不一致問題
-- ============================================

-- 如果存在 `action` 欄位但不存在 `action_type`，則重新命名
DO $$
BEGIN
  -- 檢查是否存在 `action` 欄位
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'action'
  ) THEN
    -- 檢查是否已經有 `action_type` 欄位
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'audit_logs' 
        AND column_name = 'action_type'
    ) THEN
      -- 重新命名欄位
      ALTER TABLE audit_logs RENAME COLUMN action TO action_type;
      
      -- 更新索引名稱
      DROP INDEX IF EXISTS idx_audit_logs_action;
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action_type);
    ELSE
      -- 如果兩個欄位都存在，需要合併資料
      -- 先將 action 的資料複製到 action_type（如果 action_type 為空）
      UPDATE audit_logs
      SET action_type = action
      WHERE action_type IS NULL AND action IS NOT NULL;
      
      -- 然後刪除 action 欄位
      ALTER TABLE audit_logs DROP COLUMN IF EXISTS action;
      
      -- 確保索引正確
      DROP INDEX IF EXISTS idx_audit_logs_action;
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action_type);
    END IF;
  END IF;
END $$;

-- ============================================
-- 2. 確保所有必要的欄位都存在
-- ============================================

-- 確保 user_id 欄位存在且正確（應該參考 user_profiles，不是 auth.users）
DO $$
BEGIN
  -- 檢查 user_id 欄位是否存在
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'user_id'
  ) THEN
    -- 檢查外鍵約束是否正確
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = 'audit_logs'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
        AND ccu.table_name = 'user_profiles'
    ) THEN
      -- 刪除舊的外鍵（如果存在且指向 auth.users）
      ALTER TABLE audit_logs 
        DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
      
      -- 建立新的外鍵指向 user_profiles
      ALTER TABLE audit_logs
        ADD CONSTRAINT audit_logs_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES user_profiles(id);
    END IF;
  END IF;
END $$;

-- 確保 resource_id 欄位類型正確（應該是 VARCHAR 或 TEXT，不是 UUID）
DO $$
BEGIN
  -- 檢查 resource_id 欄位類型
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'resource_id'
      AND data_type = 'uuid'
  ) THEN
    -- 將 UUID 類型改為 VARCHAR(100) 以支援不同格式的 ID
    ALTER TABLE audit_logs 
      ALTER COLUMN resource_id TYPE VARCHAR(100) USING resource_id::text;
  END IF;
END $$;

-- 確保 ip_address 欄位類型正確（應該是 VARCHAR(45)，不是 INET）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'ip_address'
      AND data_type = 'inet'
  ) THEN
    -- 將 INET 類型改為 VARCHAR(45)
    ALTER TABLE audit_logs 
      ALTER COLUMN ip_address TYPE VARCHAR(45) USING ip_address::text;
  END IF;
END $$;

-- 確保 user_agent 欄位存在
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;
  END IF;
END $$;

-- ============================================
-- 3. 確保所有索引都存在
-- ============================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- 4. 確保 RLS 政策正確
-- ============================================

-- 啟用 RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 刪除舊的 RLS 政策（如果存在）
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "管理員可看稽核日誌" ON audit_logs;
DROP POLICY IF EXISTS "Users can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "使用者可記錄稽核日誌" ON audit_logs;

-- 建立新的 SELECT 政策
-- SUPER_ADMIN 可以看到所有記錄
-- DEPT_ADMIN 只能看到自己部門的記錄（透過 department_id 欄位）
CREATE POLICY "管理員可看稽核日誌" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND (
        -- SUPER_ADMIN 可以看到所有記錄
        up.role = 'SUPER_ADMIN'
        OR (
          -- DEPT_ADMIN 只能看到自己部門的記錄
          up.role = 'DEPT_ADMIN'
          AND audit_logs.department_id = up.department_id
        )
      )
    )
  );

-- 建立 INSERT 政策（允許使用者記錄自己的操作）
CREATE POLICY "使用者可記錄稽核日誌" ON audit_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. 重新匯入歷史資料（如果尚未匯入）
-- ============================================

-- 從 files 表匯入檔案上傳紀錄
INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, details, created_at)
SELECT 
    f.uploaded_by as user_id,
    'UPLOAD_FILE' as action_type,
    'FILE' as resource_type,
    f.id::text as resource_id,
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
    WHERE a.resource_id = f.id::text 
      AND a.action_type = 'UPLOAD_FILE'
  );

-- 從 agents 表匯入 Agent 創建紀錄
INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, details, created_at)
SELECT 
    a.created_by as user_id,
    'CREATE_AGENT' as action_type,
    'AGENT' as resource_type,
    a.id::text as resource_id,
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
    WHERE al.resource_id = a.id::text 
      AND al.action_type = 'CREATE_AGENT'
  );

-- 從 departments 表匯入部門創建紀錄
INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, details, created_at)
SELECT 
    (SELECT id FROM user_profiles WHERE role = 'SUPER_ADMIN' LIMIT 1) as user_id,
    'CREATE_DEPT' as action_type,
    'DEPARTMENT' as resource_type,
    d.id::text as resource_id,
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
    WHERE a.resource_id = d.id::text 
      AND a.action_type = 'CREATE_DEPT'
  );

-- 從 user_profiles 表匯入使用者創建紀錄
INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, details, created_at)
SELECT 
    u.id as user_id,
    'CREATE_USER' as action_type,
    'USER' as resource_type,
    u.id::text as resource_id,
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
    WHERE a.resource_id = u.id::text 
      AND a.action_type = 'CREATE_USER'
  );

-- ============================================
-- 6. 顯示匯入結果統計
-- ============================================

DO $$
DECLARE
    total_count INTEGER;
    reconstructed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM audit_logs;
    SELECT COUNT(*) INTO reconstructed_count 
    FROM audit_logs 
    WHERE details->>'reconstructed' = 'true';
    
    RAISE NOTICE '稽核日誌修復完成：總計 % 筆記錄，其中 % 筆為重建的歷史記錄', 
        total_count, reconstructed_count;
END $$;
