-- ============================================
-- 為 user_interests 和 knowledge_push_logs 啟用 RLS
-- 建立日期: 2026-01-22
-- 目的: 遵循專案規範，所有資料表必須啟用 RLS
-- ============================================

-- 1. 啟用 RLS
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_push_logs ENABLE ROW LEVEL SECURITY;

-- 2. user_interests 表的 RLS 政策

-- 使用者只能查看自己的興趣
CREATE POLICY "使用者可查看自己的興趣" ON user_interests
  FOR SELECT
  USING (user_id = auth.uid());

-- 使用者可以建立自己的興趣
CREATE POLICY "使用者可建立自己的興趣" ON user_interests
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 使用者可以更新自己的興趣
CREATE POLICY "使用者可更新自己的興趣" ON user_interests
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 使用者可以刪除自己的興趣
CREATE POLICY "使用者可刪除自己的興趣" ON user_interests
  FOR DELETE
  USING (user_id = auth.uid());

-- 管理員可以查看所有使用者的興趣（用於分析）
CREATE POLICY "管理員可查看所有使用者興趣" ON user_interests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
    )
  );

-- 3. knowledge_push_logs 表的 RLS 政策

-- 使用者只能查看自己的推送記錄
CREATE POLICY "使用者可查看自己的推送記錄" ON knowledge_push_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- 系統可以建立推送記錄（透過 Service Role 或應用層）
-- 注意：此政策允許已登入使用者建立，實際使用時應透過 Service Role
CREATE POLICY "授權使用者可建立推送記錄" ON knowledge_push_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      -- 使用者可以為自己建立記錄
      user_id = auth.uid()
      OR
      -- 管理員可以為其他使用者建立記錄
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
        AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
      )
    )
  );

-- 使用者可以更新自己的推送記錄（例如標記為已讀）
CREATE POLICY "使用者可更新自己的推送記錄" ON knowledge_push_logs
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 使用者可以刪除自己的推送記錄
CREATE POLICY "使用者可刪除自己的推送記錄" ON knowledge_push_logs
  FOR DELETE
  USING (user_id = auth.uid());

-- 管理員可以查看所有推送記錄（用於分析）
CREATE POLICY "管理員可查看所有推送記錄" ON knowledge_push_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
    )
  );

-- 4. 為 user_interests 表建立 updated_at 觸發器（使用 last_updated 欄位）
-- 注意：user_interests 使用 last_updated 而非 updated_at，所以需要特別處理
CREATE OR REPLACE FUNCTION update_user_interests_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_interests_last_updated
  BEFORE UPDATE ON user_interests
  FOR EACH ROW
  EXECUTE FUNCTION update_user_interests_last_updated();

-- 註解說明
COMMENT ON POLICY "使用者可查看自己的興趣" ON user_interests IS 
  '使用者只能查看自己的興趣設定';

COMMENT ON POLICY "使用者可建立自己的興趣" ON user_interests IS 
  '使用者可以建立自己的興趣標籤';

COMMENT ON POLICY "使用者可更新自己的興趣" ON user_interests IS 
  '使用者可以更新自己的興趣分數和來源';

COMMENT ON POLICY "使用者可刪除自己的興趣" ON user_interests IS 
  '使用者可以刪除自己的興趣標籤';

COMMENT ON POLICY "管理員可查看所有使用者興趣" ON user_interests IS 
  '管理員可以查看所有使用者的興趣，用於系統分析和推薦優化';

COMMENT ON POLICY "使用者可查看自己的推送記錄" ON knowledge_push_logs IS 
  '使用者只能查看自己的知識推送記錄';

COMMENT ON POLICY "授權使用者可建立推送記錄" ON knowledge_push_logs IS 
  '系統可以為使用者建立推送記錄，實際使用時應透過 Service Role';

COMMENT ON POLICY "使用者可更新自己的推送記錄" ON knowledge_push_logs IS 
  '使用者可以更新自己的推送記錄，例如標記為已讀';

COMMENT ON POLICY "使用者可刪除自己的推送記錄" ON knowledge_push_logs IS 
  '使用者可以刪除自己的推送記錄';

COMMENT ON POLICY "管理員可查看所有推送記錄" ON knowledge_push_logs IS 
  '管理員可以查看所有推送記錄，用於系統分析和優化';
