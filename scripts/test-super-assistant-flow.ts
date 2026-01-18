
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { createOrchestratorAgent } from '../lib/super-assistant/orchestrator';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runTest() {
    console.log('🤖 Starting Super Assistant Capabilities Test...');

    // 1. Setup Database Connection to find a user
    console.log('📊 Connecting to database...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Find a valid user (Admin preferred)
    console.log('👤 Finding a valid user context...');
    const { data: users, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);

    if (userError || !users?.length) {
        console.error('❌ Could not find any user in database:', userError);
        process.exit(1);
    }

    const testUser = users[0] as { id: string; full_name: string | null; role: string; department_id: string | null };
    console.log(`✅ Using User: ${testUser.full_name || 'User'} (${testUser.id})`);

    // 3. Initialize Orchestrator Agent
    console.log('🚀 Initializing Super Assistant (Orchestrator Agent)...');

    // Check keys for external tools
    const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN ? '✅ Present' : '❌ Missing';
    console.log(`   - Line Channel Token: ${lineToken}`);

    // Mock global fetch to avoid connection refused errors for available agents
    const originalFetch = global.fetch;

    interface MockResponse {
        ok: boolean;
        json: () => Promise<{ agents: never[] }>;
    }

    global.fetch = async (url: string | URL | Request, options?: RequestInit) => {
        if (url.toString().includes('/api/agents/available')) {
            const mockRes: MockResponse = {
                ok: true,
                json: async () => ({ agents: [] })
            };
            return mockRes as unknown as Response;
        }
        return originalFetch(url, options);
    };

    const agent = createOrchestratorAgent({
        systemUserId: testUser.id,
        userName: testUser.full_name || 'Test User',
        userRole: testUser.role || 'admin',
        departmentId: testUser.department_id || undefined
    });

    // 4. Test Scenario A: Calendar Query
    console.log('\n📅 [Test A] Testing Calendar Access...');
    const calendarQuery = "查詢我下週的行程";
    console.log(`   User Query: "${calendarQuery}"`);

    const calendarResponse = await agent.processMessage({
        id: 'test-msg-1',
        source: 'web',
        userId: testUser.id,
        externalUserId: testUser.id,
        content: { type: 'text', text: calendarQuery },
        timestamp: new Date()
    });

    console.log('   Agent Response:');
    console.log('   ---------------------------------------------------');
    console.log(`   ${calendarResponse.content.text}`);
    console.log('   ---------------------------------------------------');


    // 5. Test Scenario B: Send Line Message
    console.log('\n💬 [Test B] Testing Line Message Sending...');
    // Providing a clear instruction to trigger the specific tool
    const lineQuery = "幫我發送Line訊息給自己：這是來自系統自我檢測的問候訊息";
    console.log(`   User Query: "${lineQuery}"`);

    const lineResponse = await agent.processMessage({
        id: 'test-msg-2',
        source: 'web',
        userId: testUser.id,
        externalUserId: testUser.id,
        content: { type: 'text', text: lineQuery },
        timestamp: new Date()
    });

    console.log('   Agent Response:');
    console.log('   ---------------------------------------------------');
    console.log(`   ${lineResponse.content.text}`);
    console.log('   ---------------------------------------------------');

    console.log('\n✅ Test Completed.');
}

runTest().catch(console.error);
