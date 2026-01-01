-- 修復 SECURITY DEFINER 函式的 RLS 問題
-- 問題：即使使用 SECURITY DEFINER，函式內部查詢 user_profiles 時仍然會受到 RLS 影響
-- 解決方案：在函式中使用 SET LOCAL row_security = off 來暫時關閉 RLS

-- ============================================
-- 1. 修復 is_super_admin() 函式
-- ============================================
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  -- 暫時關閉 RLS，以 postgres 權限查詢
  SET LOCAL row_security = off;
  
  SELECT COALESCE(
    (SELECT role = 'SUPER_ADMIN' 
     FROM public.user_profiles 
     WHERE id = auth.uid()),
    false
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- 2. 修復 get_user_role() 函式
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR AS $$
DECLARE
  result VARCHAR;
BEGIN
  -- 暫時關閉 RLS，以 postgres 權限查詢
  SET LOCAL row_security = off;
  
  SELECT role 
  FROM public.user_profiles 
  WHERE id = auth.uid()
  INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- 3. 修復 get_user_dept() 函式
-- ============================================
CREATE OR REPLACE FUNCTION get_user_dept()
RETURNS UUID AS $$
DECLARE
  result UUID;
BEGIN
  -- 暫時關閉 RLS，以 postgres 權限查詢
  SET LOCAL row_security = off;
  
  SELECT department_id 
  FROM public.user_profiles 
  WHERE id = auth.uid()
  INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- 4. 修復 is_admin() 函式
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  -- 暫時關閉 RLS，以 postgres 權限查詢
  SET LOCAL row_security = off;
  
  SELECT COALESCE(
    (SELECT role IN ('SUPER_ADMIN', 'DEPT_ADMIN') 
     FROM public.user_profiles 
     WHERE id = auth.uid()),
    false
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- 5. 註解說明
-- ============================================
COMMENT ON FUNCTION is_super_admin() IS '檢查當前使用者是否為 SUPER_ADMIN，使用 SET LOCAL row_security = off 來繞過 RLS';
COMMENT ON FUNCTION get_user_role() IS '取得當前使用者的角色，使用 SET LOCAL row_security = off 來繞過 RLS';
COMMENT ON FUNCTION get_user_dept() IS '取得當前使用者的部門 ID，使用 SET LOCAL row_security = off 來繞過 RLS';
COMMENT ON FUNCTION is_admin() IS '檢查當前使用者是否為管理員，使用 SET LOCAL row_security = off 來繞過 RLS';
