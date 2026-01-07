
import { createClient } from './lib/supabase/server';

async function test() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log('User:', user?.id);

    if (!user) return;

    const { data, error } = await supabase
        .from('external_intelligence')
        .select('count')
        .eq('user_id', user.id);

    console.log('Intelligence count:', data, error);

    const { data: topics } = await supabase
        .from('war_room_config')
        .select('watch_topics')
        .eq('user_id', user.id)
        .single();

    console.log('Topics:', topics);
}

test();
