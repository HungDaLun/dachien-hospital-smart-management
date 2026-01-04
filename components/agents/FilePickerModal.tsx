/**
 * 檔案選擇器 Modal
 * 讓使用者手動瀏覽並選擇檔案作為 Agent 的知識來源
 */
'use client';

import { useState, useEffect } from 'react';
import { Button, Spinner, Badge } from '@/components/ui';

interface FileItem {
  id: string;
  filename: string;
  metadata_analysis?: {
    title?: string;
    summary?: string;
    governance?: {
      dikw_level?: string;
      artifact?: string;
    };
  };
  department?: { name: string };
  category?: { name: string };
}

interface FilePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFiles: string[];
  onConfirm: (fileIds: string[]) => void;
}

export default function FilePickerModal({
  isOpen,
  onClose,
  selectedFiles,
  onConfirm
}: FilePickerModalProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>(selectedFiles);

  // 載入所有檔案
  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedFiles);
      fetchFiles();
    }
  }, [isOpen, selectedFiles]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      if (data.success) {
        setFiles(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  // 切換檔案選擇
  const toggleFile = (fileId: string) => {
    if (tempSelected.includes(fileId)) {
      setTempSelected(tempSelected.filter(id => id !== fileId));
    } else {
      setTempSelected([...tempSelected, fileId]);
    }
  };

  // 過濾檔案
  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.metadata_analysis?.title?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleConfirm = () => {
    onConfirm(tempSelected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">選擇知識來源</h2>
              <p className="text-sm text-gray-500 mt-1">
                已選 {tempSelected.length} 個檔案
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 搜尋框 */}
          <input
            type="text"
            placeholder="搜尋檔案名稱或標題..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
          />
        </div>

        {/* 檔案列表 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <Spinner />
              <p className="text-gray-500 mt-2">載入中...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">找不到符合的檔案</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFiles.map((file) => {
                const isSelected = tempSelected.includes(file.id);
                const meta = file.metadata_analysis || {};

                return (
                  <div
                    key={file.id}
                    onClick={() => toggleFile(file.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* 勾選框 */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFile(file.id)}
                        className="mt-1 w-4 h-4 text-primary-600 rounded"
                      />

                      <div className="flex-1 min-w-0">
                        {/* 標題與標籤 */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 truncate">
                            {meta.title || file.filename}
                          </span>
                          {meta.governance?.dikw_level && (
                            <Badge className={`text-xs ${getDIKWColor(meta.governance.dikw_level)}`}>
                              {meta.governance.dikw_level.toUpperCase()}
                            </Badge>
                          )}
                        </div>

                        {/* 檔案名稱（如果與標題不同） */}
                        {meta.title && meta.title !== file.filename && (
                          <p className="text-xs text-gray-500 mb-1">
                            📄 {file.filename}
                          </p>
                        )}

                        {/* 部門與分類 */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          {file.department && (
                            <span>🏢 {file.department.name}</span>
                          )}
                          {file.category && (
                            <span>📁 {file.category.name}</span>
                          )}
                          {meta.governance?.artifact && (
                            <span>🔧 {meta.governance.artifact}</span>
                          )}
                        </div>

                        {/* 摘要 */}
                        {meta.summary && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {meta.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            已選擇 <span className="font-semibold text-primary-600">{tempSelected.length}</span> 個檔案
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
            >
              確認選擇
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
