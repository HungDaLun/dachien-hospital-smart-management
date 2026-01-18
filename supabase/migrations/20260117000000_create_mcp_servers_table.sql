-- =============================================
-- MCP Servers 表建立
-- 建立日期: 2026-01-17
-- 說明: 建立 MCP Server 註冊表，供超級管家和 Agent 建立使用
-- =============================================

-- MCP Server 註冊表
CREATE TABLE IF NOT EXISTS mcp_servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 基本資訊
    name TEXT NOT NULL UNIQUE, -- 'gmail', 'slack', 'notion'
    display_name TEXT NOT NULL,
    description TEXT,
    
    -- 連接資訊
    server_url TEXT NOT NULL, -- MCP Server URL
    server_type TEXT DEFAULT 'http', -- 'http', 'websocket', 'stdio'
    api_key TEXT, -- 加密儲存（如果需要）
    
    -- 能力
    capabilities JSONB DEFAULT '[]'::jsonb, -- ['read_email', 'send_email']
    
    -- 狀態
    is_active BOOLEAN DEFAULT TRUE,
    last_health_check TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_mcp_servers_active ON mcp_servers(is_active);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_name ON mcp_servers(name);

-- RLS 政策
ALTER TABLE mcp_servers ENABLE ROW LEVEL SECURITY;

-- 只有 SUPER_ADMIN 可以管理，所有使用者可以讀取（供 Agent 建立使用）
CREATE POLICY "super_admin_full_access" ON mcp_servers
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

-- 所有已登入使用者可以讀取（供 AI 代理架構師查詢）
CREATE POLICY "users_read_access" ON mcp_servers
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        is_active = TRUE
    );

-- 註解
COMMENT ON TABLE mcp_servers IS 'MCP Server 註冊表，供超級管家和 Agent 建立使用';
COMMENT ON COLUMN mcp_servers.name IS 'MCP Server 唯一識別名，用於程式碼中引用';
COMMENT ON COLUMN mcp_servers.capabilities IS 'MCP Server 提供的能力列表，JSONB 陣列格式';
COMMENT ON COLUMN mcp_servers.api_key IS 'API Key（如果需要），應加密儲存';

-- 更新時間觸發器
CREATE OR REPLACE FUNCTION update_mcp_servers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mcp_servers_updated_at
    BEFORE UPDATE ON mcp_servers
    FOR EACH ROW
    EXECUTE FUNCTION update_mcp_servers_updated_at();

-- ============================================
-- Migration 完成
-- ============================================
