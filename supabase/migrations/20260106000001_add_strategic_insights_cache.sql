-- 建立 AI 戰略分析快取表
-- 用於儲存每日自動產生的企業戰略分析報告，避免每次頁面刷新都呼叫 AI

CREATE TABLE ai_strategic_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,                    -- AI 生成的分析內容（純文字，已清理 Markdown）
  raw_content TEXT,                         -- 原始 AI 輸出（含 Markdown）
  generated_at TIMESTAMPTZ DEFAULT NOW(),   -- 生成時間
  model_version TEXT DEFAULT 'gemini-3-pro-preview',
  context_snapshot JSONB,                   -- 當時的數據快照（用於追蹤分析依據）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)                           -- 每個使用者只保留最新一筆
);

-- 建立索引加速查詢
CREATE INDEX idx_strategic_insights_user_id ON ai_strategic_insights(user_id);
CREATE INDEX idx_strategic_insights_generated_at ON ai_strategic_insights(generated_at DESC);

-- 啟用 RLS
ALTER TABLE ai_strategic_insights ENABLE ROW LEVEL SECURITY;

-- RLS 政策：使用者只能讀取自己的分析
CREATE POLICY "Users can view their own insights" ON ai_strategic_insights
  FOR SELECT USING (auth.uid() = user_id);

-- RLS 政策：只有系統（Service Role）可以寫入
CREATE POLICY "Service role can manage insights" ON ai_strategic_insights
  FOR ALL USING (true)
  WITH CHECK (true);

-- 建立更新時間觸發器
CREATE TRIGGER update_ai_strategic_insights_updated_at
  BEFORE UPDATE ON ai_strategic_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 註解說明
COMMENT ON TABLE ai_strategic_insights IS '儲存每日 AI 戰略分析報告的快取表，每日凌晨 5:00 自動更新';
COMMENT ON COLUMN ai_strategic_insights.content IS '已清理 Markdown 格式的分析內容，直接用於前端顯示';
COMMENT ON COLUMN ai_strategic_insights.context_snapshot IS '分析時的數據快照，包含檔案摘要數量、風險數量等';
