import { GoogleGenerativeAI } from '@google/generative-ai';

import { submitFeedback, FeedbackEvent } from '@/lib/knowledge/feedback';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

/**
 * AI Judge: Analyzes conversation to infer implicit user feedback
 */
export async function analyzeImplicitFeedback(
    sessionId: string,
    messages: ChatMessage[],
    involvedFileIds: string[]
) {
    if (messages.length < 2 || involvedFileIds.length === 0) return;

    // Use a cheap model for analysis
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    擔任「對話滿意度裁判」。請分析以下使用者與 AI 的對話，判斷使用者對 AI 回答的滿意度。
    
    【判斷標準】
    - POSITIVE (正向): 使用者表示感謝 (謝謝、ok、好用)、追問更深層問題、或嘗試應用回答。
    - NEGATIVE (負向): 使用者表示錯誤 (不對、不是這個意思)、重複質問同一問題、指責 AI。
    - NEUTRAL (中立): 僅是資訊交換，無明顯情緒或評價，或對話太短無法判斷。

    【對話內容】
    ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

    【輸出格式】
    只輸出一個單字: POSITIVE, NEGATIVE, or NEUTRAL
    `;

    try {
        const result = await model.generateContent(prompt);
        const sentiment = result.response.text().trim().toUpperCase().replace(/[^A-Z]/g, '');

        if (sentiment === 'NEUTRAL') return;

        let score = 0;
        let type: 'helpful' | 'not_helpful' = 'helpful';

        if (sentiment.includes('POSITIVE')) {
            score = 0.5; // Implicit positive is weaker than explicit (+1.0)
            type = 'helpful';
        } else if (sentiment.includes('NEGATIVE')) {
            score = -0.5; // Implicit negative is weaker than explicit (-1.0)
            type = 'not_helpful';
        } else {
            return;
        }

        // Apply feedback to all referenced files
        // In a more advanced version, we could ask AI *which* files were helpful
        for (const fileId of involvedFileIds) {
            const event: FeedbackEvent = {
                file_id: fileId,
                source: 'user_implicit',
                feedback_type: type,
                score: score,
                details: {
                    reason: 'AI_JUDGE_SENTIMENT_ANALYSIS',
                    session_id: sessionId
                }
            };
            await submitFeedback(event);
        }

        console.log(`[AI Judge] Session ${sessionId}: ${sentiment} feedback applied to ${involvedFileIds.length} files.`);

    } catch (error) {
        console.error('[AI Judge] Analysis failed:', error);
    }
}
