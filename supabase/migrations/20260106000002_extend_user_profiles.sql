-- ============================================
-- 擴充 user_profiles 表 - 企業級欄位
-- 建立日期: 2026-01-06
-- 說明: 新增支援中小企業至上市櫃公司的個人資料欄位
-- ============================================

-- 1. 基本資訊欄位
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50),           -- 員工編號
  ADD COLUMN IF NOT EXISTS job_title VARCHAR(100),            -- 職稱
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30),                 -- 辦公室電話
  ADD COLUMN IF NOT EXISTS mobile VARCHAR(30),                -- 手機號碼
  ADD COLUMN IF NOT EXISTS extension VARCHAR(10);             -- 分機號碼

-- 2. 組織資訊欄位
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES user_profiles(id), -- 直屬主管
  ADD COLUMN IF NOT EXISTS hire_date DATE,                    -- 入職日期
  ADD COLUMN IF NOT EXISTS location VARCHAR(100);             -- 工作地點/辦公室

-- 3. 專業資訊欄位
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,                          -- 個人簡介
  ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::JSONB,  -- 技能標籤
  ADD COLUMN IF NOT EXISTS expertise_areas JSONB DEFAULT '[]'::JSONB; -- 專業領域

-- 4. 社群連結欄位
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);         -- LinkedIn 連結

-- 5. 系統欄位
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,    -- 帳戶啟用狀態
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE, -- 最後登入時間
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::JSONB;  -- 使用者偏好設定

-- 6. 建立索引以優化查詢效能
CREATE INDEX IF NOT EXISTS idx_user_profiles_employee_id ON user_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_manager_id ON user_profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);

-- 7. 建立 GIN 索引以支援 JSONB 欄位查詢
CREATE INDEX IF NOT EXISTS idx_user_profiles_skills ON user_profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_user_profiles_expertise ON user_profiles USING GIN(expertise_areas);

-- ============================================
-- 欄位說明
-- ============================================
COMMENT ON COLUMN user_profiles.employee_id IS '員工編號，由人資或系統管理員設定';
COMMENT ON COLUMN user_profiles.job_title IS '職稱，如「資深工程師」、「行銷經理」';
COMMENT ON COLUMN user_profiles.phone IS '辦公室電話，包含區碼';
COMMENT ON COLUMN user_profiles.mobile IS '手機號碼';
COMMENT ON COLUMN user_profiles.extension IS '分機號碼';
COMMENT ON COLUMN user_profiles.manager_id IS '直屬主管的 user_profiles ID';
COMMENT ON COLUMN user_profiles.hire_date IS '入職日期';
COMMENT ON COLUMN user_profiles.location IS '工作地點或辦公室名稱，如「台北總部」、「新竹研發中心」';
COMMENT ON COLUMN user_profiles.bio IS '個人簡介，用於知識分享與專業展示';
COMMENT ON COLUMN user_profiles.skills IS '技能標籤陣列，如 ["Python", "資料分析", "專案管理"]';
COMMENT ON COLUMN user_profiles.expertise_areas IS '專業領域陣列，如 ["財務會計", "稅務法規"]';
COMMENT ON COLUMN user_profiles.linkedin_url IS 'LinkedIn 個人頁面連結';
COMMENT ON COLUMN user_profiles.is_active IS '帳戶是否啟用，false 表示停用（如離職）';
COMMENT ON COLUMN user_profiles.last_login_at IS '最後登入時間，用於安全稽核';
COMMENT ON COLUMN user_profiles.preferences IS '使用者偏好設定 JSONB，如 {"theme": "dark", "language": "zh-TW"}';
