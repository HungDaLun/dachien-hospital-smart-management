-- 補齊缺少的 RLS 政策
-- 建立日期: 2026-01-01
-- 目的: 為 departments, user_tag_permissions, chat_feedback, agent_prompt_versions 建立 RLS 政策

-- ============================================
-- 1. departments 政策
-- ============================================
-- 所有人都可以讀取部門列表（用於下拉選單等）
CREATE POLICY "使用者可讀取部門" ON departments
  FOR SELECT
  USING (true);

-- 只有 SUPER_ADMIN 可以管理部門
CREATE POLICY "超級管理員可管理部門" ON departments
  FOR ALL
  USING (is_super_admin() = true)
  WITH CHECK (is_super_admin() = true);

-- ============================================
-- 2. user_tag_permissions 政策
-- ============================================
-- 使用者可以讀取自己的標籤權限
CREATE POLICY "使用者可讀取自己的標籤權限" ON user_tag_permissions
  FOR SELECT
  USING (user_id = auth.uid());

-- 管理員可以讀取所有標籤權限
CREATE POLICY "管理員可讀取所有標籤權限" ON user_tag_permissions
  FOR SELECT
  USING (is_admin() = true);

-- 只有管理員可以管理標籤權限
CREATE POLICY "管理員可管理標籤權限" ON user_tag_permissions
  FOR ALL
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);

-- ============================================
-- 3. chat_feedback 政策
-- ============================================
-- 使用者可以讀取自己提供的回饋
CREATE POLICY "使用者可讀取自己的回饋" ON chat_feedback
  FOR SELECT
  USING (user_id = auth.uid());

-- 使用者可以建立自己的回饋
CREATE POLICY "使用者可建立自己的回饋" ON chat_feedback
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 使用者可以更新自己的回饋
CREATE POLICY "使用者可更新自己的回饋" ON chat_feedback
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 管理員可以讀取所有回饋（用於分析）
CREATE POLICY "管理員可讀取所有回饋" ON chat_feedback
  FOR SELECT
  USING (is_admin() = true);

-- ============================================
-- 4. agent_prompt_versions 政策
-- ============================================
-- 使用者可以讀取有權限的 Agent 的版本歷史
CREATE POLICY "使用者可讀取授權 Agent 的版本歷史" ON agent_prompt_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = agent_prompt_versions.agent_id
        AND (
          -- SUPER_ADMIN 可看全部
          is_super_admin() = true
          OR
          -- 建立者可看自己的
          agents.created_by = auth.uid()
          OR
          -- 部門管理員可看部門的
          (
            get_user_role() = 'DEPT_ADMIN'
            AND agents.department_id = get_user_dept()
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
        )
    )
  );

-- 只有管理員可以建立版本歷史（透過 API 自動建立）
CREATE POLICY "管理員可建立版本歷史" ON agent_prompt_versions
  FOR INSERT
  WITH CHECK (is_admin() = true);
