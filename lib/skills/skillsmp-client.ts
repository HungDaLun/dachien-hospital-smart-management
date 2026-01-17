/**
 * AgentSkills API 整合服務 (原 SkillsMP 替代方案)
 * 
 * 官方網站：https://www.agentskills.in
 * 
 * 端點：
 * - GET /api/skills?search=關鍵字 - 搜尋技能
 */

interface SkillsMPSkill {
    id: string;
    slug: string;
    name: string;
    title?: string;
    description: string;
    content?: string;  // 從 GitHub Raw 抓取的 SKILL.md 內容
    category?: string;
    tags?: string[];
    author?: string;
    stars?: number;
    downloads?: number;
    repoFullName?: string; // GitHub 倉庫名稱 (例如: "user/repo")
    path?: string;         // 檔案路徑 (例如: ".opencode/skill/name/SKILL.md")
    githubUrl?: string;    // GitHub 頁面連結
}

interface SkillsMPSearchResponse {
    success: boolean;
    data?: {
        skills: SkillsMPSkill[];
        total?: number;
    };
    error?: {
        code: string;
        message: string;
    };
}

/**
 * 為了保持與既有代碼相容，我們保留 SkillsMPClient 這個名稱，
 * 但內部邏輯已改為使用更穩定的 agentskills.in 資料源。
 */
export class SkillsMPClient {
    private baseUrl = 'https://www.agentskills.in/api';

    constructor(_apiKey?: string) {
        // agentskills.in 目前不需要 API Key，此參數僅為保持相容
    }

    /**
     * 搜尋技能
     * 
     * @param query 搜尋關鍵字
     * @param options 選項
     */
    async searchSkills(
        query: string,
        options?: {
            limit?: number;
            sortBy?: string;
        }
    ): Promise<SkillsMPSearchResponse> {
        const params = new URLSearchParams();
        params.append('search', query);
        params.append('limit', (options?.limit || 20).toString());
        if (options?.sortBy) params.append('sortBy', options.sortBy);

        try {
            const response = await fetch(
                `${this.baseUrl}/skills?${params.toString()}`,
                {
                    method: 'GET',
                    cache: 'no-store',
                }
            );

            if (!response.ok) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_RESPONSE',
                        message: `伺服器回傳錯誤 (HTTP ${response.status})`,
                    },
                };
            }

            const data = await response.json();

            // 轉換資料格式以符合既有的前端介面
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const formattedSkills: SkillsMPSkill[] = (data.skills || []).map((s: any) => ({
                id: s.id,
                slug: s.name, // 使用 name 作為 slug
                name: s.name,
                title: s.name,
                description: s.description || '',
                author: s.author,
                stars: s.stars,
                repoFullName: s.repoFullName,
                path: s.path,
                githubUrl: s.githubUrl,
                category: s.category || 'General',
                tags: s.tags || []
            }));

            return {
                success: true,
                data: {
                    skills: formattedSkills,
                    total: data.total || formattedSkills.length
                },
            };
        } catch (error) {
            console.error('AgentSkills search error:', error);
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: error instanceof Error ? error.message : '網路錯誤',
                },
            };
        }
    }

    /**
     * AI 語意搜尋技能 (目前 AgentSkills 支援基本搜尋，我們直接映射)
     */
    async aiSearch(query: string): Promise<SkillsMPSearchResponse> {
        return this.searchSkills(query, { sortBy: 'stars' });
    }

    /**
     * 取得技能內容 (從 GitHub Raw)
     */
    async fetchSkillContent(repoFullName: string, path: string): Promise<string | null> {
        try {
            // 構建 GitHub Raw URL
            // 注意：分支預設嘗試 master，如果不通可能需要 main
            const rawUrl = `https://raw.githubusercontent.com/${repoFullName}/master/${path}`;
            const response = await fetch(rawUrl);

            if (response.ok) {
                return await response.text();
            }

            // 嘗試 main 分支
            const mainUrl = `https://raw.githubusercontent.com/${repoFullName}/main/${path}`;
            const mainResponse = await fetch(mainUrl);

            if (mainResponse.ok) {
                return await mainResponse.text();
            }

            return null;
        } catch (error) {
            console.error('Fetch skill content error:', error);
            return null;
        }
    }

    /**
     * 為了保持 API 相容性提供的 Mock 方法
     */
    async getSkillBySlug(_slug: string): Promise<{ success: boolean; data?: SkillsMPSkill; error?: { code: string; message: string } }> {
        // 因為 AgentSkills 沒有直接的 by slug 端點提供完整內容，
        // 我們通常是在搜尋結果中拿到內容路徑。
        // 此處僅作為介面相容。
        return {
            success: false,
            error: { code: 'NOT_IMPLEMENTED', message: '請使用搜尋結果中的內容路徑獲取' }
        };
    }
}

/**
 * 取得客戶端實例
 */
export async function getSkillsMPClient(): Promise<SkillsMPClient | null> {
    // 現在不需 Key 也能初始化
    return new SkillsMPClient();
}

export type { SkillsMPSkill, SkillsMPSearchResponse };
