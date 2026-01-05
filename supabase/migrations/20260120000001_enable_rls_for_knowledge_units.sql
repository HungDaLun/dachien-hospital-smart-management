-- ============================================
-- 為 knowledge_units 和 knowledge_unit_files 啟用 RLS
-- 建立日期: 2026-01-20
-- 目的: 遵循專案規範，所有資料表必須啟用 RLS
-- ============================================

-- 1. 啟用 RLS
ALTER TABLE knowledge_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_unit_files ENABLE ROW LEVEL SECURITY;

-- 2. knowledge_units 表的 RLS 政策

-- 所有已登入使用者可以查看知識單元（類似 files 表的寬鬆讀取策略）
CREATE POLICY "所有已登入使用者可查看知識單元" ON knowledge_units
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 只有 EDITOR 以上角色可以建立知識單元
CREATE POLICY "授權使用者可建立知識單元" ON knowledge_units
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN', 'EDITOR')
    )
  );

-- 只有 SUPER_ADMIN 和 DEPT_ADMIN 可以更新知識單元
CREATE POLICY "管理員可更新知識單元" ON knowledge_units
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
    )
  );

-- 只有 SUPER_ADMIN 和 DEPT_ADMIN 可以刪除知識單元
CREATE POLICY "管理員可刪除知識單元" ON knowledge_units
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
    )
  );

-- 3. knowledge_unit_files 表的 RLS 政策

-- 所有已登入使用者可以查看關聯關係
CREATE POLICY "所有已登入使用者可查看知識單元檔案關聯" ON knowledge_unit_files
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 只有 EDITOR 以上角色可以建立關聯
CREATE POLICY "授權使用者可建立知識單元檔案關聯" ON knowledge_unit_files
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN', 'EDITOR')
    )
  );

-- 只有 SUPER_ADMIN 和 DEPT_ADMIN 可以更新關聯
CREATE POLICY "管理員可更新知識單元檔案關聯" ON knowledge_unit_files
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
    )
  );

-- 只有 SUPER_ADMIN 和 DEPT_ADMIN 可以刪除關聯
CREATE POLICY "管理員可刪除知識單元檔案關聯" ON knowledge_unit_files
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
    )
  );

-- 4. 為 knowledge_units 表建立 updated_at 觸發器
CREATE TRIGGER update_knowledge_units_updated_at
  BEFORE UPDATE ON knowledge_units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 註解說明
COMMENT ON POLICY "所有已登入使用者可查看知識單元" ON knowledge_units IS 
  '寬鬆讀取策略：所有已登入使用者都可以查看知識單元，透過審計日誌追蹤存取';

COMMENT ON POLICY "授權使用者可建立知識單元" ON knowledge_units IS 
  '只有 EDITOR 以上角色可以建立知識單元';

COMMENT ON POLICY "管理員可更新知識單元" ON knowledge_units IS 
  '只有 SUPER_ADMIN 和 DEPT_ADMIN 可以更新知識單元';

COMMENT ON POLICY "管理員可刪除知識單元" ON knowledge_units IS 
  '只有 SUPER_ADMIN 和 DEPT_ADMIN 可以刪除知識單元';
