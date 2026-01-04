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
      "suggested_knowledge_files": ["uuid-1", "uuid-2", "uuid-3"]
    }

    **IMPORTANT**:
    - For "suggested_knowledge_files", ONLY include file IDs from the "Available Knowledge Assets" list above
    - Prioritize files with DIKW level = "knowledge" or "wisdom"
    - Select 3-7 most relevant files based on the user's intent

    **System Prompt Guidelines (K-0 Standard)**:
    1.  **Role & Mission**: Define clearly who the agent is.
    2.  **Knowledge Mapping**: Explicitly state "When asked about X, refer to Document Y".
    3.  **Compliance**: Add a section on "Regulation Checks" (e.g., Do not promise medical cures).
    4.  **Tone**: Define the persona (e.g., Professional, Empathetic).
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
