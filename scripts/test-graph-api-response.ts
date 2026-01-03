
/**
 * 測試 Graph API 的實際輸出
 * 執行方法：npx tsx scripts/test-graph-api-response.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// 載入環境變數
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function testGraphApiResponse() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 模擬 API Route 的邏輯
    console.log('--- 模擬 Graph API 流程 ---');

    // 1. Files
    const { data: files, error: fError } = await supabase
        .from('files')
        .select('id, filename, mime_type, created_at, metadata_analysis, department_id')
        .eq('is_active', true)
        .eq('gemini_state', 'SYNCED');

    console.log(`Files count: ${files?.length}`);

    // 2. Instances
    const { data: instances, error: iError } = await supabase
        .from('knowledge_instances')
        .select(`
        id, 
        title, 
        framework_id, 
        knowledge_frameworks(code, name, ui_config, detailed_definition),
        ai_summary,
        completeness_score,
        confidence_score,
        content_data,
        source_file_ids,
        created_at,
        department_id
    `);

    if (iError) {
        console.error('Instances Error:', iError);
    }
    console.log(`Instances count: ${instances?.length}`);

    if (instances && instances.length > 0) {
        console.log('第一個 Instance 範例:', JSON.stringify(instances[0], null, 2));
    }

    // 3. Mapping Node Logic (Test if the logic in route.ts crashes)
    const nodes: any[] = [];
    (files || []).forEach((file) => {
        nodes.push({
            id: file.id,
            type: 'file',
            label: file.filename,
            data: {
                mimeType: file.mime_type,
                metadata: file.metadata_analysis
            }
        });
    });

    (instances || []).forEach((inst: any) => {
        nodes.push({
            id: inst.id,
            type: 'framework_instance',
            label: inst.title,
            data: {
                frameworkCode: inst.knowledge_frameworks?.code,
                frameworkName: inst.knowledge_frameworks?.name,
                detailedDefinition: inst.knowledge_frameworks?.detailed_definition,
                uiConfig: inst.knowledge_frameworks?.ui_config,
                aiSummary: inst.ai_summary,
                completeness: inst.completeness_score,
                confidence: inst.confidence_score,
                contentData: inst.content_data
            }
        });
    });

    console.log(`Final Nodes Count: ${nodes.length}`);
}

testGraphApiResponse();
