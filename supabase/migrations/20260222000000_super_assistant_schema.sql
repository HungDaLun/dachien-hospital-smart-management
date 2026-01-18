-- Super Assistant Schema Migration
-- Version: 1.0
-- Created: 2026-02-22

-- 1. 擴充系統設定 (System Settings)
INSERT INTO system_settings (setting_key, setting_value, is_encrypted, description) VALUES
    -- Line Messaging API 設定
    ('line_channel_access_token', NULL, TRUE, 'Line Channel Access Token'),
    ('line_channel_secret', NULL, TRUE, 'Line Channel Secret'),
    ('line_webhook_enabled', 'false', FALSE, '是否啟用 Line Webhook'),
    
    -- Google OAuth 設定 (系統級)
    ('google_oauth_client_id', NULL, FALSE, 'Google OAuth Client ID'),
    ('google_oauth_client_secret', NULL, TRUE, 'Google OAuth Client Secret'),
    ('google_oauth_redirect_uri', NULL, FALSE, 'Google OAuth Redirect URI'),
    
    -- Super Assistant 全域設定
    ('calendar_sync_interval_minutes', '15', FALSE, '行事曆同步間隔 (分鐘)'),
    ('notification_daily_briefing_time', '08:00', FALSE, '每日簡報發送時間')
ON CONFLICT (setting_key) DO NOTHING;

-- 2. 建立行事曆事件表 (Calendar Events)
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 基本資訊
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    
    -- 時間設定
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    timezone TEXT DEFAULT 'Asia/Taipei',
    is_all_day BOOLEAN DEFAULT FALSE,
    
    -- 參與者與主辦人
    organizer_id UUID REFERENCES user_profiles(id) NOT NULL,
    participants JSONB DEFAULT '[]'::jsonb, -- [{user_id, email, status, name}]
    
    -- 權限與可見度
    department_id UUID REFERENCES departments(id),
    visibility TEXT DEFAULT 'department', -- 'private', 'department', 'company'
    
    -- 外部同步狀態
    google_calendar_id TEXT,
    google_sync_enabled BOOLEAN DEFAULT FALSE,
    last_synced_at TIMESTAMPTZ,
    
    -- 狀態管理
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'cancelled', 'completed'
    reminders JSONB DEFAULT '[]'::jsonb, -- [{type: 'line', minutes: 15}]
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 簡單檢查
    CONSTRAINT check_end_time_after_start CHECK (end_time >= start_time)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_calendar_events_organizer ON calendar_events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_time_range ON calendar_events(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_google_id ON calendar_events(google_calendar_id);

-- 3. Google Calendar 授權表 (User Authorizations)
CREATE TABLE IF NOT EXISTS google_calendar_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) UNIQUE NOT NULL,
    
    -- OAuth Tokens
    access_token TEXT NOT NULL, -- 應用層加密
    refresh_token TEXT,        -- 應用層加密
    token_expires_at TIMESTAMPTZ,
    
    -- 同步偏好
    sync_enabled BOOLEAN DEFAULT TRUE,
    sync_direction TEXT DEFAULT 'bidirectional',
    default_calendar_id TEXT,
    
    -- 狀態
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 社群帳號綁定表 (Social Connections - 包含 Line)
CREATE TABLE IF NOT EXISTS user_social_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) NOT NULL,
    
    -- 提供者資訊
    provider TEXT NOT NULL, -- 'line', 'slack', etc.
    provider_account_id TEXT NOT NULL, -- Line User ID
    profile_data JSONB DEFAULT '{}'::jsonb, -- 顯示名稱, 頭像等
    
    -- 狀態
    is_active BOOLEAN DEFAULT TRUE,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(provider, provider_account_id),
    UNIQUE(user_id, provider) -- 每個使用者每種服務只能綁定一個帳號 (暫定)
);

-- 5. Row Level Security (RLS) Policies

-- Calendar Events RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- 策略: 使用者可以看見 (1) 自己是主辦人 (2) 參與者 (3) 同部門且 visibility='department' (4) visibility='company'
CREATE POLICY "Users can view relevant calendar events" ON calendar_events
    FOR SELECT
    USING (
        organizer_id = auth.uid() OR
        participants @> jsonb_build_array(jsonb_build_object('user_id', auth.uid())) OR
        (
            visibility = 'department' AND department_id IN (
                SELECT department_id FROM user_profiles WHERE id = auth.uid()
            )
        ) OR
        visibility = 'company'
    );

-- 策略: 只有主辦人可以修改/刪除事件
CREATE POLICY "Organizers can insert/update/delete their events" ON calendar_events
    FOR ALL
    USING (organizer_id = auth.uid())
    WITH CHECK (organizer_id = auth.uid());

-- Google Authorizations RLS
ALTER TABLE google_calendar_authorizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own google auth" ON google_calendar_authorizations
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Social Connections RLS
ALTER TABLE user_social_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own social connections" ON user_social_connections
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 允許系統服務角色 (Service Role) 或 Admin 管理所有 (視需要)
-- 這裡假設 Supabase Service Role 預設繞過 RLS，如果不繞過需額外加 Policy
