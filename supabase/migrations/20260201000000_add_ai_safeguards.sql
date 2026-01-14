-- Add AI Quality Safeguards columns to chat_messages table

-- Citations: Stores structured citation data (source, uri, content snippet)
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS citations JSONB DEFAULT '[]';

-- Confidence Score: AI's self-reported confidence (0.0 - 1.0)
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2);

-- Confidence Licensing: Why the AI feels this way
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS confidence_reasoning TEXT;

-- Manual Review Trigger: Whether this message was flagged for human review
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE;

-- Review Triggers: Array of categories that triggered the review (financial, legal, safety, etc.)
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS review_triggers TEXT[];

-- Review Status Tracking
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES user_profiles(id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_citations ON chat_messages USING GIN (citations);
CREATE INDEX IF NOT EXISTS idx_chat_messages_low_confidence ON chat_messages(confidence_score) WHERE confidence_score < 0.6;
CREATE INDEX IF NOT EXISTS idx_chat_messages_needs_review ON chat_messages(needs_review) WHERE needs_review = TRUE;

-- Comments for documentation
COMMENT ON COLUMN chat_messages.citations IS 'Detailed source citations for the AI response';
COMMENT ON COLUMN chat_messages.confidence_score IS 'AI self-assessed confidence score (0.0-1.0)';
COMMENT ON COLUMN chat_messages.needs_review IS 'Flag automatically set by review-detector or low confidence';
