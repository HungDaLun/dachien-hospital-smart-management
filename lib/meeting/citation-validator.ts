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

        if (speakerType === 'department') {
            // 部門：獲取該部門的所有文件
            const { data: files } = await supabase
                .from('files')
                .select('filename, metadata_analysis')
                .eq('department_id', speakerId);

            availableFilenames = (files || []).flatMap((f: any) => [
                f.filename,
                f.metadata_analysis?.title
            ].filter(Boolean));
        } else {
            // 顧問：獲取綁定的文件
            const { data: agentFiles } = await supabase
                .from('agent_files')
                .select('file:files(filename, metadata_analysis)')
                .eq('agent_id', speakerId);

            availableFilenames = (agentFiles || []).flatMap((af: any) => [
                af.file?.filename,
                af.file?.metadata_analysis?.title
            ].filter(Boolean));
        }

        // 比對引用的文件
        const validCitations: string[] = [];
        const invalidCitations: string[] = [];

        for (const citation of citations) {
            // 模糊匹配：檢查引用是否與任何已知文件相似
            const isValid = availableFilenames.some(filename =>
                filename.includes(citation) ||
                citation.includes(filename) ||
                this.fuzzyMatch(citation, filename)
            );

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
     * 簡單的模糊匹配
     */
    private fuzzyMatch(citation: string, filename: string): boolean {
        // 移除常見的前綴和後綴
        const cleanCitation = citation
            .replace(/^(部門|報告|分析|文件|年度)/, '')
            .replace(/(部門|報告|分析|文件|年度)$/, '');

        const cleanFilename = filename
            .replace(/^(部門|報告|分析|文件|年度)/, '')
            .replace(/(部門|報告|分析|文件|年度)$/, '')
            .replace(/\.md$/, '')
            .replace(/-v\d+\.?\d*$/, '');

        // 檢查是否有足夠的重疊
        const words1 = cleanCitation.split(/[-_\s]/);
        const words2 = cleanFilename.split(/[-_\s]/);

        const commonWords = words1.filter(w =>
            w.length > 1 && words2.some(w2 => w2.includes(w) || w.includes(w2))
        );

        return commonWords.length >= 2;
    }
}
