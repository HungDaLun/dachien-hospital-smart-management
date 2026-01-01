-- 啟用 Row Level Security (RLS) 並建立安全政策
-- 遵循最小權限原則

-- ============================================
-- 1. 啟用 RLS
-- ============================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tag_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_knowledge_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_access_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. user_profiles 政策
-- ============================================
-- 所有人都可以讀取自己的資料
CREATE POLICY "使用者可讀取自己的資料" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 所有人都可以更新自己的資料（但不可修改 role）
-- 注意：RLS policy 中無法直接使用 OLD，需在應用層或觸發器中驗證
CREATE POLICY "使用者可更新自己的資料" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- SUPER_ADMIN 可讀取所有使用者
CREATE POLICY "超級管理員可讀取所有使用者" ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

-- DEPT_ADMIN 可讀取部門成員
CREATE POLICY "部門管理員可讀取部門成員" ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up1
      JOIN user_profiles up2 ON up1.department_id = up2.department_id
      WHERE up1.id = auth.uid() 
        AND up1.role = 'DEPT_ADMIN'
        AND up2.id = user_profiles.id
    )
  );

-- ============================================
-- 3. files 政策
-- ============================================
-- SUPER_ADMIN 可看所有檔案
CREATE POLICY "超級管理員可看所有檔案" ON files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

-- DEPT_ADMIN 可看部門檔案
CREATE POLICY "部門管理員可看部門檔案" ON files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN file_tags ft ON ft.file_id = files.id
      WHERE up.id = auth.uid() 
        AND up.role = 'DEPT_ADMIN'
        AND ft.tag_key = 'department'
        AND ft.tag_value = (
          SELECT d.name FROM departments d WHERE d.id = up.department_id
        )
    )
  );

-- EDITOR 可看自己上傳的檔案或有標籤權限的檔案
CREATE POLICY "編輯者可看授權檔案" ON files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'EDITOR'
    )
    AND (
      uploaded_by = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM file_tags ft
        JOIN user_tag_permissions utp ON 
          ft.tag_key = utp.tag_key AND 
          ft.tag_value = utp.tag_value
        WHERE ft.file_id = files.id 
          AND utp.user_id = auth.uid()
      )
    )
  );

-- 所有人都可以上傳檔案（透過 API 驗證權限）
CREATE POLICY "使用者可上傳檔案" ON files
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    uploaded_by = auth.uid()
  );

-- 上傳者可更新自己的檔案
CREATE POLICY "上傳者可更新自己的檔案" ON files
  FOR UPDATE
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

-- 上傳者可刪除自己的檔案（或管理員）
CREATE POLICY "上傳者可刪除自己的檔案" ON files
  FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
    )
  );

-- ============================================
-- 4. agents 政策
-- ============================================
-- 使用者可看有權限的 Agent
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

-- DEPT_ADMIN 和 SUPER_ADMIN 可建立 Agent
CREATE POLICY "管理員可建立 Agent" ON agents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
    )
    AND created_by = auth.uid()
  );

-- 建立者可更新自己的 Agent（或 SUPER_ADMIN）
CREATE POLICY "建立者可更新自己的 Agent" ON agents
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

-- ============================================
-- 5. chat_sessions 政策
-- ============================================
-- 使用者只能看自己的對話
CREATE POLICY "使用者可看自己的對話" ON chat_sessions
  FOR SELECT
  USING (user_id = auth.uid());

-- 使用者可建立自己的對話
CREATE POLICY "使用者可建立自己的對話" ON chat_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 使用者可更新自己的對話
CREATE POLICY "使用者可更新自己的對話" ON chat_sessions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 使用者可刪除自己的對話
CREATE POLICY "使用者可刪除自己的對話" ON chat_sessions
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 6. chat_messages 政策
-- ============================================
-- 使用者只能看自己對話的訊息
CREATE POLICY "使用者可看自己對話的訊息" ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = chat_messages.session_id AND user_id = auth.uid()
    )
  );

-- 使用者可建立訊息（透過 API 驗證）
CREATE POLICY "使用者可建立訊息" ON chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = chat_messages.session_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- 7. audit_logs 政策
-- ============================================
-- 只有管理員可看稽核日誌
CREATE POLICY "管理員可看稽核日誌" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
    )
  );

-- 系統可寫入稽核日誌（透過 Service Role）
-- 注意：此政策需在應用層透過 Service Role Key 寫入
