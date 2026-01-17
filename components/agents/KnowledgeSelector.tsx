/**
 * 知識庫選擇器 (Knowledge Selector)
 * 用於 Agent 建立/編輯時選擇知識來源
 *
 * 特性：
 * 1. AI 智能推薦（根據 Agent 描述）
 * 2. 手動瀏覽選擇（按部門/分類過濾）
 * 3. 視覺化顯示相關度分數
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Spinner, Input } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { Sparkles, Folder, Search, CheckCircle2, RefreshCw, Database, Brain, Network } from 'lucide-react';

interface FileItem {
  id: string;
  filename: string;
  title?: string;
  summary?: string;
  department_name?: string;
  category_name?: string;
  dikw_level?: 'data' | 'information' | 'knowledge' | 'wisdom';
  relevance_score?: number;  // 0-1 的相關度（AI 推薦時才有）
  reason?: string;           // 推薦原因（AI 推薦時才有）
}

interface KnowledgeSelectorProps {
  agentDescription: string;  // Agent 的描述，用於 AI 推薦
  selectedFiles: string[];   // 已選檔案 ID 列表
  onChange: (fileIds: string[]) => void;
  dict: Dictionary;
}

export default function KnowledgeSelector({
  agentDescription,
  selectedFiles,
  onChange,
  dict: _dict
}: KnowledgeSelectorProps) {
  const [mode, setMode] = useState<'recommended' | 'manual'>('recommended');
  const [loading, setLoading] = useState(false);
  const [recommendedFiles, setRecommendedFiles] = useState<FileItem[]>([]);
  const [allFiles, setAllFiles] = useState<FileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // AI 推薦檔案
  const fetchRecommendations = useCallback(async () => {
    if (!agentDescription.trim()) {
      toast.error('請先填寫 Agent 描述，AI 才能推薦相關知識來源');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/agents/recommend-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_intent: agentDescription,
          department_id: null,  // TODO: 從使用者 session 取得
        })
      });

      const data = await res.json();
      if (data.success) {
        setRecommendedFiles(data.data.files);
        // 自動勾選「必需」和「推薦」的檔案
        const autoSelected = data.data.files
          .filter((f: FileItem) => f.relevance_score && f.relevance_score > 0.7)
          .map((f: FileItem) => f.id);
        onChange(autoSelected);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      toast.error('AI 推薦失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, [agentDescription, onChange, toast]);

  // 載入所有檔案（手動模式）
  const fetchAllFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      if (data.success) {
        setAllFiles(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mode === 'manual' && allFiles.length === 0) {
      fetchAllFiles();
    }
  }, [mode, allFiles.length, fetchAllFiles]);

  // 切換檔案選擇狀態
  const toggleFile = (fileId: string) => {
    if (selectedFiles.includes(fileId)) {
      onChange(selectedFiles.filter(id => id !== fileId));
    } else {
      onChange([...selectedFiles, fileId]);
    }
  };

  // 過濾檔案（手動模式）
  const filteredFiles = allFiles.filter(file =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // DIKW 層級配色
  const getDIKWBadge = (level?: string) => {
    switch (level) {
      case 'data': return <Badge variant="outline" size="sm" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">DATA</Badge>;
      case 'information': return <Badge variant="outline" size="sm" className="bg-sky-500/10 text-sky-400 border-sky-500/20">INFO</Badge>;
      case 'knowledge': return <Badge variant="outline" size="sm" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">KNOW</Badge>;
      case 'wisdom': return <Badge variant="outline" size="sm" className="bg-violet-500/10 text-violet-400 border-violet-500/20">WIZ</Badge>;
      default: return null;
    }
  };

  // 相關度分數視覺化
  const RelevanceIndicator = ({ score }: { score: number }) => (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full transition-all duration-1000 shadow-glow-cyan/20 ${score > 0.8 ? 'bg-primary-500' :
            score > 0.6 ? 'bg-secondary-400' :
              'bg-semantic-warning'
            }`}
          style={{ width: `${score * 100}%` }}
        />
      </div>
      <span className="text-[10px] font-black tabular-nums text-text-tertiary uppercase tracking-widest">{Math.round(score * 100)}% Match</span>
    </div>
  );

  return (
    <Card variant="glass" className="overflow-hidden border-white/10 shadow-glow-cyan/5">
      <div className="space-y-6">
        {/* Header Control Unit */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h3 className="text-lg font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
              <Database size={18} className="text-primary-500" />
              知識驅動核心來源 <span className="text-[10px] text-text-tertiary opacity-40 ml-2 font-black italic">INTEL_SOURCE_KERNEL</span>
            </h3>
          </div>

          <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setMode('recommended')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${mode === 'recommended'
                ? 'bg-primary-500/20 text-primary-400 shadow-glow-cyan/10'
                : 'text-text-tertiary hover:text-text-primary hover:bg-white/5'
                }`}
            >
              <Brain size={14} />
              AI 智慧推薦
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${mode === 'manual'
                ? 'bg-primary-500/20 text-primary-400 shadow-glow-cyan/10'
                : 'text-text-tertiary hover:text-text-primary hover:bg-white/5'
                }`}
            >
              <Folder size={14} />
              檔案庫手動瀏覽
            </button>
          </div>
        </div>

        {/* AI Recommendations Mode */}
        {mode === 'recommended' && (
          <div className="space-y-6">
            {recommendedFiles.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.01] rounded-[32px] border border-dashed border-white/10 group hover:border-primary-500/30 transition-all duration-500">
                <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-primary-500/20 transition-all">
                  <Sparkles size={32} className="text-primary-400 animate-pulse-slow" />
                </div>
                <p className="text-text-secondary font-medium mb-8 max-w-xs mx-auto italic opacity-60 leading-relaxed">
                  AI 神經網路已就緒，請完成 Agent 定義後啟動跨庫掃描，精準匹配核心知識資產。
                </p>
                <Button
                  type="button"
                  variant="cta"
                  onClick={fetchRecommendations}
                  disabled={loading || !agentDescription.trim()}
                  className="px-8 shadow-glow-cyan/20"
                >
                  {loading ? <Spinner size="sm" color="black" /> : (
                    <span className="flex items-center gap-2">
                      <Network size={16} />
                      啟動智慧掃描推薦
                    </span>
                  )}
                </Button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-6 px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-500 shadow-glow-cyan" />
                    <p className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em]">
                      已校準 {recommendedFiles.length} 項關聯資產 <span className="opacity-30">|</span> 已掛載 {selectedFiles.length} 節點
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={fetchRecommendations}
                    disabled={loading}
                    className="h-8 text-[10px] font-black opacity-60 hover:opacity-100"
                  >
                    <RefreshCw size={12} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    刷新推薦流
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {recommendedFiles.map((file) => {
                    const isSelected = selectedFiles.includes(file.id);
                    return (
                      <div
                        key={file.id}
                        className={`group/item relative p-6 rounded-2xl border transition-all duration-500 cursor-pointer overflow-hidden ${isSelected
                          ? 'bg-primary-500/10 border-primary-500/30 shadow-glow-cyan/5'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                          }`}
                        onClick={() => toggleFile(file.id)}
                      >
                        {isSelected && <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />}

                        <div className="flex items-start gap-5 relative z-10">
                          <div className={`mt-1 flex items-center justify-center w-6 h-6 rounded-lg border transition-all duration-300 ${isSelected ? 'bg-primary-500 border-primary-500 text-black shadow-glow-cyan' : 'bg-black/40 border-white/10 text-transparent group-hover/item:border-primary-500/50'
                            }`}>
                            <CheckCircle2 size={14} strokeWidth={3} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="font-black text-text-primary uppercase tracking-tight text-base group-hover/item:text-primary-400 transition-colors truncate">
                                {file.title || file.filename}
                              </span>
                              {getDIKWBadge(file.dikw_level)}
                            </div>

                            {file.reason && (
                              <div className="flex items-start gap-2 mb-4 bg-primary-500/5 p-3 rounded-xl border border-primary-500/10">
                                <Sparkles size={14} className="text-primary-400 mt-0.5 shrink-0" />
                                <p className="text-xs font-bold text-text-secondary leading-relaxed">
                                  {file.reason}
                                </p>
                              </div>
                            )}

                            {file.relevance_score && (
                              <div className="mb-4">
                                <RelevanceIndicator score={file.relevance_score} />
                              </div>
                            )}

                            {file.summary && (
                              <p className="text-[11px] font-medium text-text-tertiary leading-relaxed line-clamp-2 italic opacity-60">
                                {file.summary}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Selection Mode */}
        {mode === 'manual' && (
          <div className="space-y-6">
            <div className="relative group/search">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within/search:text-primary-400 transition-colors" />
              <Input
                type="text"
                placeholder="跨庫搜索知識節點名稱、元數據標記..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-black/20"
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Spinner size="lg" />
                <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest animate-pulse">Synchronizing Data Matrix...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredFiles.map((file) => {
                  const isSelected = selectedFiles.includes(file.id);
                  return (
                    <div
                      key={file.id}
                      className={`group/item p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-4 ${isSelected
                        ? 'bg-primary-500/10 border-primary-500/30 shadow-glow-cyan/5'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                        }`}
                      onClick={() => toggleFile(file.id)}
                    >
                      <div className={`flex items-center justify-center w-5 h-5 rounded-md border transition-all duration-300 ${isSelected ? 'bg-primary-500 border-primary-500 text-black shadow-glow-cyan' : 'bg-black/40 border-white/10 text-transparent group-hover/item:border-primary-500/50'
                        }`}>
                        <CheckCircle2 size={12} strokeWidth={4} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="font-black text-text-primary tracking-tight group-hover/item:text-primary-400 transition-colors truncate">
                            {file.title || file.filename}
                          </span>
                          {getDIKWBadge(file.dikw_level)}
                        </div>

                        <div className="flex items-center gap-4">
                          {file.department_name && (
                            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                              <div className="w-1 h-1 rounded-full bg-secondary-400" />
                              {file.department_name}
                            </span>
                          )}
                          {file.category_name && (
                            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                              <div className="w-1 h-1 rounded-full bg-primary-500" />
                              {file.category_name}
                            </span>
                          )}
                          {file.summary && (
                            <span className="text-[10px] text-text-tertiary truncate opacity-40 italic">
                              - {file.summary}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredFiles.length === 0 && (
                  <div className="text-center py-20 text-text-tertiary bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                    <p className="text-sm font-black uppercase tracking-widest opacity-40">搜尋結果為空 <span className="opacity-30">|</span> INDEX EMPTY</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Selected Summary Footer */}
        {selectedFiles.length > 0 && (
          <div className="pt-6 border-t border-white/5 animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">
                虛擬掛載點摘要 <span className="text-primary-400 ml-2 shadow-glow-cyan">{selectedFiles.length} MOUNTED</span>
              </span>
              <button
                onClick={() => onChange([])}
                className="text-[9px] font-black text-semantic-danger opacity-40 hover:opacity-100 uppercase tracking-widest transition-all"
              >
                Clear Matrix
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((fileId) => {
                const file = [...recommendedFiles, ...allFiles].find(f => f.id === fileId);
                return file ? (
                  <Badge
                    key={fileId}
                    variant="outline"
                    size="sm"
                    className="bg-white/5 border-white/10 text-text-secondary hover:border-primary-500/30 transition-all pr-1.5"
                  >
                    {file.title || file.filename}
                    <button
                      type="button"
                      onClick={() => toggleFile(fileId)}
                      className="ml-2 opacity-40 hover:opacity-100 hover:text-semantic-danger transition-all"
                    >
                      ×
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
