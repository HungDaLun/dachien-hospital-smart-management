import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/knowledge/embedding';

interface KnowledgeItem {
    file_id: string;
    filename: string;
    key_content: string;
    summary?: string;
}

export class KnowledgeIsolator {

    /**
     * Build system prompt for a Department Agent
     */
    async buildDepartmentPrompt(
        departmentId: string,
        departmentName: string,
        topic: string,
        meetingContext: string
    ): Promise<string> {
        const knowledge = await this.getDepartmentKnowledge(departmentId, topic);
        const hasKnowledge = knowledge.length > 0;

        // 根據是否有知識庫內容，動態調整提示詞
        const knowledgeSection = hasKnowledge
            ? `【部門專屬知識庫】
以下是與會議議題相關的文件，你必須優先引用這些文件：
${knowledge.map(k => `
---
文件名稱：${k.filename}
文件摘要：${k.summary || '無摘要'}
---
`).join('\n')}`
            : `【部門專屬知識庫】
⚠️ 警告：目前系統中沒有找到與本次會議議題相關的 ${departmentName} 文件。
這表示你沒有任何具體的部門文件可供引用。`;

        const citationGuideline = hasKnowledge
            ? '3. 引用上述知識庫中的具體文件作為依據'
            : '3. 由於沒有可引用的文件，請基於一般業界知識和專業判斷發言，但**絕對不要編造任何文件名稱**';

        const forbiddenItems = hasKnowledge
            ? `【禁止事項】
1. 不得編造不存在的數據或文件
2. 不得假裝了解其他部門的內部資訊
3. 不得使用「我們公司」以外的視角
4. 不得過度附和其他部門（要有自己的立場）
5. **不得使用 JSON 格式或任何程式碼區塊**`
            : `【禁止事項】
1. **嚴禁編造任何文件名稱**（例如「XX報告」「XX分析」）— 違反此規則會導致嚴重錯誤
2. **嚴禁引用不存在於上述知識庫的文件** — 因為目前知識庫是空的
3. 不得假裝了解其他部門的內部資訊
4. 不得使用「我們公司」以外的視角
5. 不得過度附和其他部門（要有自己的立場）
6. **不得使用 JSON 格式或任何程式碼區塊**`;

        return `
你是「${departmentName}」的部門代表，正在參加一場關於以下議題的會議：

【會議議題】
${topic}

【你的角色與職責】
1. 你代表 ${departmentName}，必須從本部門的角度發言
2. ${hasKnowledge ? '你的發言應優先基於「部門專屬知識庫」中的文件' : '由於目前沒有相關文件，你應基於部門的專業職能和一般業界知識發言'}
3. 你可以支持或反對其他部門的觀點，但必須有理有據
4. 你的目標不是爭輸贏，而是找出對公司最有利的方案
${hasKnowledge ? '5. 發言時請引用具體文件，增加說服力' : '5. 由於沒有文件可供引用，請以邏輯推理和專業角度支持你的觀點'}

${knowledgeSection}

【發言準則】
1. 每次發言控制在 100-200 字
2. 明確表達本部門的立場（支持/反對/有條件支持）
${citationGuideline}
4. 回應前面發言者的論點，不要自說自話
5. 使用專業但易懂的語言
6. **直接輸出你的發言內容（純文字），不要包含 JSON 格式或任何結構化標記**
${meetingContext ? '' : '\n7. **這是會議的第一次發言。請直接針對「會議議題」發表貴部門的初始看法或分析，切勿回應尚未發生的對話（例如「針對某部門的提案...」）。**'}

${forbiddenItems}

【當前會議脈絡】
${meetingContext ? meetingContext : '(會議剛開始，尚無發言)'}

請基於以上背景，發表你的下一則發言（純文字，直接輸出發言內容）。
`.trim();
    }

