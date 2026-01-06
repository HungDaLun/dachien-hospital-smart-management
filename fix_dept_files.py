import os
import json
from supabase import create_client, Client

import dotenv
dotenv.load_dotenv(".env.local")
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

print("--- Fetching Departments ---")
depts = supabase.table("departments").select("id, name").execute()
name_to_id = {d['name']: d['id'] for d in depts.data}
print(name_to_id)

print("\n--- Fixing File Departments ---")
files = supabase.table("files").select("id, filename").execute()

for f in files.data:
    fname = f['filename']
    target_dept_id = None
    
    if "財務" in fname or "預算" in fname or "報表" in fname:
        target_dept_id = name_to_id.get("財務部")
    elif "行銷" in fname or "市場" in fname:
        target_dept_id = name_to_id.get("行銷部")
    elif "業務" in fname or "銷售" in fname:
        target_dept_id = name_to_id.get("業務部")
    elif "研發" in fname or "技術" in fname or "Project" in fname:
        target_dept_id = name_to_id.get("研發部")
    elif "供應鏈" in fname or "庫存" in fname or "採購" in fname:
        target_dept_id = name_to_id.get("供應鏈部")
    elif "法務" in fname or "合約" in fname:
        # Assuming no explicitly Separate Legal Dept in DB, assign to closest or a new one?
        # Checking depts list: 財務部, 生管部, 研發部, 行銷部, 業務部, 供應鏈部.
        # No '法務部'. Let's assign Legal to '財務部' (often linked) or leave as is if we can't map.
        # User complained legal was in finance. So maybe we should create Legal dept?
        # But wait, the user's list has "法務-合約..." currently in "財務部" and they said "strange".
        # If there is no Legal dept, where should it go?
        # '經營管理' (General Mgmt) might be better? But we only have mapped depts.
        # Let's map strict matches first.
        pass
    
    # Correction logic specifically for user complaint:
    # "法務-合約" -> currently Finance. User thinks it is strange.
    # "業務-業務報告" -> should be Sales (業務部).
    # "產品-..." -> should be R&D or Product. R&D (研發部) is safest for Product here if no Product dept.
    
    # Specific re-mapping rules based on filename prefix
    # Create missing departments if needed
    if "法務部" not in name_to_id:
        print("Creating Legal Department...")
        res = supabase.table("departments").insert({"name": "法務部", "description": "負責公司法律事務與合規管理", "code": "LEGAL"}).execute()
        name_to_id["法務部"] = res.data[0]['id']

    if "法務" in fname:
        target_dept_id = name_to_id.get("法務部")

    if "業務" in fname:
        target_dept_id = name_to_id.get("業務部")
    
    if "產品" in fname:
         target_dept_id = name_to_id.get("研發部") 

    if "供應鏈" in fname or "庫存" in fname:
        target_dept_id = name_to_id.get("供應鏈部")
        
    if "人力資源" in fname:
         # Put in General Management/Production if no HR, or create HR. 
         # Let's put in '生管部' as a catch-all for Admin/HR for now to unclutter Finance
         target_dept_id = name_to_id.get("生管部")

    if target_dept_id:
        print(f"Updating {fname} -> {target_dept_id}")
        supabase.table("files").update({"department_id": target_dept_id}).eq("id", f['id']).execute()

print("Done re-assigning.")
