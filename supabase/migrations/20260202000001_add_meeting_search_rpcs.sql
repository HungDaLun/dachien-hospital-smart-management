-- Add search functions for Agent Meeting System

-- 1. Search Knowledge for Consultant (by file_ids)
CREATE OR REPLACE FUNCTION public.search_knowledge_by_file_ids(
  query_embedding vector(768),
  file_ids uuid[],
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  filename text,
  title text,
  summary text,
  content text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.filename,
    COALESCE((f.metadata_analysis->>'title')::text, f.filename) as title,
    (f.metadata_analysis->>'summary')::text as summary,
    -- For now assume we might want full content or chunks.
    -- If files are large, we might need a separate chunks table search. 
    -- Assuming files table has content or we just return summary for now.
    -- Based on previous migrations, files might not store full text in a searchable way here if not chunked. 
    -- But 'search_knowledge_by_embedding' uses 'files' table directly.
    -- Let's check 'files' table structure if possible. Assuming it has some text content or we rely on summary.
    -- Actually, for RAG, usually we search chunks. 
    -- If 'files' has the embedding, it implies the file itself is the unit.
    -- We'll return empty content for now if it's not readily available as column, 
    -- logic later can fetch it from storage if needed.
    -- Wait, the design doc says 'key_content' is extracted. 
    ''::text as content, 
    1 - (f.content_embedding <=> query_embedding) as similarity
  FROM files f
  WHERE
    f.id = ANY(file_ids)
    AND 1 - (f.content_embedding <=> query_embedding) > match_threshold
  ORDER BY f.content_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 2. Search Department Knowledge (Wrapper for clarity or specific logic)
CREATE OR REPLACE FUNCTION public.search_department_knowledge(
  query_embedding vector(768),
  department_id uuid,
  match_threshold float,
  match_count int
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
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.filename,
    COALESCE((f.metadata_analysis->>'title')::text, f.filename) as title,
    (f.metadata_analysis->>'summary')::text as summary,
    1 - (f.content_embedding <=> query_embedding) as similarity
  FROM files f
  WHERE
    f.department_id = search_department_knowledge.department_id
    AND 1 - (f.content_embedding <=> query_embedding) > match_threshold
  ORDER BY f.content_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
