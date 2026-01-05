-- Create knowledge_feedback_events table
CREATE TABLE IF NOT EXISTS knowledge_feedback_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL, -- Optional: which agent generated/used this
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL, -- Optional: which user gave feedback
    session_id VARCHAR(255), -- Optional: session context
    
    source VARCHAR(30) NOT NULL, -- user_explicit, user_implicit, agent_self
    feedback_type VARCHAR(30) NOT NULL, -- helpful, not_helpful, etc.
    score DECIMAL(3,2) NOT NULL, -- -1.0 to 1.0
    details JSONB DEFAULT '{}', -- Extra info
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add feedback statistics to files table
ALTER TABLE files ADD COLUMN IF NOT EXISTS feedback_score DECIMAL(3,2) DEFAULT 0.5; -- Weighted score 0.0-1.0
ALTER TABLE files ADD COLUMN IF NOT EXISTS feedback_count INTEGER DEFAULT 0; -- Total explicit feedback events
ALTER TABLE files ADD COLUMN IF NOT EXISTS positive_ratio DECIMAL(3,2) DEFAULT 0.0; -- Ratio of positive feedback

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_feedback_file_id ON knowledge_feedback_events(file_id);

-- Comments
COMMENT ON TABLE knowledge_feedback_events IS 'Stores feedback events for knowledge files to enable the learning loop.';
COMMENT ON COLUMN files.feedback_score IS 'Quality score derived from feedback (0.0-1.0)';
