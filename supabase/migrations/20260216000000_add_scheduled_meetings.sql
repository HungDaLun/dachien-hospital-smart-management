-- Add scheduled_start_time to meetings table
ALTER TABLE public.meetings
ADD COLUMN IF NOT EXISTS scheduled_start_time TIMESTAMPTZ DEFAULT NULL;

-- 允許 status 欄位接受 'scheduled' 值
ALTER TABLE public.meetings
DROP CONSTRAINT IF EXISTS meetings_status_check;

ALTER TABLE public.meetings
ADD CONSTRAINT meetings_status_check 
CHECK (status IN ('in_progress', 'paused', 'completed', 'scheduled'));
