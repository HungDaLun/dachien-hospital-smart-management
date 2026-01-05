import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/knowledge/embedding';

export interface SearchFilters {
    departmentId?: string;
    categoryId?: string;
    dikwLevel?: string;
}

export interface SearchResult {
    file_id: string;
    filename: string;
    markdown_content: string; // partial/snippet usually by API
    similarity: number;
    dikw_level: string;
    decay_score: number;
    decay_status: string;
}

/**
 * High-Performance Semantic Search Engine (ANN)
 * Uses HNSW index via Supabase RPC.
 */
export class ANNSemanticSearchEngine {

    /**
     * Perform semantic search using Approximate Nearest Neighbor (ANN)
     */
    async search(
        query: string,
        topK: number = 10,
        filters?: SearchFilters
    ): Promise<SearchResult[]> {
        const supabase = await createClient();

        // 1. Generate Query Vector
        const queryEmbedding = await generateEmbedding(query);

        if (!queryEmbedding) {
            throw new Error('Failed to generate embedding for query');
        }

        // 2. Call RPC
        // Note: RPC name matches migration: semantic_search_ann
        const { data: results, error } = await supabase.rpc('semantic_search_ann', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5, // Lower threshold for ANN to ensure recall
            match_count: topK,
            filter_department: filters?.departmentId || null,
            filter_category: filters?.categoryId || null,
            filter_dikw_level: filters?.dikwLevel || null
        });

        if (error) {
            console.error('ANN Search Error:', error);
            throw error;
        }

        return (results as any[]).map(r => ({
            file_id: r.id,
            filename: r.filename,
            markdown_content: r.markdown_content,
            similarity: r.similarity,
            dikw_level: r.dikw_level,
            decay_score: r.decay_score,
            decay_status: r.decay_status
        }));
    }
}
