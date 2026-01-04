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
        const { intent, department_context } = body;

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

        // 2. Meta-Prompting for "Agent Architect"
        const metaPrompt = `
    You are an expert **AI Agent Architect**.
    Your goal is to design a high-quality, enterprise-grade System Prompt based on the user's vague intent.

    **User Intent**: "${intent}"
    **Context/Department**: ${department_context || "General"}
    
    **Available Knowledge Assets**:
    ${fileList}

    ---
    
    **Task**:
    Generate a JSON response with the following structure:
    {
      "name": "Suggest a professional name for the agent",
      "description": "Short description (2-3 sentences)",
      "system_prompt": "The full, professional system prompt following K-0 standards",
      "suggested_knowledge_rules": [
        { "rule_type": "TAG", "rule_value": "Product:Origins" },
        { "rule_type": "DEPARTMENT", "rule_value": "Marketing" }
      ],
      "suggested_knowledge_files": ["uuid-1", "uuid-2", "uuid-3"],
      "mcp_config": {
        "mcpServers": {
          "google-drive": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-google-drive"],
            "env": { "GOOGLE_CLIENT_ID": "..." }
          }
        }
      }
    }

    **IMPORTANT - Dynamic Skills (MCP) Config**:
    If the user's intent implies needing external tools (e.g., "check stocks", "search web", "read files", "save to drive", "github"), you MUST generate a valid 'mcp_config'.
    
    Here is a library of known MCP Servers to use as reference. Use these EXACT configurations (leaving placeholder keys like YOUR_KEY_HERE):

    [Reference Library]:
    1. **Google Drive**:
       Key: "google-drive"
       Config: { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-google-drive"] }
    
    2. **Filesystem** (Local files access):
       Key: "filesystem"
       Config: { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"] }
    
    3. **Git / GitHub**:
       Key: "github"
       Config: { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"], "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_TOKEN_HERE" } }

    4. **Web Search (Brave Search)**:
       Key: "brave-search"
       Config: { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-brave-search"], "env": { "BRAVE_API_KEY": "YOUR_API_KEY_HERE" } }

    5. **Google Maps**:
       Key: "google-maps"
       Config: { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-google-maps"], "env": { "GOOGLE_MAPS_API_KEY": "YOUR_KEY_HERE" } }
    
    6. **Slack**:
       Key: "slack"
       Config: { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-slack"], "env": { "SLACK_BOT_TOKEN": "YOUR_TOKEN_HERE" } }

    7. **Financial Data (AlphaVantage)**:
       Key: "alpha-vantage"
       Config: { "command": "npx", "args": ["-y", "mcp-server-alphavantage"], "env": { "ALPHAVANTAGE_API_KEY": "YOUR_KEY_HERE" } }

    **Language Requirement**:
    - The 'name', 'description', and 'system_prompt' MUST be in **Traditional Chinese (繁體中文)**.
    - However, keep the 'mcp_config' and 'rule_value' in English/Code as technically required.

    **System Prompt Guidelines (K-0 Standard)**:
    1.  **Role & Mission**: Define clearly who the agent is.
    2.  **Tool Usage**: If you generated 'mcp_config', EXPLICITLY instruct the agent on how/when to use these tools in the system prompt.
    3.  **Knowledge Mapping**: Explicitly state "When asked about X, refer to Document Y".
    4.  **Compliance**: Add a section on "Regulation Checks".
    5.  Reference the specific filenames provided in "Available Knowledge Assets" if they seem relevant.
    `;

        // 3. Call Gemini
        const modelVersion = process.env.GEMINI_MODEL_VERSION || 'gemini-3-flash-preview'; // Use Flash 3 for speed and intelligence
        const result = await generateContent(modelVersion, metaPrompt);

        if (!result) {
            throw new Error('Failed to generate agent blueprint');
        }

        // 4. Parse JSON (Gemini usually returns Markdown JSON, need to clean)
        const jsonString = result.replace(/```json\n|\n```/g, '');
        const blueprint = JSON.parse(jsonString);

        return NextResponse.json({
            success: true,
            data: blueprint
        });

    } catch (error: any) {
        console.error('Agent Architect Error:', error);
        return toApiResponse(error);
    }
}
