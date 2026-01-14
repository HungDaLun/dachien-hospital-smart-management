
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSkillsMPClient } from '@/lib/skills/skillsmp-client';
import { SkillMarketTranslator } from '@/lib/skills/translator';
import { toApiResponse } from '@/lib/errors';

const translator = new SkillMarketTranslator();

/**
 * GET /api/skills/marketplace/seed
 * 從 AgentSkills 預選前 50 名熱門技能並匯入本地
 */
export async function POST(_request: NextRequest) {
    try {
        const client = await getSkillsMPClient();
        if (!client) throw new Error('無法初始化市集客戶端');

        console.log('[Seed] Fetching top 50 skills from AgentSkills...');

        // 1. 抓取前 50 名 (透過 stars 排序)
        const response = await client.searchSkills('', { limit: 50, sortBy: 'stars' });

        if (!response.success || !response.data) {
            throw new Error(response.error?.message || '抓取市集資料失敗');
        }

        const externalSkills = response.data.skills;
        console.log(`[Seed] Found ${externalSkills.length} skills from AgentSkills API.`);

        // 2. 為了確保品質，我們進行批次翻譯 (英翻中)
        console.log('[Seed] Starting translation batch...');
        const translatedSkills = await translator.translateResults(externalSkills);
        console.log(`[Seed] Translation finished. Results: ${translatedSkills.length}`);

        const adminSupabase = createAdminClient();
        let importedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;

        // 3. 逐一匯入
        for (const skill of translatedSkills) {
            try {
                // 檢查是否已存在
                const { data: existing, error: checkError } = await adminSupabase
                    .from('skills_library')
                    .select('id')
                    .eq('external_id', skill.slug)
                    .maybeSingle();

                if (checkError) {
                    console.error(`[Seed] Error checking existing skill ${skill.slug}:`, checkError);
                    errorCount++;
                    continue;
                }

                const skillData = {
                    name: skill.slug,
                    display_name: skill.translatedTitle || skill.title || skill.name,
                    description: skill.translatedDescription || skill.description,
                    skill_content: skill.translatedDescription || skill.description,
                    category: mapCategory(skill.category),
                    tags: [...(skill.tags || []), `stars:${skill.stars || 0}`],
                    author: skill.author || 'Open Source',
                    is_official: false,
                    is_active: true, // 重要：確保預設是啟用的
                    source: 'skillsmp', // 配合資料庫 CHECK 約束 (internal, skillsmp, enterprise)
                    external_id: skill.slug,
                    external_url: skill.githubUrl || `https://github.com/${skill.repoFullName}`,
                    updated_at: new Date().toISOString()
                };

                if (existing) {
                    const { error: updateError } = await adminSupabase.from('skills_library').update(skillData).eq('id', existing.id);
                    if (updateError) {
                        console.error(`[Seed] Update failed for ${skill.slug}:`, updateError);
                        errorCount++;
                    } else {
                        updatedCount++;
                    }
                } else {
                    const { error: insertError } = await adminSupabase.from('skills_library').insert({
                        ...skillData,
                        created_at: new Date().toISOString(),
                        version: '1.0.0',
                        icon: getIconByCategory(skill.category)
                    });
                    if (insertError) {
                        console.error(`[Seed] Insert failed for ${skill.slug}:`, insertError);
                        errorCount++;
                    } else {
                        importedCount++;
                    }
                }
            } catch (innerErr) {
                console.error(`[Seed] Critical inner error for ${skill.slug}:`, innerErr);
                errorCount++;
            }
        }

        console.log(`[Seed] Done. Imported: ${importedCount}, Updated: ${updatedCount}, Errors: ${errorCount}`);

        return NextResponse.json({
            success: true,
            data: {
                total: externalSkills.length,
                imported: importedCount,
                updated: updatedCount,
                errors: errorCount
            }
        });

    } catch (error) {
        console.error('[Seed Error]', error);
        return toApiResponse(error);
    }
}

/**
 * 分類對應實作 (與外部 API 分類對齊)
 */
function mapCategory(category?: string): string {
    if (!category) return 'general';
    const lower = category.toLowerCase();
    const map: Record<string, string> = {
        'development': 'analytics',
        'marketing': 'marketing',
        'sales': 'sales',
        'hr': 'hr',
        'legal': 'legal',
        'finance': 'finance',
        'support': 'support',
        'productivity': 'operations',
        'data': 'analytics'
    };
    return map[lower] || 'general';
}

function getIconByCategory(category?: string): string {
    const iconMap: Record<string, string> = {
        'development': '💻',
        'marketing': '📢',
        'sales': '💼',
        'hr': '👥',
        'legal': '⚖️',
        'finance': '💰',
        'support': '🎧',
        'analytics': '📊'
    };
    return iconMap[category?.toLowerCase() || ''] || '🧩';
}
