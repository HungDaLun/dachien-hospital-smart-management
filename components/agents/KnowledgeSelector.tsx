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

import { useState, useEffect } from 'react';
import { Card, Button, Badge, Spinner } from '@/components/ui';
import { Dictionary } from '@/lib/i18n/dictionaries';

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

  // AI 推薦檔案
  const fetchRecommendations = async () => {
    if (!agentDescription.trim()) {
      alert('請先填寫 Agent 描述，AI 才能推薦相關知識來源');
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
      alert('AI 推薦失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 載入所有檔案（手動模式）
  const fetchAllFiles = async () => {
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
  };

  useEffect(() => {
    if (mode === 'manual' && allFiles.length === 0) {
      fetchAllFiles();
    }
  }, [mode]);

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
  const getDIKWColor = (level?: string) => {
    switch (level) {
      case 'data': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'information': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'knowledge': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'wisdom': return 'bg-violet-50 text-violet-700 border-violet-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // 相關度分數視覺化
  const RelevanceBar = ({ score }: { score: number }) => (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500 min-w-[60px]">相關度</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${score > 0.8 ? 'bg-emerald-500' :
            score > 0.6 ? 'bg-sky-500' :
              'bg-amber-500'
            }`}
          style={{ width: `${score * 100}%` }}
        />
      </div>
      <span className="font-medium text-gray-700 min-w-[40px]">{Math.round(score * 100)}%</span>
    </div>
  );

  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">知識庫來源</h3>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === 'recommended' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setMode('recommended')}
            >
              🤖 AI 推薦
            </Button>
            <Button
              type="button"
              variant={mode === 'manual' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setMode('manual')}
            >
              📂 手動選擇
            </Button>
          </div>
        </div>

        {/* AI 推薦模式 */}
        {mode === 'recommended' && (
          <div className="space-y-3">
            {recommendedFiles.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-600 mb-3">
                  AI 會根據你的 Agent 描述推薦最相關的知識來源
                </p>
                <Button
                  type="button"
                  variant="primary"
                  onClick={fetchRecommendations}
                  disabled={loading || !agentDescription.trim()}
                >
                  {loading ? <Spinner size="sm" color="white" /> : '✨ 開始推薦'}
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    已推薦 {recommendedFiles.length} 個檔案，已選 {selectedFiles.length} 個
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={fetchRecommendations}
                    disabled={loading}
                  >
                    🔄 重新推薦
                  </Button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recommendedFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedFiles.includes(file.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white'
                        }`}
                      onClick={() => toggleFile(file.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* 勾選框 */}
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => toggleFile(file.id)}
                          className="mt-1 w-4 h-4 text-primary-600 rounded"
                        />

                        <div className="flex-1 min-w-0">
                          {/* 檔名與標籤 */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 truncate">
                              {file.title || file.filename}
                            </span>
                            {file.dikw_level && (
                              <Badge className={`text-xs ${getDIKWColor(file.dikw_level)}`}>
                                {file.dikw_level.toUpperCase()}
                              </Badge>
                            )}
                          </div>

                          {/* 推薦原因 */}
                          {file.reason && (
                            <p className="text-xs text-gray-600 mb-2">
                              💡 {file.reason}
                            </p>
                          )}

                          {/* 相關度分數 */}
                          {file.relevance_score && (
                            <RelevanceBar score={file.relevance_score} />
                          )}

                          {/* 摘要 */}
                          {file.summary && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                              {file.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* 手動選擇模式 */}
        {mode === 'manual' && (
          <div className="space-y-3">
            {/* 搜尋框 */}
            <input
              type="text"
              placeholder="搜尋檔案名稱或標題..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />

            {/* 檔案列表 */}
            {loading ? (
              <div className="text-center py-8">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedFiles.includes(file.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white'
                      }`}
                    onClick={() => toggleFile(file.id)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => toggleFile(file.id)}
                        className="mt-1 w-4 h-4 text-primary-600 rounded"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 truncate">
                            {file.title || file.filename}
                          </span>
                          {file.dikw_level && (
                            <Badge className={`text-xs ${getDIKWColor(file.dikw_level)}`}>
                              {file.dikw_level.toUpperCase()}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {file.department_name && (
                            <span>🏢 {file.department_name}</span>
                          )}
                          {file.category_name && (
                            <span>📁 {file.category_name}</span>
                          )}
                        </div>

                        {file.summary && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {file.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredFiles.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    找不到符合的檔案
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 已選檔案摘要 */}
        {selectedFiles.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              已選擇 {selectedFiles.length} 個檔案
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((fileId) => {
                const file = [...recommendedFiles, ...allFiles].find(f => f.id === fileId);
                return file ? (
                  <Badge
                    key={fileId}
                    className="bg-primary-100 text-primary-700 border border-primary-200"
                  >
                    {file.title || file.filename}
                    <button
                      type="button"
                      onClick={() => toggleFile(fileId)}
                      className="ml-2 hover:text-primary-900 font-bold"
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
