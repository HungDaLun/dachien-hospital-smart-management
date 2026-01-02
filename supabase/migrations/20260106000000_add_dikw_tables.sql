-- ============================================
-- 新增 DIKW 引擎資料表
-- 執行日期: 2026-01-06
-- 目的: 建立知識框架與實例資料表，並擴充檔案資料表以支援 AI 清洗內容
-- ============================================

-- 1. 建立 knowledge_frameworks (知識框架定義)
CREATE TABLE IF NOT EXISTS knowledge_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'swot', 'pestle'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  structure_schema JSONB NOT NULL DEFAULT '{}'::jsonb, -- Zod schema for UI
  visual_type VARCHAR(50) DEFAULT 'default', -- 'quadrant', 'list'
  ui_config JSONB DEFAULT '{}'::jsonb, -- Color, icon, layout
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- 2. 建立 knowledge_instances (知識實例 - AI 填寫結果)
CREATE TABLE IF NOT EXISTS knowledge_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID REFERENCES knowledge_frameworks(id) ON DELETE CASCADE,
  target_subject VARCHAR(200), -- 該知識的主體，例如 "Product X"
  content_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- 實際填入的內容
  completeness_score FLOAT DEFAULT 0, -- 0.0 - 1.0
  confidence_score FLOAT DEFAULT 0, -- 0.0 - 1.0
  source_file_ids UUID[], -- 關聯的原始檔案 ID (Data Lineage)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- 3. 修改 files 資料表 (新增 AI 清洗欄位)
DO $$
BEGIN
  -- 新增 markdown_content 欄位 (如果不存在)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'markdown_content') THEN
    ALTER TABLE files ADD COLUMN markdown_content TEXT;
  END IF;

  -- 新增 metadata_analysis 欄位 (如果不存在)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'metadata_analysis') THEN
    ALTER TABLE files ADD COLUMN metadata_analysis JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ============================================
-- 4. 設定 RLS 權限
-- ============================================

-- 啟用 RLS
ALTER TABLE knowledge_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_instances ENABLE ROW LEVEL SECURITY;

-- 4.1 knowledge_frameworks 權限
-- 讀取: 所有登入使用者皆可讀取框架定義
CREATE POLICY "所有使用者皆可讀取知識框架" ON knowledge_frameworks
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 寫入: 僅 SUPER_ADMIN 與 DEPT_ADMIN 可管理框架定義
CREATE POLICY "管理員可管理知識框架" ON knowledge_frameworks
  FOR ALL
  USING (
    is_super_admin() = true OR 
    get_user_role() = 'DEPT_ADMIN'
  );

-- 4.2 knowledge_instances 權限
-- 讀取: 所有登入使用者皆可讀取知識實例 (未來可視需求加入部門隔離)
CREATE POLICY "所有使用者皆可讀取知識實例" ON knowledge_instances
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 寫入: SUPER_ADMIN, DEPT_ADMIN, EDITOR 可創建與更新實例
-- 這裡我們使用 Helper Function 簡化判斷
CREATE POLICY "授權人員可管理知識實例" ON knowledge_instances
  FOR ALL
  USING (
    is_super_admin() = true OR
    get_user_role() IN ('DEPT_ADMIN', 'EDITOR')
  );

-- ============================================
-- 5. 插入自動更新 updated_at 的 Trigger
-- ============================================

-- 假設 update_updated_at_column 函式已存在 (通常在 initial_schema 中建立)
-- 若無，需在此建立。安全起見先檢查並建立。

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_knowledge_frameworks_modtime ON knowledge_frameworks;
CREATE TRIGGER update_knowledge_frameworks_modtime
    BEFORE UPDATE ON knowledge_frameworks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_instances_modtime ON knowledge_instances;
CREATE TRIGGER update_knowledge_instances_modtime
    BEFORE UPDATE ON knowledge_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. 插入 Seed Data (預設框架)
-- ============================================
-- 插入 SWOT 框架
INSERT INTO knowledge_frameworks (code, name, description, structure_schema, visual_type)
VALUES (
  'swot', 
  'SWOT 分析', 
  '用於分析企業優勢、劣勢、機會與威脅的標準框架',
  '{
    "sections": [
      {"key": "strengths", "label": "優勢 (Strengths)", "type": "list"},
      {"key": "weaknesses", "label": "劣勢 (Weaknesses)", "type": "list"},
      {"key": "opportunities", "label": "機會 (Opportunities)", "type": "list"},
      {"key": "threats", "label": "威脅 (Threats)", "type": "list"}
    ]
  }'::jsonb,
  'quadrant'
) ON CONFLICT (code) DO NOTHING;

-- 插入 PESTLE 框架
INSERT INTO knowledge_frameworks (code, name, description, structure_schema, visual_type)
VALUES (
  'pestle', 
  'PESTLE 宏觀分析', 
  '用於分析政治、經濟、社會、科技、法律與環境因素',
   '{
    "sections": [
      {"key": "political", "label": "政治 (Political)", "type": "text"},
      {"key": "economic", "label": "經濟 (Economic)", "type": "text"},
      {"key": "social", "label": "社會 (Social)", "type": "text"},
      {"key": "technological", "label": "科技 (Technological)", "type": "text"},
      {"key": "legal", "label": "法律 (Legal)", "type": "text"},
      {"key": "environmental", "label": "環境 (Environmental)", "type": "text"}
    ]
  }'::jsonb,
  'list'
) ON CONFLICT (code) DO NOTHING;
