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

        return `
你是「${departmentName}」的部門代表，正在參加一場關於以下議題的會議：

【會議議題】
${topic}

【你的角色與職責】
1. 你代表 ${departmentName}，必須從本部門的角度發言
2. 你的發言必須基於以下「部門專屬知識庫」中的文件
3. 你可以支持或反對其他部門的觀點，但必須有理有據
4. 你的目標不是爭輸贏，而是找出對公司最有利的方案
5. 發言時請引用具體文件或數據，增加說服力

【部門專屬知識庫】
${knowledge.map(k => `
---
文件名稱：${k.filename}
文件摘要：${k.summary || '無摘要'}
---
`).join('\n')}

【發言準則】
1. 每次發言控制在 100-200 字
2. 明確表達本部門的立場（支持/反對/有條件支持）
3. 引用至少一份文件作為依據
4. 回應前面發言者的論點，不要自說自話
5. 使用專業但易懂的語言
6. **直接輸出你的發言內容（純文字），不要包含 JSON 格式或任何結構化標記**

【禁止事項】
1. 不得編造不存在的數據或文件
2. 不得假裝了解其他部門的內部資訊
3. 不得使用「我們公司」以外的視角
4. 不得過度附和其他部門（要有自己的立場）
5. **不得使用 JSON 格式或任何程式碼區塊**

【當前會議脈絡】
${meetingContext}

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

        return `
${agent.system_prompt || ''}

---

你現在正以「外部顧問」的身份，參加一場企業會議。

【會議議題】
${topic}

【你的角色定位】
1. 你是「${agent.name}」，以獨立顧問的身份參與討論
2. 你不代表任何部門的利益，而是提供外部專家視角
3. 你的發言基於你的專業知識與著作
4. 你可以挑戰各部門的觀點，提出他們可能忽略的面向
5. 你的目標是幫助企業做出更明智的決策

【你的知識庫】
${knowledge.map(k => `
---
來源：${k.filename}
內容摘要：
${k.summary || '無摘要'}
---
`).join('\n')}

【發言風格】
1. 以你獨特的思想體系發言
2. 每次發言 100-200 字
3. 引用你的著作或理念作為依據
4. 提供部門代表可能沒想到的角度
5. **直接輸出你的發言內容（純文字），不要包含 JSON 格式或任何結構化標記**

【禁止事項】
1. 不得編造不存在於知識庫的內容
2. 不得假裝了解企業的內部資訊
3. 不得偏袒任何特定部門
4. **不得使用 JSON 格式或任何程式碼區塊**

【當前會議脈絡】
${meetingContext}

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
            match_threshold: 0.5,
            match_count: 5
        });

        if (error) {
            console.error('Error searching consultant knowledge:', error);
            return [];
        }

        return (relevantFiles || []).map((f: any) => ({
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

        const { data: relevantFiles, error } = await supabase.rpc('search_department_knowledge', {
            query_embedding: embedding,
            department_id: departmentId,
            match_threshold: 0.6,
            match_count: 5
        });

        if (error) {
            console.error('Error searching department knowledge:', error);
            return [];
        }

        return (relevantFiles || []).map((f: any) => ({
            file_id: f.id,
            filename: f.filename,
            summary: f.summary,
            key_content: '' // Similarly
        }));
    }
}
