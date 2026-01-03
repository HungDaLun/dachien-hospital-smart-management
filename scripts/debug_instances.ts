
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function inspectInstances() {
    const { data: instances, error } = await supabase
        .from('knowledge_instances')
        .select('id, title, framework_id, source_file_ids');

    if (error) {
        console.error(error);
        return;
    }

    console.log('--- Knowledge Instances ---');
    instances.forEach(i => {
        console.log(`ID: ${i.id}`);
        console.log(`Title: ${i.title}`);
        console.log(`Sources: ${i.source_file_ids.length} files -> [${i.source_file_ids.join(', ')}]`);
        console.log('---');
    });
}

inspectInstances();
