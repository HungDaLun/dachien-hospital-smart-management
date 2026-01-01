-- 徹底修復 RLS 遞迴問題
-- 透過 SECURITY DEFINER 函式中斷 files <> file_tags 的循環相依

-- 1. 建立檢查檔案所有權的輔助函式
CREATE OR REPLACE FUNCTION is_file_owner(f_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM files 
    WHERE id = f_id AND uploaded_by = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 2. 重構 files 政策 (移除對 file_tags 的相依，或使用 SECURITY DEFINER)
-- 我們建立一個專用的函式來檢查部門檔案權限
CREATE OR REPLACE FUNCTION can_access_dept_file(f_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM file_tags ft
    JOIN user_profiles up ON up.id = auth.uid()
    JOIN departments d ON d.id = up.department_id
    WHERE ft.file_id = f_id
      AND ft.tag_key = 'department'
      AND ft.tag_value = d.name
      AND up.role = 'DEPT_ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 3. 套用新的 policies
DROP POLICY IF EXISTS "部門管理員可看部門檔案" ON files;
CREATE POLICY "部門管理員可看部門檔案" ON files
  FOR SELECT
  USING (can_access_dept_file(id));

DROP POLICY IF EXISTS "編輯者可看授權檔案" ON files;
CREATE POLICY "編輯者可看授權檔案" ON files
  FOR SELECT
  USING (
    get_user_role() = 'EDITOR'
    AND (
      uploaded_by = auth.uid()
      OR EXISTS (
        -- 這裡直接查 table，因為是子查詢且 get_user_role 是 SECURITY DEFINER
        -- 但為了保險，我們也可以把這個邏輯封裝
        SELECT 1 FROM file_tags ft
        JOIN user_tag_permissions utp ON 
          ft.tag_key = utp.tag_key AND 
          ft.tag_value = utp.tag_value
        WHERE ft.file_id = files.id 
          AND utp.user_id = auth.uid()
      )
    )
  );

-- 4. 重構 file_tags 政策
-- 刪除舊的政策（包含可能由 20240101000003_fix_tags_rls.sql 建立的）
DROP POLICY IF EXISTS "管理員可管理標籤" ON file_tags;
DROP POLICY IF EXISTS "上傳者可管理標籤" ON file_tags;
DROP POLICY IF EXISTS "使用者可讀取標籤" ON file_tags;

-- 建立新的政策
-- SUPER_ADMIN 與 DEPT_ADMIN 可進行所有操作
CREATE POLICY "管理員可管理標籤" ON file_tags
  FOR ALL
  USING (is_admin() = true);

-- 上傳者可管理自己檔案的標籤（使用 SECURITY DEFINER 函式避開循環）
CREATE POLICY "上傳者可管理標籤" ON file_tags
  FOR ALL
  USING (is_file_owner(file_id));

-- 讀取政策：直接允許所有已存在的標籤
-- 安全性由 files 表的 SELECT 政策控制，因為應用層會先查詢 files
-- 如果直接查詢 file_tags，使用者只能看到標籤，但無法存取對應的檔案內容
-- 這是可接受的，因為標籤本身不包含敏感資訊
CREATE POLICY "使用者可讀取標籤" ON file_tags
  FOR SELECT
  USING (true);
