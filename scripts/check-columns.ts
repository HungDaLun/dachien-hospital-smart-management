
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
}

async function checkColumns() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'knowledge_instances' });

    if (error) {
        // If RPC doesn't exist, try a simple query and check keys
        const { data: row } = await supabase.from('knowledge_instances').select('*').limit(1).single();
        if (row) {
            console.log('Columns in knowledge_instances:', Object.keys(row));
        } else {
            console.log('No data in knowledge_instances to check columns.');
        }
    } else {
        console.log('Columns:', data);
    }
}

checkColumns();
