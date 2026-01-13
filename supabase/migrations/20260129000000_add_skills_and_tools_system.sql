-- =============================================
-- Skills 與工具系統 - Migration 1: 資料結構
-- 建立日期: 2026-01-13
-- 說明: 建立工具註冊表、技能包庫、擴展 agents 欄位、工具執行日誌
-- =============================================

-- ============================================
-- 1. tools_registry - 工具註冊表
-- ============================================
CREATE TABLE IF NOT EXISTS tools_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 基本資訊
    name TEXT NOT NULL UNIQUE,              -- 工具唯一識別名 (例: search_knowledge)
    display_name TEXT NOT NULL,             -- 前台顯示名稱 (例: 搜尋知識庫)
    description TEXT NOT NULL,              -- 工具說明
    icon TEXT,                              -- 圖示 (emoji 或 icon name)
    
    -- 分類
    category TEXT NOT NULL DEFAULT 'general'
        CHECK (category IN ('knowledge', 'data', 'communication', 'export', 'external', 'task', 'general')),
    
    -- Gemini Function Calling 定義
    function_declaration JSONB NOT NULL,    -- Gemini 工具定義 (name, description, parameters)
    
    -- 權限控制
    requires_api_key BOOLEAN DEFAULT FALSE, -- 是否需要客戶提供 API Key
    api_key_config JSONB,                   -- API Key 配置說明
    
    -- 狀態
    is_active BOOLEAN DEFAULT TRUE,         -- 是否啟用
    is_premium BOOLEAN DEFAULT FALSE,       -- 是否為進階功能（需付費）
    
    -- 元數據
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_tools_registry_category ON tools_registry(category);
CREATE INDEX IF NOT EXISTS idx_tools_registry_active ON tools_registry(is_active);
CREATE INDEX IF NOT EXISTS idx_tools_registry_name ON tools_registry(name);

-- 註解
COMMENT ON TABLE tools_registry IS '系統工具註冊表，定義所有可供 Agent 使用的工具';
COMMENT ON COLUMN tools_registry.name IS '工具唯一識別名，用於程式碼中引用';
COMMENT ON COLUMN tools_registry.function_declaration IS 'Gemini Function Calling 的完整定義，包含 name, description, parameters';
COMMENT ON COLUMN tools_registry.requires_api_key IS '若為 TRUE，客戶需在設定頁配置對應的 API Key';

-- ============================================
-- 2. skills_library - 技能包庫
-- ============================================
CREATE TABLE IF NOT EXISTS skills_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 基本資訊
    name TEXT NOT NULL,                     -- 技能唯一識別名 (例: customer_service_sop)
    display_name TEXT NOT NULL,             -- 前台顯示名稱 (例: 客戶服務標準流程)
    description TEXT,                       -- 技能說明
    icon TEXT,                              -- 圖示 (emoji)
    
    -- 分類與標籤
    category TEXT DEFAULT 'general'
        CHECK (category IN ('marketing', 'sales', 'hr', 'legal', 'support', 'finance', 'operations', 'analytics', 'custom', 'general')),
    tags TEXT[] DEFAULT '{}',
    
    -- 核心內容（這是最重要的欄位！）
    skill_content TEXT NOT NULL,            -- SKILL.md 的完整 Markdown 內容
    
    -- 工具需求（選擇此技能時會自動勾選這些工具）
    required_tools TEXT[] DEFAULT '{}',     -- 例: ['search_knowledge', 'send_email']
    
    -- 來源追蹤
    source TEXT DEFAULT 'internal'
        CHECK (source IN ('internal', 'skillsmp', 'enterprise')),
    external_id TEXT,                       -- 外部來源 ID（如 SkillsMP 的 skill ID）
    external_url TEXT,                      -- 外部來源連結
    
    -- 作者與版本
    author TEXT DEFAULT 'EAKAP Official',
    version TEXT DEFAULT '1.0.0',
    
    -- 權限控制
    is_public BOOLEAN DEFAULT TRUE,         -- 是否對所有使用者可見
    is_official BOOLEAN DEFAULT FALSE,      -- 是否為官方認證（會顯示 ⭐ 標記）
    owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- 企業自建技能的擁有者
    
    -- 使用統計
    usage_count INTEGER DEFAULT 0,
    
    -- 狀態
    is_active BOOLEAN DEFAULT TRUE,
    
    -- 時間戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_skills_library_category ON skills_library(category);
