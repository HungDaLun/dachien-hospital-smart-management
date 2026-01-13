-- ============================================
-- 修復安全問題 Migration
-- 建立日期: 2026-01-28
-- 目的: 
--   1. 為 system_settings_audit 表啟用 RLS
--   2. 修復函數 search_path 設定
--   3. 加強 RLS 政策安全性
-- ============================================

-- ============================================
-- 1. 為 system_settings_audit 表啟用 RLS
-- ============================================

-- 啟用 RLS
ALTER TABLE system_settings_audit ENABLE ROW LEVEL SECURITY;

-- 刪除舊的政策（如果存在）
DROP POLICY IF EXISTS "super_admin_can_view_audit" ON system_settings_audit;
DROP POLICY IF EXISTS "super_admin_can_insert_audit" ON system_settings_audit;

-- 只有 SUPER_ADMIN 可以查看審計日誌
CREATE POLICY "super_admin_can_view_audit" ON system_settings_audit
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

-- 允許系統自動插入審計日誌（透過 trigger）
-- 注意：此政策允許所有已認證使用者插入，因為審計日誌是透過 trigger 自動建立的
CREATE POLICY "system_can_insert_audit" ON system_settings_audit
    FOR INSERT
    WITH CHECK (true);

-- 不允許更新或刪除審計日誌（審計日誌應該是不可變的）
-- 如果需要刪除，只能由 SUPER_ADMIN 透過直接 SQL 執行

-- ============================================
-- 2. 修復函數 search_path 設定
-- ============================================

-- 2.1 修復 get_user_avatar_url 函數
CREATE OR REPLACE FUNCTION public.get_user_avatar_url(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  avatar_path TEXT;
  avatar_url TEXT;
BEGIN
  -- 查找該使用者的頭像路徑
  SELECT name INTO avatar_path
  FROM storage.objects
  WHERE bucket_id = 'avatars'
    AND name LIKE 'user/' || user_id::text || '/avatar.%'
    AND owner = user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- 如果找到，構建公開 URL 路徑
  -- 注意：應用層需要加上完整的 Supabase URL
  -- 格式：<SUPABASE_URL>/storage/v1/object/public/avatars/<path>
  IF avatar_path IS NOT NULL THEN
    avatar_url := '/storage/v1/object/public/avatars/' || avatar_path;
  END IF;

  RETURN avatar_url;
END;
$$;

-- 2.2 修復 search_knowledge_global 函數
CREATE OR REPLACE FUNCTION public.search_knowledge_global(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  filename text,
  title text,
  summary text,
  similarity float,
  department_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.filename,
    (f.metadata_analysis->>'title')::text AS title,
    (f.metadata_analysis->>'summary')::text AS summary,
    1 - (f.content_embedding <=> query_embedding) AS similarity,
    f.department_id
  FROM files f
  WHERE
    1 - (f.content_embedding <=> query_embedding) > match_threshold
  ORDER BY f.content_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 2.3 修復 delete_old_user_avatar 函數
CREATE OR REPLACE FUNCTION public.delete_old_user_avatar(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  old_avatar_path TEXT;
BEGIN
  -- 查找該使用者的舊頭像（路徑格式：user/<user_id>/avatar.*）
  SELECT name INTO old_avatar_path
  FROM storage.objects
  WHERE bucket_id = 'avatars'
    AND name LIKE 'user/' || user_id::text || '/avatar.%'
    AND owner = user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- 如果找到舊頭像，則刪除
  IF old_avatar_path IS NOT NULL THEN
    DELETE FROM storage.objects
    WHERE bucket_id = 'avatars'
      AND name = old_avatar_path
      AND owner = user_id;
  END IF;
END;
$$;

-- 2.4 修復 update_user_interests_last_updated 函數
CREATE OR REPLACE FUNCTION public.update_user_interests_last_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- 3. 加強 ai_strategic_insights 表的 RLS 政策
-- ============================================

-- 檢查表是否存在
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_strategic_insights'
  ) THEN
    -- 刪除過於寬鬆的政策
    DROP POLICY IF EXISTS "Service role can manage insights" ON ai_strategic_insights;
    
    -- 建立更嚴格的政策
    -- 只有 SUPER_ADMIN 和 DEPT_ADMIN 可以管理洞察
    CREATE POLICY "admins_can_manage_insights" ON ai_strategic_insights
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid()
          AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid()
          AND role IN ('SUPER_ADMIN', 'DEPT_ADMIN')
        )
      );
    
    -- 一般使用者可以查看所有洞察（因為此表沒有 department_id 欄位）
    -- 如果需要限制，應該在應用層處理
    CREATE POLICY "users_can_view_insights" ON ai_strategic_insights
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles up
          WHERE up.id = auth.uid()
          AND up.role IN ('SUPER_ADMIN', 'DEPT_ADMIN', 'USER', 'EDITOR')
        )
      );
  END IF;
END $$;

-- ============================================
-- 4. 加強 files 表的 UPDATE RLS 政策
-- ============================================

-- 檢查並更新 files 表的 UPDATE 政策
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'files'
  ) THEN
    -- 刪除舊的寬鬆政策
    DROP POLICY IF EXISTS "上傳者或管理員可更新檔案" ON files;
    
    -- 建立更嚴格的政策
    CREATE POLICY "上傳者或管理員可更新檔案" ON files
      FOR UPDATE
      USING (
        -- 上傳者可以更新自己的檔案
        uploaded_by = auth.uid()
        OR
        -- SUPER_ADMIN 可以更新所有檔案
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
        OR
        -- DEPT_ADMIN 可以更新自己部門的檔案
        (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'DEPT_ADMIN'
          )
          AND (
            department_id = (
              SELECT department_id FROM user_profiles WHERE id = auth.uid()
            )
            OR department_id IS NULL
          )
        )
      )
      WITH CHECK (
        -- WITH CHECK 使用相同的條件，確保更新後的資料也符合權限
        uploaded_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
        OR
        (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'DEPT_ADMIN'
          )
          AND (
            department_id = (
              SELECT department_id FROM user_profiles WHERE id = auth.uid()
            )
            OR department_id IS NULL
          )
        )
      );
  END IF;
END $$;

-- ============================================
-- 5. 註解說明
-- ============================================

COMMENT ON POLICY "super_admin_can_view_audit" ON system_settings_audit IS 
  '只有 SUPER_ADMIN 可以查看系統設定審計日誌';

COMMENT ON POLICY "system_can_insert_audit" ON system_settings_audit IS 
  '允許系統透過 trigger 自動插入審計日誌';

COMMENT ON FUNCTION public.get_user_avatar_url(UUID) IS 
  '取得使用者的頭像公開 URL（已設定 search_path）';

COMMENT ON FUNCTION public.search_knowledge_global(vector, float, int) IS 
  '全域知識搜尋函數（已設定 search_path）';

COMMENT ON FUNCTION public.delete_old_user_avatar(UUID) IS 
  '刪除指定使用者的舊頭像（已設定 search_path）';

COMMENT ON FUNCTION public.update_user_interests_last_updated() IS 
  '更新使用者興趣的最後更新時間（已設定 search_path）';

-- ============================================
-- 完成訊息
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '安全修復完成：';
  RAISE NOTICE '  - system_settings_audit 表已啟用 RLS';
  RAISE NOTICE '  - 4 個函數已修復 search_path 設定';
  RAISE NOTICE '  - ai_strategic_insights 表 RLS 政策已加強';
  RAISE NOTICE '  - files 表 UPDATE RLS 政策已加強';
END $$;
