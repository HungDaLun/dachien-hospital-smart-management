-- 新增 metadata 欄位到 meeting_messages 表
-- 用於儲存引用驗證結果、幻覺警告等後設資料

ALTER TABLE public.meeting_messages 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;

COMMENT ON COLUMN public.meeting_messages.metadata IS '訊息後設資料，包含引用驗證結果、疑似幻覺警告等';

-- 創建索引以支援對 metadata 的查詢（如果需要查找有幻覺警告的訊息）
CREATE INDEX IF NOT EXISTS idx_meeting_messages_metadata_gin 
ON public.meeting_messages USING gin(metadata) 
WHERE metadata IS NOT NULL;
