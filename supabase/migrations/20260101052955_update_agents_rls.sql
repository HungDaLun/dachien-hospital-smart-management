
-- 更新 Agent 資料表的 RLS 政策
-- 建立日期: 2026-01-01
-- 目的: 解決 DEPT_ADMIN 建立 Agent 後無法立即讀取的問題，並增加部門級讀取權限

DROP POLICY IF EXISTS "使用者可看授權的 Agent" ON agents;

CREATE POLICY "使用者可看授權的 Agent" ON agents
  FOR SELECT
  USING (
    -- SUPER_ADMIN 可看全部
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
    OR
    -- 建立者可看自己的
    created_by = auth.uid()
    OR
    -- 部門管理員可看部門的
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
        AND role = 'DEPT_ADMIN' 
        AND department_id = agents.department_id
    )
    OR
    -- 有存取權限的 Agent
    EXISTS (
      SELECT 1 FROM agent_access_control aac
      WHERE aac.agent_id = agents.id
        AND (
          aac.user_id = auth.uid()
          OR
          (
            aac.department_id IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM user_profiles
              WHERE id = auth.uid() AND department_id = aac.department_id
            )
          )
        )
        AND aac.can_access = true
    )
  );
