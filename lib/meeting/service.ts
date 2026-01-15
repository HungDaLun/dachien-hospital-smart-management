import { createClient } from '@/lib/supabase/server';
import { MeetingConfig, MeetingMessage, ParticipantType } from './types';
import { MeetingSpeakerScheduler } from './scheduler';
import { KnowledgeIsolator } from './knowledge-isolator';
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

                    // 4. Save Message to DB
                    const newMessage = {
                        meeting_id: meetingId,
                        speaker_id: nextSpeaker.id,
                        speaker_type: nextSpeaker.type,
                        speaker_name: nextSpeaker.name,
                        content: fullText,
                        sequence_number: (messages?.length || 0) + 1,
                        citations: []
                    };

                    const { data: savedMsg, error } = await supabase.from(MESSAGES_TABLE).insert(newMessage).select().single();

                    if (error) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`));
                    } else {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', message: savedMsg })}\n\n`));
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
}
