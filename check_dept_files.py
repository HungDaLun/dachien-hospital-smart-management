import os
import json
from supabase import create_client, Client

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    # Fallback to loading from .env.local manually if needed, but for now rely on env vars being set or I'll parse them
    pass

import dotenv
dotenv.load_dotenv(".env.local")
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Use service role for admin access

supabase: Client = create_client(url, key)

print("--- Departments ---")
depts = supabase.table("departments").select("id, name").execute()
dept_map = {d['id']: d['name'] for d in depts.data}
for d in depts.data:
    print(f"{d['id']}: {d['name']}")

print("\n--- Files and their Departments ---")
files = supabase.table("files").select("id, filename, department_id, ai_summary").execute()
for f in files.data:
    d_name = dept_map.get(f['department_id'], "Unknown/None")
    summary_preview = (f['ai_summary'][:20] + "...") if f.get('ai_summary') else "NONE"
    print(f"File: {f['filename']} | Dept: {d_name} ({f['department_id']}) | Summary: {summary_preview}")

