-- Add function to search all files regardless of department
create or replace function search_knowledge_global(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  filename text,
  title text,
  summary text,
  similarity float,
  department_id uuid
)
language plpgsql
security definer
as $$
begin
  return query
  select
    f.id,
    f.filename,
    (f.metadata_analysis->>'title')::text as title,
    (f.metadata_analysis->>'summary')::text as summary,
    1 - (f.content_embedding <=> query_embedding) as similarity,
    f.department_id
  from files f
  where
    1 - (f.content_embedding <=> query_embedding) > match_threshold
  order by f.content_embedding <=> query_embedding
  limit match_count;
end;
$$;
