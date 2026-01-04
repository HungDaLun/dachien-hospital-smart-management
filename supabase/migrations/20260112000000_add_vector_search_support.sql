-- Enable pgvector extension
create extension if not exists vector with schema extensions;

-- Add content_embedding column to files table
alter table "files"
add column if not exists "content_embedding" vector(768);

-- Create HNSW index for better performance
create index if not exists "files_content_embedding_idx"
on "files" using hnsw ("content_embedding" vector_cosine_ops);

-- Create search function
create or replace function search_knowledge_by_embedding(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_department uuid
)
returns table (
  id uuid,
  filename text,
  title text,
  summary text,
  similarity float
)
language plpgsql
security definer
as $$
begin
  return query
  select
    f.id,
    f.filename,
    -- Safely extract title and summary from metadata_analysis JSONB
    (f.metadata_analysis->>'title')::text as title,
    (f.metadata_analysis->>'summary')::text as summary,
    1 - (f.content_embedding <=> query_embedding) as similarity
  from files f
  where
    f.department_id = filter_department
    and 1 - (f.content_embedding <=> query_embedding) > match_threshold
  order by f.content_embedding <=> query_embedding
  limit match_count;
end;
$$;
