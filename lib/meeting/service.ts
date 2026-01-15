import { createClient } from '@/lib/supabase/server';
import { MeetingConfig, MeetingMessage, ParticipantType } from './types';
import { MeetingSpeakerScheduler } from './scheduler';
import { KnowledgeIsolator } from './knowledge-isolator';
import { CitationValidator } from './citation-validator';
import { GoogleGenerativeAI } from "@google/generative-ai";

const MEETINGS_TABLE = 'meetings';
const PARTICIPANTS_TABLE = 'meeting_participants';
const MESSAGES_TABLE = 'meeting_messages';

export class MeetingService {

    /**
     * Create a new meeting
     */
    async createMeeting(
        userId: string,
        title: string,
        topic: string,
        departmentIds: string[],
        consultantAgentIds: string[],
        durationMinutes: number = 5,
        scheduledStartTime?: string
    ) {
        const supabase = await createClient();

        // Determine status
        // If scheduled time is provided, it's 'scheduled', otherwise 'in_progress' (ready to start)
        const status = scheduledStartTime ? 'scheduled' : 'in_progress';

        // 1. Create Meeting
        const { data: meeting, error: meetingError } = await supabase
            .from(MEETINGS_TABLE)
            .insert({
                user_id: userId,
                title: title || topic.slice(0, 50), // Fallback
                topic, // This is the Agenda
                settings: {}, // Defaults
                duration_minutes: durationMinutes,
                status: status,
                scheduled_start_time: scheduledStartTime || null
            })
            .select()
            .single();

        if (meetingError || !meeting) throw meetingError;

        // 2. Add Participants
        const participants = [];

        // Departments
        for (const deptId of departmentIds) {
            const { data: dept } = await supabase.from('departments').select('name').eq('id', deptId).single();
            if (dept) {
                participants.push({
                    meeting_id: meeting.id,
                    participant_id: deptId,
                    participant_type: 'department',
                    name: dept.name
                });
            }
        }

        // Consultants
        for (const agentId of consultantAgentIds) {
            const { data: agent } = await supabase.from('agents').select('name, description, avatar_url').eq('id', agentId).single();
            if (agent) {
                participants.push({
                    meeting_id: meeting.id,
                    participant_id: agentId,
                    participant_type: 'consultant',
                    name: agent.name,
                    avatar: agent.avatar_url,
                    role_description: agent.description
                });
            }
        }

        if (participants.length > 0) {
            const { error: partError } = await supabase.from(PARTICIPANTS_TABLE).insert(participants);
            if (partError) throw partError;
        }

        return meeting.id;
    }

    /**
     * Start the meeting
     */
    async startMeeting(meetingId: string) {
        const supabase = await createClient();
        await supabase.from(MEETINGS_TABLE).update({ status: 'in_progress', started_at: new Date().toISOString() }).eq('id', meetingId);
    }

