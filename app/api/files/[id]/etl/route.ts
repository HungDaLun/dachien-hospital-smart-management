
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini/client';
import { uploadToS3 } from '@/lib/storage/s3';
import { syncFileToGemini } from '@/lib/gemini/files';

export async function POST(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const fileId = params.id;

        // 1. Fetch original file details
        const { data: file, error: fetchError } = await supabase
            .from('files')
            .select('*')
            .eq('id', fileId)
            .single();

        if (fetchError || !file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        if (!file.gemini_file_uri || file.gemini_state !== 'SYNCED') {
            return NextResponse.json(
                { error: 'File must be synced to Gemini before ETL processing' },
                { status: 400 }
            );
        }

        // 2. Call Gemini for ETL (AI Librarian)
        const prompt = `
      You are an expert AI Knowledge Librarian.
      Your task is to convert the attached document into a clean, structured Markdown file.
      
      Guidelines:
      1. Remove all noise (headers, footers, page numbers, repeated disclaimers).
      2. Use standard Markdown headers (#, ##, ###) to represent the document structure.
      3. Preserve all key information, numerical data, and tables (convert to Markdown tables).
      4. If the document is long, ensure logical flow is maintained.
      5. Output ONLY the Markdown content. Do not include introductory text like "Here is the markdown...".
    `;

        // Use Gemin 3 Flash for efficient document reading and cleaning
        const modelVersion = process.env.GEMINI_MODEL_VERSION || 'gemini-3-flash';

        const structuredContent = await generateContent(
            modelVersion,
            prompt,
            file.gemini_file_uri,
            file.mime_type
        );

        if (!structuredContent) {
            return NextResponse.json({ error: 'Gemini generated empty content' }, { status: 500 });
        }

        // 3. Save the new structured file
        const newFilename = `[Structured] ${file.filename}.md`;
        const newFileBuffer = Buffer.from(structuredContent, 'utf-8');
        const s3Key = `librarian/${fileId}/${newFilename}`;
        const contentType = 'text/markdown';

        // Upload to S3 (Hub)
        const etag = await uploadToS3(newFileBuffer, s3Key, contentType);

        // Insert into DB
        const { data: newFile, error: insertError } = await supabase
            .from('files')
            .insert({
                filename: newFilename,
                s3_storage_path: s3Key,
                s3_etag: etag,
                mime_type: contentType,
                size_bytes: newFileBuffer.length,
                uploaded_by: user.id,
                is_active: true,
                gemini_state: 'PENDING' // Setup for sync
            })
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        // 4. Sync the new structured file back to Gemini (Spoke)
        // This allows Agents to use the *clean* version immediately.
        await syncFileToGemini(newFile.id, supabase);

        // 5. Add a tag to link them conceptually (Optional, but good for "Librarian")
        // For now, allow simple return.

        return NextResponse.json({
            success: true,
            original_file_id: fileId,
            structured_file_id: newFile.id,
            message: 'AI Librarian ETL completed successfully'
        });

    } catch (error: any) {
        console.error('ETL Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
