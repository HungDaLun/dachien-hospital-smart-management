/**
 * 處理信心度評分
 */
export function extractConfidence(score: unknown, reasoning?: unknown): { score: number; reasoning: string } {
    let finalScore = 0.5; // 預設值

    if (typeof score === 'number') {
        finalScore = Math.max(0, Math.min(1, score));
    } else if (typeof score === 'string') {
        const parsed = parseFloat(score);
        if (!isNaN(parsed)) {
            finalScore = Math.max(0, Math.min(1, parsed));
        }
    }

    return {
        score: finalScore,
        reasoning: String(reasoning || (finalScore > 0.8 ? '高度符合知識庫內容' : '內容可能不完整或基於模型通識')),
    };
}
