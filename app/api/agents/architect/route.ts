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

    // Simple keyword matching for tactical framework selection
    let matchedTemplate = null;
    if (templates && templates.length > 0) {
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

    ---
    
    **任務**:
    請根據「使用者意圖」與「當前 Agent 狀態」，生成一個優化的 JSON 回應。
    
    **關鍵指令 (CRITICAL INSTRUCTIONS)**:
    1.  **增量配置建議**:
        - 'suggested_knowledge_files' / 'suggested_knowledge_rules': 只建議新的。
        - **工具與技能配置 (Tools & Skills)**: 請從上方提供的列表中選擇適合此任務的工具與技能。請將其 ID (name) 放入 'suggested_tools' 與 'suggested_skills'。例如 'search_knowledge', 'send_email'。
    2.  **整體提示詞重寫 (K-0 演算法)**: 請完全重寫 'system_prompt'。
        - 必須遵循 **三階段工作流**: 1. 思考與解析 (Think) -> 2. 執行與生成 (Act) -> 3. 合規檢查 (Check)。
        - 必須使用下方提供的 **特定結構模板**。
        - **重要**：在 'system_prompt' 文字內容中，當提及特定檔案時，**務必使用「檔案名稱」** (例如："參閱 2024財報.pdf")，以便 Agent 透過語意理解內容。**請勿**在提示詞文字中使用 UUID。

    **必須使用的系統提示詞模板 (System Prompt Template)**:
    ${systemPromptStructure}

    **提示詞撰寫原則 (Robustness Principles)**:
    1.  **檔案引用的魯棒性**: 由於使用者可能會手動移除建議的檔案，請不要編寫「絕對依賴」某些檔案才能回答的邏輯。
    2.  **降級語氣**: 在提示詞中提到檔案時，請使用類似「請參閱 {檔案名稱}（若已提供）來進行分析，若無該文件，請運用您的通用商業知識或詢問使用者提供更多資訊」的表述。
    3.  **無知識庫預案**: 確保 Agent 在 '【已載入的知識庫內容】' 區塊為空時，仍能維持其 Persona 並提供有價值的建議，而非直接拒絕回答。

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

    **動態技能配置 (MCP Config - 舊版相容)**:
    如果上述 'suggested_tools' 無法滿足需求，且需要底層 MCP 配置，才生成 'mcp_config'。一般情況請優先使用 'suggested_tools'。

    **語言要求**:
    - 'name', 'description', 'system_prompt' 必須全為 **繁體中文 (Traditional Chinese)**。
    - 'suggested_knowledge_files' 陣列中 **必須只包含 檔案 ID (UUID)**。
    - 'suggested_tools' / 'suggested_skills' 必須使用列表中的英文 ID (name)。
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

  } catch (error: any) {
    console.error('Agent Architect Error:', error);
    return toApiResponse(error);
  }
}
