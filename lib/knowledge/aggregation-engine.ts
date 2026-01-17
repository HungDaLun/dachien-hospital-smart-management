import { createClient } from '@/lib/supabase/server';
import { generateContent } from '@/lib/gemini/client';

export interface AggregationCandidate {
    concept_name: string;
    file_ids: string[];
    reason: string;
}

export interface AggregationResult {
    unitId: string;
    conceptName: string;
}

/**
 * Knowledge Aggregation Engine
 * Automatically discovers and synthesizes dispersed knowledge fragments.
 */
export class KnowledgeAggregationEngine {

    /**
     * Discover potential aggregation candidates based on file analysis.
     * (Simplified version: grouping by explicit tags or category overlap for now, 
     *  real version would use vector clustering)
     */
    async discoverAggregationCandidates(): Promise<AggregationCandidate[]> {
        const supabase = await createClient();

        // Fetch synced files with their metadata
        const { data: files } = await supabase
            .from('files')
            .select('id, filename, metadata_analysis')
            .eq('gemini_state', 'SYNCED')
            .not('metadata_analysis', 'is', null) // Corrected from .not('metadata_analysis', 'is', null)
            .limit(50); // Analyze latest 50 for candidates

        if (!files || files.length < 2) return [];

        // Simple clustering logic: Group by 'topics' in metadata
        // In a real advanced system, we'd use k-means on embeddings.
        const topicMap: Record<string, string[]> = {};

        files.forEach(file => {
            const meta = file.metadata_analysis as { topics?: string[] } | null;
            if (meta?.topics && Array.isArray(meta.topics)) {
                meta.topics.forEach((topic: string) => {
                    // Normalize topic
                    const key = topic.toLowerCase().trim();
                    if (!topicMap[key]) topicMap[key] = [];
                    topicMap[key].push(file.id);
                });
            }
        });

        // Filter for clusters with at least 2 files
        const candidates: AggregationCandidate[] = [];

        for (const [topic, fileIds] of Object.entries(topicMap)) {
            if (fileIds.length >= 2) {
                candidates.push({
                    concept_name: topic,
                    file_ids: [...new Set(fileIds)], // Dedupe
                    reason: `Found ${fileIds.length} files discussing topic '${topic}'`
                });
            }
        }

        // Sort by size
        return candidates.sort((a, b) => b.file_ids.length - a.file_ids.length);
    }

    /**
     * Synthesize knowledge from a list of files into a Knowledge Unit
     */
    async aggregateKnowledge(conceptName: string, fileIds: string[]): Promise<AggregationResult> {
        const supabase = await createClient();

        // 1. Fetch file content
        const { data: files } = await supabase
            .from('files')
            .select('id, filename, markdown_content')
            .in('id', fileIds);

        if (!files || files.length === 0) {
            throw new Error('No files found for aggregation');
        }

        // 2. AI Synthesis
        const combinedContent = files.map(f => `--- FILE: ${f.filename} ---\n${f.markdown_content}`).join('\n\n');

        const prompt = `
    You are a Knowledge Architect.
    
    Goal: Synthesize a complete "Knowledge Unit" for the concept: "${conceptName}".
    
    Source Material:
    ${combinedContent.substring(0, 30000)} // Truncate to safe limit
    
    Instructions:
    1. Analyze the provided source files.
    2. Extract all key information related to "${conceptName}".
    3. Resolve any conflicts or duplicates. 
    4. Structure the output as a comprehensive guide or definition.
    5. Return ONLY the synthesized markdown content. Do not include introductory filler.
    `;

        const synthesizedContent = await generateContent('gemini-3-flash-preview', prompt);

        // 3. Save to DB
        const { data: unit, error: unitError } = await supabase
            .from('knowledge_units')
            .insert({
                concept_name: conceptName,
                synthesized_knowledge: synthesizedContent,
                source_count: files.length,
                completeness_score: 0.8 // Dummy score for now, could be assessed by AI
            })
            .select()
            .single();

        if (unitError) throw unitError;

        // 4. Link files
        const links = files.map(f => ({
            unit_id: unit.id,
            file_id: f.id,
            contribution: 'Part of source set'
        }));

        await supabase.from('knowledge_unit_files').insert(links);

        return {
            unitId: unit.id,
            conceptName: unit.concept_name
        };
    }
}
