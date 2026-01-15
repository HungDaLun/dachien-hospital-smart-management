-- 系統設定表 (用於儲存可編輯的設定，敏感資料加密儲存)
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES user_profiles(id)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- RLS 政策
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 只有 SUPER_ADMIN 可以讀寫
CREATE POLICY "super_admin_full_access" ON system_settings
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

-- 插入預設設定
INSERT INTO system_settings (setting_key, setting_value, is_encrypted, description) VALUES
    ('gemini_api_key', NULL, TRUE, 'Gemini API 金鑰'),
    ('gemini_model_version', 'gemini-3-flash-preview', FALSE, 'Gemini 模型版本'),
    ('s3_endpoint', NULL, TRUE, 'S3/MinIO 端點'),
    ('s3_access_key', NULL, TRUE, 'S3 存取金鑰'),
    ('s3_secret_key', NULL, TRUE, 'S3 密鑰'),
    ('s3_bucket', NULL, FALSE, 'S3 儲存桶名稱'),
    ('s3_region', NULL, FALSE, 'S3 區域'),
    ('app_url', 'http://localhost:3000', FALSE, '應用程式 URL')
ON CONFLICT (setting_key) DO NOTHING;

-- 設定變更審計日誌
CREATE TABLE IF NOT EXISTS system_settings_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by UUID REFERENCES user_profiles(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT
);

-- 審計日誌索引
CREATE INDEX IF NOT EXISTS idx_system_settings_audit_key ON system_settings_audit(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_audit_changed_at ON system_settings_audit(changed_at);
