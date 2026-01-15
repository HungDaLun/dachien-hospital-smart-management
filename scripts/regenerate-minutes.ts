
import { createClient } from '@supabase/supabase-js';
import { MeetingService } from '../lib/meeting/service';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseKey) {
        console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the latest completed meeting
    const { data: meetings, error } = await supabase
        .from('meetings')
        .select('id, title, user_id, created_at')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error || !meetings || meetings.length === 0) {
        console.error("No completed meetings found.", error);
        return;
    }

    const meeting = meetings[0];
    console.log(`Found latest meeting: ${meeting.title} (${meeting.id})`);
    console.log(`Regenerating minutes...`);

    // We need to bypass the 'createClient' in service.ts which usually looks for cookies
    // So we will instantiate MeetingService but we need to mock or ensure it works in script context.
    // However, MeetingService imports createClient from '@/lib/supabase/server' which fails in scripts.

    // Instead of using MeetingService directly (which is tied to Next.js server context), 
    // I will replicate the 'endMeeting' logic here but using a direct supabase client.

    // 1. Fetch messages
    const { data: messages } = await supabase
        .from('meeting_messages')
        .select('*')
        .eq('meeting_id', meeting.id)
        .order('sequence_number', { ascending: true });

    if (!messages || messages.length === 0) {
        console.log("No messages found.");
        return;
    }

    const contextStr = messages.map((m: any) => `[${m.speaker_type}] ${m.speaker_name}: ${m.content}`).join('\n');

    // 2. Generate with Gemini
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });

    const prompt = `
你是首席戰略官的秘書。你的任務是將以下會議記錄總結為一份符合 **SMART** 原則的正式紀錄。

**會議詳情**:
會議標題: ${meeting.title}

**會議逐字稿**:
${contextStr}

**絕對要求**:
1. **輸出語言必須是繁體中文（台灣）**。如果原本是英文，請翻譯成中文。
2. JSON 中的所有字串值（value）都必須是中文。
3. 'recommended_actions' 必須嚴格遵守 SMART 原則。

JSON Schema:
{
    "executive_summary": "精簡的執行摘要 (約 200 字，必須是中文)",
    "content": {
        "participants": {
             "departments": [{ "id": "id_if_known", "name": "Department Name", "message_count": 0 }],
             "consultants": [{ "id": "id_if_known", "name": "Agent Name", "message_count": 0 }]
        },
        "department_positions": [
            {
                "department_id": "...",
                "department_name": "...",
                "position_summary": "立場摘要 (中文)",
                "key_arguments": ["論點列表 (中文)"],
                "cited_documents": ["引用文件列表"],
                "final_stance": "support|oppose|neutral|conditional"
            }
        ],
        "consultant_insights": [
             {
                "consultant_id": "...",
                "consultant_name": "...",
                "role_perspective": "角色觀點 (中文)",
                "key_insights": ["洞察列表 (中文)"],
                "cited_sources": ["..."],
                "memorable_quotes": ["..."]
             }
        ],
        "consensus_points": ["達成共識的點 (中文)"],
        "divergence_points": ["歧見或未決事項 (中文)"],
        "recommended_actions": [
            {
                "action": "行動項目描述 (中文)",
                "responsible_department": "負責單位",
                "priority": "high|medium|low",
                "smart_specific": "具體說明 (S) (中文)",
                "smart_measurable": "衡量標準 (M) (中文)",
                "smart_achievable": "如何達成 (A) (中文)",
                "smart_relevant": "關聯性 (R) (中文)",
                "smart_time_bound": "截止期限 (T) (中文)"
            }
        ],
        "statistics": {
            "total_messages": ${messages.length},
            "user_messages": 0,
            "cited_documents_count": 0,
            "discussion_keywords": ["關鍵字 (中文)"]
        }
    }
}
    `.trim();

    console.log("Calling Gemini...");
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log("Raw Response:", responseText.slice(0, 200) + "..."); // Debug log

    let minutesData;
    try {
        minutesData = JSON.parse(responseText.replace(/```json\n?|\n?```/g, '').trim());
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.log("Response text was:", responseText);
        return;
    }

    console.log("Saving minutes... Summary:", minutesData.executive_summary);
    // 3. Update Minutes
    const { error: upsertError } = await supabase.from('meeting_minutes').upsert({
        meeting_id: meeting.id,
        executive_summary: minutesData.executive_summary,
        content: minutesData.content
    }, { onConflict: 'meeting_id' });

    if (upsertError) {
        console.error("Upsert Error:", upsertError);
    } else {
        console.log("Done! Minutes regenerated in Traditional Chinese.");

        // 4. Save as Knowledge File
        console.log("Syncing to Knowledge Base...");
        const knowledgeMarkdown = `
# 會議記錄：${meeting.title}

## 執行摘要
${minutesData.executive_summary}

## SMART 行動計畫
${minutesData.content.recommended_actions.map((action: any) => `
### ${action.action}
- **負責單位**: ${action.responsible_department} (優先級: ${action.priority})
- **S (具體)**: ${action.smart_specific}
- **M (可衡量)**: ${action.smart_measurable}
- **A (可達成)**: ${action.smart_achievable}
- **R (相關)**: ${action.smart_relevant}
- **T (時限)**: ${action.smart_time_bound}
`).join('\n')}

## 部門立場
${minutesData.content.department_positions.map((dept: any) => `
- **${dept.department_name}**: ${dept.position_summary} (${dept.final_stance})
`).join('\n')}

## 專家觀點
${minutesData.content.consultant_insights.map((cons: any) => `
- **${cons.consultant_name}**: ${cons.key_insights.join('; ')}
`).join('\n')}

## 共識與分歧
- **共識**: ${minutesData.content.consensus_points.join(', ')}
- **分歧**: ${minutesData.content.divergence_points.join(', ')}
        `.trim();

        const { error: insertError } = await supabase.from('files').insert({
            uploaded_by: meeting.user_id,
            filename: `會議記錄_${meeting.title}_${new Date().toISOString().split('T')[0]}.md`,
            s3_storage_path: `meeting-minutes/${meeting.id}.md`, // Virtual path for meeting minutes
            size_bytes: Buffer.byteLength(knowledgeMarkdown, 'utf8'),
            mime_type: 'text/markdown',
            markdown_content: knowledgeMarkdown,
            gemini_state: 'SYNCED', // Already processed - use SYNCED since COMPLETED is not a valid enum value
            dikw_level: 'wisdom', // Minutes are high value
            metadata_analysis: {
                title: `[會議記錄] ${meeting.title}`,
                summary: minutesData.executive_summary,
                created_from_meeting_id: meeting.id,
                source_type: 'meeting_minutes'
            }
        });

        if (insertError) {
            console.error("Error inserting file:", insertError);
        } else {
            console.log("Knowledge Base sync complete.");
        }
    }
}

main().catch(console.error);
