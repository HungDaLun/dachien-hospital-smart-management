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
     * 優先處理純文字格式的來源標註，向下相容 JSON 格式
     */
    async process(rawContent: string): Promise<SafeguardResult> {
        const result: SafeguardResult = {
            citations: [],
            needsReview: false,
            reviewTriggers: [],
            cleanContent: rawContent,
            selectedForAudit: Math.random() < this.config.auditSampleRate,
        };

        // 1. 先嘗試解析 JSON 格式（向下相容舊格式）
        const parsed = this.tryParseJsonResponse(rawContent);

        if (parsed && parsed.answer) {
            // 如果有 JSON 格式，提取核心內容
            result.cleanContent = parsed.answer;

            // 從 JSON 中提取引用
            if (this.config.enableCitation && parsed.citations) {
                result.citations = extractCitations(parsed.citations);
            }

            // 從 JSON 中提取信心度
            if (this.config.enableConfidence && parsed.confidence !== undefined) {
                const { score, reasoning } = extractConfidence(parsed.confidence, parsed.reasoning);
                result.confidenceScore = score;
                result.confidenceReasoning = reasoning;
            }
        } else {
            // 2. 純文字處理：清理可能殘留的 JSON 區塊
            result.cleanContent = rawContent
                .replace(/```json\s*\{[\s\S]*\}\s*```/g, '')
                .replace(/\{[\s\S]*"answer"[\s\S]*\}/g, '')
                .trim();

            // 3. 從純文字中提取「來源：《文件名稱》」格式的引用
            if (this.config.enableCitation) {
                const sourceMatches = rawContent.matchAll(/來源[：:]\s*[《「]([^》」\n]+)[》」]/g);
                const extractedCitations: Array<{ fileName: string; reason: string; excerpt: string }> = [];

                for (const match of sourceMatches) {
                    const fileName = match[1].trim();
                    if (fileName && !extractedCitations.some(c => c.fileName === fileName)) {
                        extractedCitations.push({
                            fileName,
                            reason: '文件引用',
                            excerpt: ''
                        });
                    }
                }

                if (extractedCitations.length > 0) {
                    result.citations = extractCitations(extractedCitations);
                }
            }
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
     * 注意：不再要求 JSON 格式輸出，以避免串流過程中顯示 JSON 給用戶
     * 改為要求 AI 在回答中自然地標註來源
     */
    getSystemPromptSuffix(): string {
        const guidelines: string[] = [];

        if (this.config.enableCitation) {
            guidelines.push('在引用知識庫內容時，請在相關段落末尾以「來源：《文件名稱》」的格式標註');
        }

        if (this.config.enableConfidence) {
            // 不再要求在回覆中顯示信心度，改由後端分析
            // 這樣可以保持回覆的自然性
        }

        if (guidelines.length === 0) {
            return '';
        }

        return `

【回答格式建議】
${guidelines.map((g, i) => `${i + 1}. ${g}`).join('\n')}
請以自然流暢的繁體中文回答，不要使用 JSON 格式。
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
