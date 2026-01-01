-- ============================================
-- 自動建立 user_profile 觸發器
-- 解決問題: 使用者註冊後沒有對應的 user_profiles 記錄
-- ============================================

-- 1. 建立處理新使用者的函式
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 當新使用者在 auth.users 建立時，自動在 user_profiles 建立對應記錄
  -- 預設狀態為 PENDING（待審核），需要管理員審核通過才能使用
  INSERT INTO public.user_profiles (id, email, display_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    'USER',  -- 預設角色為一般使用者
    'PENDING'  -- 預設狀態為待審核
  )
  ON CONFLICT (id) DO UPDATE SET
    status = 'PENDING';  -- 如果記錄已存在（例如 API 已建立），確保狀態為 PENDING
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 建立觸發器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. 為現有的 auth.users 補建 user_profiles 記錄
-- 只插入那些在 auth.users 存在但 user_profiles 不存在的使用者
-- 注意：如果 status 欄位存在，則設為 APPROVED（現有使用者視為已審核）
INSERT INTO public.user_profiles (id, email, display_name, role, status)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'display_name', au.email),
  'USER',
  COALESCE(
    (SELECT status FROM public.user_profiles WHERE id = au.id),
    'APPROVED'  -- 現有使用者預設為已審核
  )
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. 註解說明
COMMENT ON FUNCTION public.handle_new_user() IS '當新使用者註冊時，自動在 user_profiles 建立對應記錄';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS '自動同步新使用者至 user_profiles 表';
