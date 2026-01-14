import { NextResponse } from 'next/server';
import { loadAllTools } from '@/lib/tools/registry';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        // Use registry to load tools (cached)
        let tools = await loadAllTools();

        if (category) {
            tools = tools.filter(t => t.category === category);
        }

        const toolDtos = tools.map((t) => ({
            name: t.name,
            display_name: t.displayName,
            description: t.description,
            icon: t.icon,
            category: t.category,
            requires_api_key: t.requiresApiKey,
            is_premium: t.isPremium
        }));

        return NextResponse.json({
            success: true,
            data: toolDtos
        });
    } catch (error) {
        console.error('Error fetching tools:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch tools' },
            { status: 500 }
        );
    }
}
