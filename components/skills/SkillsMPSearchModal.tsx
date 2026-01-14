'use client';

/**
 * SkillsMP 搜尋與匯入模態框
 * 用於在技能市集中搜尋並匯入 SkillsMP 的技能
 */
import { useState } from 'react';
import { Modal, Button, Card, Badge, Spinner } from '@/components/ui';
import { Search, Download, Star, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';

interface SkillsMPSkill {
    id: string;
    slug: string;
    name: string;
    title?: string;
    description: string;
    content?: string;
    category?: string;
    tags?: string[];
    author?: string;
    stars?: number;
    downloads?: number;
    repoFullName?: string; // 新增
    githubUrl?: string;    // 新增
    translatedTitle?: string;       // 新增翻譯標題
    translatedDescription?: string; // 新增翻譯描述
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess?: () => void;
}

export function SkillsMPSearchModal({ isOpen, onClose, onImportSuccess }: Props) {
    const [query, setQuery] = useState('');
    const [searchMode, setSearchMode] = useState<'keyword' | 'ai'>('keyword');
    const [skills, setSkills] = useState<SkillsMPSkill[]>([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [importedSlugs, setImportedSlugs] = useState<Set<string>>(new Set());

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                q: query,
                mode: searchMode,
                limit: '20',
            });

            const response = await fetch(`/api/skills/skillsmp?${params.toString()}`);
            const data = await response.json();

            if (!data.success) {
                setError(data.error?.message || '搜尋服務暫時無法使用');
                setSkills([]);
                return;
            }

            setSkills(data.data?.skills || []);
        } catch (err) {
            console.error('Search error:', err);
            setError(err instanceof Error ? err.message : '連線端點時發生網路錯誤');
            setSkills([]);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (skill: SkillsMPSkill) => {
        setImporting(skill.slug || skill.name);
        setError(null);

        try {
            const response = await fetch('/api/skills/skillsmp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill }),
            });

            const data = await response.json();

            if (!data.success) {
                setError(data.error?.message || '匯入失敗');
                return;
            }

            // 標記為已匯入
            setImportedSlugs(prev => new Set([...prev, (skill.slug || skill.name)]));

            // 通知父組件重新載入
            onImportSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : '匯入過程發生錯誤');
        } finally {
            setImporting(null);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        // 修改為僅在 Ctrl + Enter 或 Cmd + Enter 時觸發
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" title="探索全球 AI 技能市集 (AgentSkills)">
            <div className="space-y-6">
                {/* 搜尋區 */}
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={searchMode === 'ai' ? '描述您需要的技能需求 (支援中文搜尋)... (Ctrl+Enter)' : '輸入中文或英文關鍵字... (Ctrl+Enter)'}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>
                        <Button
                            variant="cta"
                            onClick={handleSearch}
                            loading={loading}
                            className="px-6"
                        >
                            搜尋
                        </Button>
                    </div>

                    {/* 搜尋模式切換 */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-text-tertiary uppercase tracking-wide">搜尋模式：</span>
                        <button
                            onClick={() => setSearchMode('keyword')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${searchMode === 'keyword'
                                ? 'bg-purple-500 text-white'
                                : 'bg-white/5 text-text-tertiary hover:bg-white/10'
                                }`}
                        >
                            精確搜尋
                        </button>
                        <button
                            onClick={() => setSearchMode('ai')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${searchMode === 'ai'
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                                : 'bg-white/5 text-text-tertiary hover:bg-white/10'
                                }`}
                        >
                            <Sparkles size={12} />
                            AI 建議
                        </button>
                    </div>
                </div>

                {/* 錯誤訊息 */}
                {error && (
                    <div className="bg-semantic-danger/10 border border-semantic-danger/30 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-semantic-danger flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-semantic-danger">{error}</p>
                        </div>
                    </div>
                )}

                {/* 搜尋結果 */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 flex-col gap-4">
                            <Spinner size="lg" />
                            <p className="text-xs text-text-tertiary animate-pulse">正在為您進行跨語言在地化翻譯...</p>
                        </div>
                    ) : skills.length > 0 ? (
                        skills.map((skill) => {
                            const slug = skill.slug || skill.name;
                            const isImported = importedSlugs.has(slug);
                            const isImportingThis = importing === slug;

                            return (
                                <Card
                                    key={slug}
                                    variant="glass"
                                    className="p-4 hover:border-purple-500/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-text-primary truncate">
                                                    {skill.name}
                                                </h3>
                                                {skill.translatedTitle && (
                                                    <span className="text-sm text-text-tertiary truncate">
                                                        ({skill.translatedTitle})
                                                    </span>
                                                )}
                                                {skill.stars !== undefined && skill.stars > 10 && (
                                                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px]">
                                                        <Star size={10} className="fill-current mr-1" />
                                                        {skill.stars}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                                                {skill.description}
                                            </p>

                                            {/* AI 翻譯描述 */}
                                            {skill.translatedDescription && (
                                                <div className="mb-3 p-2 rounded bg-purple-500/10 border border-purple-500/20">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Sparkles size={12} className="text-purple-400" />
                                                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">AI 翻譯</span>
                                                    </div>
                                                    <p className="text-xs text-purple-200 line-clamp-2">
                                                        {skill.translatedDescription}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {skill.category && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-text-tertiary uppercase">
                                                        {skill.category}
                                                    </span>
                                                )}
                                                {skill.author && (
                                                    <span className="text-[10px] text-text-tertiary">
                                                        by {skill.author}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {(skill.githubUrl || skill.repoFullName) && (
                                                <a
                                                    href={skill.githubUrl || `https://github.com/${skill.repoFullName}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 hover:bg-white/10 rounded-lg text-text-tertiary hover:text-white transition-colors"
                                                    title="查看原始代碼"
                                                >
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                            <Button
                                                variant={isImported ? 'outline' : 'cta'}
                                                size="sm"
                                                onClick={() => handleImport(skill)}
                                                loading={isImportingThis}
                                                disabled={isImported || isImportingThis}
                                                className="min-w-[80px]"
                                            >
                                                {isImported ? (
                                                    '已匯入'
                                                ) : (
                                                    <>
                                                        <Download size={14} className="mr-1" />
                                                        匯入
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    ) : query && !loading ? (
                        <div className="text-center py-12 text-text-tertiary">
                            <Search size={32} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">沒有找到符合的技能</p>
                            <p className="text-xs mt-1">試試其他關鍵字，或改用英文搜尋</p>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-text-tertiary">
                            <Sparkles size={32} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">探索全球 AI 專業技能</p>
                            <p className="text-xs mt-1">搜尋結果將透過 Gemini 自動翻譯為繁體中文</p>
                        </div>
                    )}
                </div>

                {/* 底部資訊 */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-xs text-text-tertiary">
                        整合資料源: AgentSkills
                    </span>
                    <Button variant="ghost" onClick={onClose}>
                        關閉
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
