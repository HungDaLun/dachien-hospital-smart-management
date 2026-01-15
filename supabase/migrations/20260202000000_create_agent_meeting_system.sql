-- Create Meeting System Tables

-- 1. Meetings Table
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    topic_context TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 5,
    status TEXT NOT NULL CHECK (status IN ('setup', 'in_progress', 'paused', 'completed')) DEFAULT 'setup',
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ
);

-- 2. Meeting Participants
CREATE TABLE IF NOT EXISTS public.meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL, -- Department ID or Agent ID
    participant_type TEXT NOT NULL CHECK (participant_type IN ('department', 'consultant')),
    name TEXT NOT NULL,
    avatar TEXT,
    role_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(meeting_id, participant_id)
);

-- 3. Meeting Messages
CREATE TABLE IF NOT EXISTS public.meeting_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    speaker_id UUID, -- NULL for system/user (if user doesn't have an ID in this context, but usually user messages have a fixed type)
    speaker_type TEXT NOT NULL CHECK (speaker_type IN ('department', 'consultant', 'user', 'system')),
    content TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb,
    stance TEXT CHECK (stance IN ('support', 'oppose', 'neutral', 'conditional')),
    sequence_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Meeting Minutes
CREATE TABLE IF NOT EXISTS public.meeting_minutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    executive_summary TEXT,
    content JSONB NOT NULL, -- Structured minutes data (store the full JSON object including stats, decisions, etc)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(meeting_id)
);

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Meetings: Users can manage their own meetings
CREATE POLICY "Users can view their own meetings"
    ON public.meetings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meetings"
    ON public.meetings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meetings"
    ON public.meetings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meetings"
    ON public.meetings FOR DELETE
    USING (auth.uid() = user_id);

-- Participants: Access via meeting ownership
CREATE POLICY "Users can view participants of their meetings"
    ON public.meeting_participants FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.meetings
        WHERE meetings.id = meeting_participants.meeting_id
        AND meetings.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert participants to their meetings"
    ON public.meeting_participants FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.meetings
        WHERE meetings.id = meeting_participants.meeting_id
        AND meetings.user_id = auth.uid()
    ));

CREATE POLICY "Users can update participants of their meetings"
    ON public.meeting_participants FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.meetings
        WHERE meetings.id = meeting_participants.meeting_id
        AND meetings.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete participants of their meetings"
    ON public.meeting_participants FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.meetings
        WHERE meetings.id = meeting_participants.meeting_id
        AND meetings.user_id = auth.uid()
    ));

-- Messages: Access via meeting ownership
CREATE POLICY "Users can view messages of their meetings"
    ON public.meeting_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.meetings
        WHERE meetings.id = meeting_messages.meeting_id
        AND meetings.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert messages to their meetings"
    ON public.meeting_messages FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.meetings
        WHERE meetings.id = meeting_messages.meeting_id
        AND meetings.user_id = auth.uid()
    ));

-- Minutes: Access via meeting ownership
CREATE POLICY "Users can view minutes of their meetings"
    ON public.meeting_minutes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.meetings
        WHERE meetings.id = meeting_minutes.meeting_id
        AND meetings.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert minutes to their meetings"
    ON public.meeting_minutes FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.meetings
        WHERE meetings.id = meeting_minutes.meeting_id
        AND meetings.user_id = auth.uid()
    ));

-- Grant access to authenticated users
GRANT ALL ON public.meetings TO authenticated;
GRANT ALL ON public.meeting_participants TO authenticated;
GRANT ALL ON public.meeting_messages TO authenticated;
GRANT ALL ON public.meeting_minutes TO authenticated;
