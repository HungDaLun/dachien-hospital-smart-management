import { Citation } from '../types';

/**
 * 從 AI 回應中提取引用來源
 */
export function extractCitations(rawCitations: unknown): Citation[] {
    if (!rawCitations) {
        return [];
    }

    const citationsArray = Array.isArray(rawCitations) ? rawCitations : [rawCitations];

    // Define a loose type for the raw citation object from JSON
    interface RawCitation {
        fileId?: string | number;
        file_id?: string | number;
        fileName?: string;
        file_name?: string;
        filename?: string;
        title?: string;
        excerpt?: string;
        quote?: string;
        reason?: string;
        relevance?: number;
    }

    return citationsArray
        .filter((c): c is RawCitation => !!c && typeof c === 'object')
        .map((c) => ({
            fileId: String(c.fileId || c.file_id || ''),
            fileName: String(c.fileName || c.file_name || c.filename || c.title || ''),
            excerpt: String(c.excerpt || c.quote || ''),
            reason: String(c.reason || ''),
            relevanceScore: typeof c.relevance === 'number' ? c.relevance : undefined,
        }))
        .filter((c) => c.fileName); // 至少要有檔案名稱
}