    /**
     * Process turn: Decide who speaks next and generate their message (streaming)
     * Returns a ReadableStream for SSE or null if no turn should be taken
     */
    async processNextTurn(meetingId: string): Promise<ReadableStream | null> {
        const supabase = await createClient();

        // 1. Fetch meeting context
        const { data: meeting } = await supabase.from(MEETINGS_TABLE).select('*').eq('id', meetingId).single();
        const { data: participants } = await supabase.from(PARTICIPANTS_TABLE).select('*').eq('meeting_id', meetingId);
        const { data: messages } = await supabase.from(MESSAGES_TABLE).select('*').eq('meeting_id', meetingId).order('sequence_number', { ascending: true });

        if (!meeting || meeting.status !== 'in_progress') return null;

        // 1.5 Check Duration / Timeout
        if (meeting.started_at && meeting.duration_minutes) {
            const start = new Date(meeting.started_at).getTime();
            const now = new Date().getTime();
            const elapsedMinutes = (now - start) / (1000 * 60);

            if (elapsedMinutes >= meeting.duration_minutes) {
                console.log(`[MeetingService] Meeting ${meetingId} timed out (${elapsedMinutes.toFixed(1)}/${meeting.duration_minutes} mins). Ending...`);
                await this.endMeeting(meetingId);
                return null;
            }
        }

        // 2. Scheduler decides next speaker
        const scheduler = new MeetingSpeakerScheduler(meeting as MeetingConfig, (participants || []).map(p => ({
            id: p.participant_id,
            type: p.participant_type as ParticipantType,
            name: p.name
        })));

        // Hydrate scheduler with messages
        scheduler.setMessages((messages || []) as MeetingMessage[]);

        const nextSpeaker = scheduler.getNextSpeaker();
        if (!nextSpeaker) return null;

        // 3. Generate Content
        // Convert messages to string context
        const contextStr = (messages || []).map((m: any) => `${m.speaker_name}: ${m.content}`).join('\n');

        const isolator = new KnowledgeIsolator();
        let prompt = '';

        if (nextSpeaker.type === 'department') {
            prompt = await isolator.buildDepartmentPrompt(nextSpeaker.id, nextSpeaker.name, meeting.topic, contextStr);
        } else {
            prompt = await isolator.buildConsultantPrompt(nextSpeaker.id, meeting.topic, contextStr);
        }

        // Generate with Gemini (Streaming)
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContentStream(prompt);

        let fullText = '';

        // 建立 TransformStream 來處理串流
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                // 先發送 speaker 資訊
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'speaker',
                    speaker_id: nextSpeaker.id,
                    speaker_type: nextSpeaker.type,
                    speaker_name: nextSpeaker.name
                })}\n\n`));

                try {
                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        if (text) {
                            fullText += text;
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`));
                        }
                    }

                    // 4. Validate citations (幻覺檢測)
                    const validator = new CitationValidator();
                    const validationResult = await validator.validateCitations(
                        fullText,
                        nextSpeaker.id,
                        nextSpeaker.type as 'department' | 'consultant'
                    );

                    // 5. Save Message to DB
                    const newMessage = {
                        meeting_id: meetingId,
                        speaker_id: nextSpeaker.id,
                        speaker_type: nextSpeaker.type,
                        speaker_name: nextSpeaker.name,
                        content: fullText,
                        sequence_number: (messages?.length || 0) + 1,
                        citations: validationResult.validCitations,
                        // 如果有疑似幻覺引用，在 metadata 中標記
                        metadata: validationResult.hasSuspectedHallucinations
                            ? {
                                suspected_hallucinations: validationResult.invalidCitations,
                                warning: validationResult.warningMessage
                            }
                            : null
                    };

                    const { data: savedMsg, error } = await supabase.from(MESSAGES_TABLE).insert(newMessage).select().single();

                    if (error) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`));
                    } else {
                        // 在回傳的訊息中包含驗證結果
                        const responsePayload = {
                            type: 'done',
                            message: savedMsg,
                            ...(validationResult.hasSuspectedHallucinations && {
                                citation_warning: validationResult.warningMessage,
                                suspected_hallucinations: validationResult.invalidCitations
                            })
                        };
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(responsePayload)}\n\n`));
                    }

                    controller.close();
                } catch (err: any) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`));
                    controller.close();
                }
            }
        });

        return stream;
    }

    /**
     * End meeting and generate SMART minutes
     */
    async endMeeting(meetingId: string) {
        const supabase = await createClient();

        // 1. Update status
        await supabase.from(MEETINGS_TABLE).update({
            status: 'completed',
            ended_at: new Date().toISOString()
        }).eq('id', meetingId);

        // 2. Fetch context for summarization
        const { data: meeting } = await supabase.from(MEETINGS_TABLE).select('*').eq('id', meetingId).single();
        const { data: participants } = await supabase.from(PARTICIPANTS_TABLE).select('*').eq('meeting_id', meetingId);
        const { data: messages } = await supabase.from(MESSAGES_TABLE).select('*').eq('meeting_id', meetingId).order('sequence_number', { ascending: true });

        if (!messages || messages.length === 0) return;

        // 3. Generate SMART Minutes using Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return;

        const contextStr = messages.map((m: any) => `[${m.speaker_type}] ${m.speaker_name}: ${m.content}`).join('\n');

        const prompt = `
你是首席戰略官的秘書。你的任務是將以下會議記錄總結為一份符合 **SMART** 原則的正式紀錄。

