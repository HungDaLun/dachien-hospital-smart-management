import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toApiResponse } from '@/lib/errors';
import { SkillsImporter } from '@/lib/skills/importer';
import { EakapSkillSchema } from '@/lib/skills/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/skills
 * 取得可用技能列表
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        let query = supabase
            .from('skills_library')
            .select('*')
            .eq('is_active', true)
            .order('category', { ascending: true })
            .order('display_name', { ascending: true });

        if (category) {
            query = query.eq('category', category);
        }

        if (search) {
            query = query.or(`display_name.ilike.%${search}%,description.ilike.%${search}%,name.ilike.%${search}%`);
        }

        const { data: skills, error } = await query;

        if (error) {
            return toApiResponse(error);
        }

        return NextResponse.json({
            success: true,
            data: skills || []
        });
    } catch (error) {
        return toApiResponse(error);
    }
}

/**
 * POST /api/skills
 * 建立新的技能（從匯入或直接建立）
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
                { status: 401 }
            );
        }

        const body = await request.json();
        let skillData;

        // 檢查是否為匯入動作
        if (body.import_content) {
            try {
                // 使用 SkillsImporter 解析匯入內容
                skillData = SkillsImporter.import(body.import_content);
            } catch {
                return NextResponse.json(
                    { success: false, error: { code: 'IMPORT_FAILED', message: 'Invalid skill format or import failed' } },
                    { status: 400 }
                );
            }
        } else {
            // 直接建立，驗證資料格式
            const validation = EakapSkillSchema.safeParse(body);
            if (!validation.success) {
                return NextResponse.json(
                    { success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: validation.error.format() } },
                    { status: 400 }
                );
            }
            skillData = validation.data;
        }

        // 取得使用者資訊
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'User not found' } },
                { status: 401 }
            );
        }

        // 使用 Admin Client 來寫入資料（因為可能需要繞過某些 RLS 限制）
        const adminSupabase = createAdminClient();

        // 將 EakapSkill 格式轉換為 skills_library 格式
        const skillPayload = {
            name: skillData.name,
            display_name: skillData.name, // 如果沒有 display_name，使用 name
            description: skillData.description || '',
            skill_content: skillData.system_prompt_template, // EakapSkill 的 system_prompt_template 對應到 skill_content
            category: skillData.category?.toLowerCase() || 'general',
            tags: skillData.tags || [],
            author: skillData.author || user.email || 'Unknown',
            version: skillData.version || '1.0.0',
            source: 'enterprise', // 使用者建立的技能標記為 enterprise
            is_public: false, // 預設為私有
            is_official: false,
            is_active: true,
            owner_user_id: user.id,
            required_tools: skillData.mcp_config?.tools?.map((t: { name: string }) => t.name) || [],
        };

        const { data: newSkill, error: insertError } = await adminSupabase
            .from('skills_library')
            .insert([skillPayload])
            .select()
            .single();

        if (insertError) {
            console.error('Error creating skill:', insertError);
            return NextResponse.json(
                { success: false, error: { code: 'INSERT_FAILED', message: insertError.message } },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: newSkill
        });

    } catch (error) {
        console.error('Unexpected error in POST /api/skills:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' } },
            { status: 500 }
        );
    }
}
