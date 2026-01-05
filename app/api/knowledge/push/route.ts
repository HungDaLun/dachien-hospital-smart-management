import { NextRequest, NextResponse } from 'next/server';
import { KnowledgePushService } from '@/lib/knowledge/push-service';
import { createClient } from '@/lib/supabase/server';

const pushService = new KnowledgePushService();

export async function GET(_req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const recommendations = await pushService.generateRecommendations(user.id);
        return NextResponse.json({ recommendations });

    } catch (error) {
        console.error('Push Service Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(_req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Trigger manual analysis/refresh
        await pushService.analyzeUserInterests(user.id);
        const recommendations = await pushService.generateRecommendations(user.id);

        return NextResponse.json({ success: true, recommendations });

    } catch (error) {
        console.error('Push Analysis Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
