-- 修復 RLS 無限遞迴問題
-- 建立輔助函式以獲取當前使用者的資訊，這些函式定義為 SECURITY DEFINER
-- 這樣它們就不會受到 RLS 的約束，從而避開遞迴。

-- ============================================
-- 1. 建立輔助函式（SECURITY DEFINER）
-- ============================================

-- 取得當前使用者的角色
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 取得當前使用者的部門 ID
CREATE OR REPLACE FUNCTION get_user_dept()
RETURNS UUID AS $$
  SELECT department_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 檢查使用者是否為管理員（SUPER_ADMIN 或 DEPT_ADMIN）
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('SUPER_ADMIN', 'DEPT_ADMIN') 
  FROM user_profiles 
  WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 檢查使用者是否為超級管理員
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'SUPER_ADMIN' 
  FROM user_profiles 
  WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- ============================================
-- 2. 修復 user_profiles 的 RLS 政策
-- ============================================

-- 刪除舊的政策
DROP POLICY IF EXISTS "超級管理員可讀取所有使用者" ON user_profiles;
DROP POLICY IF EXISTS "部門管理員可讀取部門成員" ON user_profiles;
DROP POLICY IF EXISTS "允許讀取使用者資料" ON user_profiles;

-- 重新建立政策（使用輔助函式避免遞迴）
CREATE POLICY "超級管理員可讀取所有使用者" ON user_profiles
  FOR SELECT
  USING (is_super_admin() = true);

CREATE POLICY "部門管理員可讀取部門成員" ON user_profiles
  FOR SELECT
  USING (
    get_user_role() = 'DEPT_ADMIN' 
    AND department_id = get_user_dept()
  );

-- ============================================
-- 3. 修復 files 表的 RLS 政策
-- ============================================

-- 刪除舊的政策
DROP POLICY IF EXISTS "超級管理員可看所有檔案" ON files;
DROP POLICY IF EXISTS "部門管理員可看部門檔案" ON files;
DROP POLICY IF EXISTS "編輯者可看授權檔案" ON files;
DROP POLICY IF EXISTS "上傳者可刪除自己的檔案" ON files;

-- 重新建立政策（使用輔助函式）
CREATE POLICY "超級管理員可看所有檔案" ON files
  FOR SELECT
  USING (is_super_admin() = true);

CREATE POLICY "部門管理員可看部門檔案" ON files
  FOR SELECT
  USING (
    get_user_role() = 'DEPT_ADMIN' 
    AND EXISTS (
      SELECT 1 FROM file_tags ft
      WHERE ft.file_id = files.id
        AND ft.tag_key = 'department'
        AND ft.tag_value = (
          SELECT d.name FROM departments d 
          WHERE d.id = get_user_dept()
        )
    )
  );

CREATE POLICY "編輯者可看授權檔案" ON files
  FOR SELECT
  USING (
    get_user_role() = 'EDITOR'
    AND (
      uploaded_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM file_tags ft
        JOIN user_tag_permissions utp ON 
          ft.tag_key = utp.tag_key AND 
          ft.tag_value = utp.tag_value
        WHERE ft.file_id = files.id 
          AND utp.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "上傳者可刪除自己的檔案" ON files
  FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR is_admin() = true
  );

-- ============================================
-- 4. 修復 agents 表的 RLS 政策
-- ============================================

-- 刪除舊的政策
DROP POLICY IF EXISTS "使用者可看授權的 Agent" ON agents;
DROP POLICY IF EXISTS "建立者可更新自己的 Agent" ON agents;
DROP POLICY IF EXISTS "管理員可建立 Agent" ON agents;

-- 重新建立政策（使用輔助函式）
CREATE POLICY "使用者可看授權的 Agent" ON agents
  FOR SELECT
  USING (
    is_super_admin() = true
    OR EXISTS (
      SELECT 1 FROM agent_access_control aac
      WHERE aac.agent_id = agents.id
        AND (
          aac.user_id = auth.uid()
          OR (
            aac.department_id IS NOT NULL
            AND aac.department_id = get_user_dept()
          )
        )
        AND aac.can_access = true
    )
  );

CREATE POLICY "建立者可更新自己的 Agent" ON agents
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR is_super_admin() = true
  );

CREATE POLICY "管理員可建立 Agent" ON agents
  FOR INSERT
  WITH CHECK (
    is_admin() = true
    AND created_by = auth.uid()
  );

-- ============================================
-- 5. 修復 audit_logs 表的 RLS 政策
-- ============================================

-- 刪除舊的政策
DROP POLICY IF EXISTS "管理員可看稽核日誌" ON audit_logs;

-- 重新建立政策（使用輔助函式）
CREATE POLICY "管理員可看稽核日誌" ON audit_logs
  FOR SELECT
  USING (is_admin() = true);
