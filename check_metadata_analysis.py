import os
from supabase import create_client, Client

import dotenv
dotenv.load_dotenv(".env.local")
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

print("--- Checking Metadata Analysis ---")
files = supabase.table("files").select("filename, metadata_analysis").ilike("filename", "%財務-預算管理%").execute()

for f in files.data:
    print(f"File: {f['filename']}")
    print(f"Meta Analysis: {f.get('metadata_analysis', 'NONE')}")
