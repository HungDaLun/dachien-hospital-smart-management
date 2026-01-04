-- Extend agent_templates for Skills and MCP support

ALTER TABLE "public"."agent_templates"
ADD COLUMN IF NOT EXISTS "mcp_config" jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS "model_config" jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS "author" text,
ADD COLUMN IF NOT EXISTS "version" text DEFAULT '1.0.0',
ADD COLUMN IF NOT EXISTS "license" text DEFAULT 'MIT',
ADD COLUMN IF NOT EXISTS "tags" text[] DEFAULT '{}';

COMMENT ON COLUMN "public"."agent_templates"."mcp_config" IS 'Configuration for MCP servers, tools, and resources.';
COMMENT ON COLUMN "public"."agent_templates"."model_config" IS 'Preferred model settings (e.g., gemini-3-pro, temperature).';
COMMENT ON COLUMN "public"."agent_templates"."author" IS 'Creator of the skill/template.';
COMMENT ON COLUMN "public"."agent_templates"."version" IS 'Semantic version of the skill.';
