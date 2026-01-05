-- Create user_interests table
CREATE TABLE IF NOT EXISTS user_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Link to auth.users (if available) or user_profiles
    concept VARCHAR(255) NOT NULL, -- Tag or Concept Name
    score DECIMAL(3,2) DEFAULT 0.5, -- Interest Level (0-1)
    source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'inferred', 'feedback'
    
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, concept)
);

-- Create push_logs table to track what has been recommended/sent
CREATE TABLE IF NOT EXISTS knowledge_push_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    push_type VARCHAR(50) NOT NULL, -- 'recommendation', 'alert', 'email'
    score_at_push DECIMAL(3,2), -- Recommendation score at time of push
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_push_logs_user ON knowledge_push_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_push_logs_file ON knowledge_push_logs(file_id);

-- Comments
COMMENT ON TABLE user_interests IS 'Tracks inferred or explicit user interests for knowledge recommendation.';
COMMENT ON TABLE knowledge_push_logs IS 'History of proactive knowledge pushes to avoid duplicates.';
