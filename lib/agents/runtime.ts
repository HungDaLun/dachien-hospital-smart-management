import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateEmbedding } from '@/lib/knowledge/embedding';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createHighRiskProcessor } from '@/lib/ai-safeguards';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ChatOptions {
    agentId: string;
    message: string;
    userId: string;
    sessionId?: string;
    history?: { role: string; content: string }[];
    isDelegation?: boolean; // 標記是否為委派呼叫 (跳過部分權限檢查或記錄邏輯)
}

interface ChatResponse {
    text: string;
    metadata: {
        confidence: number;
        reasoning?: string;
        citations: string[];
    };
    sessionId: string;
}

/**
 * 核心 Agent 運行時 (Agent Runtime)
 * 封裝了 Agent 的 RAG 檢索、Prompt 組裝、LLM 呼叫邏輯
 * 可供 API Route 或 Orchestrator 直接調用
 */
export async function runAgentChat(options: ChatOptions): Promise<ChatResponse> {
    const { agentId, message, userId, isDelegation } = options;
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // 1. 取得 Agent 設定
    const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('id, name, system_prompt, model_version, temperature, knowledge_files, enabled_tools')
        .eq('id', agentId)
        .single();

    if (agentError || !agent) {
        throw new Error(`Agent not found: ${agentId}`);
    }

    // 2. 處理 Session
    let sessionId = options.sessionId;
    if (!sessionId) {
        // 如果是委派，且沒有 Session，建立一個「子任務 Session」或直接掛在主 Session下?
        // 這裡簡單處理：如果是委派，建立一個臨時 Session 記錄，或者我們應該重用主 Session?
        // 為了記錄完整性，委派通常視為該 Agent 的一次獨立執行
        const { data: newSession } = await supabase
            .from('chat_sessions')
            .insert({
                agent_id: agentId,
                user_id: userId,
                title: `[Delegated] ${message.slice(0, 30)}...`,
                is_delegated: isDelegation || false
            })
            .select()
            .single();

        if (newSession) sessionId = newSession.id;
    }

    if (!sessionId) throw new Error('Failed to create session');

    // 紀錄使用者訊息 (如果是委派，這裡的角色是否要區分? 暫時維持 user)
    await supabase.from('chat_messages').insert({
        session_id: sessionId,
        agent_id: agentId,
        role: 'user',
        content: message
    });

    // 3. RAG 知識檢索邏輯 (重用既有邏輯)
    // ---------------------------------------------------------
    const { data: rules } = await supabase
        .from('agent_knowledge_rules')
        .select('rule_type, rule_value')
        .eq('agent_id', agent.id);

    const matchedFileIds: Set<string> = new Set(agent.knowledge_files || []);
    let departmentIds: string[] = [];

    if (rules && rules.length > 0) {
        const tagRules = rules.filter(r => r.rule_type === 'TAG');
        const deptRules = rules.filter(r => r.rule_type === 'DEPARTMENT');
        const categoryRules = rules.filter(r => r.rule_type === 'CATEGORY');

        // ... (Tags logic omitted for brevity, focusing on core flow) ...
        // 為了節省篇幅與時間，這裡使用已經驗證過的相同邏輯，重新實作一次
        if (tagRules.length > 0) {
            const tagFilters = tagRules.map(r => {
                const [key, value] = r.rule_value.split(':');
                return { key, value };
            });
            const { data: tagFiles } = await adminSupabase
                .from('file_tags')
                .select('file_id')
                .or(tagFilters.map(f => `and(tag_key.eq.${f.key},tag_value.eq.${f.value})`).join(','));
            tagFiles?.forEach(f => matchedFileIds.add(f.file_id));
        }

        if (deptRules.length > 0) {
            const deptValues = deptRules.map(r => r.rule_value);
            const { data: departments } = await adminSupabase
                .from('departments')
                .select('id')
                .or(`code.in.(${deptValues.map(v => `"${v}"`).join(',')}),name.in.(${deptValues.map(v => `"${v}"`).join(',')})`);

            if (departments) departmentIds = departments.map(d => d.id);
        }

        if (categoryRules.length > 0) {
            const catIds = categoryRules.map(r => r.rule_value);
            const { data: catFiles } = await adminSupabase
                .from('files')
                .select('id')
                .in('category_id', catIds);
            catFiles?.forEach(f => matchedFileIds.add(f.id));
        }
    }

    // 執行搜尋
    let knowledgeContext = '';
    const embedding = await generateEmbedding(message);

    interface RetrievedFile {
        id: string;
        filename?: string;
        content?: string;
        markdown_content?: string;
        similarity?: number;
    }

    let retrievedFiles: RetrievedFile[] = [];

    // 部門搜尋 vs 全域/特定檔案搜尋
    if (departmentIds.length > 0) {
        const searchPromises = departmentIds.map(deptId =>
            adminSupabase.rpc('search_knowledge_by_embedding', {
                query_embedding: embedding, match_threshold: 0.1, match_count: 5, filter_department: deptId
            })
        );
        const results = await Promise.all(searchPromises);
        results.forEach(r => { if (r.data) retrievedFiles.push(...r.data); });
    } else if (matchedFileIds.size > 0) {
        const { data: files } = await adminSupabase
            .from('files')
            .select('id, filename, markdown_content, metadata_analysis, department_id')
            .in('id', Array.from(matchedFileIds));

        if (files) retrievedFiles = files.map(f => ({ ...f, content: f.markdown_content }));
    } else {
        // 全域搜尋 (Fallback)
        const { data: vectorMatches } = await adminSupabase.rpc('search_knowledge_global', {
            query_embedding: embedding, match_threshold: 0.1, match_count: 5
        });
        if (vectorMatches) retrievedFiles = vectorMatches;
    }

    // 去重
    retrievedFiles = Array.from(new Map(retrievedFiles.map(f => [f.id, f])).values())
        .slice(0, 5); // 取 Top 5

    if (retrievedFiles.length > 0) {
        knowledgeContext = retrievedFiles.map((f, i) =>
            `【文件 ${i + 1}: ${f.filename}】\n${(f.content || '').substring(0, 2000)}...`
        ).join('\n\n');
    }

    // 4. 組裝完整 Prompt
    const safeguardProcessor = createHighRiskProcessor();
    const fullSystemPrompt = `${agent.system_prompt}
    
    ${knowledgeContext ? `【相關知識庫】\n${knowledgeContext}\n請優先依據上述資料回答。` : '【知識庫】無相關資料，請依據您的專業回答。'}
    
    ${safeguardProcessor.getSystemPromptSuffix()}
    `;

    // 5. 執行 LLM
    const model = genAI.getGenerativeModel({
        model: agent.model_version || 'gemini-3-flash-preview', // Default to 3 Flash, but allow override
        systemInstruction: fullSystemPrompt,
    });

    // 這裡我們只處理簡單文字生成，暫不處理 Agent 內的 Function Calling (除了 Super Assistant 外，其他 Agent 暫定為純回答)
    // 如果未來其他 Agent 也要 Function Calling，這裡需要擴充

    // 歷史紀錄處理
    const chatHistory = (options.history || []).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    // 6. 後處理與紀錄
    const safeguardResult = await safeguardProcessor.process(responseText);

    await supabase.from('chat_messages').insert({
        session_id: sessionId,
        agent_id: agentId,
        role: 'assistant',
        content: safeguardResult.cleanContent,
        citations: (safeguardResult.citations || []).map(c => typeof c === 'string' ? c : c.fileName || 'Unknown'),
        confidence_score: safeguardResult.confidenceScore,
        confidence_reasoning: safeguardResult.confidenceReasoning
    });

    return {
        text: safeguardResult.cleanContent,
        metadata: {
            confidence: safeguardResult.confidenceScore || 0.8,
            reasoning: safeguardResult.confidenceReasoning,
            citations: (safeguardResult.citations || []).map(c => typeof c === 'string' ? c : c.fileName || 'Unknown')
        },
        sessionId
    };
}
