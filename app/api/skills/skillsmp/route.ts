import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSkillsMPClient } from '@/lib/skills/skillsmp-client';
import { toApiResponse } from '@/lib/errors';
import { SkillMarketTranslator } from '@/lib/skills/translator';

export const dynamic = 'force-dynamic';

const translator = new SkillMarketTranslator();

/**
 * GET /api/skills/skillsmp
 * 搜尋 AgentSkills 技能 (支援自動中英翻譯)
 */
export async function GET(request: NextRequest) {
    try {
        // 驗證使用者已登入
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: '請先登入' } },
                { status: 401 }
            );
        }

        // 取得搜尋參數
        const searchParams = request.nextUrl.searchParams;
        let query = searchParams.get('q');
        const mode = searchParams.get('mode') || 'keyword';
        const limit = parseInt(searchParams.get('limit') || '20');
        const sortBy = searchParams.get('sortBy') as string | null;

        if (!query) {
            return NextResponse.json(
                { success: false, error: { code: 'MISSING_QUERY', message: '請提供搜尋關鍵字' } },
                { status: 400 }
            );
        }

        // --- 在地化翻譯處理：搜尋關鍵字 (中翻英) ---
        const isChinese = /[\u4e00-\u9fa5]/.test(query);
        let searchKeywords = query;
        if (isChinese) {
            console.log(`[Marketplace] Translating chinese query: ${query}`);
            searchKeywords = await translator.translateQuery(query);
            console.log(`[Marketplace] Optimized keywords: ${searchKeywords}`);
        }

        // 取得客戶端
        const client = await getSkillsMPClient();
        if (!client) {
            throw new Error('無法初始化技能市集客戶端');
        }

        // 執行外部搜尋
        let result;
        if (mode === 'ai') {
            result = await client.aiSearch(searchKeywords);
        } else {
            result = await client.searchSkills(searchKeywords, {
                limit,
                sortBy: sortBy || 'stars',
            });
        }

        if (!result.success || !result.data) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }

        // --- 在地化翻譯處理：結果列表 (英翻中) ---
        let finalSkills = result.data.skills;
        if (finalSkills.length > 0) {
            console.log(`[Marketplace] Translating results batch: ${finalSkills.length} items`);
            finalSkills = await translator.translateResults(finalSkills);
        }

        return NextResponse.json({
            success: true,
            data: {
                skills: finalSkills, // 明確放在最前面或直接指定，確保使用翻譯後的版本
                total: result.data.total,
                originalQuery: query,
                translatedKeywords: searchKeywords
            },
        });

    } catch (error) {
        return toApiResponse(error);
    }
}

/**
 * POST /api/skills/skillsmp/import
 * 匯入 SkillsMP 技能到本地資料庫
 */
export async function POST(request: NextRequest) {
    try {
        // 驗證使用者已登入
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: '請先登入' } },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { skill } = body; // SkillsMP/AgentSkills 技能物件

        if (!skill || !skill.slug) {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_SKILL', message: '請提供有效的技能資料' } },
                { status: 400 }
            );
        }

        const adminSupabase = createAdminClient();

        // 取得客戶端以抓取 GitHub 上的 SKILL.md 內容
        const client = await getSkillsMPClient();
        let content = skill.content || '';

        // 如果沒有 content 且有 repoFullName，則從 GitHub 抓取
        if (!content && client && skill.repoFullName && skill.path) {
            console.log(`[Import] Fetching content from GitHub: ${skill.repoFullName}/${skill.path}`);
            const fetchedContent = await (client as any).fetchSkillContent(skill.repoFullName, skill.path);
            if (fetchedContent) {
                content = fetchedContent;
            }
        }

        // 檢查是否已經匯入過
        const { data: existingSkill } = await adminSupabase
            .from('skills_library')
            .select('id')
            .eq('external_id', skill.slug)
            .eq('source', 'skillsmp')
            .maybeSingle();

        const skillData = {
            display_name: skill.translatedTitle || skill.title || skill.name,
            description: skill.translatedDescription || skill.description,
            skill_content: content || skill.translatedDescription || skill.description || '',
            category: mapCategory(skill.category),
            tags: skill.tags || [],
            author: skill.author || 'Open Source Community',
            updated_at: new Date().toISOString(),
        };

        if (existingSkill) {
            // 更新現有技能
            const { error: updateError } = await adminSupabase
                .from('skills_library')
                .update(skillData)
                .eq('id', existingSkill.id);

            if (updateError) {
                console.error('更新技能失敗:', updateError);
                return NextResponse.json(
                    { success: false, error: { code: 'UPDATE_FAILED', message: '更新技能失敗' } },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                data: {
                    id: existingSkill.id,
                    message: '技能已更新',
                    action: 'updated',
                },
            });
        }

        // 建立新技能
        const { data: newSkill, error: insertError } = await adminSupabase
            .from('skills_library')
            .insert({
                ...skillData,
                name: skill.slug,
                icon: getIconByCategory(skill.category),
                source: 'skillsmp',
                external_id: skill.slug,
                external_url: skill.githubUrl || `https://github.com/${skill.repoFullName}`,
                version: '1.0.0',
                is_public: true,
                is_official: false,
                is_active: true,
            })
            .select()
            .single();

        if (insertError) {
            console.error('匯入技能失敗:', insertError);
            return NextResponse.json(
                { success: false, error: { code: 'INSERT_FAILED', message: '匯入技能失敗' } },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: newSkill.id,
                message: '技能已匯入',
                action: 'imported',
                skill: newSkill,
            },
        });

    } catch (error) {
        return toApiResponse(error);
    }
}

/**
 * 將 SkillsMP 分類對應到本地分類
 */
function mapCategory(category?: string): string {
    if (!category) return 'general';

    const categoryMap: Record<string, string> = {
        'development': 'analytics',
        'marketing': 'marketing',
        'sales': 'sales',
        'hr': 'hr',
        'legal': 'legal',
        'finance': 'finance',
        'support': 'support',
        'operations': 'operations',
        'productivity': 'operations',
        'communication': 'support',
        'data': 'analytics',
        'analysis': 'analytics',
        'business': 'operations',
    };

    const lowerCategory = category.toLowerCase();
    return categoryMap[lowerCategory] || 'general';
}

/**
 * 根據分類取得圖示
 */
function getIconByCategory(category?: string): string {
    const iconMap: Record<string, string> = {
        'development': '💻',
        'marketing': '📢',
        'sales': '💼',
        'hr': '👥',
        'legal': '⚖️',
        'finance': '💰',
        'support': '🎧',
        'operations': '📋',
        'analytics': '📊',
        'data': '📊',
        'productivity': '⚡',
    };

    if (!category) return '🧩';
    const lowerCategory = category.toLowerCase();
    return iconMap[lowerCategory] || '🧩';
}
