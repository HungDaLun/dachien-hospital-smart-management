-- ============================================
-- 更新 Gemini 模型版本註解
-- 建立日期: 2026-01-09
-- 目的: 更新 agents.model_version 註解，說明支援的 Gemini 3 Preview 模型
-- ============================================

-- 更新 agents.model_version 欄位註解
COMMENT ON COLUMN agents.model_version IS 
  'AI 模型版本。支援的模型：gemini-3-flash-preview（速度最快、成本較低，預設）、gemini-3-pro-preview（推論能力最強）';
