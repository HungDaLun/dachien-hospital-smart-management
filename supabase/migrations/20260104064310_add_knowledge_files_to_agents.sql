-- 新增 knowledge_files 欄位到 agents 表
-- 用於儲存 Agent 直接綁定的檔案 ID 列表

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS knowledge_files UUID[] DEFAULT '{}';

-- 新增註解
COMMENT ON COLUMN agents.knowledge_files IS 'Array of file IDs that this agent can access. Uses vector search within these files.';

-- 建立索引（可選，如果需要快速查詢哪些 Agent 使用了特定檔案）
CREATE INDEX IF NOT EXISTS idx_agents_knowledge_files
ON agents USING GIN (knowledge_files);

-- 為了向後相容，保留 knowledge_rules 表
-- 未來可以同時使用「檔案綁定」和「規則綁定」兩種模式
