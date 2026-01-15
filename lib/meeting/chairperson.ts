import { GoogleGenerativeAI } from "@google/generative-ai";
import { MeetingConfig, MeetingMessage, ChairpersonDecision } from './types';

export class Chairperson {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || '';
        if (!this.apiKey) {
            console.warn("GEMINI_API_KEY is not defined, Chairperson will be disabled.");
        }
    }

    /**
     * The core brain of the Chairperson.
     * Evaluates the current meeting state and decides on the next move.
     */
    async evaluate(
        meeting: MeetingConfig,
        messages: MeetingMessage[],
        participants: { id: string, name: string, type: string, description?: string }[] = [],
        timeContext?: { elapsed: number; total: number; remaining: number; progressPercentage: number }
    ): Promise<ChairpersonDecision> {
        if (!this.apiKey) return { action: 'continue' };

        const contextStr = messages.map(m => `[${m.speaker_name} (${m.speaker_type})]: ${m.content}`).join('\n');

        const participantsStr = participants.map(p => `- ${p.name} (${p.type}) [ID: ${p.id}]`).join('\n');

        // Don't intervene if the last speaker was already the chairperson (avoid loops)
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.speaker_type === 'chairperson') {
            return { action: 'continue' };
        }

        let timeStatusStr = "Not specified";
        if (timeContext) {
            timeStatusStr = `
- Elapsed: ${timeContext.elapsed.toFixed(1)} mins
- Total: ${timeContext.total} mins
- Remaining: ${timeContext.remaining.toFixed(1)} mins
- Progress: ${timeContext.progressPercentage.toFixed(0)}%
            `.trim();
        }

        const prompt = `
You are the **Chairperson (AI 本議座)** of a strategic meeting.
Your goal is to ensure the meeting is productive, focused, and results-oriented.

**Meeting Info**:
- Topic: ${meeting.topic}
- Mode: ${meeting.mode} (Quick Sync / Deep Dive / Results Driven)
- Current Phase: ${meeting.current_phase} (Diverge -> Debate -> Converge -> Audit)
- Turn Count: ${meeting.turn_count}

**Time Status**:
${timeStatusStr}

**Participants in Room**:
${participantsStr}

**Recent Transcript**:
${contextStr.slice(-3000)} -- (Truncated for efficiency)

**Your Logic & Time Strategy**:

**[MODE: ${meeting.mode === 'deep_dive' ? 'DEEP DIVE (深度研討)' : 'STRATEGIC DECISION (戰略決策)'}]**

${meeting.mode === 'deep_dive' ? `
// Logic for Deep Dive
1. **Goal**: Explore all angles, uncover hidden risks/opportunities.
2. **Strategy**:
   - **0-60% (Diverge)**: Maximize variance. Ask "What are we missing?". Play Devil's Advocate (反向思考).
   - **60-80% (Debate)**: Clash differing or conflicting views.
   - **80-100% (Converge)**: Synthesize insights.
3. **Intervention Style**: Facilitator/Coach. Use questions like "Have you considered...?"
` : `
// Logic for Strategic Decision (Result Driven)
1. **Goal**: Reach a clear GO/NO-GO decision or a concrete Action Plan.
2. **Strategy**:
   - **0-30% (Diverge)**: Quick scan of options. Don't linger.
   - **30-70% (Debate)**: Weigh Pros/Cons, ROI, and Feasibility. Force agents to take a stance (Support/Oppose).
   - **70-100% (Converge/Audit)**: Draft the final decision. Strict SMART check.
3. **Intervention Style**: Decision Maker/Director. Be decisive.
   - If agents are deadlocked, **Intervene** to propose a compromise or pick a side to move forward.
   - Demand concrete resource estimates.
`}

**General Decision Rules**:
- **Time Critical**: If Progress > 80% and phase is still Diverge/Debate, **intervene** and force a move to Converge.
- **Time Critical**: If Progress > 90% and no conclusion, **intervene** to Summarize/Wrap-up.
- If a speaker was vague, **intervene** and ask for data/specifics.
- If the discussion is going in circles, **intervene** to force a phase change or summary.
- If the last message was a good contribution and fits the phase, **continue**.
- If the goal is met (in Results Driven), **wrap_up**.
- **Crucial**: If you want a specific person to speak next, set "target_agent_id" to their ID.

**Output Format (JSON)**:
{
    "action": "continue" | "intervene" | "wrap_up",
    "instruction": "Your message to the room (if intervening). Be authoritative but professional. STRICTLY use Traditional Chinese (Taiwan).",
    "target_agent_id": "Optional ID if addressing someone specific",
    "suggested_phase": "Optional new phase if transition needed (diverge|debate|converge|audit)"
}

Based on the transcript and TIME STATUS, what is your decision?
        `.trim();

        const genAI = new GoogleGenerativeAI(this.apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        try {
            const result = await model.generateContent(prompt);
            const decision = JSON.parse(result.response.text());
            return decision;
        } catch (error) {
            console.error("Chairperson thought failed:", error);
            // Default to continue if AI fails
            return { action: 'continue' };
        }
    }

    /**
     * Generates a SMART audit report or specific feedback
     */
    async auditConclusion(conclusionText: string): Promise<{ passed: boolean; feedback: string; score: number }> {
        if (!this.apiKey) return { passed: false, feedback: "API Key missing", score: 0 };

        const prompt = `
You are the **SMART Auditor**. Evaluate the following conclusion/action plan against the SMART criteria:
1. **Specific**: Is it clear what needs to be done?
2. **Measurable**: Are there metrics to track success?
3. **Achievable**: Is it realistic?
4. **Relevant**: Does it matter?
5. **Time-bound**: Is there a deadline?

**Input Text**:
"${conclusionText}"

**Output Format (JSON)**:
{
    "passed": boolean, // true if score >= 80
    "score": number, // 0-100
    "feedback": "Concise feedback in Traditional Chinese (Taiwan). Point out missing SMART elements if any."
}
        `.trim();

        const genAI = new GoogleGenerativeAI(this.apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        try {
            const result = await model.generateContent(prompt);
            const decision = JSON.parse(result.response.text());
            return decision;
        } catch (error) {
            console.error("SMART Audit failed:", error);
            return { passed: false, feedback: "Audit failed due to technical error.", score: 0 };
        }
    }
}
