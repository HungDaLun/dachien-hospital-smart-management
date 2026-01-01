-- 修復 file_tags 與 agent_knowledge_rules 的 RLS 政策
-- 這些表目前啟用了 RLS 但缺乏適當的 INSERT/SELECT 政策，導致 API 呼叫失敗。

-- ============================================
-- 1. file_tags 政策
-- ============================================

DROP POLICY IF EXISTS "管理員可管理標籤" ON file_tags;
DROP POLICY IF EXISTS "上傳者可管理標籤" ON file_tags;
DROP POLICY IF EXISTS "使用者可讀取標籤" ON file_tags;

-- SUPER_ADMIN 與 DEPT_ADMIN 可進行所有操作
CREATE POLICY "管理員可管理標籤" ON file_tags
  FOR ALL
  USING (is_admin() = true);

-- 上傳者可管理自己檔案的標籤
CREATE POLICY "上傳者可管理標籤" ON file_tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM files
      WHERE files.id = file_tags.file_id
        AND files.uploaded_by = auth.uid()
    )
  );

-- 只要能看到檔案的人就能看到標籤
CREATE POLICY "使用者可讀取標籤" ON file_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM files
      WHERE files.id = file_id
    )
  );

-- ============================================
-- 2. agent_knowledge_rules 政策
-- ============================================

DROP POLICY IF EXISTS "管理員可管理 Agent 規則" ON agent_knowledge_rules;
DROP POLICY IF EXISTS "使用者可讀取 Agent 規則" ON agent_knowledge_rules;

-- SUPER_ADMIN 與 DEPT_ADMIN 可進行所有操作
CREATE POLICY "管理員可管理 Agent 規則" ON agent_knowledge_rules
  FOR ALL
  USING (is_admin() = true);

-- 只要能看到 Agent 的人就能看到規則
CREATE POLICY "使用者可讀取 Agent 規則" ON agent_knowledge_rules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = agent_id
    )
  );

-- ============================================
-- 3. agent_access_control 政策
-- ============================================

DROP POLICY IF EXISTS "管理員可管理存取控制" ON agent_access_control;

CREATE POLICY "管理員可管理存取控制" ON agent_access_control
  FOR ALL
  USING (is_admin() = true);
