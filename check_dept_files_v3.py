import os
import json
from supabase import create_client, Client

import dotenv
dotenv.load_dotenv(".env.local")
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

print("--- Departments ---")
depts = supabase.table("departments").select("id, name").execute()
dept_map = {d['id']: d['name'] for d in depts.data}

print("\n--- Files and their Departments (Post-Fix) ---")
files = supabase.table("files").select("id, filename, department_id").execute()
for f in files.data:
    d_name = dept_map.get(f['department_id'], "Unknown/None")
    print(f"File: {f['filename']} | Dept: {d_name}")
