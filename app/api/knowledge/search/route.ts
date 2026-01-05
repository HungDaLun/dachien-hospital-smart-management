import { NextRequest, NextResponse } from 'next/server';
import { ANNSemanticSearchEngine } from '@/lib/knowledge/ann-search';
import { createClient } from '@/lib/supabase/server';

const searchEngine = new ANNSemanticSearchEngine();

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { query, filters, topK } = body;

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        const results = await searchEngine.search(
            query,
            topK || 10,
            filters // { departmentId, categoryId, dikwLevel }
        );

        return NextResponse.json({ results });

    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
