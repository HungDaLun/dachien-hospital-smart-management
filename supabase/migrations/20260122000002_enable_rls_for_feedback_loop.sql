-- ============================================
-- 為 knowledge_feedback_events 啟用 RLS
-- 建立日期: 2026-01-22
-- 目的: 遵循專案規範，所有資料表必須啟用 RLS
-- ============================================

-- 1. 啟用 RLS
ALTER TABLE knowledge_feedback_events ENABLE ROW LEVEL SECURITY;

-- 2. knowledge_feedback_events 表的 RLS 政策

-- 使用者可以查看自己的回饋事件
CREATE POLICY "使用者可查看自己的回饋事件" ON knowledge_feedback_events
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    -- 管理員可以查看所有回饋事件（用於分析）
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
    )
  );

-- 使用者可以建立自己的回饋事件
CREATE POLICY "使用者可建立自己的回饋事件" ON knowledge_feedback_events
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      -- 使用者可以為自己建立回饋
      user_id = auth.uid()
      OR
      -- 系統可以建立回饋（user_id 為 NULL 時，透過 Service Role）
      user_id IS NULL
    )
  );

-- 使用者可以更新自己的回饋事件
CREATE POLICY "使用者可更新自己的回饋事件" ON knowledge_feedback_events
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 使用者可以刪除自己的回饋事件
CREATE POLICY "使用者可刪除自己的回饋事件" ON knowledge_feedback_events
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR
    -- 管理員可以刪除回饋事件
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
    )
  );

-- 註解說明
COMMENT ON POLICY "使用者可查看自己的回饋事件" ON knowledge_feedback_events IS 
  '使用者只能查看自己的回饋事件，管理員可以查看所有回饋用於分析';

COMMENT ON POLICY "使用者可建立自己的回饋事件" ON knowledge_feedback_events IS 
  '使用者可以建立自己的回饋事件，系統也可以透過 Service Role 建立';

COMMENT ON POLICY "使用者可更新自己的回饋事件" ON knowledge_feedback_events IS 
  '使用者可以更新自己的回饋事件';

COMMENT ON POLICY "使用者可刪除自己的回饋事件" ON knowledge_feedback_events IS 
  '使用者可以刪除自己的回饋事件，管理員也可以刪除';
