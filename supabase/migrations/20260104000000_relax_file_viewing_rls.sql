-- Description: 放寬檔案查看權限，改為透過審計日誌追蹤
-- Created at: 2026-01-04
-- 策略：寬鬆讀取、嚴格寫入 + 完整審計追蹤

-- ============================================
-- 1. 更新 files 表的 SELECT 政策（放寬）
-- ============================================

-- 刪除舊的嚴格部門隔離政策
DROP POLICY IF EXISTS "Users can view files from their own department" ON files;
DROP POLICY IF EXISTS "超級管理員可看所有檔案" ON files;
DROP POLICY IF EXISTS "部門管理員可看部門檔案" ON files;
DROP POLICY IF EXISTS "編輯者可看授權檔案" ON files;

-- 新政策：所有已登入使用者都可以查看所有檔案（透過審計日誌追蹤）
CREATE POLICY "所有已登入使用者可查看檔案" ON files
  FOR SELECT
  USING (
    -- 只要已登入就可以查看（RLS 會確保 auth.uid() 不為 NULL）
    auth.uid() IS NOT NULL
  );

-- ============================================
-- 2. 保持嚴格的寫入控制（INSERT/UPDATE/DELETE）
-- ============================================

-- INSERT 政策：只有 EDITOR 以上角色可以上傳
-- （已在 API 層面檢查，這裡保持一致性）
DROP POLICY IF EXISTS "Users can upload to their own department" ON files;
DROP POLICY IF EXISTS "使用者可上傳檔案" ON files;

CREATE POLICY "授權使用者可上傳檔案" ON files
  FOR INSERT
  WITH CHECK (
    -- 必須是已登入使用者
    auth.uid() IS NOT NULL
    AND
    -- 上傳者必須是自己
    uploaded_by = auth.uid()
    AND
    -- 必須有 EDITOR 以上權限（透過 user_profiles 檢查）
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN', 'EDITOR')
    )
  );

-- UPDATE 政策：只有上傳者或管理員可以修改
DROP POLICY IF EXISTS "上傳者可更新自己的檔案" ON files;

CREATE POLICY "上傳者或管理員可更新檔案" ON files
  FOR UPDATE
  USING (
    -- 上傳者可以更新自己的檔案
    uploaded_by = auth.uid()
    OR
    -- SUPER_ADMIN 可以更新所有檔案
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
    OR
    -- DEPT_ADMIN 可以更新部門檔案
    (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'DEPT_ADMIN'
      )
      AND
      (
        -- 檔案屬於該部門
        department_id = (
          SELECT department_id FROM user_profiles WHERE id = auth.uid()
        )
        OR
        -- 或檔案沒有部門（全域檔案）
        department_id IS NULL
      )
    )
  )
  WITH CHECK (
    -- 確保 uploaded_by 不會被改變（在 API 層面也應該確保這點）
    -- 這裡只檢查是否有權限，實際的欄位保護在 API 層面處理
    true
  );

-- DELETE 政策：只有上傳者或管理員可以刪除
DROP POLICY IF EXISTS "上傳者可刪除自己的檔案" ON files;

CREATE POLICY "上傳者或管理員可刪除檔案" ON files
  FOR DELETE
  USING (
    -- 上傳者可以刪除自己的檔案
    uploaded_by = auth.uid()
    OR
    -- SUPER_ADMIN 可以刪除所有檔案
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
    OR
    -- DEPT_ADMIN 可以刪除部門檔案
    (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'DEPT_ADMIN'
      )
      AND
      (
        -- 檔案屬於該部門
        department_id = (
          SELECT department_id FROM user_profiles WHERE id = auth.uid()
        )
        OR
        -- 或檔案沒有部門（全域檔案）
        department_id IS NULL
      )
    )
  );

-- ============================================
-- 3. 擴充 audit_logs 表以支援更詳細的追蹤
-- ============================================

-- 如果 audit_logs 表還沒有 department_id 欄位，則新增（用於快速篩選）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' 
    AND column_name = 'department_id'
  ) THEN
    ALTER TABLE audit_logs 
    ADD COLUMN department_id UUID REFERENCES departments(id);
    
    CREATE INDEX idx_audit_logs_department ON audit_logs(department_id);
  END IF;
END $$;

-- 如果還沒有 file_department_id 欄位（記錄被操作的檔案所屬部門），則新增
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' 
    AND column_name = 'file_department_id'
  ) THEN
    ALTER TABLE audit_logs 
    ADD COLUMN file_department_id UUID REFERENCES departments(id);
    
    CREATE INDEX idx_audit_logs_file_department ON audit_logs(file_department_id);
  END IF;
END $$;

-- ============================================
-- 4. 建立觸發器自動記錄部門資訊
-- ============================================

-- 建立函數：自動填入 audit_logs 的部門資訊
CREATE OR REPLACE FUNCTION set_audit_log_department()
RETURNS TRIGGER AS $$
BEGIN
  -- 自動填入操作者的部門
  SELECT department_id INTO NEW.department_id
  FROM user_profiles
  WHERE id = NEW.user_id;
  
  -- 如果是檔案相關操作，自動填入檔案的部門
  IF NEW.resource_type = 'FILE' AND NEW.resource_id IS NOT NULL THEN
    SELECT department_id INTO NEW.file_department_id
    FROM files
    WHERE id::text = NEW.resource_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 建立觸發器
DROP TRIGGER IF EXISTS trigger_set_audit_log_department ON audit_logs;
CREATE TRIGGER trigger_set_audit_log_department
  BEFORE INSERT ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION set_audit_log_department();
