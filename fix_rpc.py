import os
from supabase import create_client, Client
import dotenv
dotenv.load_dotenv(".env.local")
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# Redefine the function with specific search path
sql = """
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
"""

# We can't run raw SQL via supabase-py easily.
# I will suggest the user run this SQL in Supabase or I'll try to find a way.
# Wait! I can't browse the UI. 
# I will try to use the  client to run a fake query to see if search path can be set? No.

# Alternative: Is there any other function I can call?
# I'll create a migration file and hope it gets applied or tell the user.
