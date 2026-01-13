
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load env vars
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath, override: true });
}

// Import definitions
import { calculate_statistics, web_search } from '../lib/tools/definitions/analysis';
import { generate_chart } from '../lib/tools/definitions/visualization';
import { ToolDefinition } from '../lib/tools/types';
import { loadAllTools } from '../lib/tools/registry';

// Setup Supabase (mock client for public tools or real if env vars present)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Use anon key for public tools
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest(tool: ToolDefinition, params: any) {
    console.log(`\nTesting tool: ${tool.name}...`);
    try {
        // Validate schema if z.object
        if (tool.parameters.safeParse) {
            const parsed = tool.parameters.safeParse(params);
            if (!parsed.success) {
                console.error('  ❌ Validation Failed:', parsed.error);
                return;
            }
            console.log(`  Params valid:`, parsed.data);
        } else {
            console.log(`  Params (no strict validation):`, params);
        }

        // Execute
        if (tool.execute) {
            const result = await tool.execute(params, {
                agentId: 'test-agent',
                runId: 'test-run',
                userId: 'test-user',
                sessionId: 'test-session'
            });

            console.log(`  Result:`, JSON.stringify(result, null, 2));
            console.log(`  ✅ ${tool.name} Passed`);
        } else {
            console.log(`  ⚠️ Skipping execution: No .execute method on definition.`);
        }
    } catch (e) {
        console.error(`  ❌ ${tool.name} Failed:`, e);
    }
}

async function main() {
    console.log('🧪 Starting Tool Verification...');

    // 1. Test Calculate Statistics
    await runTest(calculate_statistics, {
        dataset: [1, 2, 3, 4, 5, 5, 10],
        metrics: ['mean', 'median', 'mode', 'max']
    });

    // 2. Test Generate Chart
    await runTest(generate_chart, {
        chartType: 'bar',
        title: 'Sales Q1',
        data: [{ month: 'Jan', sales: 100 }, { month: 'Feb', sales: 150 }],
        xAxisKey: 'month',
        seriesKeys: ['sales']
    });

    // 3. Test Web Search
    await runTest(web_search, {
        query: 'EAKAP AI Framework',
        numResults: 2
    });

    // 4. Test Registry Loading (DB)
    console.log('\nTesting Registry Loading from DB...');
    try {
        const tools = await loadAllTools(); // loadAllTools returns all active tools
        const searchTool = tools.find(t => t.name === 'web_search');

        if (searchTool) {
            console.log('  ✅ Loaded web_search from registry correctly');
        } else {
            console.warn('  ⚠️ Available tools in DB:', tools.map(t => t.name));
            console.warn('  If web_search is not listed, check if Migration 2 (Seed) was applied.');
        }
    } catch (e) {
        console.error('  ❌ Registry Load Error:', e);
    }

    console.log('\n✨ Verification Complete.');
}

main().catch(console.error);
