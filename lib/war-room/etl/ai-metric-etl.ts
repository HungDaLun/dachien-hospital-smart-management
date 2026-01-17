import { createClient } from '@/lib/supabase/server';
import {
    uploadFileToGemini,
    generateContent,
    retryWithBackoff
} from '@/lib/gemini/client';
import { downloadFromS3 } from '@/lib/storage/s3';
import { MetricDefinition } from '../types';

/**
 * AI-Driven ETL Engine
 * Extracts standardized metrics from unstructured files (PDF, CSV, Excel, etc.)
 */
export class AIMetricETLEngine {

    /**
     * Core Process: Extract metrics from a file
     */
    async processFileForMetrics(fileId: string): Promise<{ status: string; count: number; error?: string }> {
        const supabase = await createClient();

        // 1. Get File Record
        const { data: file, error } = await supabase
            .from('files')
            .select('*')
            .eq('id', fileId)
            .single();

        if (error || !file) {
            console.error(`[ETL] File not found: ${fileId}`);
            return { status: 'failed', count: 0, error: 'File not found' };
        }

        try {
            // 2. Prepare Gemini File URI
            let geminiUri = file.gemini_file_uri;

            if (!geminiUri) {
                // Must upload to Gemini first
                console.log(`[ETL] Uploading file ${file.filename} to Gemini...`);
                let buffer: Buffer;

                if (file.s3_storage_path) {
                    buffer = await downloadFromS3(file.s3_storage_path);
                } else {
                    return { status: 'skipped', count: 0, error: 'No content available (S3 path missing)' };
                }

                const uploadResult = await uploadFileToGemini(buffer, file.mime_type, file.filename);
                geminiUri = uploadResult.uri;

                // Save URI for future use
                await supabase.from('files').update({ gemini_file_uri: geminiUri }).eq('id', fileId);
            }

            // 3. Get Metric Definitions (Schema)
            const { data: definitions } = await supabase.from('metric_definitions').select('*');
            const validMetrics = definitions?.map((d: MetricDefinition) =>
                `- ID: ${d.id}, Name: ${d.name} (${d.unit}), Keywords: ${d.keywords.join(', ')}`
            ).join('\n') || '';

            if (!validMetrics) {
                console.log('[ETL] No metric definitions found. Skipping extraction.');
                return { status: 'skipped', count: 0, error: 'No definitions' };
            }

            // 4. AI Extraction Prompt
            const prompt = `
You are a Data Extraction Expert. Your goal is to extract specific structured metrics from the provided document.

Target Metrics Schema (Only extract these):
${validMetrics}

Instructions:
1. Analyze the document content carefully.
2. Identify values that match the Target Metrics.
3. If a metric is found, extract the value, the timestamp (closest date associated with the value), and any relevant dimensions (like department, region).
4. If the document contains no relevant metrics, return an empty array.
5. Extract ONLY the numeric value. Convert text like "$1.5M" to 1500000.

Return JSON Format:
{
  "metrics": [
    {
      "metric_id": "Target Metric ID",
      "value": 123.45,
      "timestamp": "YYYY-MM-DD",
      "dimensions": { "department": "Sales", "region": "North America" },
      "confidence": 0.95
    }
  ]
}
`;

            const jsonResponse = await retryWithBackoff(() => generateContent(
                'gemini-3-flash-preview',
                prompt,
                geminiUri,
                file.mime_type
            ));

            // 5. Parse Response
            const cleanJson = jsonResponse.replace(/```json\n?|\n?```/g, '').trim();
            const result = JSON.parse(cleanJson);

            if (!result.metrics || !Array.isArray(result.metrics) || result.metrics.length === 0) {
                return { status: 'success', count: 0 };
            }

            // 6. Save to Database
            interface ExtractedMetric {
                metric_id: string;
                value: number;
                timestamp: string;
                dimensions?: Record<string, string>;
                confidence?: number;
            }

            const metricsToInsert = result.metrics.map((m: ExtractedMetric) => ({
                metric_id: m.metric_id,
                value: m.value,
                timestamp: m.timestamp,
                dimensions: m.dimensions || {},
                source_file_id: fileId,
                confidence: m.confidence || 0.8,
                user_id: file.user_id // Inherit owner
            }));

            const { error: insertError } = await supabase.from('metric_values').insert(metricsToInsert);

            if (insertError) {
                throw insertError;
            }

            return { status: 'success', count: metricsToInsert.length };

        } catch (err: unknown) {
            console.error('[ETL] Extraction failed:', err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            return { status: 'failed', count: 0, error: errorMessage };
        }
    }
}
