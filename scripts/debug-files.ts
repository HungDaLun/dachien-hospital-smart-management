
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if any files with '會議記錄' in the filename exist
    const { data: files, error } = await supabase
        .from('files')
        .select('id, filename, user_id, gemini_state, created_at')
        .ilike('filename', '%會議記錄%')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error querying files:", error);
        return;
    }

    console.log("Found files with '會議記錄' in filename:");
    console.log(JSON.stringify(files, null, 2));

    // Also check the files table structure
    const { data: allFiles } = await supabase
        .from('files')
        .select('id, filename, user_id')
        .order('created_at', { ascending: false })
        .limit(5);

    console.log("\nLatest 5 files in the system:");
    console.log(JSON.stringify(allFiles, null, 2));
}

main().catch(console.error);
