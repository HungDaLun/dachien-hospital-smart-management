-- Add mcp_config column to agents table to support dynamic tool/skill configuration
ALTER TABLE agents
ADD COLUMN mcp_config JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN agents.mcp_config IS 'Configuration for MCP (Model Context Protocol) servers and skills';
