-- 20260126000000_add_war_room_infrastructure.sql

-- 1. 戰情室配置表
CREATE TABLE IF NOT EXISTS war_room_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,

    -- 外部情資監控主題
    watch_topics JSONB DEFAULT '[]',

    -- 儀表板佈局偏好
    layout_config JSONB DEFAULT '{
        "kpi_order": ["strategy", "operations", "financial", "risk", "intelligence"],
        "department_display_mode": "grid",
        "show_ai_insights": true
    }',

    -- 通知偏好
    notification_preferences JSONB DEFAULT '{
        "email_daily_summary": true,
        "push_critical_risks": true,
        "push_high_opportunities": false
    }',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for war_room_config
ALTER TABLE war_room_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own war room config"
  ON war_room_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own war room config"
  ON war_room_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own war room config"
  ON war_room_config FOR UPDATE
  USING (auth.uid() = user_id);


-- 2. 指標定義表 (Metric Store Definitions)
CREATE TABLE IF NOT EXISTS metric_definitions (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'finance_revenue'
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20),
    granularity VARCHAR(20),
    keywords JSONB DEFAULT '[]',
    conflict_policy VARCHAR(20) DEFAULT 'latest_wins'
);

-- RLS for metric_definitions (Read-only for most users, Admin can manage)
ALTER TABLE metric_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view metric definitions"
  ON metric_definitions FOR SELECT
  TO authenticated
  USING (true);


-- 3. 指標數值表 (Metric Store Values)
CREATE TABLE IF NOT EXISTS metric_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_id VARCHAR(50) REFERENCES metric_definitions(id),
    value DECIMAL(20, 4) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL, -- 數據時間點
    dimensions JSONB DEFAULT '{}',  -- 維度
    
    source_file_id UUID REFERENCES files(id), -- 可以為空，若非來自檔案
    confidence DECIMAL(3, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    user_id UUID REFERENCES user_profiles(id) -- 用於權限控制，記錄誰產生的
);

CREATE INDEX idx_metrics_query_basic ON metric_values (metric_id, timestamp);

-- RLS for metric_values
ALTER TABLE metric_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view metrics they have access to"
  ON metric_values FOR SELECT
  TO authenticated
  USING (true); -- 暫時開放，後續結合部門權限

CREATE POLICY "Users can insert metrics"
  ON metric_values FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);


-- 4. 洞察片段表 (Insight Store)
CREATE TABLE IF NOT EXISTS insight_snippets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_file_id UUID REFERENCES files(id),
    department_id UUID REFERENCES departments(id),
    
    content TEXT NOT NULL,
    tags JSONB DEFAULT '[]',
    significance DECIMAL(3, 2) DEFAULT 0.5, -- 重要性
    
    is_pushed BOOLEAN DEFAULT FALSE, -- 是否已推播
    created_at TIMESTAMPTZ DEFAULT NOW(),

    user_id UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_insights_dept_created ON insight_snippets (department_id, created_at DESC);

-- RLS for insight_snippets
ALTER TABLE insight_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view insights"
  ON insight_snippets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert insights"
  ON insight_snippets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);


-- 5. 外部新聞情資表
CREATE TABLE IF NOT EXISTS external_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    topic_id VARCHAR(255) NOT NULL,

    -- 新聞基本資訊
    title TEXT NOT NULL,
    source VARCHAR(255) NOT NULL,
    url TEXT,
    content TEXT,
    published_at TIMESTAMPTZ NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),

    -- AI 分析結果
    relevance_score DECIMAL(3,2) DEFAULT 0,
    risk_level VARCHAR(10),
    impact_areas JSONB DEFAULT '[]',
    sentiment VARCHAR(10),
    ai_summary TEXT,
    key_points JSONB DEFAULT '[]',
    affected_entities JSONB DEFAULT '{}',
    recommended_actions JSONB DEFAULT '[]',

    -- 使用者互動
    is_read BOOLEAN DEFAULT FALSE,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    user_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',

    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intelligence_user_topic ON external_intelligence (user_id, topic_id);
CREATE INDEX idx_intelligence_risk_pending ON external_intelligence (risk_level) WHERE status = 'pending';
CREATE INDEX idx_intelligence_published_desc ON external_intelligence (published_at DESC);

-- RLS for external_intelligence
ALTER TABLE external_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own intelligence"
  ON external_intelligence FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own intelligence"
  ON external_intelligence FOR ALL
  USING (auth.uid() = user_id);


-- 6. 部門日報表
CREATE TABLE IF NOT EXISTS department_daily_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    brief_date DATE NOT NULL,

    -- AI 生成內容
    top_updates JSONB DEFAULT '[]',
    key_metrics JSONB DEFAULT '[]',
    urgent_items JSONB DEFAULT '[]',
    ai_summary TEXT,
    insights JSONB DEFAULT '[]',

    -- 統計數據
    stats JSONB DEFAULT '{
        "total_files": 0,
        "files_updated_today": 0,
        "active_agents": 0,
        "conversations_count": 0,
        "knowledge_health_score": 0
    }',

    generated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(department_id, brief_date)
);

-- RLS for department_daily_briefs
ALTER TABLE department_daily_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view briefs"
  ON department_daily_briefs FOR SELECT
  TO authenticated
  USING (true); -- 權限細化由應用層處理


-- 7. 戰略建議表
CREATE TABLE IF NOT EXISTS strategic_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,

    priority VARCHAR(10) NOT NULL,
    category VARCHAR(30) NOT NULL,
    title TEXT NOT NULL,
    problem TEXT,
    recommendation TEXT NOT NULL,
    expected_benefit TEXT,
    evidence_files UUID[] DEFAULT '{}',
    next_steps JSONB DEFAULT '[]',

    -- 使用者互動
    status VARCHAR(20) DEFAULT 'pending',
    assigned_to UUID REFERENCES user_profiles(id),
    due_date DATE,
    completed_at TIMESTAMPTZ,
    user_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendations_user_week ON strategic_recommendations (user_id, week_start_date);
CREATE INDEX idx_recommendations_status ON strategic_recommendations (status);

-- RLS
ALTER TABLE strategic_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recommendations"
  ON strategic_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own recommendations"
  ON strategic_recommendations FOR ALL
  USING (auth.uid() = user_id);


-- 8. 跨部門洞察表
CREATE TABLE IF NOT EXISTS cross_department_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

    type VARCHAR(20) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    departments UUID[] DEFAULT '{}',
    related_files UUID[] DEFAULT '{}',
    importance_score DECIMAL(3,2) DEFAULT 0,
    recommended_action TEXT,

    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_insights_user_id ON cross_department_insights (user_id);
CREATE INDEX idx_insights_importance_desc ON cross_department_insights (importance_score DESC);

-- RLS
ALTER TABLE cross_department_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own insights"
  ON cross_department_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own insights"
  ON cross_department_insights FOR ALL
  USING (auth.uid() = user_id);
