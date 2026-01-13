// import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { LoadedSkill } from './types';

/**
 * 載入指定的一組技能
 * @param skillNames 技能名稱列表 (e.g., ['sales_guide', 'python_coder'])
 */
export async function loadSkills(skillNames: string[]): Promise<LoadedSkill[]> {
    if (!skillNames || skillNames.length === 0) {
        return [];
    }

    // Use Admin Client to ensure we can read system skills regardless of RLS for now (or standard client if preferred)
    // Usually skills are public read, so standard client is fine, but for safety in backend logic:
    const supabase = await createAdminClient();

    const { data: skills, error } = await supabase
        .from('skills_library')
        .select('name, display_name, prompt_instruction')
        .in('name', skillNames)
        .eq('is_active', true);

    if (error) {
        console.error('Failed to load skills:', error);
        return [];
    }

    return skills.map(s => ({
        name: s.name,
        display_name: s.display_name,
        instruction: s.prompt_instruction
    }));
}

/**
 * 將技能指令注入到 System Prompt 中
 * @param basePrompt 原始 System Prompt
 * @param skills 已載入的技能列表
 */
export function injectSkillInstructions(basePrompt: string, skills: LoadedSkill[]): string {
    if (skills.length === 0) {
        return basePrompt;
    }

    const skillInstructions = skills.map(s => {
        return `### [SKILL] ${s.display_name} (${s.name})
${s.instruction}
`;
    }).join('\n');

    return `${basePrompt}

---
## 🛠️ 專業技能掛載 (Loaded Skills)
以下是此 Agent 掛載的額外專業技能模組，請務必遵循以下特定指導原則：

${skillInstructions}
---
`;
}
