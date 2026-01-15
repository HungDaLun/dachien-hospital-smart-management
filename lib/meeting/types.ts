export type ParticipantType = 'department' | 'consultant';
export type SpeakerType = 'department' | 'consultant' | 'user' | 'system' | 'chairperson';
export type MeetingStatus = 'setup' | 'in_progress' | 'paused' | 'completed';
export type MessageStance = 'support' | 'oppose' | 'neutral' | 'conditional';

export type MeetingMode = 'quick_sync' | 'deep_dive' | 'result_driven';
export type MeetingPhase = 'diverge' | 'debate' | 'converge' | 'audit';

export interface ChairpersonDecision {
    action: 'continue' | 'intervene' | 'wrap_up';
    instruction?: string; // Guidance for the next agent or the room
    target_agent_id?: string; // specific agent to address
    suggested_phase?: MeetingPhase;
}

export interface MeetingParticipant {
    id: string;
    meeting_id: string;
    participant_id: string; // Department ID or Agent ID
    type: ParticipantType;
    name: string;
    avatar?: string;
    role_description?: string;
    knowledge_source?: 'department' | 'agent';
    knowledge_count?: number;
}

export interface MeetingMessage {
    id: string;
    meeting_id: string;
    speaker_id?: string;
    speaker_type: SpeakerType;
    speaker_name?: string; // Hydrated from participant info
    speaker_avatar?: string; // Hydrated from participant info
    content: string;
    citations: {
        file_id: string;
        file_name: string;
        snippet: string;
    }[];
    stance?: MessageStance;
    sequence_number: number;
    created_at: string;
}

export interface MeetingConfig {
    id: string;
    user_id: string;
    topic: string;
    topic_context?: string;
    duration_minutes: number;
    status: MeetingStatus;

    // New Fields for Revolution v2.0
    mode: MeetingMode;
    current_phase: MeetingPhase;
    smart_score: number;
    turn_count: number;
    max_turns?: number;

    participants: {
        departments: string[];
        consultants: string[];
    };
    settings: {
        debate_mode: boolean;
        force_citations: boolean;
        final_voting: boolean;
        allow_interruption: boolean;
        consultant_priority: 'normal' | 'high';
    };
    created_at: string;
    started_at?: string;
    ended_at?: string;
}

// DB representation might differ slightly (JSONB columns), but this is the application view
export interface Meeting extends MeetingConfig {
    // participants are hydrated separately usually, but for config object it stores IDs
}

export interface MeetingMinutes {
    id: string;
    meeting_id: string;
    executive_summary: string;
    content: {
        participants: {
            departments: { id: string; name: string; message_count: number }[];
            consultants: { id: string; name: string; message_count: number }[];
        };
        department_positions: {
            department_id: string;
            department_name: string;
            position_summary: string;
            key_arguments: string[];
            cited_documents: string[];
            final_stance?: MessageStance;
        }[];
        consultant_insights: {
            consultant_id: string;
            consultant_name: string;
            role_perspective: string;
            key_insights: string[];
            cited_sources: string[];
            memorable_quotes: string[];
        }[];
        consensus_points: string[];
        divergence_points: string[];
        recommended_actions: {
            action: string;
            responsible_department?: string;
            priority: 'high' | 'medium' | 'low';
            smart_specific: string;
            smart_measurable: string;
            smart_achievable: string;
            smart_relevant: string;
            smart_time_bound: string;
        }[];
        statistics: {
            total_messages: number;
            user_messages: number;
            cited_documents_count: number;
            discussion_keywords: string[];
        };
    };
    created_at: string;
}

export interface SpeakerInfo {
    id: string;
    type: ParticipantType;
    name: string;
}
