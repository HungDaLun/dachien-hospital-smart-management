import { createClient } from '@/lib/supabase/server';
import { MeetingConfig, MeetingMessage, ParticipantType } from './types';
import { MeetingSpeakerScheduler } from './scheduler';
import { KnowledgeIsolator } from './knowledge-isolator';
import { CitationValidator, CitationValidationResult } from './citation-validator';
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
        scheduledStartTime?: string,
        mode: MeetingConfig['mode'] = 'quick_sync',
        maxTurns?: number
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
                scheduled_start_time: scheduledStartTime || null,
                mode: mode,
                current_phase: 'diverge',
                max_turns: maxTurns || null,
                turn_count: 0
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
        const { data: meetingData } = await supabase.from(MEETINGS_TABLE).select('*').eq('id', meetingId).single();
        if (!meetingData || meetingData.status !== 'in_progress') return null;

        const meeting = meetingData as MeetingConfig; // Cast to config

        const { data: participants } = await supabase.from(PARTICIPANTS_TABLE).select('*').eq('meeting_id', meetingId);
        const { data: messagesRaw } = await supabase.from(MESSAGES_TABLE).select('*').eq('meeting_id', meetingId).order('sequence_number', { ascending: true });
        const messages = (messagesRaw || []) as MeetingMessage[];

        // 1.5 Check Duration / Timeout (Quick Sync Rule)
        if (meeting.started_at && meeting.duration_minutes && meeting.mode === 'quick_sync') {
            const start = new Date(meeting.started_at).getTime();
            const now = new Date().getTime();
            const elapsedMinutes = (now - start) / (1000 * 60);

            if (elapsedMinutes >= meeting.duration_minutes) {
                console.log(`[MeetingService] Meeting ${meetingId} timed out. Soft wrap-up initiated.`);
                // In v2, we might force a chairperson wrap-up here instead of hard stop
                // For now, let's just trigger endMeeting for compatibility
                await this.endMeeting(meetingId);
                return null;
            }
        }


        // 2. Special Case: Opening (First Turn)
        let chairpersonDecision: any = { action: 'continue' };

        if (messages.length === 0) {
            // Force Chairperson to open the meeting for ALL modes
            const modeText = meeting.mode === 'quick_sync' ? '快速同步(Quick Sync)' :
                meeting.mode === 'deep_dive' ? '深度研討(Deep Dive)' : '戰略決策(Strategic Decision)';

            const openingGoal = meeting.mode === 'quick_sync' ? '效率至上，請與會者快速同步關鍵資訊。' :
                meeting.mode === 'deep_dive' ? '廣泛發想，請大家多角度切入探討。' : '結果導向，請大家以產出具體行動方案為最終目標。';

            // 建立實際參與者名單，讓主席能直接點名
            const departmentParticipants = (participants || [])
                .filter(p => p.participant_type === 'department')
                .map(p => p.name);
            const consultantParticipants = (participants || [])
                .filter(p => p.participant_type === 'consultant')
                .map(p => p.name);

            let participantListStr = '';
            if (departmentParticipants.length > 0) {
                participantListStr += `\n- 部門：${departmentParticipants.join('、')}`;
            }
            if (consultantParticipants.length > 0) {
                participantListStr += `\n- 顧問 Agent：${consultantParticipants.join('、')}`;
            }

            // 選擇第一位要邀請發言的參與者（優先選擇部門）
            const firstSpeakerName = departmentParticipants[0] || consultantParticipants[0] || '第一位與會者';

            const openingInstruction = `
                這是會議的開始。
                請開場說明會議主題：「${meeting.topic}」。
                會議模式為：「${modeText}」。
                請簡短說明目的：${openingGoal}
                
                【重要】今天參與會議的人員如下（你必須使用這些精確名稱）：${participantListStr}
                
                最後，請邀請「${firstSpeakerName}」先開始發言。你必須直接點名實際的參與者名稱，不可以用「相關部門」或其他模糊說辭。
            `.trim();

            chairpersonDecision = {
                action: 'intervene',
                instruction: openingInstruction
            };
        } else if (meeting.mode !== 'quick_sync') {
            // 2. Chairperson Evaluation (The Brain) - For subsequent turns in complex modes
            const { Chairperson } = await import('./chairperson');
            const chair = new Chairperson();
            const participantInfos = (participants || []).map(p => ({
                id: p.participant_id,
                name: p.name,
                type: p.participant_type,
                description: undefined
            }));

            // Time Context Calculation
            let timeContext;
            if (meeting.started_at && meeting.duration_minutes) {
                const start = new Date(meeting.started_at).getTime();
                const now = Date.now();
                const elapsed = (now - start) / (1000 * 60);
                const total = meeting.duration_minutes;
                timeContext = {
                    elapsed,
                    total,
                    remaining: Math.max(0, total - elapsed),
                    progressPercentage: Math.min(100, (elapsed / total) * 100)
                };
            }

            chairpersonDecision = await chair.evaluate(meeting, messages, participantInfos, timeContext);

            // Update Phase if suggested
            if (chairpersonDecision.suggested_phase && chairpersonDecision.suggested_phase !== meeting.current_phase) {
                await supabase.from(MEETINGS_TABLE).update({
                    current_phase: chairpersonDecision.suggested_phase
                }).eq('id', meetingId);
                meeting.current_phase = chairpersonDecision.suggested_phase; // Local update
            }
        }

        // 3. Act on Decision
        if (chairpersonDecision.action === 'wrap_up') {
            await this.endMeeting(meetingId);
            return null; // Or stream a final "Meeting Adjourned" message?
        }

        let nextSpeaker: { id: string, type: ParticipantType | 'chairperson' | 'system', name: string } | null = null;
        let isIntervention = false;

        if (chairpersonDecision.action === 'intervene' && chairpersonDecision.instruction) {
            // Chairperson speaks!
            nextSpeaker = {
                id: 'chairperson-ai',
                type: 'chairperson',
                name: 'AI 主席'
            };
            isIntervention = true;
        } else {
            // 4. Scheduler decides next speaker (Standard Flow)
            // Check if Chairperson targeted someone specific in 'continue'
            if (chairpersonDecision.target_agent_id) {
                const targetP = participants?.find(p => p.participant_id === chairpersonDecision.target_agent_id);
                if (targetP) {
                    nextSpeaker = {
                        id: targetP.participant_id,
                        type: targetP.participant_type as ParticipantType,
                        name: targetP.name
                    };
                }
            }

            // Fallback to Scheduler if no target or target not found
            if (!nextSpeaker) {
                const scheduler = new MeetingSpeakerScheduler(meeting, (participants || []).map(p => ({
                    id: p.participant_id,
                    type: p.participant_type as ParticipantType,
                    name: p.name
                })));

                // Hydrate scheduler with messages
                scheduler.setMessages(messages);
                nextSpeaker = scheduler.getNextSpeaker();
            }
        }

        if (!nextSpeaker) return null;

        // Update Turn Count
        await supabase.from(MEETINGS_TABLE).update({
            turn_count: (meeting.turn_count || 0) + 1
        }).eq('id', meetingId);


        // 5. Generate Content
        // Convert messages to string context
        const contextStr = messages.map((m: any) => `${m.speaker_name}: ${m.content}`).join('\n');

        let prompt = '';

        if (isIntervention) {
            // Chairperson Prompt - 包含參與者資訊，確保主席能點名
            // 建立參與者列表
            const participantsList = (participants || []).map(p =>
                `- ${p.name} (${p.participant_type === 'department' ? '部門' : '顧問'})`
            ).join('\n');

            prompt = `
You are the Chairperson (AI 主席) of a strategic meeting. You have decided to intervene.

**Your Internal Instruction**: "${chairpersonDecision.instruction}"

**Meeting Participants** (你必須使用這些實際名稱，不可使用「相關部門」等模糊說辭):
${participantsList}

**Task**: Generate the full spoken message based on this instruction.
**Constraints**:
1. **Language**: STRICTLY **Traditional Chinese (Taiwan)** (繁體中文). NO English allowed.
2. **Tone**: Professional, authoritative, yet constructive.
3. **Length**: Keep it concise (under 100 words).
4. **CRITICAL**: When referring to participants, you MUST use their exact names from the list above. Never use vague terms like "相關部門" or "相關人員".
             `.trim();
        } else {
            const isolator = new KnowledgeIsolator();
            if (nextSpeaker.type === 'department') {
                prompt = await isolator.buildDepartmentPrompt(nextSpeaker.id, nextSpeaker.name, meeting.topic, contextStr);
            } else {
                prompt = await isolator.buildConsultantPrompt(nextSpeaker.id, meeting.topic, contextStr);
            }
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
                    // 注意：chairperson/system 類型沒有綁定的知識庫，跳過驗證
                    let validationResult: CitationValidationResult = {
                        hasSuspectedHallucinations: false,
                        validCitations: [],
                        invalidCitations: []
                    };

                    if (nextSpeaker.type === 'department' || nextSpeaker.type === 'consultant') {
                        const validator = new CitationValidator();
                        validationResult = await validator.validateCitations(
                            fullText,
                            nextSpeaker.id,
                            nextSpeaker.type
                        );
                    }

                    // 5. Save Message to DB
                    // 注意：對於 chairperson/system 類型，speaker_id 應為 null
                    // 因為 'chairperson-ai' 等字串不是有效的 UUID
                    const isSystemSpeaker = nextSpeaker.type === 'chairperson' || nextSpeaker.type === 'system';

                    const newMessage = {
                        meeting_id: meetingId,
                        speaker_id: isSystemSpeaker ? null : nextSpeaker.id,
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

        // 2.5 Fetch Owner's Department & System Taxonomy
        // 為了解決「部門歸屬」問題，我們直接查詢會議發起人的所屬部門
        let ownerDepartmentId = null;
        let ownerDepartmentName = "管理部"; // Default Fallback

        if (meeting.user_id) {
            const { data: userProfile } = await supabase
                .from('user_profiles')
                .select('department_id, departments(name)')
                .eq('id', meeting.user_id)
                .single();

            if (userProfile && userProfile.department_id) {
                ownerDepartmentId = userProfile.department_id;
                // @ts-ignore - supabase query types alignment
                ownerDepartmentName = userProfile.departments?.name || "管理部";
            }
        }

        // 為了解決「分類脫節」問題，我們動態查詢「會議記錄」的 Category ID
        let meetingCategoryId = null;
        const { data: categoryData } = await supabase
            .from('document_categories')
            .select('id')
            .eq('name', '會議記錄')
            .maybeSingle();

        if (categoryData) {
            meetingCategoryId = categoryData.id;
        }

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
            const keywords = minutesData.content.statistics?.discussion_keywords || [];

            // 決定顯示部門：使用發起人部門，或 Action Items 中最主要的負責單位
            const displayDepartment = ownerDepartmentName;

            const s3StoragePath = `meeting-minutes/${meetingId}.md`;
            const fileName = `會議記錄_${meeting.title}_${new Date().toISOString().split('T')[0]}.md`;

            // Check if file exists to prevent duplicates
            const { data: existingFile } = await supabase
                .from('files')
                .select('id')
                .eq('s3_storage_path', s3StoragePath)
                .maybeSingle();

            // 為了解決「缺乏治理標籤」問題，我們注入標準 Governance 物件
            const governanceMetadata = {
                sensitivity: "internal", // 預設內部機密
                retention_policy: "7_years", // 企業標準保存年限
                access_control: "department_internal", // 預設部門內可見
                is_official_record: true
            };

            const fileData = {
                uploaded_by: meeting.user_id,
                filename: fileName,
                s3_storage_path: s3StoragePath,
                size_bytes: Buffer.byteLength(knowledgeMarkdown, 'utf8'),
                mime_type: 'text/markdown',
                markdown_content: knowledgeMarkdown,
                gemini_state: 'SYNCED', // Already processed
                dikw_level: 'wisdom', // Minutes are high value
                department_id: ownerDepartmentId, // [Fix] 正確歸屬部門 ID
                category_id: meetingCategoryId,   // [Fix] 正確歸屬分類 ID
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
                    last_updated: new Date().toISOString(),
                    governance: governanceMetadata // [Fix] 注入治理資料
                }
            };

            if (existingFile) {
                // Update existing file
                await supabase.from('files').update(fileData).eq('id', existingFile.id);
            } else {
                // Insert new file
                await supabase.from('files').insert(fileData);
            }

        } catch (err) {
            console.error('[MeetingService] Error generating minutes:', err);
            // Don't fail the whole request if summarization fails
        }
    }
}
