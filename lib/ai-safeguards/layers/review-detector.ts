/**
 * 覆核提示檢測器（Layer 3）
 */

const REVIEW_TRIGGER_PATTERNS = [
    // 法規相關
    { pattern: /法規|法律|合規|監管|罰則|判決|勞資糾紛|違法/g, category: 'legal' },

    // 財務相關
    { pattern: /財務報表|稅務|審計|投資建議|財務預測|盈虧|預算編列/g, category: 'financial' },

    // 人事相關
    { pattern: /解僱|資遣|薪資調整|調職|處分/g, category: 'hr' },

    // 不確定性表達
    { pattern: /我不確定|可能有誤|建議諮詢專業|請進一步確認|無法保證/g, category: 'uncertainty' },

    // 敏感決策
    { pattern: /重大決策|風險評估|不可逆|緊急狀況|應急預案/g, category: 'critical' },
];

/**
 * 檢測內容中是否包含需要人工覆核的觸發項
 */
export function detectReviewTriggers(content: string): string[] {
    if (!content) return [];

    const triggers: string[] = [];

    for (const { pattern, category } of REVIEW_TRIGGER_PATTERNS) {
        if (pattern.test(content)) {
            triggers.push(category);
        }
        // 重置 regex 狀態以免多次調用出錯
        pattern.lastIndex = 0;
    }

    return [...new Set(triggers)];
}
