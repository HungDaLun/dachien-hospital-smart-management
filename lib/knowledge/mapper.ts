import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SupabaseClient } from '@supabase/supabase-js';
import { createGeminiClient } from '@/lib/gemini/client';
import { FRAMEWORK_EXTRACTION_PROMPT, FRAMEWORK_SELECTION_PROMPT } from './prompts';

/**
 * Auto-Map a Document to Multiple Knowledge Frameworks
 * This function orchestrates the "Mapper Agent" workflow.
 * 
 * @param fileId The ID of the file to analyze
 */
export async function autoMapDocumentToFrameworks(fileId: string, supabaseClient?: SupabaseClient): Promise<{ success: boolean; message: string; instanceIds?: string[] }> {
    let supabase = supabaseClient;

    if (!supabase) {
        try {
            supabase = await createClient();
        } catch (e) {
            console.log('[Mapper] Falling back to Admin Client...');
            supabase = createAdminClient();
        }
    }

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
        .select('id, code, name, description, structure_schema');

    if (fwError || !frameworks || frameworks.length === 0) {
        return { success: false, message: 'No frameworks defined' };
    }

    // 3. Selection Step: Ask Gemini which frameworks fit
    const frameworkListText = frameworks.map(f => `- ${f.name} (${f.code}): ${f.description}`).join('\n');

    // Safety truncation
    const contentPreview = file.markdown_content.slice(0, 20000); // 20k chars is safe for Gemini 3

    const selectionPrompt = FRAMEWORK_SELECTION_PROMPT
        .replace('{{ FRAMEWORK_LIST }}', frameworkListText);

    const model = gemini.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    try {
        console.log('[Mapper] Asking AI to select frameworks...');
        const selectionResult = await model.generateContent([
            selectionPrompt,
            { text: `Document Content:\n${contentPreview}` }
        ]);

        const selectionText = selectionResult.response.text();
        console.log('[Mapper] AI Selection Raw Output:', selectionText);

        const cleanedSelectionJson = selectionText.replace(/```json/g, '').replace(/```/g, '').trim();
        let selectionData;
        try {
            selectionData = JSON.parse(cleanedSelectionJson);
        } catch (jsonErr) {
            console.error('[Mapper] JSON Parse Failed:', jsonErr);
            return { success: false, message: 'AI returned invalid JSON' };
        }

        // Handle both single object (legacy) and array format (new)
        let selectedItems: { code: string; confidence: number; reasoning: string }[] = [];

        if (selectionData.selected_frameworks && Array.isArray(selectionData.selected_frameworks)) {
            selectedItems = selectionData.selected_frameworks;
        } else if (selectionData.selected_framework_code) {
            // Fallback for single mode if model ignores instructions
            selectedItems = [{
                code: selectionData.selected_framework_code,
                confidence: selectionData.confidence || 0.8,
                reasoning: selectionData.reasoning || ''
            }];
        }

        // Filter by confidence threshold (e.g. 0.6)
        const validSelections = selectedItems.filter(item => item.confidence >= 0.6);

        if (validSelections.length === 0) {
            console.log('[Mapper] No frameworks met the confidence threshold.');
            return { success: true, message: 'No suitable frameworks found (low confidence).' };
        }

        console.log(`[Mapper] Selected ${validSelections.length} frameworks:`, validSelections.map(s => s.code));

        // 4. Parallel Extraction
        const extractionPromises = validSelections.map(async (selection) => {
            // Synonym Mapping (Legacy support)
            const synonymMap: Record<string, string> = {
                'marketing_strategy': 'swot',
                'external_environment': 'pestle',
                'pest': 'pestle',
                'customer_persona': 'persona',
                'user_profile': 'persona',
                'audience_analysis': 'persona',
                'customer_journey': 'customer_experience_map',
                'cj': 'customer_experience_map',
                'cjm': 'customer_experience_map'
            };

            const finalCode = synonymMap[selection.code.toLowerCase()] || selection.code.toLowerCase();
            const targetFramework = frameworks.find(f => f.code.toLowerCase() === finalCode);

            if (!targetFramework) {
                console.warn(`[Mapper] Framework code not found: ${selection.code}`);
                return null;
            }

            console.log(`[Mapper] Extracting for ${targetFramework.code}...`);

            const extractionPrompt = FRAMEWORK_EXTRACTION_PROMPT
                .replace('{{FRAMEWORK_NAME}}', targetFramework.name)
                .replace('{{FRAMEWORK_SCHEMA}}', JSON.stringify(targetFramework.structure_schema, null, 2))
                .replace('{{DOCUMENT_CONTENT}}', contentPreview);

            try {
                const extractionResult = await model.generateContent(extractionPrompt);
                const extractionText = extractionResult.response.text();
                const cleanedExtractionJson = extractionText.replace(/```json/g, '').replace(/```/g, '').trim();
                const extractionData = JSON.parse(cleanedExtractionJson);

                // Upsert Logic
                // Upsert Logic with Aggregation (Smart Merge)
                // 1. Try to find an exact match for the file (Legacy Logic - Re-processing)
                let { data: existingInstance } = await supabase
                    .from('knowledge_instances')
                    .select('id, title, data, source_file_ids')
                    .eq('framework_id', (targetFramework as any).id)
                    .contains('source_file_ids', [file.id])
                    .limit(1)
                    .maybeSingle();

                // 2. If not found, try to find a conceptual match by TITLE (New Aggregation Logic)
                // If title extraction is "Standardized", we can match on title.
                // e.g. "SWOT - Product X"
                if (!existingInstance) {
                    // LLM-based Consolidation Logic
                    // 1. Fetch potential candidates (same framework)
                    // We only filter by department if the file has one, otherwise we look at all (for consistency)
                    let candidatesQuery = supabase
                        .from('knowledge_instances')
                        .select('id, title, data, source_file_ids')
                        .eq('framework_id', (targetFramework as any).id);

                    if (file.user_profiles?.department_id) {
                        candidatesQuery = candidatesQuery.eq('department_id', file.user_profiles.department_id);
                    }

                    const { data: candidates } = await candidatesQuery.limit(30); // Higher limit for better matching

                    if (candidates && candidates.length > 0) {
                        const candidateListText = candidates
                            .map(c => `- ID: ${c.id}, Title: "${c.title}"`)
                            .join('\n');

                        // 2. Ask AI Judge
                        const { CONSOLIDATION_PROMPT } = await import('./prompts'); // Dynamic import to avoid circular dependency issues if any
                        const judgePrompt = CONSOLIDATION_PROMPT
                            .replace('{{NEW_TITLE}}', extractionData.title || 'Unknown Title')
                            .replace('{{FILENAME}}', file.filename)
                            .replace('{{FRAMEWORK_NAME}}', targetFramework.name)
                            .replace('{{EXISTING_CANDIDATES}}', candidateListText);

                        try {
                            const judgeResult = await model.generateContent(judgePrompt);
                            const judgeText = judgeResult.response.text();
                            const cleanedJudgeJson = judgeText.replace(/```json/g, '').replace(/```/g, '').trim();
                            const judgeDecision = JSON.parse(cleanedJudgeJson);

                            if (judgeDecision.action === 'MERGE' && judgeDecision.target_instance_id) {
                                const targetId = judgeDecision.target_instance_id;
                                const targetMatch = candidates.find(c => c.id === targetId);
                                if (targetMatch) {
                                    existingInstance = targetMatch;
                                    console.log(`[Mapper] LLM decided to MERGE into: ${existingInstance.id} (${existingInstance.title}) - Reason: ${judgeDecision.reasoning}`);
                                } else {
                                    console.warn(`[Mapper] LLM suggested invalid ID: ${targetId}`);
                                }
                            } else {
                                console.log(`[Mapper] LLM decided to CREATE NEW. Reason: ${judgeDecision.reasoning}`);
                            }
                        } catch (judgeErr) {
                            console.error('[Mapper] Consolidation Judge Failed:', judgeErr);
                            // Fallback to Create New
                        }
                    }
                }

                if (existingInstance) {
                    // Merge Data Logic
                    const mergedData = { ...extractionData.data };
                    // If we are merging into an existing instance (from a different file), we should be careful not to lose old data
                    if (existingInstance?.data) {
                        Object.keys(existingInstance.data).forEach(key => {
                            const oldVal = existingInstance.data[key];
                            const newVal = mergedData[key];

                            // Array: Union
                            if (Array.isArray(oldVal) && Array.isArray(newVal)) {
                                mergedData[key] = Array.from(new Set([...oldVal, ...newVal]));
                            }
                            // String: Append if different
                            else if (typeof oldVal === 'string' && typeof newVal === 'string' && oldVal !== newVal) {
                                // Only append if it's not super long, maybe add a newline?
                                // For now, let's keep the NEW value as primary or append?
                                // Let's append with newline to be safe
                                mergedData[key] = oldVal + '\n---\n' + newVal;
                            }
                        });
                    }

                    // Merge Source File IDs
                    const currentSourceIds = existingInstance?.source_file_ids || [];
                    const newSourceIds = Array.from(new Set([...currentSourceIds, file.id]));

                    const { data: updated } = await supabase
                        .from('knowledge_instances')
                        .update({
                            title: extractionData.title || `${targetFramework.name} of ${file.filename}`,
                            ai_summary: extractionData.ai_summary, // Ideally merge summary too, but replacement is acceptable for now
                            data: mergedData,
                            completeness: extractionData.completeness,
                            confidence: extractionData.confidence,
                            source_file_ids: newSourceIds,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existingInstance.id)
                        .select()
                        .single();
                    return updated;
                } else {
                    const { data: inserted } = await supabase
                        .from('knowledge_instances')
                        .insert({
                            framework_id: (targetFramework as any).id,
                            title: extractionData.title || `${targetFramework.name} of ${file.filename}`,
                            ai_summary: extractionData.ai_summary,
                            data: extractionData.data,
                            completeness: extractionData.completeness,
                            confidence: extractionData.confidence,
                            source_file_ids: [file.id],
                            department_id: file.user_profiles?.department_id,
                            created_by: file.uploaded_by
                        })
                        .select()
                        .single();
                    return inserted;
                }

            } catch (err) {
                console.error(`[Mapper] Extraction failed for ${targetFramework.code}:`, err);
                return null;
            }
        });

        const results = await Promise.all(extractionPromises);
        const successfulInstances = results.filter(r => r !== null);

        return {
            success: true,
            message: `Mapped to ${successfulInstances.length} frameworks`,
            instanceIds: successfulInstances.map(i => i.id)
        };

    } catch (error: any) {
        console.error('Mapper Logic Error:', error);
        return { success: false, message: `Analysis failed: ${error.message}` };
    }
}
