-- ============================================
-- 頭像自動覆蓋與壓縮功能
-- 建立日期: 2026-01-25
-- 說明: 
--   1. 上傳新頭像時自動刪除舊頭像（避免重複）
--   2. 強制使用路徑結構 user/<user_id>/avatar.* 以確保安全
--   3. 圖片壓縮需透過 Edge Function 處理（見下方註解）
-- ============================================

-- 1. 建立函數：刪除使用者的舊頭像
-- 此函數會在插入新頭像前被調用，確保每個使用者只有一張頭像
CREATE OR REPLACE FUNCTION public.delete_old_user_avatar(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 2. 建立觸發器函數：在插入新頭像前自動刪除舊頭像
CREATE OR REPLACE FUNCTION public.before_insert_avatar()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 確保路徑格式正確：user/<user_id>/avatar.*
  IF NEW.bucket_id = 'avatars' AND NEW.owner IS NOT NULL THEN
    -- 驗證路徑格式
    IF NOT (NEW.name LIKE 'user/' || NEW.owner::text || '/avatar.%') THEN
      RAISE EXCEPTION '頭像路徑格式錯誤。必須使用格式: user/<user_id>/avatar.<extension>';
    END IF;

    -- 刪除該使用者的舊頭像
    PERFORM public.delete_old_user_avatar(NEW.owner);
  END IF;

  RETURN NEW;
END;
$$;

-- 3. 建立觸發器：在插入 storage.objects 前執行
DROP TRIGGER IF EXISTS before_insert_avatar_trigger ON storage.objects;
CREATE TRIGGER before_insert_avatar_trigger
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'avatars')
  EXECUTE FUNCTION public.before_insert_avatar();

-- 4. 更新 RLS 政策：強制使用正確的路徑結構
-- 刪除舊的寬鬆政策
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;

-- 建立新的嚴格政策：只允許上傳到自己的路徑
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND auth.uid() = owner
    AND name LIKE 'user/' || auth.uid()::text || '/avatar.%'
  );

-- 5. 更新更新政策：只允許更新自己的頭像
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;

CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
    AND name LIKE 'user/' || auth.uid()::text || '/avatar.%'
  )
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
    AND name LIKE 'user/' || auth.uid()::text || '/avatar.%'
  );

-- 6. 更新刪除政策：只允許刪除自己的頭像
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
    AND name LIKE 'user/' || auth.uid()::text || '/avatar.%'
  );

-- 7. 建立函數：取得使用者的頭像 URL（用於更新 user_profiles.avatar_url）
-- 注意：此函數返回相對路徑，應用層需要加上 Supabase URL 前綴
CREATE OR REPLACE FUNCTION public.get_user_avatar_url(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 8. 建立觸發器：當頭像上傳後，自動更新 user_profiles.avatar_url
-- 注意：此函數儲存相對路徑，應用層需要加上 Supabase URL 前綴
CREATE OR REPLACE FUNCTION public.after_insert_avatar()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avatar_url TEXT;
BEGIN
  IF NEW.bucket_id = 'avatars' AND NEW.owner IS NOT NULL THEN
    -- 構建頭像 URL 路徑（相對路徑，應用層會加上完整 URL）
    -- 格式：/storage/v1/object/public/avatars/<path>
    avatar_url := '/storage/v1/object/public/avatars/' || NEW.name;

    -- 更新 user_profiles 表的 avatar_url
    -- 注意：如果需要完整 URL，應用層應該在查詢時加上 Supabase URL
    UPDATE public.user_profiles
    SET avatar_url = avatar_url,
        updated_at = NOW()
    WHERE id = NEW.owner;
  END IF;

  RETURN NEW;
END;
$$;

-- 建立觸發器：在插入後更新 user_profiles
DROP TRIGGER IF EXISTS after_insert_avatar_trigger ON storage.objects;
CREATE TRIGGER after_insert_avatar_trigger
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'avatars')
  EXECUTE FUNCTION public.after_insert_avatar();

-- ============================================
-- 註解說明
-- ============================================
COMMENT ON FUNCTION public.delete_old_user_avatar(UUID) IS 
  '刪除指定使用者的舊頭像，確保每個使用者只有一張頭像';

COMMENT ON FUNCTION public.before_insert_avatar() IS 
  '在插入新頭像前自動刪除舊頭像，並驗證路徑格式';

COMMENT ON FUNCTION public.get_user_avatar_url(UUID) IS 
  '取得使用者的頭像公開 URL';

COMMENT ON FUNCTION public.after_insert_avatar() IS 
  '在頭像上傳後自動更新 user_profiles.avatar_url';

-- ============================================
-- 圖片壓縮與自動覆蓋說明
-- ============================================
-- 
-- 1. 自動覆蓋舊頭像：
--    應用層在上傳新頭像前，應調用 public.delete_old_user_avatar(user_id) 函數
--    此函數會自動刪除該使用者的舊頭像，確保每個使用者只有一張頭像
--
-- 2. 圖片壓縮：
--    已建立 Edge Function: supabase/functions/compress-avatar/index.ts
--    此 Edge Function 會：
--    - 自動壓縮頭像圖片至 10KB 以下
--    - 刪除舊頭像（如果存在）
--    - 上傳壓縮後的圖片（覆蓋原檔案）
--    - 更新 user_profiles.avatar_url
--
-- 3. 使用方式：
--    方式 A（推薦）：在應用層 API route 中
--      a. 調用 public.delete_old_user_avatar(user_id) 刪除舊頭像
--      b. 上傳新頭像到路徑：user/<user_id>/avatar.<extension>
--      c. 調用 Edge Function 來壓縮圖片
--
--    方式 B：使用 Database Webhook
--      a. 在 Supabase Dashboard 設定 Database Webhook
--      b. 監聽 storage.objects 的 INSERT 事件（bucket_id = 'avatars'）
--      c. 觸發 Edge Function: compress-avatar
--
-- 4. 路徑格式要求：
--    所有頭像必須使用格式：user/<user_id>/avatar.<extension>
--    此格式由 RLS 政策強制執行，確保安全性
--
-- 5. 壓縮目標：
--    - 最大檔案大小：10KB
--    - 建議解析度：300x300 像素（首次壓縮）或 200x200 像素（進一步壓縮）
--    - 輸出格式：WebP（最佳壓縮比）
--    - 品質：80%（首次）或 60%（進一步壓縮）
--
-- 6. 部署 Edge Function：
--    supabase functions deploy compress-avatar
--
-- 7. 環境變數設定（Edge Function）：
--    - SUPABASE_URL: Supabase 專案 URL
--    - SUPABASE_SERVICE_ROLE_KEY: Supabase Service Role Key（完整權限）
