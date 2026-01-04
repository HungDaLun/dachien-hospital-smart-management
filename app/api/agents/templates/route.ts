import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { SkillsImporter } from '@/lib/skills/importer';
import { EakapSkillSchema } from '@/lib/skills/types';

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
        const tag = searchParams.get('tag');

        let query = supabase
            .from('agent_templates')
            .select('*')
            .order('category', { ascending: true })
            .order('name', { ascending: true });

        // Apply filters if present
        if (category) {
            query = query.eq('category', category);
        }

        if (tag) {
            query = query.contains('tags', [tag]);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
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

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        let skillData;

        // Check if this is an import action
        if (body.import_content) {
            try {
                // Import logic
                skillData = SkillsImporter.import(body.import_content);
            } catch (err) {
                return NextResponse.json(
                    { error: 'Invalid skill format or import failed' },
                    { status: 400 }
                );
            }
        } else {
            // Direct creation logic, validate against our schema
            const validation = EakapSkillSchema.safeParse(body);
            if (!validation.success) {
                return NextResponse.json(
                    { error: 'Validation failed', details: validation.error.format() },
                    { status: 400 }
                );
            }
            skillData = validation.data;
        }

        // Insert into database
        // Note: we map EakapSkill fields to DB columns. 
        // EakapSkill matches DB columns mostly, but we need to ensure mapped correctly.
        const dbPayload = {
            name: skillData.name,
            description: skillData.description,
            category: skillData.category,
            system_prompt_template: skillData.system_prompt_template,
            input_schema: skillData.input_schema,
            recommended_knowledge: {
                required_frameworks: skillData.required_frameworks,
                required_dikw_levels: skillData.required_dikw_levels,
                department_scope: skillData.department_scope
            }, // Map to existing JSONB column structure or new columns? 
            // The implementation plan suggested mapping these. 
            // Wait, types.ts has these as top level, but DB has `recommended_knowledge`.
            // Let's stick to the DB schema `recommended_knowledge` for now for compatibility.

            author: skillData.author,
            version: skillData.version,
            license: skillData.license,
            tags: skillData.tags,
            mcp_config: skillData.mcp_config,
            model_config: skillData.model_config,
            is_official: false // User created skills are not official by default
        };

        const { data, error } = await supabase
            .from('agent_templates')
            .insert([dbPayload])
            .select()
            .single();

        if (error) {
            console.error('Error creating template:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Unexpected error in POST /api/agents/templates:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
