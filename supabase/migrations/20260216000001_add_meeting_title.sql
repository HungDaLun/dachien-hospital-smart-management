-- Add title column to meetings table for "Meeting Name"
-- The existing 'topic' column will serve as the "Agenda/Content"
ALTER TABLE public.meetings
ADD COLUMN IF NOT EXISTS title TEXT;

-- Update existing meetings to use topic as title (fallback)
UPDATE public.meetings
SET title = topic
WHERE title IS NULL;
