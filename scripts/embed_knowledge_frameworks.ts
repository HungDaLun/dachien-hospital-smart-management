
import dotenv from 'dotenv';
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import { createAdminClient } from '../lib/supabase/admin';
import { generateEmbedding } from '../lib/knowledge/embedding';

async function main() {
    console.log('🔄 Starting Knowledge Framework Embedding...');

    const supabase = createAdminClient();

    // 1. Fetch all frameworks
    const { data: frameworks, error } = await supabase
        .from('knowledge_frameworks')
        .select('id, name, description, detailed_definition');

    if (error) {
        console.error('❌ Failed to fetch frameworks:', error);
        process.exit(1);
    }

    if (!frameworks || frameworks.length === 0) {
        console.log('⚠️ No frameworks found.');
        process.exit(0);
    }

    console.log(`📊 Found ${frameworks.length} frameworks to process.`);

    // 2. Process each framework
    let successCount = 0;
    let failCount = 0;

    for (const fw of frameworks) {
        try {
            // Create a rich context string for embedding
            const textToEmbed = `
Framework: ${fw.name}
Description: ${fw.description}
Definition: ${fw.detailed_definition}
      `.trim();

            console.log(`⚡ Embedding: ${fw.name}...`);
            const vector = await generateEmbedding(textToEmbed);

            // Update the record
            const { error: updateError } = await supabase
                .from('knowledge_frameworks')
                .update({ embedding: vector })
                .eq('id', fw.id);

            if (updateError) throw updateError;

            successCount++;
        } catch (err) {
            console.error(`❌ Error processing ${fw.name}:`, err);
            failCount++;
        }

        // Slight delay to avoid hitting rate limits too hard
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`
✅ Completed!
Success: ${successCount}
Failed: ${failCount}
  `);
}

main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