**會議詳情**:
會議標題: ${meeting.title}
會議議程: ${meeting.topic}

**會議逐字稿**:
${contextStr}

**絕對要求**:
1. **輸出語言必須是繁體中文（台灣）**。如果原本是英文，請翻譯成中文。
2. JSON 中的所有字串值（value）都必須是中文。
3. 'recommended_actions' 必須嚴格遵守 SMART 原則。

JSON Schema:
{
    "executive_summary": "A concise executive summary (approx 200 words)",
    "content": {
        "participants": {
             "departments": [{ "id": "id_if_known", "name": "Department Name", "message_count": 0 }],
             "consultants": [{ "id": "id_if_known", "name": "Agent Name", "message_count": 0 }]
        },
        "department_positions": [
            {
                "department_id": "...",
                "department_name": "...",
                "position_summary": "Summary of their stance",
                "key_arguments": ["List of arguments"],
                "cited_documents": ["List of cited filenames"],
                "final_stance": "support|oppose|neutral|conditional"
            }
        ],
        "consultant_insights": [
             {
                "consultant_id": "...",
                "consultant_name": "...",
                "role_perspective": "e.g. Risk Analyst",
                "key_insights": ["..."],
                "cited_sources": ["..."],
                "memorable_quotes": ["..."]
             }
        ],
        "consensus_points": ["List of points where participants agreed"],
        "divergence_points": ["List of points where participants disagreed"],
        "recommended_actions": [
            {
                "action": "Action Item description",
                "responsible_department": "Department Name",
                "priority": "high|medium|low",
                "smart_specific": "Why Specific?",
                "smart_measurable": "How Measurable?",
                "smart_achievable": "Why Achievable?",
                "smart_relevant": "Why Relevant?",
                "smart_time_bound": "Timeline/Deadline"
            }
        ],
        "statistics": {
            "total_messages": ${messages.length},
            "user_messages": 0,
            "cited_documents_count": 0,
            "discussion_keywords": ["keyword1", "keyword2"]
        }
    }
}
        `.trim();

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const minutesData = JSON.parse(responseText);

            // 4. Save to meeting_minutes
            await supabase.from('meeting_minutes').upsert({
                meeting_id: meetingId,
                executive_summary: minutesData.executive_summary,
                content: minutesData.content
            }, { onConflict: 'meeting_id' });

            // 5. Save as Knowledge File (Auto-import)
            // Create a markdown version for the knowledge base
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

            // 準備 Metadata
            const participantNames = participants?.map(p => p.name) || [];
            const departmentNames = participants?.filter(p => p.participant_type === 'department').map(p => p.name) || [];
            const keywords = minutesData.content.statistics?.discussion_keywords || [];

            // 決定部門歸屬：若有多個部門參與則為「跨部門」，否則歸屬該部門（若無部門則為管理部）
            const displayDepartment = departmentNames.length > 1 ? "跨部門" : (departmentNames[0] || "戰略室");

            await supabase.from('files').insert({
                uploaded_by: meeting.user_id,
                filename: `會議記錄_${meeting.title}_${new Date().toISOString().split('T')[0]}.md`,
                s3_storage_path: `meeting-minutes/${meetingId}.md`,
                size_bytes: Buffer.byteLength(knowledgeMarkdown, 'utf8'),
                mime_type: 'text/markdown',
                markdown_content: knowledgeMarkdown,
                gemini_state: 'SYNCED', // Already processed
                dikw_level: 'wisdom', // Minutes are high value
                metadata_analysis: {
                    title: meeting.title || meeting.topic,
                    summary: minutesData.executive_summary,
                    tags: ["會議記錄", "戰略會議", ...participantNames, ...keywords],
                    department: displayDepartment,
                    type: "meeting_minutes", // 明確指定類型代碼
                    type_label: "會議記錄",   // 用於顯示的類型名稱
                    category: "MANAGEMENT",
                    audience: "management_team",
                    sensitivity: "internal",
                    language: "zh-TW",
                    created_from_meeting_id: meetingId,
                    last_updated: new Date().toISOString()
                }
            });

        } catch (err) {
            console.error('[MeetingService] Error generating minutes:', err);
            // Don't fail the whole request if summarization fails
        }
    }
}
