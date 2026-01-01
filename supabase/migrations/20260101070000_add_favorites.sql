-- 建立使用者最愛資源表
-- 支援 Agent, File 等不同類型的資源收藏

CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('AGENT', 'FILE')),
  resource_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 確保一個資源只能被同個使用者收藏一次
  UNIQUE(user_id, resource_type, resource_id)
);

-- 建立索引以加速查詢
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_resource ON user_favorites(resource_type, resource_id);

-- 啟用 RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS 政策
-- 1. 使用者可以查看自己的最愛
CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

-- 2. 使用者可以新增自己的最愛
CREATE POLICY "Users can add own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. 使用者可以刪除自己的最愛
CREATE POLICY "Users can remove own favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);
