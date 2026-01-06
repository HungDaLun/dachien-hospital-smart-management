import os
from supabase import create_client, Client
import dotenv
dotenv.load_dotenv(".env.local")
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# Test RPC call
try:
    # Dummy embedding (768 zeros)
    dummy_embedding = [0.0] * 768
    dept_id = "2382db3e-d0e3-4b17-ac96-488048d55374" # Finance
    
    print("Testing RPC search_knowledge_by_embedding...")
    res = supabase.rpc('search_knowledge_by_embedding', {
        'query_embedding': dummy_embedding,
        'match_threshold': 0.0,
        'match_count': 5,
        'filter_department': dept_id
    }).execute()
    
    print("Success!")
    print(f"Result count: {len(res.data)}")
    for d in res.data:
        print(f"- {d['filename']} (Sim: {d['similarity']})")

except Exception as e:
    print(f"RPC Error: {e}")
