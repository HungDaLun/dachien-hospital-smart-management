import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeAggregationEngine } from '@/lib/knowledge/aggregation-engine';
import { createClient } from '@/lib/supabase/server';

const engine = new KnowledgeAggregationEngine();

export async function GET(_req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Authorization check (simplified)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const candidates = await engine.discoverAggregationCandidates();
        return NextResponse.json({ candidates });

    } catch (error) {
        console.error('Aggregation Discovery Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { conceptName, fileIds } = body;

        if (!conceptName || !fileIds || !Array.isArray(fileIds)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const result = await engine.aggregateKnowledge(conceptName, fileIds);
        return NextResponse.json({ success: true, result });

    } catch (error) {
        console.error('Aggregation Creation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