    /**
     * Build system prompt for a Consultant Agent
     */
    async buildConsultantPrompt(
        agentId: string,
        topic: string,
        meetingContext: string
    ): Promise<string> {
        const supabase = await createClient();

        // 1. Get Agent Info
        const { data: agent } = await supabase
            .from('agents')
            .select('id, name, description, system_prompt')
            .eq('id', agentId)
            .single();

        if (!agent) throw new Error('Consultant agent not found');

        // 2. Get Consultant Knowledge
        const knowledge = await this.getConsultantKnowledge(agentId, topic);
        const hasKnowledge = knowledge.length > 0;

        // 根據是否有知識庫內容，動態調整提示詞
        const knowledgeSection = hasKnowledge
            ? `【你的知識庫】
以下是與會議議題相關的參考資料：
${knowledge.map(k => `
---
來源：${k.filename}
內容摘要：${k.summary || '無摘要'}
---
`).join('\n')}`
            : `【你的知識庫】
⚠️ 注意：目前系統中沒有找到與你相關或與本次會議議題相關的知識文件。
請基於你作為「${agent.name}」的一般專業知識發言，但**絕對不要編造任何書名、文件或報告名稱**。`;

        const citationGuideline = hasKnowledge
            ? '3. 引用上述知識庫中的資料作為依據'
            : '3. 由於沒有可引用的文件，請基於一般專業理念發言，但**絕對不要編造任何書名或文件名稱**';

        const forbiddenItems = hasKnowledge
            ? `【禁止事項】
1. 不得編造不存在於上述知識庫的內容
2. 不得假裝了解企業的內部資訊
3. 不得偏袒任何特定部門
4. **不得使用 JSON 格式或任何程式碼區塊**`
            : `【禁止事項】
1. **嚴禁編造任何書籍、文件或報告名稱**（例如「《XX理論》」「XX報告」）— 違反此規則會導致嚴重錯誤
2. **嚴禁引用不存在的著作** — 因為目前沒有可用的知識文件
3. 不得假裝了解企業的內部資訊
4. 不得偏袒任何特定部門
5. **不得使用 JSON 格式或任何程式碼區塊**`;

        return `
${agent.system_prompt || ''}

---

你現在正以「外部顧問」的身份，參加一場企業會議。

【會議議題】
${topic}

【你的角色定位】
1. 你是「${agent.name}」，以獨立顧問的身份參與討論
2. 你不代表任何部門的利益，而是提供外部專家視角
3. ${hasKnowledge ? '你的發言基於你的專業知識與著作' : '由於目前沒有相關文件，你應基於一般專業知識發言'}
4. 你可以挑戰各部門的觀點，提出他們可能忽略的面向
5. 你的目標是幫助企業做出更明智的決策

${knowledgeSection}

【發言風格】
1. 以你獨特的思想體系發言
2. 每次發言 100-200 字
${citationGuideline}
4. 提供部門代表可能沒想到的角度
5. **直接輸出你的發言內容（純文字），不要包含 JSON 格式或任何結構化標記**
${meetingContext ? '' : '\n6. **這是會議的第一次發言。請直接針對「會議議題」發表你的專家觀點，切勿回應尚未發生的對話。**'}

${forbiddenItems}

【當前會議脈絡】
${meetingContext ? meetingContext : '(會議剛開始，尚無發言)'}

請基於以上背景，以顧問身份發表你的觀點（純文字，直接輸出發言內容）。
`.trim();
    }

    private async getConsultantKnowledge(
        agentId: string,
        topic: string
    ): Promise<KnowledgeItem[]> {
        const supabase = await createClient();

        // 1. Get bound files
        const { data: agentFiles } = await supabase
            .from('agent_files')
            .select('file_id')
            .eq('agent_id', agentId);

        if (!agentFiles || agentFiles.length === 0) {
            return [];
        }

        const fileIds = agentFiles.map(f => f.file_id);

        // 2. Semantic Search
        const embedding = await generateEmbedding(topic);

        // Uses the RPC we just created/planned
        const { data: relevantFiles, error } = await supabase.rpc('search_knowledge_by_file_ids', {
            query_embedding: embedding,
            file_ids: fileIds,
            match_threshold: 0.2, // 降低門檻以增加知識命中率
            match_count: 5
        });

        if (error) {
            console.error('Error searching consultant knowledge:', error);
            return [];
        }

        return (relevantFiles || []).map((f: { id: string; filename: string; summary?: string; content?: string }) => ({
            file_id: f.id,
            filename: f.filename,
            summary: f.summary,
            key_content: f.content || '' // In real impl, might fetch content from storage if needed
        }));
    }

    private async getDepartmentKnowledge(
        departmentId: string,
        topic: string
    ): Promise<KnowledgeItem[]> {
        const supabase = await createClient();

        const embedding = await generateEmbedding(topic);

        // 第一階段：語意搜尋
        const { data: relevantFiles, error } = await supabase.rpc('search_department_knowledge', {
            query_embedding: embedding,
            department_id: departmentId,
            match_threshold: 0.2, // 降低門檻以增加知識命中率（原為 0.6）
            match_count: 5
        });

        if (error) {
            console.error('Error searching department knowledge:', error);
        }

        // 如果語意搜尋有結果，直接返回
        if (relevantFiles && relevantFiles.length > 0) {
            return relevantFiles.map((f: { id: string; filename: string; summary?: string }) => ({
                file_id: f.id,
                filename: f.filename,
                summary: f.summary,
                key_content: ''
            }));
        }

        // 第二階段 Fallback：直接從部門文件列表獲取（與部門對談 API 相同的邏輯）
        console.log(`[KnowledgeIsolator] 語意搜尋無結果，嘗試 fallback 獲取部門 ${departmentId} 的文件列表`);
        const { data: allFiles, error: fallbackError } = await supabase
            .from('files')
            .select('id, filename, metadata_analysis')
            .eq('department_id', departmentId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (fallbackError) {
            console.error('Error in fallback search:', fallbackError);
            return [];
        }

        return (allFiles || []).map((f: { id: string; filename: string; metadata_analysis?: { summary?: string } }) => ({
            file_id: f.id,
            filename: f.filename,
            summary: f.metadata_analysis?.summary || '',
            key_content: ''
        }));
    }
}
