import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get URL parameters for filtering
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        let query = supabase
            .from('agent_templates')
            .select('*')
            .order('category', { ascending: true })
            .order('name', { ascending: true });

        // Apply filters if present
        if (category) {
            query = query.eq('category', category);
        }

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data: templates, error } = await query;

        if (error) {
            console.error('Error fetching agent templates:', error);
            return NextResponse.json(
                { error: 'Failed to fetch templates' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: templates
        });

    } catch (error) {
        console.error('Unexpected error in GET /api/agents/templates:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
