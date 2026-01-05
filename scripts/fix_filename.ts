
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixFilename() {
    const targetName = '產品-價值主張畫布-品木宣言_青春無敵系列-v20251128.md';
    const newName = '產品-價值主張畫布-品木宣言青春無敵系列-v20251128.md';

    console.log(`Searching for file: ${targetName}...`);

    const { data: files, error: searchError } = await supabase
        .from('files')
        .select('*')
        .eq('filename', targetName);

    if (searchError) {
        console.error('Search error:', searchError);
        return;
    }

    if (!files || files.length === 0) {
        console.log('File not found. It might have been renamed or deleted.');
        return;
    }

    const file = files[0];
    console.log(`Found file ID: ${file.id}`);

    // Also update metadata if it exists
    let newMetadata = file.metadata_analysis || {};
    if (newMetadata.suggested_filename) {
        newMetadata.suggested_filename = newName;
    }

    const { error: updateError } = await supabase
        .from('files')
        .update({
            filename: newName,
            metadata_analysis: newMetadata
        })
        .eq('id', file.id);

    if (updateError) {
        console.error('Update failed:', updateError);
    } else {
        console.log(`\nSUCCESS: Renamed to "${newName}"`);
        console.log('Metadata suggested_filename updated as well.');
    }
}

fixFilename();
