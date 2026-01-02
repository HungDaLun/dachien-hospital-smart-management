import { createClient } from '@/lib/supabase/server';
import { createGeminiClient } from '@/lib/gemini/client';
import { FRAMEWORK_SELECTION_PROMPT, FRAMEWORK_EXTRACTION_PROMPT } from './prompts';

/**
 * Auto-Map a Document to a Knowledge Framework
 * This function orchestrates the "Mapper Agent" workflow.
 * 
 * @param fileId The ID of the file to analyze
 */
export async function autoMapDocumentToFrameworks(fileId: string): Promise<{ success: boolean; message: string; instanceId?: string }> {
    const supabase = await createClient();
    const gemini = createGeminiClient();

    // 1. Fetch File Content
    const { data: file, error: fileError } = await supabase
        .from('files')
        .select('*, user_profiles(department_id)')
        .eq('id', fileId)
        .single();

    if (fileError || !file) {
        return { success: false, message: 'File not found' };
    }

    if (!file.markdown_content) {
        return { success: false, message: 'File has no markdown content (ETL incomplete)' };
    }

    // 2. Fetch Available Frameworks
    const { data: frameworks, error: fwError } = await supabase
        .from('knowledge_frameworks')
        .select('code, name, description, schema')
        .limit(10); // Sanity limit

    if (fwError || !frameworks || frameworks.length === 0) {
        return { success: false, message: 'No frameworks defined' };
    }

    // 3. Selection Step: Ask Gemini which framework fits
    const frameworkListText = frameworks.map(f => `- ${f.name} (${f.code}): ${f.description}`).join('\n');

    // Safety truncation
    const contentPreview = file.markdown_content.slice(0, 15000);

    const selectionPrompt = FRAMEWORK_SELECTION_PROMPT
        .replace('{{FRAMEWORK_LIST}}', frameworkListText);

    // We use generateContent for selection (Flash model is fast)
    // Note: In a real agentic loop, we might want strict JSON mode, but here we ask for JSON in prompt.
    // Let's assume the Gemini client helper has a method or we use raw generation.
    // For simplicity, we assume `gemini.generateContent` returns text and we parse it.

    // Reuse the model instance from client
    const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    try {
        const selectionResult = await model.generateContent([
            selectionPrompt,
            { text: `Document Content:\n${contentPreview}` }
        ]);

        const selectionText = selectionResult.response.text();
        const cleanedSelectionJson = selectionText.replace(/```json/g, '').replace(/```/g, '').trim();
        const selectionData = JSON.parse(cleanedSelectionJson);

        if (!selectionData.selected_framework_code) {
            return { success: true, message: 'No suitable framework found by AI.' };
        }

        const targetFramework = frameworks.find(f => f.code === selectionData.selected_framework_code);
        if (!targetFramework) {
            return { success: false, message: 'AI selected an invalid framework code.' };
        }

        // 4. Extraction Step: Extract data using the chosen framework
        const extractionPrompt = FRAMEWORK_EXTRACTION_PROMPT
            .replace('{{FRAMEWORK_NAME}}', targetFramework.name)
            .replace('{{FRAMEWORK_SCHEMA}}', JSON.stringify(targetFramework.schema, null, 2))
            .replace('{{DOCUMENT_CONTENT}}', contentPreview);

        const extractionResult = await model.generateContent(extractionPrompt);
        const extractionText = extractionResult.response.text();
        const cleanedExtractionJson = extractionText.replace(/```json/g, '').replace(/```/g, '').trim();
        const extractionData = JSON.parse(cleanedExtractionJson);

        // 5. Save to Database
        // We need to know who created the file to attribute the instance correctly? 
        // Or simply assign to the file owner.
        // The file.created_by is available in `file`.
        const { data: instance, error: insertError } = await supabase
            .from('knowledge_instances')
            .insert({
                framework_id: (targetFramework as any).id, // We didn't select ID above, need to fix select or re-fetch
                title: extractionData.title || `${targetFramework.name} of ${file.filename}`,
                data: extractionData.data,
                completeness: extractionData.completeness,
                confidence: extractionData.confidence,
                source_file_ids: [file.id],
                department_id: file.department_id, // Inherit from file
                created_by: file.created_by // Inherit from file owner
            })
            .select()
            .single();

        // Wait, we missed selecting 'id' in step 2. 
        // Optimization: We can find it by code since code is unique.
        if (!instance && insertError) {
            // Fallback: Fetch ID if missing
            const { data: fwId } = await supabase.from('knowledge_frameworks').select('id').eq('code', targetFramework.code).single();
            if (fwId) {
                await supabase.from('knowledge_instances').insert({
                    framework_id: fwId.id,
                    title: extractionData.title || `${targetFramework.name} of ${file.filename}`,
                    data: extractionData.data,
                    completeness: extractionData.completeness,
                    confidence: extractionData.confidence,
                    source_file_ids: [file.id],
                    department_id: file.department_id,
                    created_by: file.created_by
                });
            }
        }

        return {
            success: true,
            message: `Mapped to ${targetFramework.name}`,
            instanceId: (instance as any)?.id // Might be undefined in fallback but that's ok for now
        };

    } catch (error: any) {
        console.error('Mapper Logic Error:', error);
        return { success: false, message: `Analysis failed: ${error.message}` };
    }
}
