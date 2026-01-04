-- Create DIKW Level Enum
create type "public"."dikw_level_enum" as enum ('data', 'information', 'knowledge', 'wisdom');

-- Add dikw_level column to files table
alter table "public"."files"
add column "dikw_level" "public"."dikw_level_enum" default 'data' not null;

-- Create index for fast filtering by DIKW level
create index "files_dikw_level_idx" on "public"."files" ("dikw_level");

-- Update the search_knowledge_by_embedding function to use the enum type if necessary
-- currently the function signature uses text[] for filter_dikw_levels, which is fine, 
-- we just need to cast or ensure the query matches.
-- Let's update the function signature to be more explicit if we want, or just rely on text casting.
-- For now, let's keep the function as is, but we might need to cast 'data'::text in queries if we use the enum directly.
-- Actually, the previous implementation plan mentioned:
-- filter_dikw_levels text[]
-- AND f.dikw_level = ANY(filter_dikw_levels)
-- Since dikw_level is now an enum, we might need to cast the column to text for comparison OR change the input to dikw_level_enum[].
-- Changing input to enum array is cleaner type-wise but might be harder to call from client without types.
-- Let's update the function to accept text[] and cast the column to text for comparison to be safe and flexible.

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
  dikw_level text -- return the level as text
)
LANGUAGE plpgsql
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
