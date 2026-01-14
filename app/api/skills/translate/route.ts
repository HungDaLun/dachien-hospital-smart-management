
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SkillMarketTranslator } from '@/lib/skills/translator';
import { toApiResponse } from '@/lib/errors';

const translator = new SkillMarketTranslator();

/**
 * POST /api/skills/translate
 * 批次翻譯資料庫中的英文技能
 */
export async function POST(_request: NextRequest) {
    try {
        const supabase = createAdminClient();

        // 1. 找出所有需要翻譯的技能 (標題或描述是英文)
        const { data: skills, error: fetchError } = await supabase
            .from('skills_library')
            .select('id, name, display_name, description');

        if (fetchError) throw fetchError;

        const needsTranslation = (skills?.filter(s => {
            const titleIsEnglish = !/[\u4e00-\u9fa5]/.test(s.display_name);
            const descIsEnglish = !/[\u4e00-\u9fa5]/.test(s.description || '');
            return titleIsEnglish || descIsEnglish;
        }) || []);

        const needsNames = needsTranslation.map(s => s.display_name);
        console.log(`[Translate Batch] Total skills: ${skills?.length}, Needs translation: ${needsTranslation.length}`);

        if (needsTranslation.length === 0) {
            return NextResponse.json({
                success: true,
                message: '所有技能皆已是中文，無需翻譯。',
                translatedCount: 0,
                found: []
            });
        }

        // 2. 呼叫翻譯器
        const resultsToTranslate = needsTranslation.map(s => ({
            id: s.id,
            name: s.display_name,
            description: s.description
        }));

        let translatedResults = [];
        try {
            translatedResults = await translator.translateResults(resultsToTranslate);
        } catch (err: any) {
            console.error('[Translate Batch] Translator error:', err);
            return NextResponse.json({
                success: false,
                error: { message: `翻譯器發生錯誤: ${err.message}` },
                found: needsNames
            });
        }

        // 3. 更新回資料庫
        let count = 0;
        const failedIds: string[] = [];

        for (const tr of translatedResults) {
            if (tr.translatedTitle || tr.translatedDescription) {
                const original = needsTranslation.find(s => s.id === tr.id);
                if (original) {
                    const updateData: any = {};
                    if (tr.translatedTitle) updateData.display_name = tr.translatedTitle;
                    if (tr.translatedDescription) {
                        let finalDesc = tr.translatedDescription;
                        if (tr.translatedTip) {
                            finalDesc += `\n\n---TIPS---\n${tr.translatedTip}`;
                        }
                        updateData.description = finalDesc;
                        updateData.skill_content = finalDesc;
                    }

                    const { error: updateError } = await supabase
                        .from('skills_library')
                        .update(updateData)
                        .eq('id', original.id);

                    if (!updateError) {
                        count++;
                    } else {
                        failedIds.push(original.id);
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            translatedCount: count,
            totalFound: needsTranslation.length
        });

    } catch (error) {
        return toApiResponse(error);
    }
}
