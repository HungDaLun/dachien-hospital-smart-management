import {
    SafeguardConfig,
    SafeguardResult,
    RISK_PRESETS,
    RiskLevel
} from './types';
import { extractCitations } from './layers/citation-extractor';
import { extractConfidence } from './layers/confidence-scorer';
import { detectReviewTriggers } from './layers/review-detector';

export class SafeguardProcessor {
    private config: SafeguardConfig;

    constructor(riskLevel: RiskLevel);
    constructor(config: SafeguardConfig);
    constructor(configOrRiskLevel: SafeguardConfig | RiskLevel) {
        this.config = typeof configOrRiskLevel === 'string'
            ? RISK_PRESETS[configOrRiskLevel]
            : configOrRiskLevel;
    }

    /**
     * 處理 AI 回應，提取品質防護資訊
     */
    async process(rawContent: string): Promise<SafeguardResult> {
        const result: SafeguardResult = {
            citations: [],
            needsReview: false,
            reviewTriggers: [],
            cleanContent: rawContent,
            selectedForAudit: Math.random() < this.config.auditSampleRate,
        };

        // 嘗試解析 JSON 格式的回應（有些回應可能包含 JSON markdown 區塊）
        const parsed = this.tryParseJsonResponse(rawContent);

        if (parsed) {
            // 提取核心內容（如果是結構化回答）
            result.cleanContent = parsed.answer || parsed.content || parsed.response || rawContent;

            // Layer 1: 引用來源
            if (this.config.enableCitation) {
                result.citations = extractCitations(parsed.citations);
            }

            // Layer 2: 信心度評分
            if (this.config.enableConfidence) {
                const { score, reasoning } = extractConfidence(parsed.confidence, parsed.reasoning);
                result.confidenceScore = score;
                result.confidenceReasoning = reasoning;
            }
        } else {
            // 即使沒有 JSON，也要清理可能的餘留 JSON 區塊標示
            result.cleanContent = rawContent.replace(/```json\s*\{[\s\S]*\}\s*```$/, '').trim();
        }

        // Layer 3: 覆核提示（基於內容檢測）
        if (this.config.enableReviewTrigger) {
            const triggers = detectReviewTriggers(result.cleanContent);
            result.needsReview = triggers.length > 0 || (result.confidenceScore !== undefined && result.confidenceScore < 0.6);
            result.reviewTriggers = triggers;
        }

        return result;
    }

    /**
     * 取得用於注入 System Prompt 的格式要求
     */
    getSystemPromptSuffix(): string {
        const requirements: string[] = [];

        if (this.config.enableCitation) {
            requirements.push('"citations": [{"fileName": "檔案名稱", "reason": "引用的章節或理由", "excerpt": "核心原文"}]');
        }

        if (this.config.enableConfidence) {
            requirements.push('"confidence": 0.0-1.0 的信心評分數字');
            requirements.push('"reasoning": "對於此信心評分的理由"');
        }

        if (requirements.length === 0) {
            return '';
        }

        return `

【回應格式要求】
為了確保回答品質，請在回答內容結束後，附帶一個符合以下結構的 JSON 區塊：
\`\`\`json
{
  "answer": "這裡放置你的回答主體內容",
  ${requirements.join(',\n  ')}
}
\`\`\`
`;
    }

    /**
     * 內部輔助：嘗試解析內容中的 JSON
     */
    private tryParseJsonResponse(content: string): Record<string, any> | null {
        if (!content) return null;

        try {
            // 1. 嘗試直接解析（如果整個內容就是 JSON）
            return JSON.parse(content);
        } catch {
            // 2. 嘗試從 markdown code block 中提取末端 JSON
            const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[1]);
                } catch {
                    return null;
                }
            }

            // 3. 嘗試找最後一個 { ... }
            const lastBrace = content.lastIndexOf('{');
            if (lastBrace !== -1) {
                try {
                    return JSON.parse(content.substring(lastBrace));
                } catch {
                    return null;
                }
            }

            return null;
        }
    }
}
