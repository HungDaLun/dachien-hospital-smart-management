-- Add meeting modes and phases columns
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS mode text DEFAULT 'quick_sync', -- 'quick_sync', 'deep_dive', 'result_driven'
ADD COLUMN IF NOT EXISTS current_phase text DEFAULT 'diverge', -- 'diverge', 'debate', 'converge', 'audit'
ADD COLUMN IF NOT EXISTS smart_score integer DEFAULT 0, -- Current SMART quality score of the conclusion
ADD COLUMN IF NOT EXISTS turn_count integer DEFAULT 0,  -- Current total turn count
ADD COLUMN IF NOT EXISTS max_turns integer;             -- Max turns for turn-based mode (null for infinite)
