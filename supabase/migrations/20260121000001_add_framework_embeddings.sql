-- 1. Add embedding column to knowledge_frameworks
alter table "knowledge_frameworks"
add column if not exists "embedding" vector(768);

-- 2. Create index for performance
create index if not exists "knowledge_frameworks_embedding_idx"
on "knowledge_frameworks" using hnsw ("embedding" vector_cosine_ops);

-- 3. Update Global Search Function to include frameworks
create or replace function search_knowledge_global(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  content text,
  similarity float,
  type text,
  source text
)
language plpgsql
security definer
as $$
begin
  return query
  (
    -- Search Files
    select
      f.id,
      (f.metadata_analysis->>'title')::text as title,
      (f.metadata_analysis->>'summary')::text as content,
      1 - (f.content_embedding <=> query_embedding) as similarity,
      'file' as type,
      f.filename as source
    from files f
    where
      1 - (f.content_embedding <=> query_embedding) > match_threshold
    order by similarity desc
    limit match_count
  )
  union all
  (
    -- Search Frameworks
    select
      kf.id,
      kf.name as title,
      kf.detailed_definition as content,
      1 - (kf.embedding <=> query_embedding) as similarity,
      'framework' as type,
      'Knowledge Framework' as source
    from knowledge_frameworks kf
    where
      1 - (kf.embedding <=> query_embedding) > match_threshold
    order by similarity desc
    limit match_count
  )
  order by similarity desc
  limit match_count;
end;
$$;
