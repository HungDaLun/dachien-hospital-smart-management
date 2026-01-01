-- ============================================
-- 全面修復 user_profiles RLS 問題
-- 執行日期: 2026-01-03
-- 目的: 確保「使用者可讀取自己的資料」政策正確存在並運作
-- ============================================

-- ============================================
-- 1. 檢查並清理重複記錄（如果有的話）
-- ============================================
-- 注意：這會保留最新的記錄，刪除舊的記錄
-- 如果您的資料庫中有重複記錄，請先備份！

-- 檢查是否有重複記錄
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT id, COUNT(*) as cnt
    FROM user_profiles
    GROUP BY id
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE NOTICE '發現 % 個重複的 user_id，請手動清理', duplicate_count;
    -- 這裡不自動刪除，避免資料遺失
    -- 如果需要自動清理，可以取消下面的註解：
    /*
    DELETE FROM user_profiles
    WHERE ctid NOT IN (
      SELECT MIN(ctid)
      FROM user_profiles
      GROUP BY id
    );
    */
  ELSE
    RAISE NOTICE '沒有發現重複記錄';
  END IF;
END $$;

-- ============================================
-- 2. 確保「使用者可讀取自己的資料」政策存在
-- ============================================
-- 這是基礎政策，必須存在，讓使用者可以讀取自己的資料

-- 刪除可能存在的舊政策（避免衝突）
DROP POLICY IF EXISTS "使用者可讀取自己的資料" ON user_profiles;

-- 重新建立政策
CREATE POLICY "使用者可讀取自己的資料" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- ============================================
-- 3. 確保其他關鍵政策存在
-- ============================================

-- 檢查並確保「超級管理員可讀取所有使用者」政策存在
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = '超級管理員可讀取所有使用者'
  ) THEN
    CREATE POLICY "超級管理員可讀取所有使用者" ON user_profiles
      FOR SELECT
      USING (is_super_admin() = true);
    RAISE NOTICE '已建立「超級管理員可讀取所有使用者」政策';
  ELSE
    RAISE NOTICE '「超級管理員可讀取所有使用者」政策已存在';
  END IF;
END $$;

-- 檢查並確保「部門管理員可讀取部門成員」政策存在
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = '部門管理員可讀取部門成員'
  ) THEN
    CREATE POLICY "部門管理員可讀取部門成員" ON user_profiles
      FOR SELECT
      USING (
        get_user_role() = 'DEPT_ADMIN' 
        AND department_id = get_user_dept()
      );
    RAISE NOTICE '已建立「部門管理員可讀取部門成員」政策';
  ELSE
    RAISE NOTICE '「部門管理員可讀取部門成員」政策已存在';
  END IF;
END $$;

-- ============================================
-- 4. 確保輔助函式存在且正確
-- ============================================

-- 檢查 is_super_admin() 函式
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_schema = 'public' 
      AND routine_name = 'is_super_admin'
  ) THEN
    RAISE EXCEPTION 'is_super_admin() 函式不存在，請先執行 20260102030000_fix_rls_security_definer_functions.sql';
  END IF;
END $$;

-- 檢查 get_user_role() 函式
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_schema = 'public' 
      AND routine_name = 'get_user_role'
  ) THEN
    RAISE EXCEPTION 'get_user_role() 函式不存在，請先執行 20260102030000_fix_rls_security_definer_functions.sql';
  END IF;
END $$;

-- 檢查 get_user_dept() 函式
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_schema = 'public' 
      AND routine_name = 'get_user_dept'
  ) THEN
    RAISE EXCEPTION 'get_user_dept() 函式不存在，請先執行 20260102030000_fix_rls_security_definer_functions.sql';
  END IF;
END $$;

-- ============================================
-- 5. 驗證政策狀態
-- ============================================
-- 執行以下查詢來驗證所有政策是否正確建立：
/*
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'user_profiles'
ORDER BY policyname;
*/

-- ============================================
-- 6. 測試查詢（僅供參考，不會實際執行）
-- ============================================
-- 修復後，可以使用以下查詢測試（在 Supabase Dashboard 中，以特定使用者身份）：
/*
-- 測試：使用者查詢自己的資料
SELECT * FROM user_profiles WHERE id = auth.uid();

-- 測試：SUPER_ADMIN 查詢所有使用者
-- （需要以 SUPER_ADMIN 身份登入）
SELECT * FROM user_profiles;

-- 測試：DEPT_ADMIN 查詢部門成員
-- （需要以 DEPT_ADMIN 身份登入，且部門 ID 匹配）
SELECT * FROM user_profiles WHERE department_id = (SELECT department_id FROM user_profiles WHERE id = auth.uid());
*/

-- ============================================
-- 完成
-- ============================================
-- 修復完成後，請：
-- 1. 重新啟動應用程式
-- 2. 測試使用者登入和資料查詢
-- 3. 檢查日誌中是否還有 PGRST116 錯誤
