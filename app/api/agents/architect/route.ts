import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateContent } from '@/lib/gemini/client';
import { toApiResponse } from '@/lib/errors';

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
      const meta = f.metadata_analysis || {};
      return `- [${f.filename}] (ID: ${f.id})
  標題: ${meta.title || '無'}
  摘要: ${meta.summary || '無'}
  標籤: ${f.file_tags?.map((t: any) => `${t.tag_key}:${t.tag_value}`).join(', ') || '無'}
  DIKW層級: ${meta.governance?.dikw_level || '無'}
  框架類型: ${meta.governance?.artifact || '無'}`;
    }).join('\n\n') || "No files available.";

    // 2. Fetch "Tactical Templates" from DB
    // Use the newly created agent_tactical_templates table for strategy lookup
    const { data: templates } = await supabase
      .from('agent_tactical_templates')
      .select('*');

    // Simple keyword matching for tactical framework selection
    let matchedTemplate = null;
    if (templates && templates.length > 0) {
      // Find template with most matching keywords in intent
      matchedTemplate = templates
        .map((t: any) => ({
          ...t,
          matchCount: (t.trigger_keywords || []).filter((k: string) => intent.toLowerCase().includes(k.toLowerCase())).length || 0
        }))
        .sort((a: any, b: any) => b.matchCount - a.matchCount)[0];

      if (matchedTemplate.matchCount === 0) matchedTemplate = null;
    }

    const systemPromptStructure = matchedTemplate
      ? matchedTemplate.structure_template
      : `
## 📋 任務解析 (Task Analysis)
- **交付物**：[請清楚定義]
- **目標 Persona**：[請定義]
- **目標**：[請定義]

## ✍️ 內容生成 (Content Generation)
- **Step 1**: ...
- **Step 2**: ...

## ✅ 合規檢核 (Compliance Check)
- [ ] 禁用詞掃描
`;

    const complianceChecklist = matchedTemplate
      ? matchedTemplate.compliance_checklist?.join('\n- ')
      : "檢查所有生成內容是否符合品牌語氣與基本法規。";

    // 3. Meta-Prompting for "Agent Architect" (K-0 Standard) - Translated to Chinese
    const metaPrompt = `
    你是一位專精於 **K-0 標準** 的 **AI Agent 架構師**。
    你的目標是根據使用者的意圖，設計一個高品質、企業級的系統提示詞 (System Prompt)。

    **使用者意圖 (User Intent)**: "${intent}"
    **情境/部門 (Context)**: ${department_context || "General"}
    
    **當前 Agent 狀態 (Current Agent State)**:
    ${current_state ? JSON.stringify({
      name: current_state.name,
      description: current_state.description,
      system_prompt: current_state.system_prompt,
      knowledge_rules: current_state.knowledge_rules,
      knowledge_files: current_state.knowledge_files
    }, null, 2) : "新 Agent (無現有狀態)"}

    **匹配的戰術策略 (Matched Tactical Strategy)**: ${matchedTemplate ? matchedTemplate.name : "通用 (無特定戰術匹配)"}
    
    **可用知識資產 (Available Knowledge Assets)**:
    ${fileList}

    ---
    
    **任務**:
    請根據「使用者意圖」與「當前 Agent 狀態」，生成一個優化的 JSON 回應。
    
    **關鍵指令 (CRITICAL INSTRUCTIONS)**:
    1.  **增量知識建議**: 在 'suggested_knowledge_files' 與 'suggested_knowledge_rules' 中，**只建議**「當前 Agent 狀態」中**沒有**的新項目。不要重複已有的項目。如果不需要新增，請回傳空陣列。
    2.  **整體提示詞重寫 (K-0 演算法)**: 請完全重寫 'system_prompt'。
        - 必須遵循 **三階段工作流**: 1. 思考與解析 (Think) -> 2. 執行與生成 (Act) -> 3. 合規檢查 (Check)。
        - 必須使用下方提供的 **特定結構模板**。
        - **重要**：在 'system_prompt' 文字內容中，當提及特定檔案時，**務必使用「檔案名稱」** (例如："參閱 2024財報.pdf")，以便 Agent 透過語意理解內容。**請勿**在提示詞文字中使用 UUID。

    **必須使用的系統提示詞模板 (System Prompt Template)**:
    ${systemPromptStructure}

    **必須執行的合規檢查 (Compliance List)**:
    - ${complianceChecklist}
    
    **回應 JSON 結構**:
    {
      "name": "專業 Agent 名稱 (繁體中文)",
      "description": "簡短描述 (繁體中文)",
      "system_prompt": "完整的系統提示詞 (繁體中文)... 當參閱檔案時請寫檔名...",
      "suggested_knowledge_rules": [],
      "suggested_knowledge_files": ["UUID-1", "UUID-2"],
      "mcp_config": { ... }
    }

    **動態技能配置 (MCP Config)**:
    只有在**明確需要**外部工具時（例如：搜尋網頁、讀取檔案、存 Google Drive），才生成 'mcp_config'。
    
    [參考配置庫 (Reference Configs)]:
    - Google Drive: { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-google-drive"] }
    - Filesystem: { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"] }
    - GitHub: { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"], "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_TOKEN_HERE" } }
    - Brave Search: { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-brave-search"], "env": { "BRAVE_API_KEY": "YOUR_API_KEY_HERE" } }

    **語言要求**:
    - 'name', 'description', 'system_prompt' 必須全為 **繁體中文 (Traditional Chinese)**。
    - 'suggested_knowledge_files' 陣列中 **必須只包含 檔案 ID (UUID)**，以確保系統正確綁定。
    - JSON 格式必須合法。
    `;

    // 4. Call Gemini
    // User requested "Pro" model (Gemini 3 Pro) for better reasoning.
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
      // Attempt cleanup anyway
      jsonString = result.replace(/```json\n|\n```/g, '');
    }

    let blueprint;
    try {
      blueprint = JSON.parse(jsonString);
    } catch (e) {
      console.error("JSON Parse Error", e);
      // Fallback for UI visualization
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

  } catch (error: any) {
    console.error('Agent Architect Error:', error);
    return toApiResponse(error);
  }
}
