-- EAKAP 初始資料庫 Schema
-- 建立日期: 2026-01-01
-- 說明: 建立所有核心資料表、索引與 RLS 政策

-- ============================================
-- 1. 啟用必要的擴展
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. 部門表
-- ============================================
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. 使用者資料表 (擴展 Supabase auth.users)
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'USER' 
    CHECK (role IN ('SUPER_ADMIN', 'DEPT_ADMIN', 'EDITOR', 'USER')),
  department_id UUID REFERENCES departments(id),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX idx_user_profiles_department ON user_profiles(department_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- ============================================
-- 4. 檔案表 (Dual-Layer Storage Design)
-- ============================================
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  
  -- Layer 1: 主儲存 (資料主權)
  s3_storage_path TEXT NOT NULL,
  s3_etag VARCHAR(100),
  
  -- Layer 2: AI 運算層適配器
  gemini_file_uri TEXT,
  gemini_state VARCHAR(20) DEFAULT 'PENDING' 
    CHECK (gemini_state IN ('PENDING', 'PROCESSING', 'SYNCED', 'NEEDS_REVIEW', 'REJECTED', 'FAILED')),
  gemini_sync_at TIMESTAMP WITH TIME ZONE,
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  quality_issues JSONB,
  
  -- 未來預留欄位
  openai_file_id TEXT,
  claude_file_id TEXT,
  
  -- 元資料
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
  uploaded_by UUID REFERENCES user_profiles(id),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_gemini_state ON files(gemini_state);
CREATE INDEX idx_files_is_active ON files(is_active);
CREATE INDEX idx_files_created_at ON files(created_at DESC);

-- ============================================
-- 5. 檔案標籤 (多對多關聯)
-- ============================================
CREATE TABLE file_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  tag_key VARCHAR(50) NOT NULL,
  tag_value VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(file_id, tag_key, tag_value)
);

-- 建立索引
CREATE INDEX idx_file_tags_file_id ON file_tags(file_id);
CREATE INDEX idx_file_tags_key_value ON file_tags(tag_key, tag_value);

-- ============================================
-- 6. EDITOR 標籤權限表
-- ============================================
CREATE TABLE user_tag_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  tag_key VARCHAR(50) NOT NULL,
  tag_value VARCHAR(100) NOT NULL,
  granted_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, tag_key, tag_value)
);

-- 建立索引
CREATE INDEX idx_user_tag_permissions_user ON user_tag_permissions(user_id);
CREATE INDEX idx_user_tag_permissions_tag ON user_tag_permissions(tag_key, tag_value);

-- ============================================
-- 7. Agent 表
-- ============================================
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  system_prompt TEXT NOT NULL,
  model_version VARCHAR(50) DEFAULT 'gemini-1.5-pro',
  temperature DECIMAL(2,1) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  department_id UUID REFERENCES departments(id),
  created_by UUID REFERENCES user_profiles(id),
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX idx_agents_department ON agents(department_id);
CREATE INDEX idx_agents_created_by ON agents(created_by);
CREATE INDEX idx_agents_is_active ON agents(is_active);

-- ============================================
-- 8. Agent Prompt 版本歷史
-- ============================================
CREATE TABLE agent_prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  system_prompt TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(agent_id, version_number)
);

-- 建立索引
CREATE INDEX idx_agent_prompt_versions_agent ON agent_prompt_versions(agent_id);

-- ============================================
-- 9. Agent 知識綁定規則
-- ============================================
CREATE TABLE agent_knowledge_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('FOLDER', 'TAG')),
  rule_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX idx_agent_knowledge_rules_agent ON agent_knowledge_rules(agent_id);

-- ============================================
-- 10. Agent 存取控制
-- ============================================
CREATE TABLE agent_access_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  department_id UUID REFERENCES departments(id),
  can_access BOOLEAN DEFAULT true,
  
  CONSTRAINT user_or_dept CHECK (
    (user_id IS NOT NULL AND department_id IS NULL) OR
    (user_id IS NULL AND department_id IS NOT NULL)
  )
);

-- 建立索引
CREATE INDEX idx_agent_access_control_agent ON agent_access_control(agent_id);
CREATE INDEX idx_agent_access_control_user ON agent_access_control(user_id);
CREATE INDEX idx_agent_access_control_dept ON agent_access_control(department_id);

-- ============================================
-- 11. 對話 Session
-- ============================================
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  user_id UUID REFERENCES user_profiles(id),
  title VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX idx_chat_sessions_agent ON chat_sessions(agent_id);
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);

-- ============================================
-- 12. 對話訊息
-- ============================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id),
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  citations JSONB,
  token_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_agent ON chat_messages(agent_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ============================================
-- 13. 對話回饋
-- ============================================
CREATE TABLE chat_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES chat_messages(id),
  user_id UUID REFERENCES user_profiles(id),
  rating SMALLINT CHECK (rating IN (-1, 1)),  -- -1: 負評, 1: 正評
  reason_code VARCHAR(50),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX idx_chat_feedback_message ON chat_feedback(message_id);
CREATE INDEX idx_chat_feedback_user ON chat_feedback(user_id);

-- ============================================
-- 14. 稽核日誌
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  action_type VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- 15. 自動更新 updated_at 的函式
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為需要的資料表建立觸發器
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
