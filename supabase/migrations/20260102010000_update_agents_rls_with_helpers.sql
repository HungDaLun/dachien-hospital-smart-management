-- 更新 Agent 資料表的 RLS 政策（使用輔助函式優化）
-- 建立日期: 2026-01-02
-- 目的: 將 agents 表的 SELECT 政策從直接查詢 user_profiles 改為使用輔助函式
--       提升效能、可讀性，並符合最佳實踐

-- ============================================
-- 1. 更新 agents 表的 SELECT 政策
-- ============================================

DROP POLICY IF EXISTS "使用者可看授權的 Agent" ON agents;

CREATE POLICY "使用者可看授權的 Agent" ON agents
  FOR SELECT
  USING (
    -- SUPER_ADMIN 可看全部（使用輔助函式）
    is_super_admin() = true
    OR
    -- 建立者可看自己的
    created_by = auth.uid()
    OR
    -- 部門管理員可看部門的（使用輔助函式）
    (
      get_user_role() = 'DEPT_ADMIN'
      AND department_id = get_user_dept()
    )
    OR
    -- 有存取權限的 Agent（使用輔助函式優化部門查詢）
    EXISTS (
      SELECT 1 FROM agent_access_control aac
      WHERE aac.agent_id = agents.id
        AND (
          aac.user_id = auth.uid()
          OR
          (
            aac.department_id IS NOT NULL
            AND aac.department_id = get_user_dept()
          )
        )
        AND aac.can_access = true
    )
  );

-- ============================================
-- 說明
-- ============================================
-- 此 migration 將 agents 表的 SELECT 政策從直接查詢 user_profiles 改為使用輔助函式：
-- 
-- 優點：
-- 1. 使用 is_super_admin() 而非 EXISTS (SELECT ... FROM user_profiles WHERE role = 'SUPER_ADMIN')
-- 2. 使用 get_user_role() 和 get_user_dept() 而非直接查詢 user_profiles
-- 3. 提升效能（輔助函式是 SECURITY DEFINER，不會受到 RLS 約束）
-- 4. 更好的可讀性和維護性
-- 5. 符合最佳實踐（使用輔助函式避免遞迴查詢）
--
-- 功能保持不變：
-- - SUPER_ADMIN 可看全部 Agent
-- - 建立者可看自己的 Agent
-- - 部門管理員可看部門的 Agent
-- - 有存取權限的 Agent（透過 agent_access_control）
