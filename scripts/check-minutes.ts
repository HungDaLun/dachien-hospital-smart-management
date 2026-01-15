
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const meetingId = '5f6aa3f9-562b-4be8-864a-151f71d92b88'; // The ID from previous log

    const { data: minutes, error } = await supabase
        .from('meeting_minutes')
        .select('*')
        .eq('meeting_id', meetingId)
        .single();

    if (error) {
        console.error("Error fetching minutes:", error);
        return;
    }

    console.log("Executive Summary:", minutes.executive_summary);
    // console.log("Content:", JSON.stringify(minutes.content, null, 2));
}

main().catch(console.error);
