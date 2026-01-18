
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { createOrchestratorAgent } from '../lib/super-assistant/orchestrator';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface UserProfile {
    id: string;
    full_name: string | null;
    role: string;
    department_id: string | null;
}

interface MockResponse {
    ok: boolean;
    json: () => Promise<{ agents: never[] }>;
}

async function verifyMyCalendar() {
    console.log('🤖 Starting Personal Calendar Verification...');

    // 1. Setup Database Connection
    console.log('📊 Connecting to database...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Find ANY user that has an active Google Calendar Authorization
    console.log('👤 Searching for user with AUTHORIZED calendar...');

    // Join logic simulation: get auths first
    const { data: auths, error: authError } = await supabase
        .from('google_calendar_authorizations')
        .select('*')
        .eq('is_active', true)
        .limit(1);

    if (authError) {
        console.error('❌ Database error querying authorizations:', authError);
        process.exit(1);
    }

    let targetUser: UserProfile | null = null;

    if (auths && auths.length > 0) {
        const auth = auths[0];
        console.log(`✅ Found active authorization record for user_id: ${auth.user_id}`);

        // Fetch user profile
        const { data: user, error: userError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', auth.user_id)
            .single();

        if (user && !userError) {
            targetUser = user as UserProfile;
        }
    }

    if (!targetUser) {
        console.log('⚠️ No authorized user found in database.');
        console.log('   Falling back to the first available admin user for simulation purpose,');
        console.log('   BUT this will likely fail the actual calendar fetch if not authorized.');

        const { data: users } = await supabase.from('user_profiles').select('*').limit(1);
        if (users && users.length > 0) targetUser = users[0] as UserProfile;
    }

    if (!targetUser) {
        console.error('❌ No usable user found.');
        process.exit(1);
    }

    // Ensure targetUser isn't null for TypeScript (redundant check but keeps flow clear)
    const validUser = targetUser;

    console.log(`✅ Target User: ${validUser.full_name || 'User'} (${validUser.id})`);


    // 3. Initialize Orchestrator Agent with this SPECIFIC user
    console.log('🚀 Initializing Super Assistant...');

    // Mock global fetch to avoid agent list connection errors, BUT allow Google API calls
    const originalFetch = global.fetch;

    global.fetch = async (url: string | URL | Request, options?: RequestInit) => {
        if (url.toString().includes('/api/agents/available')) {
            const mockRes: MockResponse = {
                ok: true,
                json: async () => ({ agents: [] })
            }
            return mockRes as unknown as Response;
        }
        return originalFetch(url, options);
    };

    const agent = createOrchestratorAgent({
        systemUserId: validUser.id,
        userName: validUser.full_name || 'Authorized User',
        userRole: validUser.role || 'user',
        departmentId: validUser.department_id || undefined
    });

    // 4. Test Scenario: Check Schedule
    console.log('\n📅 [Verification] Querying "My Schedule"...');
    const query = "確認他能看到我本週的行程"; // Using user's exact wording style
    console.log(`   User Query: "${query}"`);

    // NOTE: This will trigger 'list_calendar_events' tool.
    // Inside the tool, GoogleCalendarSyncService will try to fetch using the saved token.

    const response = await agent.processMessage({
        id: 'verify-msg-1',
        source: 'web',
        userId: validUser.id,
        externalUserId: validUser.id,
        content: { type: 'text', text: query },
        timestamp: new Date()
    });

    console.log('   Agent Response:');
    console.log('   ---------------------------------------------------');
    console.log(`   ${response.content.text}`);
    console.log('   ---------------------------------------------------');

    console.log('\n✅ Verification Completed.');
}

verifyMyCalendar().catch(console.error);