CREATE INDEX IF NOT EXISTS idx_skills_library_source ON skills_library(source);
CREATE INDEX IF NOT EXISTS idx_skills_library_public ON skills_library(is_public);
CREATE INDEX IF NOT EXISTS idx_skills_library_official ON skills_library(is_official);
CREATE INDEX IF NOT EXISTS idx_skills_library_owner ON skills_library(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_skills_library_tags ON skills_library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_skills_library_required_tools ON skills_library USING GIN(required_tools);
CREATE INDEX IF NOT EXISTS idx_skills_library_active ON skills_library(is_active);

-- 全文搜尋索引（支援中文搜尋）
CREATE INDEX IF NOT EXISTS idx_skills_library_search ON skills_library 
USING GIN(to_tsvector('simple', COALESCE(name, '') || ' ' || COALESCE(display_name, '') || ' ' || COALESCE(description, '')));

-- 註解
COMMENT ON TABLE skills_library IS '技能包庫，存放可供 Agent 載入的所有技能包（包含內建、SkillsMP 匯入、企業自建）';
COMMENT ON COLUMN skills_library.skill_content IS 'SKILL.md 格式的完整技能內容，會在對話時注入到 System Prompt';
COMMENT ON COLUMN skills_library.required_tools IS '此技能需要的工具列表，選擇技能時系統會自動勾選對應工具';
COMMENT ON COLUMN skills_library.source IS 'internal=官方內建, skillsmp=從SkillsMP匯入, enterprise=企業自建';
COMMENT ON COLUMN skills_library.owner_user_id IS '企業自建技能時記錄建立者，官方技能此欄位為 NULL';

-- ============================================
-- 3. 擴展 agents 資料表
-- ============================================
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS enabled_tools TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS enabled_skills UUID[] DEFAULT '{}';

-- 索引
CREATE INDEX IF NOT EXISTS idx_agents_enabled_tools ON agents USING GIN(enabled_tools);
CREATE INDEX IF NOT EXISTS idx_agents_enabled_skills ON agents USING GIN(enabled_skills);

-- 註解
COMMENT ON COLUMN agents.enabled_tools IS '此 Agent 啟用的工具列表 (工具 name 字串陣列)';
COMMENT ON COLUMN agents.enabled_skills IS '此 Agent 載入的技能包 ID 列表 (UUID 陣列)';

-- ============================================
-- 4. tool_executions_log - 工具執行日誌
-- ============================================
CREATE TABLE IF NOT EXISTS tool_executions_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 關聯
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- 執行內容
    tool_name TEXT NOT NULL,
    input_params JSONB,                     -- 輸入參數
    output_result JSONB,                    -- 輸出結果
    
    -- 執行狀態
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'success', 'failed')),
    error_message TEXT,
    
    -- 效能追蹤
    execution_time_ms INTEGER,
    
    -- 時間戳
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_tool_executions_agent ON tool_executions_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_session ON tool_executions_log(session_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_user ON tool_executions_log(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_tool ON tool_executions_log(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_executions_status ON tool_executions_log(status);
CREATE INDEX IF NOT EXISTS idx_tool_executions_time ON tool_executions_log(created_at DESC);

-- 註解
COMMENT ON TABLE tool_executions_log IS '工具執行日誌，記錄所有 AI 工具呼叫的輸入輸出，用於追蹤、除錯與分析';

-- ============================================
-- 5. 自動更新 updated_at 觸發器
-- ============================================
-- tools_registry
DROP TRIGGER IF EXISTS update_tools_registry_updated_at ON tools_registry;
CREATE TRIGGER update_tools_registry_updated_at 
    BEFORE UPDATE ON tools_registry
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- skills_library
DROP TRIGGER IF EXISTS update_skills_library_updated_at ON skills_library;
CREATE TRIGGER update_skills_library_updated_at 
    BEFORE UPDATE ON skills_library
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. RLS 政策
-- ============================================

-- 啟用 RLS
ALTER TABLE tools_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_executions_log ENABLE ROW LEVEL SECURITY;

-- tools_registry: 所有人可讀，只有 SUPER_ADMIN 可寫
DROP POLICY IF EXISTS "所有人可讀取工具列表" ON tools_registry;
CREATE POLICY "所有人可讀取工具列表" ON tools_registry
    FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "超級管理員可管理工具" ON tools_registry;
CREATE POLICY "超級管理員可管理工具" ON tools_registry
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

-- skills_library: 公開技能所有人可讀，私人技能只有擁有者可讀
DROP POLICY IF EXISTS "所有人可讀取公開技能" ON skills_library;
CREATE POLICY "所有人可讀取公開技能" ON skills_library
    FOR SELECT USING (is_public = TRUE AND is_active = TRUE);

DROP POLICY IF EXISTS "擁有者可讀取自己的技能" ON skills_library;
CREATE POLICY "擁有者可讀取自己的技能" ON skills_library
    FOR SELECT USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "超級管理員可讀取所有技能" ON skills_library;
CREATE POLICY "超級管理員可讀取所有技能" ON skills_library
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

DROP POLICY IF EXISTS "使用者可建立企業技能" ON skills_library;
CREATE POLICY "使用者可建立企業技能" ON skills_library
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL 
        AND owner_user_id = auth.uid()
        AND source = 'enterprise'
    );

DROP POLICY IF EXISTS "擁有者可更新自己的技能" ON skills_library;
CREATE POLICY "擁有者可更新自己的技能" ON skills_library
    FOR UPDATE USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "擁有者可刪除自己的技能" ON skills_library;
CREATE POLICY "擁有者可刪除自己的技能" ON skills_library
    FOR DELETE USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "超級管理員可管理所有技能" ON skills_library;
CREATE POLICY "超級管理員可管理所有技能" ON skills_library
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

-- tool_executions_log: 使用者可讀取自己的，管理員可讀取全部
DROP POLICY IF EXISTS "使用者可讀取自己的工具執行記錄" ON tool_executions_log;
CREATE POLICY "使用者可讀取自己的工具執行記錄" ON tool_executions_log
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "管理員可讀取所有工具執行記錄" ON tool_executions_log;
CREATE POLICY "管理員可讀取所有工具執行記錄" ON tool_executions_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
        )
    );

-- 系統寫入 (需透過 Service Role)
DROP POLICY IF EXISTS "系統可寫入工具執行記錄" ON tool_executions_log;
CREATE POLICY "系統可寫入工具執行記錄" ON tool_executions_log
    FOR INSERT WITH CHECK (TRUE);

-- ============================================
-- Migration 完成
-- ============================================
