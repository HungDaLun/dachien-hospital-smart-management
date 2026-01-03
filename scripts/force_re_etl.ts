
import dotenv from 'dotenv';
import path from 'path';

// 確保在載入其他模組前先讀取環境變數
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createAdminClient } from '../lib/supabase/admin';
import { generateContent } from '../lib/gemini/client';
import { downloadFromS3 } from '../lib/storage/s3';

async function forceReETL() {
    console.log('Starting Force Re-ETL Script...');
    const supabase = createAdminClient();

    // 1. Find the problematic file (The latest CSV file that failed)
    const { data: files, error } = await supabase
        .from('files')
        .select('*')
        .ilike('filename', '%K-10-3%')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error || !files || files.length === 0) {
        console.error('No CSV file found.');
        return;
    }

    const file = files[0];
    console.log(`Found Target File: ${file.filename} (ID: ${file.id})`);
    console.log(`Current Content Preview: ${file.markdown_content?.substring(0, 50)}...`);

    // 2. Perform raw CSV extraction logic (Mimicking the fixed etl/route.ts)
    // We explicitly use the CORRECT model name here.
    const CORRECT_MODEL = 'gemini-3-flash-preview';

    let rawData = '';

    // Attempt S3 Download
    try {
        console.log(`Downloading from S3: ${file.s3_storage_path}...`);
        const buffer = await downloadFromS3(file.s3_storage_path);
        rawData = buffer.toString('utf-8'); // CSV is text, so we can just read it.
        console.log(`Download success. Size: ${rawData.length} chars.`);
    } catch (e) {
        console.error('S3 Download Failed:', e);
        if (!file.gemini_file_uri) {
            console.error('No Gemini URI available to fallback. Aborting.');
            return;
        }
        console.log('Using existing Gemini URI for ETL...');
    }

    // 3. Construct the Prompt (The optimized Data Engineer prompt)
    const prompt = `
    You are an expert Data Engineer AI.
    Your task is to Clean and Standardize the attached dataset.
    
    Guidelines:
    1. Fix encoding issues (ensure UTF-8).
    2. Standardize headers (trim spaces, clear meaning).
    3. Remove empty rows or completely corrupted lines.
    4. Output the result strictly as **valid CSV format** inside a code block (\`\`\`csv ... \`\`\`).
    5. CRITICAL: Do NOT convert to a Markdown visuals table (ASCII table). Keep it as efficient Comma Separated Values.
    `;

    // 4. Call Gemini 3
    console.log(`Calling Gemini 3 (${CORRECT_MODEL}) for ETL...`);
    try {
        const result = await generateContent(
            CORRECT_MODEL,
            prompt,
            file.gemini_file_uri, // Re-use existing Gemini URI if valid
            file.mime_type
        );

        console.log('Gemini ETL Success!');
        console.log('Result Preview:', result.substring(0, 100));

        // 5. Update Database
        const { error: updateError } = await supabase
            .from('files')
            .update({
                markdown_content: result, // Overwrite the error message!
                gemini_state: 'NEEDS_REVIEW', // Ready for analysis
                metadata_analysis: { status: 're-etl-success', timestamp: new Date().toISOString() }
            })
            .eq('id', file.id);

        if (updateError) {
            console.error('Database Update Failed:', updateError);
        } else {
            console.log('FATAL ERROR CLEARED. File content updated successfully.');
        }

    } catch (geminiError) {
        console.error('Gemini ETL Failed:', geminiError);
    }
}

// Execute
forceReETL();
