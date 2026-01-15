-- ============================================
-- 修復 agents.model_version 預設值不一致問題
-- 建立日期: 2026-01-05
-- 目的: 統一 agents.model_version 的預設值為 'gemini-3-pro'
--       以符合資料庫實際使用的值
-- ============================================

-- 將預設值改為 'gemini-3-pro'（符合 2026 最新標準）
ALTER TABLE agents 
ALTER COLUMN model_version SET DEFAULT 'gemini-3-pro';

-- 註解說明
COMMENT ON COLUMN agents.model_version IS 'AI 模型版本，預設為 gemini-3-pro';
