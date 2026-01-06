import os
from supabase import create_client, Client
import dotenv
dotenv.load_dotenv(".env.local")
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# We can't list columns directly via SDK easily.
# But we can try to select * limit 1 and see keys.
res = supabase.table("files").select("*").limit(1).execute()
if res.data:
    print(res.data[0].keys())
else:
    print("No data")
