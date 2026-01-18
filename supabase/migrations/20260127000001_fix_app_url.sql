-- 修復 app_url 設定
-- 將 app_url 從 localhost:3000 更新為生產環境 URL
-- Created: 2026-01-27

-- 更新 app_url 為生產環境 URL
UPDATE system_settings
SET 
    setting_value = 'https://nexus-ai.zeabur.app',
    updated_at = NOW()
WHERE setting_key = 'app_url'
  AND setting_value = 'http://localhost:3000';

-- 如果設定不存在，則插入預設值
INSERT INTO system_settings (setting_key, setting_value, is_encrypted, description)
VALUES (
    'app_url',
    'https://nexus-ai.zeabur.app',
    FALSE,
    '應用程式 URL'
)
ON CONFLICT (setting_key) DO NOTHING;

-- 驗證更新結果
DO $$
DECLARE
    current_value TEXT;
BEGIN
    SELECT setting_value INTO current_value
    FROM system_settings
    WHERE setting_key = 'app_url';
    
    IF current_value IS NULL THEN
        RAISE EXCEPTION 'app_url 設定不存在';
    END IF;
    
    IF current_value LIKE '%localhost%' THEN
        RAISE WARNING 'app_url 仍包含 localhost: %', current_value;
    END IF;
    
    RAISE NOTICE 'app_url 已更新為: %', current_value;
END $$;
