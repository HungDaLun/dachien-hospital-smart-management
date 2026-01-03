-- ============================================
-- 強制統一 Gemini 模型版本名稱
-- 建立日期: 2026-01-11
-- 目的: 將所有舊的 gemini-3-flash/pro 修正為標準的 -preview 後綴，並更新預設值
-- ============================================

-- 1. 修正現有資料 (Data Migration)
-- 將 'gemini-3-flash' -> 'gemini-3-flash-preview'
UPDATE agents 
SET model_version = 'gemini-3-flash-preview' 
WHERE model_version = 'gemini-3-flash';

-- 將 'gemini-3-pro' -> 'gemini-3-pro-preview'
UPDATE agents 
SET model_version = 'gemini-3-pro-preview' 
WHERE model_version = 'gemini-3-pro';

-- 2. 修改欄位預設值 (Schema Migration)
-- 將預設值設為 'gemini-3-flash-preview' (速度與成本最佳化)
ALTER TABLE agents 
ALTER COLUMN model_version SET DEFAULT 'gemini-3-flash-preview';

-- 3. 更新註解 (Documentation)
COMMENT ON COLUMN agents.model_version IS 
  'AI 模型版本。嚴格限制使用：gemini-3-flash-preview（預設）、gemini-3-pro-preview';

-- 4. 再次驗證 (Safety Check)
-- 確保沒有遺漏的舊格式（理論上此查詢不應回傳任何結果）
-- SELECT id, name, model_version FROM agents WHERE model_version NOT LIKE '%-preview';
