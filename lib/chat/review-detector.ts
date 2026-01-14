export interface ReviewTrigger {
    keywords: string[];
    category: 'financial' | 'delivery' | 'legal' | 'safety';
    severity: 'high' | 'medium' | 'low';
    message: string;
}

export const REVIEW_TRIGGERS: ReviewTrigger[] = [
    {
        keywords: ['金額', '價格', '成本', '報價', '$', '元', '萬', '百萬', '千萬', '預算', '費用'],
        category: 'financial',
        severity: 'high',
        message: '此回答涉及金額資訊，建議人工覆核確認'
    },
    {
        keywords: ['交期', '交貨', '交付', '期限', 'deadline', 'lead time', '交貨日期', '完成日期'],
        category: 'delivery',
        severity: 'high',
        message: '此回答涉及交期資訊，建議人工覆核確認'
    },
    {
        keywords: ['合約', '協議', '條款', '違約', '賠償', '法律', '法規', '遵循'],
        category: 'legal',
        severity: 'high',
        message: '此回答涉及法律條款，建議人工覆核確認'
    },
    {
        keywords: ['安全', '風險', '危險', '事故', '傷害', '緊急'],
        category: 'safety',
        severity: 'high',
        message: '此回答涉及安全相關資訊，建議人工覆核確認'
    }
];

export function detectReviewTriggers(content: string): ReviewTrigger[] {
    const detected: ReviewTrigger[] = [];
    const lowerContent = content.toLowerCase();

    // Simple verification to avoid false positives on common words could be added here
    // For now, checking inclusion

    for (const trigger of REVIEW_TRIGGERS) {
        const found = trigger.keywords.some(keyword =>
            lowerContent.includes(keyword.toLowerCase())
        );

        if (found) {
            detected.push(trigger);
        }
    }

    return detected;
}
