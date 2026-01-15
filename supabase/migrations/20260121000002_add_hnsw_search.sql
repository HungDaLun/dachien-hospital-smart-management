-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create an HNSW index for high-performance approximate nearest neighbor search
-- Note: 'vector_cosine_ops' is typical for cosine similarity which we usually want for embeddings
-- 'm' and 'ef_construction' are HNSW parameters matching standard defaults or adjusted for performance
CREATE INDEX IF NOT EXISTS idx_files_content_embedding_hnsw 
ON files USING hnsw (content_embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Create the ANN semantic search function using the HNSW index
-- This replaces/complements the standard exact nearest neighbor search (KNN)
CREATE OR REPLACE FUNCTION semantic_search_ann(
    query_embedding vector(1536),
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

-- Comments
COMMENT ON INDEX idx_files_content_embedding_hnsw IS 'HNSW index for fast approximate nearest neighbor search on content embeddings.';
COMMENT ON FUNCTION semantic_search_ann IS 'Performs high-performance semantic search using HNSW index and optional filters.';
