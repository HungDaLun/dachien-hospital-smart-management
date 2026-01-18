-- 1. 新增「是否可被調度」欄位 (預設為 true)
ALTER TABLE agents ADD COLUMN is_delegatable BOOLEAN DEFAULT true;

-- 2. 新增「專長標籤」欄位 (用於 LLM 路由判斷)
ALTER TABLE agents ADD COLUMN specialization_tags TEXT[];
