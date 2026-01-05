
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function resetKnowledgeGraph() {
    console.log('🧹 Clearing Knowledge Instances (Green Nodes) to prepare for re-analysis...');

    const { error } = await supabase
        .from('knowledge_instances')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete All

    if (error) {
        console.error('❌ Error clearing knowledge instances:', error);
    } else {
        console.log(`✅ Successfully deleted old knowledge instances. The graph is now clean.`);
        console.log('You can now run "Analyze All" to regenerate the Knowledge Graph with the new aggregation logic.');
    }
}

resetKnowledgeGraph();
