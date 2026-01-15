-- 新增 speaker_name 欄位到 meeting_messages 表
-- 用於存儲發言者名稱（部門名稱或 Agent 名稱），方便前端直接顯示

ALTER TABLE public.meeting_messages 
ADD COLUMN IF NOT EXISTS speaker_name TEXT;

-- 為現有記錄補充 speaker_name（如果有的話）
-- 從 meeting_participants 表中查詢對應的名稱
UPDATE public.meeting_messages mm
SET speaker_name = mp.name
FROM public.meeting_participants mp
WHERE mm.speaker_id = mp.participant_id
  AND mm.meeting_id = mp.meeting_id
  AND mm.speaker_name IS NULL;

-- 新增註解
COMMENT ON COLUMN public.meeting_messages.speaker_name IS '發言者名稱（部門名稱或顧問 Agent 名稱），反正規化以便前端直接顯示';
