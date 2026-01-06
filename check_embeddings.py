import os
from supabase import create_client, Client
import dotenv
dotenv.load_dotenv(".env.local")
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

res = supabase.table("files").select("count").not_.is_("content_embedding", "null").execute()
print(f"Files with embeddings: {res.data[0]['count'] if res.data else 0}")
