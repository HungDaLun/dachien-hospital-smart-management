-- ============================================
-- 確保 Gemini 模型版本設定為 3.x preview 系列
-- 建立日期: 2026-01-19
-- 目的: 確保系統設定中的 gemini_model_version 使用 gemini-3-flash-preview
--       超級管家使用 gemini-3-pro-preview（已在程式碼中硬編碼）
-- ============================================

-- 更新或插入 gemini_model_version 設定
-- 如果設定不存在，則插入；如果已存在，則更新為 gemini-3-flash-preview
INSERT INTO system_settings (setting_key, setting_value, is_encrypted, description)
VALUES ('gemini_model_version', 'gemini-3-flash-preview', FALSE, 'Gemini 模型版本')
ON CONFLICT (setting_key) 
DO UPDATE SET 
    setting_value = 'gemini-3-flash-preview',
    updated_at = NOW();
