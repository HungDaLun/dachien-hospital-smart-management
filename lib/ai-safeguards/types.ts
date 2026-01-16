/**
 * AI 品質防護型別定義
 */

export type RiskLevel = 'high' | 'medium' | 'low';

export interface Citation {
    fileId?: string;
    fileName: string;
    excerpt?: string;
    reason?: string;
    relevanceScore?: number;
}

export interface SafeguardConfig {
    riskLevel: RiskLevel;
    enableCitation: boolean;      // Layer 1
    enableConfidence: boolean;    // Layer 2
    enableReviewTrigger: boolean; // Layer 3
    enableFeedback: boolean;      // Layer 4
    auditSampleRate: number;      // Layer 5: 0-1 抽樣率
}

export interface SafeguardResult {
    // Layer 1
    citations: Citation[];

    // Layer 2
    confidenceScore?: number;
    confidenceReasoning?: string;

    // Layer 3
    needsReview: boolean;
    reviewTriggers: string[];

    // 原始內容（清理後，不含 JSON 區塊）
    cleanContent: string;

    // 審計標記
    selectedForAudit: boolean;
}

// 預設配置
export const RISK_PRESETS: Record<RiskLevel, SafeguardConfig> = {
    high: {
        riskLevel: 'high',
        enableCitation: true,
        enableConfidence: true,
        enableReviewTrigger: true,
        enableFeedback: true,
        auditSampleRate: 0.1,  // 10% 抽樣
    },
    medium: {
        riskLevel: 'medium',
        enableCitation: true,
        enableConfidence: true,
        enableReviewTrigger: false,
        enableFeedback: true,
        auditSampleRate: 0.05, // 5% 抽樣
    },
    low: {
        riskLevel: 'low',
        enableCitation: true,
        enableConfidence: false,
        enableReviewTrigger: false,
        enableFeedback: false,
        auditSampleRate: 0.02, // 2% 抽樣
    },
};
