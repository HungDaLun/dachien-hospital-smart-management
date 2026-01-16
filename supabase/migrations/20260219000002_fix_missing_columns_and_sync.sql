-- 系統修復與資料同步補強
-- 建立日期: 2026-02-19
-- 目的: 
-- 1. 為 departments 資料表補上 status 欄位，以支援前端的「僅顯示有效部門」邏輯。
-- 2. 建立自動化 Trigger，當使用者登入 (auth.users) 時，同步更新 user_profiles.last_login_at，解決後端未紀錄問題。

-- ============================================
-- 1. 部門狀態欄位 (支援 Active/Inactive)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'departments' 
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.departments 
    ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    
    -- 預設所有現有部門為 active
    UPDATE public.departments SET status = 'active' WHERE status IS NULL;
  END IF;
END $$;

COMMENT ON COLUMN public.departments.status IS '部門狀態: active (啟用), inactive (停用)';

-- ============================================
-- 2. 登入時間同步 (Auth -> User Profile)
-- ============================================
CREATE OR REPLACE FUNCTION public.sync_user_last_login()
RETURNS TRIGGER AS $$
BEGIN
  -- 當 auth.users 的 last_sign_in_at 更新時，同步到 user_profiles
  UPDATE public.user_profiles
  SET last_login_at = NEW.last_sign_in_at
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 建立 Trigger (監聽 auth.users)
-- 注意：這需要在 Supabase 的 SQL Editor 或透過 Migration Tool 執行
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_last_login();
