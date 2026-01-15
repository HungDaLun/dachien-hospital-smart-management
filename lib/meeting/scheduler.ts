import { MeetingConfig, MeetingMessage, SpeakerInfo } from './types';

export class MeetingSpeakerScheduler {
    private meeting: MeetingConfig;
    private messages: MeetingMessage[];
    private speakCounts: Map<string, number>;
    private allParticipants: SpeakerInfo[];

    constructor(meeting: MeetingConfig, participants: SpeakerInfo[]) {
        this.meeting = meeting;
        this.messages = [];
        this.speakCounts = new Map();
        this.allParticipants = participants;

        // Initialize speak counts
        participants.forEach(p => {
            this.speakCounts.set(p.id, 0);
        });
    }

    public setMessages(messages: MeetingMessage[]) {
        this.messages = messages;
        // Re-calculate speak counts based on actual messages
        this.speakCounts.clear();
        this.allParticipants.forEach(p => this.speakCounts.set(p.id, 0));

        messages.forEach(msg => {
            if (msg.speaker_type !== 'user' && msg.speaker_type !== 'system' && msg.speaker_id) {
                const current = this.speakCounts.get(msg.speaker_id) || 0;
                this.speakCounts.set(msg.speaker_id, current + 1);
            }
        });
    }

    public getNextSpeaker(): SpeakerInfo {
        const lastMessage = this.messages[this.messages.length - 1];

        // 1. User mentioned someone?
        if (lastMessage?.speaker_type === 'user') {
            const mentioned = this.detectMentionedParticipant(lastMessage.content);
            if (mentioned) return mentioned;
        }

        // 2. Consultant Priority
        if (this.meeting.settings.consultant_priority === 'high') {
            const recentDeptMessages = this.getRecentDepartmentMessageCount();
            const consultants = this.allParticipants.filter(p => p.type === 'consultant');

            if (recentDeptMessages >= 3 && consultants.length > 0) {
                return this.getLeastSpokenAmong(consultants);
            }
        }

        // 3. Debate Mode (Find opposing stance) - Simplified placeholder logic
        if (this.meeting.settings.debate_mode && lastMessage?.stance) {
            // In a real implementation, we would analyze stance or history. 
            // Here we just ensure we don't pick the same person twice.
        }

        // 4. Default: Least spoken
        // Filter out the last speaker to avoid self-replying immediately if possible
        let candidates = this.allParticipants;
        if (lastMessage?.speaker_id && candidates.length > 1) {
            candidates = candidates.filter(c => c.id !== lastMessage.speaker_id);
        }

        return this.getLeastSpokenAmong(candidates);
    }

    private getLeastSpokenAmong(group: SpeakerInfo[]): SpeakerInfo {
        let minCount = Infinity;
        let candidates: SpeakerInfo[] = [];

        group.forEach(p => {
            const count = this.speakCounts.get(p.id) || 0;
            if (count < minCount) {
                minCount = count;
                candidates = [p];
            } else if (count === minCount) {
                candidates.push(p);
            }
        });

        // Randomly pick one among those with minCount
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    private detectMentionedParticipant(content: string): SpeakerInfo | null {
        for (const participant of this.allParticipants) {
            if (content.includes(participant.name)) {
                return participant;
            }
        }
        return null;
    }

    private getRecentDepartmentMessageCount(): number {
        let count = 0;
        for (let i = this.messages.length - 1; i >= 0; i--) {
            if (this.messages[i].speaker_type === 'department') {
                count++;
            } else {
                break;
            }
        }
        return count;
    }
}
