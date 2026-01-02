-- ============================================
-- 確保資料庫結構與 Migration 檔案一致
-- 建立日期: 2026-01-08
-- 目的: 修復任何結構不一致的問題
-- ============================================

-- 1. 確保 files 表有所有必要的欄位
DO $$
BEGIN
  -- 確保 markdown_content 欄位存在
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'files' 
      AND column_name = 'markdown_content'
  ) THEN
    ALTER TABLE files ADD COLUMN markdown_content TEXT;
  END IF;

  -- 確保 metadata_analysis 欄位存在
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'files' 
      AND column_name = 'metadata_analysis'
  ) THEN
    ALTER TABLE files ADD COLUMN metadata_analysis JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- 確保 department_id 欄位存在
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'files' 
      AND column_name = 'department_id'
  ) THEN
    ALTER TABLE files ADD COLUMN department_id UUID REFERENCES departments(id);
  END IF;
END $$;

-- 2. 確保 files.department_id 有索引
CREATE INDEX IF NOT EXISTS idx_files_department_id ON files(department_id);

-- 3. 確保 agent_knowledge_rules.rule_type 包含 'DEPARTMENT'
DO $$
BEGIN
  -- 檢查 constraint 是否存在且包含 DEPARTMENT
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_schema = 'public'
      AND constraint_name LIKE '%agent_knowledge_rules%rule_type%'
      AND check_clause NOT LIKE '%DEPARTMENT%'
  ) THEN
    -- 刪除舊的 constraint
    ALTER TABLE agent_knowledge_rules 
    DROP CONSTRAINT IF EXISTS agent_knowledge_rules_rule_type_check;
    
    -- 建立新的 constraint
    ALTER TABLE agent_knowledge_rules 
    ADD CONSTRAINT agent_knowledge_rules_rule_type_check 
    CHECK (rule_type IN ('FOLDER', 'TAG', 'DEPARTMENT'));
  END IF;
END $$;

-- 4. 確保 agents.model_version 預設值為 gemini-3-pro
DO $$
BEGIN
  -- 檢查並更新預設值
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'agents'
      AND column_name = 'model_version'
      AND column_default != '''gemini-3-pro''::character varying'
  ) THEN
    ALTER TABLE agents 
    ALTER COLUMN model_version SET DEFAULT 'gemini-3-pro';
    
    COMMENT ON COLUMN agents.model_version IS 'AI 模型版本，預設為 gemini-3-pro（僅支援 Gemini 3 系列：gemini-3-flash, gemini-3-pro）';
  END IF;
END $$;

-- 5. 確保所有必要的索引都存在
CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON user_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_file_tags_file_id ON file_tags(file_id);
CREATE INDEX IF NOT EXISTS idx_file_tags_key_value ON file_tags(tag_key, tag_value);
CREATE INDEX IF NOT EXISTS idx_user_tag_permissions_user ON user_tag_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tag_permissions_tag ON user_tag_permissions(tag_key, tag_value);
CREATE INDEX IF NOT EXISTS idx_agents_department ON agents(department_id);
CREATE INDEX IF NOT EXISTS idx_agents_created_by ON agents(created_by);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);
CREATE INDEX IF NOT EXISTS idx_agent_prompt_versions_agent ON agent_prompt_versions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_rules_agent ON agent_knowledge_rules(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_access_control_agent ON agent_access_control(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_access_control_user ON agent_access_control(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_access_control_dept ON agent_access_control(department_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_agent ON chat_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_agent ON chat_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_message ON chat_feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_user ON chat_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- 6. 確保所有必要的觸發器都存在
-- update_updated_at_column 函式應該已經存在，這裡只確保觸發器存在
DO $$
BEGIN
  -- 檢查並建立 departments 觸發器
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_departments_updated_at'
  ) THEN
    CREATE TRIGGER update_departments_updated_at 
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- 檢查並建立 user_profiles 觸發器
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- 檢查並建立 files 觸發器
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_files_updated_at'
  ) THEN
    CREATE TRIGGER update_files_updated_at 
    BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- 檢查並建立 agents 觸發器
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_agents_updated_at'
  ) THEN
    CREATE TRIGGER update_agents_updated_at 
    BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- 檢查並建立 chat_sessions 觸發器
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_chat_sessions_updated_at'
  ) THEN
    CREATE TRIGGER update_chat_sessions_updated_at 
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- 檢查並建立 knowledge_frameworks 觸發器
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_knowledge_frameworks_modtime'
  ) THEN
    CREATE TRIGGER update_knowledge_frameworks_modtime
    BEFORE UPDATE ON knowledge_frameworks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- 檢查並建立 knowledge_instances 觸發器
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_knowledge_instances_modtime'
  ) THEN
    CREATE TRIGGER update_knowledge_instances_modtime
    BEFORE UPDATE ON knowledge_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 7. 確保所有資料表都啟用了 RLS
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
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_instances ENABLE ROW LEVEL SECURITY;
