import os
import json
from supabase import create_client, Client

import dotenv
dotenv.load_dotenv(".env.local")
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

print("--- Checking Finance File Summary ---")
# Find the specific finance file
files = supabase.table("files").select("id, filename, ai_summary").ilike("filename", "%財務-預算管理%").execute()

for f in files.data:
    print(f"File: {f['filename']}")
    print(f"Summary Length: {len(f['ai_summary']) if f['ai_summary'] else 0}")
    print(f"Summary Content: {f['ai_summary']}")
