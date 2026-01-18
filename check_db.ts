import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
        .from('google_calendar_authorizations')
        .select('*');

    if (error) {
        console.error('Error fetching authorizations:', error);
    } else {
        console.log('Authorizations found:', data.length);
        console.log(JSON.stringify(data, null, 2));
    }
}

check();
