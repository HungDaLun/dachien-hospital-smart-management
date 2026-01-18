import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { createOrchestratorAgent } from '../lib/super-assistant/orchestrator';
import { Content } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface UserProfile {
    id: string;
    full_name: string | null;
    role: string;
    department_id: string | null;
}

async function testMemory() {
    console.log('🤖 Starting Super Assistant Memory Verification...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Get a user
    const { data: users } = await supabase.from('user_profiles').select('*').limit(1);
    if (!users || users.length === 0) {
        console.error('❌ No user found');
        process.exit(1);
    }
    const user = users[0] as UserProfile;
    console.log(`👤 Using user: ${user.full_name} (${user.id})`);

    const agent = createOrchestratorAgent({
        systemUserId: user.id
    });

    // 2. Mock Session ID
    const sessionId = crypto.randomUUID();
    console.log(`🆔 Session ID: ${sessionId}`);

    // 3. Step 1: Initial query
    const q1 = "幫我查一下下一週的行程，我只想看，先不要幫我發 Line 喔。";
    console.log(`\n💬 Turn 1: "${q1}"`);

    const res1 = await agent.processMessage({
        id: crypto.randomUUID(),
        source: 'web',
        userId: user.id,
        externalUserId: user.id,
        content: { type: 'text', text: q1 },
        timestamp: new Date()
    }, []); // No history for turn 1

    console.log(`🤖 Response 1: ${res1.content.text?.substring(0, 100)}...`);

    // 4. Record history (Simulate API behavior)
    const history: Content[] = [
        { role: 'user', parts: [{ text: q1 }] },
        { role: 'model', parts: [{ text: res1.content.text || '' }] }
    ];

    // 5. Turn 2: Contextual query
    const q2 = "剛才看到的行程中，最晚的一個是什麼時候？";
    console.log(`\n💬 Turn 2 (Context Dependent): "${q2}"`);

    const res2 = await agent.processMessage({
        id: crypto.randomUUID(),
        source: 'web',
        userId: user.id,
        externalUserId: user.id,
        content: { type: 'text', text: q2 },
        timestamp: new Date()
    }, history);

    console.log(`🤖 Response 2:`);
    console.log('   ---------------------------------------------------');
    console.log(`   ${res2.content.text}`);
    console.log('   ---------------------------------------------------');

    console.log('\n✅ Memory Verification Completed.');
}

testMemory().catch(console.error);
