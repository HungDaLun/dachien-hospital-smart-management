-- Fix search path for vector operators
set search_path to public, extensions;

create or replace function search_knowledge_by_embedding(
  query_embedding extensions.vector(768),
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
set search_path = public, extensions
as $$
begin
  return query
  select
    f.id,
    f.filename,
    (f.metadata_analysis->>'title')::text as title,
    (f.metadata_analysis->>'summary')::text as summary,
    (1 - (f.content_embedding <=> query_embedding))::float as similarity
  from files f
  where
    f.department_id = filter_department
    and (1 - (f.content_embedding <=> query_embedding)) > match_threshold
  order by f.content_embedding <=> query_embedding
  limit match_count;
end;
$$;
