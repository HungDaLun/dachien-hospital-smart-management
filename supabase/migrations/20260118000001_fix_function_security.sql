-- ============================================
-- 修復函式安全設定
-- 建立日期: 2026-01-18
-- 目的: 為 SECURITY DEFINER 函式設定 search_path，防止安全漏洞
-- ============================================

-- 1. 修復 search_knowledge_by_embedding 函式（4 參數版本）
-- 此版本用於向後相容，但建議使用 5 參數版本
CREATE OR REPLACE FUNCTION search_knowledge_by_embedding(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_department uuid
)
RETURNS TABLE (
  id uuid,
  filename text,
  title text,
  summary text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.filename,
    (f.metadata_analysis->>'title')::text as title,
    (f.metadata_analysis->>'summary')::text as summary,
    1 - (f.content_embedding <=> query_embedding) as similarity
  FROM files f
  WHERE
    f.department_id = filter_department
    AND 1 - (f.content_embedding <=> query_embedding) > match_threshold
  ORDER BY f.content_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 2. 修復 search_knowledge_by_embedding 函式（5 參數版本，支援 DIKW 層級過濾）
-- 此為推薦使用的版本
CREATE OR REPLACE FUNCTION search_knowledge_by_embedding(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_department uuid,
  filter_dikw_levels text[]
)
RETURNS TABLE (
  id uuid,
  filename text,
  title text,
  summary text,
  similarity float,
  dikw_level text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.filename,
    f.metadata_analysis->>'title' as title,
    f.metadata_analysis->>'summary' as summary,
    1 - (f.content_embedding <=> query_embedding) as similarity,
    f.dikw_level::text as dikw_level
  FROM files f
  WHERE
    (filter_department IS NULL OR f.department_id = filter_department)
    AND (filter_dikw_levels IS NULL OR f.dikw_level::text = ANY(filter_dikw_levels))
    AND 1 - (f.content_embedding <=> query_embedding) > match_threshold
  ORDER BY f.content_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 3. 修復 set_audit_log_department 函式
CREATE OR REPLACE FUNCTION set_audit_log_department()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 自動填入操作者的部門
  SELECT department_id INTO NEW.department_id
  FROM user_profiles
  WHERE id = NEW.user_id;
  
  -- 如果是檔案相關操作，自動填入檔案的部門
  IF NEW.resource_type = 'FILE' AND NEW.resource_id IS NOT NULL THEN
    SELECT department_id INTO NEW.file_department_id
    FROM files
    WHERE id::text = NEW.resource_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 註解說明
COMMENT ON FUNCTION search_knowledge_by_embedding(vector, float, int, uuid) IS 
  '向量搜尋函式（4 參數版本，向後相容）。已設定 search_path 以確保安全性。';

COMMENT ON FUNCTION search_knowledge_by_embedding(vector, float, int, uuid, text[]) IS 
  '向量搜尋函式（5 參數版本，支援 DIKW 層級過濾）。推薦使用此版本。已設定 search_path 以確保安全性。';

COMMENT ON FUNCTION set_audit_log_department() IS 
  '觸發器函式：自動填入稽核日誌的部門資訊。已設定 search_path 以確保安全性。';
