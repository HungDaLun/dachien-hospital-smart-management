-- Migration: 20260221000000_extend_safeguards.sql
-- 擴充 AI 品質防護相關結構

-- 1. 為 meeting_messages 補齊防護欄位
ALTER TABLE meeting_messages
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS confidence_reasoning TEXT,
ADD COLUMN IF NOT EXISTS selected_for_audit BOOLEAN DEFAULT FALSE;

-- 2. 為 chat_messages 新增審計抽樣欄位
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS selected_for_audit BOOLEAN DEFAULT FALSE;

-- 3. 建立審計報告表
CREATE TABLE IF NOT EXISTS audit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL, -- e.g., 'ai_quality_monthly'
  report_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- 4. 建立會議訊息反饋表
CREATE TABLE IF NOT EXISTS meeting_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES meeting_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  rating INTEGER CHECK (rating IN (1, -1)), -- 1: 正評, -1: 負評
  reason_code TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 建立索引以加速審計與查詢
CREATE INDEX IF NOT EXISTS idx_chat_messages_audit 
ON chat_messages(selected_for_audit, needs_review, created_at);

CREATE INDEX IF NOT EXISTS idx_meeting_messages_audit 
ON meeting_messages(selected_for_audit, created_at);

CREATE INDEX IF NOT EXISTS idx_meeting_feedback_message_id ON meeting_feedback(message_id);

-- 6. 註解說明
COMMENT ON TABLE audit_reports IS '儲存 AI 品質自動化審計報告';
COMMENT ON TABLE meeting_feedback IS '儲存對於會議 AI 發言的正負評反饋';
COMMENT ON COLUMN meeting_messages.selected_for_audit IS '標記此訊息是否被抽樣用於品質審計';
COMMENT ON COLUMN chat_messages.selected_for_audit IS '標記此訊息是否被抽樣用於品質審計';
