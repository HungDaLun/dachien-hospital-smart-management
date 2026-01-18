import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateContent } from '@/lib/gemini/client';
import { toApiResponse } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { intent, department_context, current_state } = body;

    if (!intent) {
      return NextResponse.json({ error: 'Intent is required' }, { status: 400 });
    }

    // 1. Fetch available "Knowledge Assets" (包含完整 Metadata)
    const { data: recentFiles } = await supabase
      .from('files')
      .select('id, filename, metadata_analysis, file_tags(tag_key, tag_value)')
      .limit(30);

    const fileList = recentFiles?.map(f => {
      const meta = (f.metadata_analysis || {}) as { title?: string; summary?: string; governance?: { dikw_level?: string; artifact?: string } };
      interface FileTag { tag_key: string; tag_value: string; }
      return `- [${f.filename}] (ID: ${f.id})
  標題: ${meta.title || '無'}
  摘要: ${meta.summary || '無'}
  標籤: ${(f.file_tags as FileTag[] | null)?.map((t) => `${t.tag_key}:${t.tag_value}`).join(', ') || '無'}
  DIKW層級: ${meta.governance?.dikw_level || '無'}
  框架類型: ${meta.governance?.artifact || '無'}`;
    }).join('\n\n') || "No files available.";

    // 2. Fetch "Tactical Templates" from DB
    const { data: templates } = await supabase
      .from('agent_tactical_templates')
      .select('*');

    // 2.1 Fetch Available Tools
    const { data: tools } = await supabase
      .from('tools_registry')
      .select('name, display_name, description')
      .eq('is_active', true);

    const availableTools = tools?.map(t => `- [${t.name}] ${t.display_name}: ${t.description}`).join('\n') || "暫無可用工具";

    // 2.2 Fetch Available Skills
    const { data: skills } = await supabase
      .from('skills_library')
      .select('name, display_name, description')
      .eq('is_active', true);

    const availableSkills = skills?.map(s => `- [${s.name}] ${s.display_name}: ${s.description}`).join('\n') || "暫無可用技能";

    // 2.3 Fetch Available MCP Servers (系統層級設定)
    let availableMCPServers = "暫無可用的 MCP Servers（系統管理員可在系統設定頁面註冊）";
    try {
      const { data: mcpServers, error: mcpError } = await supabase
        .from('mcp_servers')
        .select('name, display_name, description, capabilities')
        .eq('is_active', true);

      if (!mcpError && mcpServers && mcpServers.length > 0) {
        availableMCPServers = mcpServers.map(m => {
          const capabilities = Array.isArray(m.capabilities) 
            ? m.capabilities.join(', ') 
            : (typeof m.capabilities === 'string' ? m.capabilities : '無');
          return `- [${m.name}] ${m.display_name}: ${m.description || '無描述'}
  能力: ${capabilities}`;
        }).join('\n\n');
      }
    } catch (err) {
      // 如果表不存在或其他錯誤，使用預設訊息
      console.warn('[Architect] MCP Servers table may not exist:', err);
      availableMCPServers = "暫無可用的 MCP Servers（系統管理員可在系統設定頁面註冊）";
    }

    // Simple keyword matching for tactical framework selection
    interface TacticalTemplate {
      name: string;
      trigger_keywords?: string[];
      structure_template?: string;
      compliance_checklist?: string[];
    }
    let matchedTemplate: (TacticalTemplate & { matchCount: number }) | null = null;
    if (templates && templates.length > 0) {
      matchedTemplate = (templates as TacticalTemplate[])
        .map((t) => ({
          ...t,
          matchCount: (t.trigger_keywords || []).filter((k) => intent.toLowerCase().includes(k.toLowerCase())).length || 0
        }))
        .sort((a, b) => b.matchCount - a.matchCount)[0];

      if (matchedTemplate.matchCount === 0) matchedTemplate = null;
    }

    const systemPromptStructure = matchedTemplate
      ? matchedTemplate.structure_template
      : `
# � Agent 核心指令 (Core Instructions)

## 0. 🧠 情境認知 (Contextual Awareness)
- **角色定位 (Persona)**: [詳細描述 Agent 的身份、專業背景與語氣風格]
- **核心目標 (Objective)**: [清楚定義 Agent 的存在意義與最終交付物]
- **執行原則 (Principles)**: [列出 3-5 條執行時必須遵守的高階原則]

## 1. 📋 任務解析 (Task Analysis)
- **輸入理解**: 分析使用者的需求核心。
- **邊案例處理**: 對於模糊或異常的請求，應如何應對。

## 2. ✍️ 執行與生成 (Execution Workflow)
- **Step 1: 資訊檢索與分析**: [詳細描述如何運用現有知識庫或工具進行初步分析]
- **Step 2: 方案架構與產出**: [描述生成內容的具體步驟、邏輯推理過程與格式規範]
- **Step 3: 優化與潤飾**: [如何調整語氣、排版，確保符合企業級標準]

## 3. ✅ 合規檢核 (Compliance & Quality Check)
- **品質指標**: [列出具體的內容檢驗點]
- **合規清單**: [ ] 禁用詞、隱私資訊、品牌語氣檢查。
`;

    const complianceChecklist = matchedTemplate
      ? matchedTemplate.compliance_checklist?.join('\n- ')
      : "檢查所有生成內容是否符合品牌語氣與基本法規。";

    // 3. Meta-Prompting for "Agent Architect" (K-0 Standard) - Translated to Chinese
    const metaPrompt = `
    你是一位專精於 **K-0 標準** 的 **AI Agent 架構師**。
    你的目標是根據使用者的意圖，設計一個高品質、企業級的系統提示詞 (System Prompt)，並配置必要的工具與技能。

    **使用者意圖 (User Intent)**: "${intent}"
    **情境/部門 (Context)**: ${department_context || "General"}
    
    **當前 Agent 狀態 (Current Agent State)**:
    ${current_state ? JSON.stringify({
      name: current_state.name,
      description: current_state.description,
      system_prompt: current_state.system_prompt,
      knowledge_rules: current_state.knowledge_rules,
      knowledge_files: current_state.knowledge_files,
      enabled_tools: current_state.enabled_tools,
      enabled_skills: current_state.enabled_skills
    }, null, 2) : "新 Agent (無現有狀態)"}

    **匹配的戰術策略 (Matched Tactical Strategy)**: ${matchedTemplate ? matchedTemplate.name : "通用 (無特定戰術匹配)"}
    
    **可用知識資產 (Available Knowledge Assets)**:
    ${fileList}

    **可用工具列表 (Available Tools)**:
    ${availableTools}

    **可用技能列表 (Available Skills)**:
    ${availableSkills}

    **可用 MCP Servers (Available MCP Servers)**:
    ${availableMCPServers}

    ---
    
    **任務**:
    請根據「使用者意圖」與「當前 Agent 狀態」，進行深度語意分析，並生成一個優化的 JSON 回應。
    
    **關鍵指令 (CRITICAL INSTRUCTIONS)**:
    1.  **Agent 核心屬性判斷 (Core Attribute Assessment)**:
        - 在生成建議前，請先判斷此 Agent 的定位：
          - **功能導向 (Function-Centric)**：關鍵字包含「深研、自動化、計算、翻譯、搜尋、爬取、即時、最新」。此類 Agent 核心在於工具 (Tools)。
          - **知識導向 (Knowledge-Centric)**：關鍵字包含「查閱、手冊、規章、歷史資料、內部知識」。此類 Agent 核心在於知識文件 (Knowledge Files)。
          - **混合型 (Hybrid)**：兩者皆需。
        
    2.  **嚴格的時效性判斷 (Strict Recency Check)**:
        - **核心禁止事項**：當使用者要求「最新」或「爬取」功能時，意指其需要動態獲取當前資訊。此時，**嚴禁**推薦資料庫中任何舊的報告或文件 (即便檔名有關鍵字)。
        - **互斥邏輯**：要求「即時搜尋」與掛載「過往報告」是互斥的。掛載舊文件會干擾 Agent 判斷最新趨勢。
        - **文件建議門檻**：除非使用者明確指定「要參考公司內部檔案」，否則請確保 \`suggested_knowledge_files\` 保持為空陣列。

    3.  **增量配置建議**:
        - \`suggested_knowledge_files\` / \`suggested_knowledge_rules\`: 僅在專門針對「內部知識檢索」時才建議。
        - **工具與技能配置 (Tools & Skills)**：這是功能型 Agent 的核心。請優先勾選 \`google_search\` 與 \`web_crawler\` 工具。
        - **實際效用說明**：放入 \`suggested_tools\` 後，Agent 將具備執行即時網路動作的能力。

    4.  **整體提示詞重寫 (K-0 演算法)**: 請完全重寫 \`system_prompt\`。
        - 必須遵循 **三階段工作流**: 1. 思考與解析 (Think) -> 2. 執行與生成 (Act) -> 3. 合規檢查 (Check)。
        - 請以下方提供的 **結構模板** 為基礎進行擴展。**長度不限**，請根據任務複雜度自行判斷，務必詳盡。
        - **重要**：在 \`system_prompt\` 文字內容中，當提及特定檔案時，**務必使用「檔案名稱」** (例如："參閱 2024財報.pdf")，以便 Agent 透過語意理解內容。**請勿**在提示詞文字中使用 UUID。

    **必須使用的系統提示詞模板 (System Prompt Template)**:
    (請以此架構為核心，並根據需求大幅擴展內容)
    ${systemPromptStructure}

    **指令長度與深度原則 (Length & Depth Principles)**:
    1.  **無字數限制**: 不要為了簡練而犧牲專業度。使用者希望看到的是深思熟慮且具備執行細節的指令，而非僅是骨架。
    2.  **動態評估**: 請對「使用者意圖」進行複雜度評估。如果任務涉及多個步驟、跨部門協作或高度專業知識，請產出詳盡且長篇的指令。
    3.  **細節至上**: 在每個步驟中，加入明確的執行準則、語氣要求、可能的邊界情況處理 (Edge Cases) 以及輸出格式規範。

    **提示詞撰寫原則 (Robustness Principles)**:
    1.  **檔案引用的魯棒性**: 由於使用者可能會手動移除建議的檔案，請不要編寫「絕對依賴」某些檔案才能回答的邏輯。
    2.  **降級語氣**: 在提示詞中提到檔案時，請使用類似「請參閱 {檔案名稱}（若已提供）來進行分析，若無該文件，請運用您的通用商業知識或詢問使用者提供更多資訊」的表述。
    3.  **無知識庫預案**: 確保 Agent 在 『【已載入的知識庫內容】』 區塊為空時，仍能維持其 Persona 並提供有價值的建議，而非直接拒絕回答。

    **必須執行的合規檢查 (Compliance List)**:
    - ${complianceChecklist}
    
    **回應 JSON 結構**:
    {
      "name": "專業 Agent 名稱 (繁體中文)",
      "description": "簡短描述 (繁體中文)",
      "system_prompt": "完整的系統提示詞 (繁體中文)... 當參閱檔案時請寫檔名...",
      "suggested_knowledge_rules": [],
      "suggested_knowledge_files": ["UUID-1", "UUID-2"],
      "suggested_tools": ["tool_name_1"],
      "suggested_skills": ["skill_name_1"],
      "mcp_config": { ... }
    }

    **MCP 配置建議 (MCP Configuration)**:
    如果 Agent 需要連接外部服務（如 Gmail、Slack、Notion），可以使用以下方式：
    1. **優先使用 \`suggested_tools\`**：如果工具已註冊到 tools_registry，直接使用工具名稱
    2. **使用 \`mcp_config\`**：只有在需要複雜的 MCP Server 整合時，才在 \`mcp_config\` 中配置對應的 MCP Server 名稱
    3. **MCP Server 名稱**：請使用上述「可用 MCP Servers」列表中的 name 欄位值
    
    範例：
    - 如果需要 Gmail 功能，且系統已註冊 Gmail MCP Server (name: "gmail")：
      \`mcp_config: { "gmail": {} }\`
    
    **一般情況下，優先使用 \`suggested_tools\`，只有在需要複雜的 MCP 整合時才使用 \`mcp_config\`。**

    **語言要求**:
    - \`name\`, \`description\`, \`system_prompt\` 必須全為 **繁體中文 (Traditional Chinese)**。
    - \`suggested_knowledge_files\` 陣列中 **必須只包含 檔案 ID (UUID)**。
    - \`suggested_tools\` / \`suggested_skills\` 必須使用列表中的英文 ID (name)。
    - JSON 格式必須合法。
    `;

    // 4. Call Gemini
    const modelVersion = process.env.GEMINI_ARCHITECT_MODEL || 'gemini-3-pro-preview';
    const result = await generateContent(modelVersion, metaPrompt);

    if (!result) {
      throw new Error('Failed to generate agent blueprint');
    }

    // 5. Parse JSON (Robust Extraction)
    let jsonString = result;
    const startIndex = result.indexOf('{');
    const endIndex = result.lastIndexOf('}');

    if (startIndex !== -1 && endIndex !== -1) {
      jsonString = result.substring(startIndex, endIndex + 1);
    } else {
      console.warn("Could not find JSON brackets in Gemini output:", result.substring(0, 100) + "...");
      jsonString = result.replace(/```json\n|\n```/g, '');
    }

    let blueprint;
    try {
      blueprint = JSON.parse(jsonString);
    } catch (e) {
      console.error("JSON Parse Error", e);
      blueprint = {
        system_prompt: result,
        name: "Agent (Parse Error - Please Retry)",
        description: "AI 生成了無效的 JSON 格式，請重試。"
      };
    }

    return NextResponse.json({
      success: true,
      data: blueprint,
      debug: {
        matched_tactic: matchedTemplate?.name
      }
    });

  } catch (error: unknown) {
    console.error('Agent Architect Error:', error);
    return toApiResponse(error);
  }
}
