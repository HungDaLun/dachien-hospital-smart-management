import os
from supabase import create_client, Client

import dotenv
dotenv.load_dotenv(".env.local")
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

print("--- Seeding Finance File Summary ---")
# Find the specific finance file
files = supabase.table("files").select("id, filename").ilike("filename", "%財務-預算管理%").execute()

for f in files.data:
    print(f"Updating {f['filename']}...")
    summary = "這是一份關於 2024 年第一季 (Q1) 各部門的預算執行分析報告。報告指出，整體預算執行率為 92%，其中研發部因新專案採購導致預算超支 5%，而行銷部預算剩餘 10%。報告建議加強 Q2 的研發預算控管，並評估行銷活動的 ROI。"
    supabase.table("files").update({"ai_summary": summary}).eq("id", f['id']).execute()
    print("Updated summary.")
