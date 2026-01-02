-- ============================================
-- 修復 agents.model_version 預設值不一致問題
-- 建立日期: 2026-01-05
-- 目的: 統一 agents.model_version 的預設值為 'gemini-1.5-pro'
--       以符合資料庫實際使用的值
-- ============================================

-- 將預設值改為 'gemini-1.5-pro'（與資料庫實際值一致）
ALTER TABLE agents 
ALTER COLUMN model_version SET DEFAULT 'gemini-1.5-pro';

-- 註解說明
COMMENT ON COLUMN agents.model_version IS 'AI 模型版本，預設為 gemini-1.5-pro';
