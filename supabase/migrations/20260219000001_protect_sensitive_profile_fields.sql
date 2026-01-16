-- 安全防護：防止非管理員修改敏感欄位
-- 建立日期: 2026-02-19

-- 1. 建立一個觸發器函式，檢查 update 操作
CREATE OR REPLACE FUNCTION public.prevent_sensitive_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- 檢查角色 (role) 是否被修改
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- 如果角色改變，必須是 SUPER_ADMIN
    IF NOT public.is_super_admin() THEN
       RAISE EXCEPTION '權限不足：只有超級管理員可以修改角色';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 建立觸發器
DROP TRIGGER IF EXISTS check_sensitive_updates ON public.user_profiles;
CREATE TRIGGER check_sensitive_updates
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_sensitive_updates();

-- 3. 確保 RLS 允許使用者更新自己的資料 (如果尚未存在)
-- 雖然通常 20240101...04_fix_rls_final.sql 已經處理，但明確宣告一次無妨
-- 注意：如果政策已存在，此操作會失敗，所以我們使用 DO block 檢查
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = '使用者可以更新自己的資料'
  ) THEN
    CREATE POLICY "使用者可以更新自己的資料" ON public.user_profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
