-- Fix semantic_search_ann function vector dimension to 768
-- The function was incorrectly defined with vector(1536) but the actual
-- content_embedding column uses vector(768) with text-embedding-004 model
-- This migration ensures the function signature matches the actual column dimension

CREATE OR REPLACE FUNCTION semantic_search_ann(
    query_embedding vector(768),  -- Fixed: changed from 1536 to 768
    match_threshold float,
    match_count int,
    filter_department uuid DEFAULT NULL,
    filter_category uuid DEFAULT NULL,
    filter_dikw_level varchar DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    filename varchar,
    markdown_content text,
    similarity float,
    dikw_level varchar,
    decay_score decimal,
    decay_status varchar
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        files.id,
        files.filename,
        files.markdown_content,
        1 - (files.content_embedding <=> query_embedding) as similarity,
        files.dikw_level,
        files.decay_score,
        files.decay_status
    FROM files
    WHERE 1 - (files.content_embedding <=> query_embedding) > match_threshold
    AND (filter_department IS NULL OR files.department_id = filter_department)
    AND (filter_category IS NULL OR files.category_id = filter_category)
    AND (filter_dikw_level IS NULL OR files.dikw_level = filter_dikw_level)
    ORDER BY files.content_embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Update comment to reflect correct dimension
COMMENT ON FUNCTION semantic_search_ann IS 'Performs high-performance semantic search using HNSW index and optional filters. Uses 768-dimensional vectors from text-embedding-004 model.';
