-- Add 'chairperson' to the allowed speaker_type values for meeting_messages

-- 1. Drop the existing check constraint
ALTER TABLE public.meeting_messages DROP CONSTRAINT IF EXISTS meeting_messages_speaker_type_check;

-- 2. Add the updated check constraint with 'chairperson' included
ALTER TABLE public.meeting_messages 
  ADD CONSTRAINT meeting_messages_speaker_type_check 
  CHECK (speaker_type IN ('department', 'consultant', 'user', 'system', 'chairperson'));

-- 3. Comment for documentation
COMMENT ON COLUMN public.meeting_messages.speaker_type IS 
  'Speaker type: department, consultant, user, system, or chairperson (AI moderator)';
