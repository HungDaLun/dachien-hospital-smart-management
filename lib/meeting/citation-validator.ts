import { createClient } from '@/lib/supabase/server';

export interface CitationValidationResult {
    hasSuspectedHallucinations: boolean;
    validCitations: string[];
    invalidCitations: string[];
    warningMessage?: string;
}

/**
 * 引用驗證器
 * 用於檢測 AI 回覆中是否引用了不存在於知識庫的文件
 */
export class CitationValidator {

    /**
     * 從文本中提取引用的文件名稱
     */
    private extractCitations(text: string): string[] {
        const citations: string[] = [];

        // 匹配多種引用格式：
        // 1. 《文件名》 格式
        // 2. 「文件名」 格式
        // 3. 根據 "XXX報告" / "XXX分析" 等模式
        const patterns = [
            /《([^》]+)》/g,           // 《...》
            /「([^」]+(?:報告|分析|白皮書|規範|文件|手冊|評估|計畫|策略))」/g,  // 「...報告」等
            /根據(?:「)?([^」\n]+(?:報告|分析|白皮書|規範|文件|手冊|評估|計畫|策略))(?:」)?/g,  // 根據...報告
            /引用(?:「)?([^」\n]+(?:報告|分析|白皮書|規範|文件|手冊|評估|計畫|策略))(?:」)?/g,  // 引用...報告
            /參照(?:「)?([^」\n]+(?:報告|分析|白皮書|規範|文件|手冊|評估|計畫|策略))(?:」)?/g,  // 參照...報告
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const citation = match[1].trim();
                if (citation && !citations.includes(citation)) {
                    citations.push(citation);
                }
            }
        }

        return citations;
    }

    /**
     * 驗證引用的文件是否存在於知識庫
     */
    async validateCitations(
        text: string,
        speakerId: string,
        speakerType: 'department' | 'consultant'
    ): Promise<CitationValidationResult> {
        const citations = this.extractCitations(text);

        if (citations.length === 0) {
            return {
                hasSuspectedHallucinations: false,
                validCitations: [],
                invalidCitations: []
            };
        }

        const supabase = await createClient();

        // 根據發言者類型獲取可用的知識庫文件
        let availableFilenames: string[] = [];
        let availableSummaries: string[] = []; // 新增：用於比對摘要關鍵字

        if (speakerType === 'department') {
            // 部門：獲取該部門的所有文件
            const { data: files } = await supabase
                .from('files')
                .select('filename, metadata_analysis')
                .eq('department_id', speakerId);

            availableFilenames = (files || []).flatMap((f: any) => [
                f.filename,
                f.metadata_analysis?.title,
                // 新增：支持不帶副檔名的文件名比對
                f.filename?.replace(/\.[^.]+$/, ''),
                f.metadata_analysis?.title?.replace(/\.[^.]+$/, '')
            ].filter(Boolean));

            availableSummaries = (files || []).map((f: any) =>
                f.metadata_analysis?.summary || ''
            ).filter(Boolean);
        } else {
            // 顧問：獲取綁定的文件
            const { data: agentFiles } = await supabase
                .from('agent_files')
                .select('file:files(filename, metadata_analysis)')
                .eq('agent_id', speakerId);

            availableFilenames = (agentFiles || []).flatMap((af: any) => [
                af.file?.filename,
                af.file?.metadata_analysis?.title,
                af.file?.filename?.replace(/\.[^.]+$/, ''),
                af.file?.metadata_analysis?.title?.replace(/\.[^.]+$/, '')
            ].filter(Boolean));

            availableSummaries = (agentFiles || []).map((af: any) =>
                af.file?.metadata_analysis?.summary || ''
            ).filter(Boolean);
        }

        // 比對引用的文件
        const validCitations: string[] = [];
        const invalidCitations: string[] = [];

        for (const citation of citations) {
            // 多層次驗證邏輯
            let isValid = false;

            // 層次 1: 精確或包含比對
            isValid = availableFilenames.some(filename =>
                filename.toLowerCase().includes(citation.toLowerCase()) ||
                citation.toLowerCase().includes(filename.toLowerCase())
            );

            // 層次 2: 模糊匹配（提取關鍵詞比對）
            if (!isValid) {
                isValid = availableFilenames.some(filename =>
                    this.fuzzyMatch(citation, filename)
                );
            }

            // 層次 3: 檢查引用是否與摘要內容相關（表示 AI 可能從摘要中提取了正確資訊）
            if (!isValid) {
                const citationKeywords = this.extractKeywords(citation);
                isValid = availableSummaries.some(summary =>
                    citationKeywords.some(keyword =>
                        summary.toLowerCase().includes(keyword.toLowerCase())
                    )
                );
            }

            if (isValid) {
                validCitations.push(citation);
            } else {
                invalidCitations.push(citation);
            }
        }

        const hasSuspectedHallucinations = invalidCitations.length > 0;

        return {
            hasSuspectedHallucinations,
            validCitations,
            invalidCitations,
            warningMessage: hasSuspectedHallucinations
                ? `⚠️ 此發言可能引用了不存在的文件：${invalidCitations.join('、')}`
                : undefined
        };
    }

    /**
     * 提取關鍵詞（用於摘要比對）
     */
    private extractKeywords(text: string): string[] {
        // 移除常見的前綴後綴和符號
        const cleaned = text
            .replace(/[《》「」\[\]【】()（）]/g, '')
            .replace(/\.(md|pdf|docx?|xlsx?)$/i, '')
            .replace(/-v\d+\.?\d*$/i, '');

        // 分割並過濾
        return cleaned
            .split(/[-_\s/\\]+/)
            .filter(w => w.length > 1)
            .filter(w => !['報告', '分析', '文件', '部門', '年度', 'FQ', 'Q'].includes(w));
    }

    /**
     * 改進的模糊匹配
     */
    private fuzzyMatch(citation: string, filename: string): boolean {
        // 標準化處理
        const normalize = (str: string) => str
            .toLowerCase()
            .replace(/[《》「」\[\]【】()（）]/g, '')
            .replace(/\.(md|pdf|docx?|xlsx?)$/i, '')
            .replace(/-v\d+\.?\d*$/i, '')
            .replace(/^(部門|報告|分析|文件|年度)/, '')
            .replace(/(部門|報告|分析|文件|年度)$/, '');

        const cleanCitation = normalize(citation);
        const cleanFilename = normalize(filename);

        // 直接包含比對
        if (cleanCitation.includes(cleanFilename) || cleanFilename.includes(cleanCitation)) {
            return true;
        }

        // 關鍵詞重疊比對（更寬鬆）
        const words1 = cleanCitation.split(/[-_\s/\\]+/).filter(w => w.length > 1);
        const words2 = cleanFilename.split(/[-_\s/\\]+/).filter(w => w.length > 1);

        const commonWords = words1.filter(w =>
            words2.some(w2 => w2.includes(w) || w.includes(w2))
        );

        // 只需要 1 個以上的共同關鍵詞（原本是 2 個，過於嚴格）
        return commonWords.length >= 1;
    }
}
