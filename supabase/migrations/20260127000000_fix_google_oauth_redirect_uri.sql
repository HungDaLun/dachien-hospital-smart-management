-- 修復 Google OAuth Redirect URI
-- 將 google_oauth_redirect_uri 更新為包含 /calendar 路徑段的正確值
-- Created: 2026-01-27

-- 更新 google_oauth_redirect_uri，確保包含 /calendar/callback 路徑
UPDATE system_settings
SET 
    setting_value = CASE
        -- 如果當前值是生產環境 URL，更新為包含 /calendar 的版本
        WHEN setting_value = 'https://nexus-ai.zeabur.app/api/auth/google/callback' 
        THEN 'https://nexus-ai.zeabur.app/api/auth/google/calendar/callback'
        
        -- 如果當前值是本地開發 URL，更新為包含 /calendar 的版本
        WHEN setting_value = 'http://localhost:3000/api/auth/google/callback' 
        THEN 'http://localhost:3000/api/auth/google/calendar/callback'
        
        -- 如果當前值已經包含 /calendar，保持不變
        WHEN setting_value LIKE '%/api/auth/google/calendar/callback' 
        THEN setting_value
        
        -- 如果當前值不包含 /calendar，但包含 /api/auth/google/callback，替換為 /calendar/callback
        WHEN setting_value LIKE '%/api/auth/google/callback' 
        THEN REPLACE(setting_value, '/api/auth/google/callback', '/api/auth/google/calendar/callback')
        
        -- 其他情況，使用預設的生產環境 URL
        ELSE 'https://nexus-ai.zeabur.app/api/auth/google/calendar/callback'
    END,
    updated_at = NOW()
WHERE setting_key = 'google_oauth_redirect_uri';

-- 如果設定不存在，則插入預設值
INSERT INTO system_settings (setting_key, setting_value, is_encrypted, description)
VALUES (
    'google_oauth_redirect_uri',
    'https://nexus-ai.zeabur.app/api/auth/google/calendar/callback',
    FALSE,
    'Google OAuth Redirect URI'
)
ON CONFLICT (setting_key) DO NOTHING;

-- 驗證更新結果
DO $$
DECLARE
    current_value TEXT;
BEGIN
    SELECT setting_value INTO current_value
    FROM system_settings
    WHERE setting_key = 'google_oauth_redirect_uri';
    
    IF current_value IS NULL THEN
        RAISE EXCEPTION 'google_oauth_redirect_uri 設定不存在';
    END IF;
    
    IF NOT current_value LIKE '%/api/auth/google/calendar/callback' THEN
        RAISE WARNING 'google_oauth_redirect_uri 可能仍不正確: %', current_value;
    END IF;
    
    RAISE NOTICE 'google_oauth_redirect_uri 已更新為: %', current_value;
END $$;
