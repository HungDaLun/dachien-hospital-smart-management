
import { generateContent } from '@/lib/gemini/client';

/**
 * 技能庫在地化翻譯工具
 */
export class SkillMarketTranslator {
    private model = 'gemini-3-flash-preview';

    // 靜態對照表：優先使用以確保速度與準確性
    private readonly OFFLINE_DICT: Record<string, string> = {
        '行銷': 'marketing',
        '市場': 'marketing',
        '銷售': 'sales',
        '業務': 'sales',
        '人資': 'hr',
        '人力資源': 'hr',
        '招聘': 'recruitment',
        '工程': 'engineering',
        '開發': 'coding',
        '程式': 'coding',
        '代碼': 'code',
        '法律': 'legal',
        '合約': 'contract',
        '財務': 'finance',
        '會計': 'accounting',
        '客服': 'support',
        '支援': 'support',
        '營運': 'operations',
        '專案': 'project',
        '管理': 'management',
        '數據': 'data',
        '資料': 'data',
        '分析': 'analytics',
        '寫作': 'writing',
        '文案': 'copywriting',
        '社群': 'social media',
        '郵件': 'email',
        '會議': 'meeting',
        '摘要': 'summary',
        '翻譯': 'translation',
        'SEO': 'seo',
    };

    /**
     * 將中文搜尋詞轉換為英文搜尋關鍵字
     */
    async translateQuery(chineseQuery: string): Promise<string> {
        // 1. 查表 (精確匹配)
        const normalized = chineseQuery.trim();
        if (this.OFFLINE_DICT[normalized]) {
            console.log(`[Translator] Offline hit: ${normalized} -> ${this.OFFLINE_DICT[normalized]}`);
            return this.OFFLINE_DICT[normalized];
        }

        // 2. 查表 (模糊匹配 - 簡單包含)
        for (const [key, value] of Object.entries(this.OFFLINE_DICT)) {
            if (normalized.includes(key)) {
                return value + ' ' + normalized.replace(key, '').trim();
            }
        }

        // 3. AI 翻譯
        const prompt = `
            Task: Convert the following Traditional Chinese AI Agent skill search query into optimize English search keywords.
            User Query: "${chineseQuery}"
            Rules:
            1. Output ONLY the English keywords.
            2. Be concise but descriptive.
            3. Do not assume technical terms if the intent is general.
        `;

        try {
            const result = await generateContent(this.model, prompt);
            // 積極清洗：移除 Markdown 標記、引號、換行
            let cleaned = result.trim()
                .replace(/```text/g, '')
                .replace(/```/g, '')
                .replace(/^"|"$/g, '')
                .replace(/\n/g, ' ')
                .trim();

            // 如果清洗後變空，回傳原文
            return cleaned || chineseQuery;
        } catch (error) {
            console.error('[Translator] Query translation failed:', error);
            return chineseQuery;
        }
    }

    /**
     * 批次翻譯搜尋結果列表
     */
    /**
     * 批次翻譯搜尋結果列表
     */
    async translateResults(skills: any[]): Promise<any[]> {
        if (skills.length === 0) return [];

        console.log(`[Translator] Starting translation for ${skills.length} skills...`);

        // 拆分成每 10 個一組，提高成功率與降低超時風險
        const CHUNK_SIZE = 10;
        const results: any[] = [];

        for (let i = 0; i < skills.length; i += CHUNK_SIZE) {
            const chunk = skills.slice(i, i + CHUNK_SIZE);
            console.log(`[Translator] Translating chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(skills.length / CHUNK_SIZE)}...`);

            const translatedChunk = await this.translateChunk(chunk);
            results.push(...translatedChunk);
        }

        const successCount = results.filter(s => s.translatedTitle || s.translatedDescription).length;
        console.log(`[Translator] Translation completed. Success: ${successCount}/${skills.length}`);

        return results;
    }

    /**
     * 翻譯單一區塊 (Internal helper)
     */
    /**
     * 翻譯單一區塊 (Internal helper)
     */
    private async translateChunk(skills: any[]): Promise<any[]> {
        const skillsToTranslate = skills.map((s, index) => ({
            k: `idx-${index}`,
            t: s.name || s.title || '',
            d: s.description ? s.description.substring(0, 800) : ''
        }));

        const prompt = `Translate this list of AI skills to Traditional Chinese (Taiwan).
Input: ${JSON.stringify(skillsToTranslate)}
Requirement: Output ONLY a JSON array of objects: 
[{"k":"idx-X", "t":"Translated Title", "d":"Translated Description", "s":"Short creative usage tip in Chinese"}]. 
Match the "k" keys exactly. The "s" should be a 1-sentence tip on how to combine this skill with other tools/agents.`;

        try {
            const result = await generateContent(this.model, prompt);
            if (!result) {
                console.warn('[Translator] Empty response from Gemini');
                return skills;
            }

            const parsed = this.cleanJson(result);
            if (!Array.isArray(parsed)) {
                console.warn('[Translator] Could not parse Gemini response as array');
                return skills;
            }

            return skills.map((original, index) => {
                const key = `idx-${index}`;
                let translated = parsed.find((t: any) => t.k === key);
                if (!translated && parsed.length === skills.length) {
                    translated = parsed[index];
                }

                if (translated) {
                    return {
                        ...original,
                        translatedTitle: translated.t,
                        translatedDescription: translated.d,
                        translatedTip: translated.s
                    };
                }
                return original;
            });
        } catch (error) {
            console.error('[Translator] Chunk error:', error);
            throw error; // Rethrow to be caught by the API
        }
    }

    /**
     * 強固的 JSON 清理與解析函式
     */
    private cleanJson(text: string): any {
        try {
            // 嘗試尋找第一個 [ 和最後一個 ]
            const start = text.indexOf('[');
            const end = text.lastIndexOf(']');

            if (start === -1 || end === -1) {
                // 如果沒有 []，可能是物件或純文字，嘗試直接解析
                return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
            }

            const jsonPart = text.substring(start, end + 1);
            return JSON.parse(jsonPart);
        } catch (e) {
            console.warn('[Translator] Failed to parse JSON:', text.substring(0, 100) + '...');
            return null;
        }
    }
}
