-- 設定本地開發環境 URL
-- 將 app_url 和 google_oauth_redirect_uri 更新為本地開發環境的值
-- Created: 2026-01-19

-- 更新 app_url 為本地開發環境 URL
UPDATE system_settings
SET 
    setting_value = 'http://localhost:3000',
    updated_at = NOW()
WHERE setting_key = 'app_url';

-- 如果設定不存在，則插入預設值
INSERT INTO system_settings (setting_key, setting_value, is_encrypted, description)
VALUES (
    'app_url',
    'http://localhost:3000',
    FALSE,
    '應用程式 URL'
)
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = 'http://localhost:3000',
    updated_at = NOW();

-- 更新 google_oauth_redirect_uri 為本地開發環境 URL
UPDATE system_settings
SET 
    setting_value = 'http://localhost:3000/api/auth/google/calendar/callback',
    updated_at = NOW()
WHERE setting_key = 'google_oauth_redirect_uri';

-- 如果設定不存在，則插入預設值
INSERT INTO system_settings (setting_key, setting_value, is_encrypted, description)
VALUES (
    'google_oauth_redirect_uri',
    'http://localhost:3000/api/auth/google/calendar/callback',
    FALSE,
    'Google OAuth Redirect URI'
)
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = 'http://localhost:3000/api/auth/google/calendar/callback',
    updated_at = NOW();

-- 驗證更新結果
DO $$
DECLARE
    app_url_value TEXT;
    redirect_uri_value TEXT;
BEGIN
    SELECT setting_value INTO app_url_value
    FROM system_settings
    WHERE setting_key = 'app_url';
    
    SELECT setting_value INTO redirect_uri_value
    FROM system_settings
    WHERE setting_key = 'google_oauth_redirect_uri';
    
    IF app_url_value IS NULL THEN
        RAISE EXCEPTION 'app_url 設定不存在';
    END IF;
    
    IF redirect_uri_value IS NULL THEN
        RAISE EXCEPTION 'google_oauth_redirect_uri 設定不存在';
    END IF;
    
    RAISE NOTICE '✅ app_url 已設定為: %', app_url_value;
    RAISE NOTICE '✅ google_oauth_redirect_uri 已設定為: %', redirect_uri_value;
END $$;
