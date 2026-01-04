'use client';

import { useState, useEffect } from 'react';
import { DocumentCategory } from '@/types';
import { getCategories } from '@/lib/actions/taxonomy';
import HierarchicalCategorySelect from '@/components/files/HierarchicalCategorySelect';
import SimpleHoverTest from './simple-test';

export default function TestCategoryPage() {
  const [showSimple, setShowSimple] = useState(false);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const { data, error } = await getCategories();
        if (error) {
          console.error('❌ 取得分類失敗:', error);
        } else if (data) {
          console.log('✅ 成功取得分類:', data);
          console.log('📊 總分類數:', data.length);

          // 分析資料結構
          const parents = data.filter(c => c.parent_id === null);
          const children = data.filter(c => c.parent_id !== null);

          console.log('📁 主分類數:', parents.length);
          console.log('📄 子分類數:', children.length);

          // 顯示每個主分類的子分類數量
          parents.forEach(parent => {
            const childCount = children.filter(c => c.parent_id === parent.id).length;
            console.log(`  - ${parent.name}: ${childCount} 個子分類`);
          });

          setCategories(data);
        }
      } catch (err) {
        console.error('❌ 例外錯誤:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">載入中...</div>
      </div>
    );
  }

  if (showSimple) {
    return <SimpleHoverTest />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            階層式分類選單測試
          </h1>
          <button
            onClick={() => setShowSimple(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            切換到簡化測試
          </button>
        </div>

        {/* 測試區域 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            測試元件
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              選擇分類：
            </label>
            <HierarchicalCategorySelect
              categories={categories}
              value={selectedValue}
              onChange={setSelectedValue}
              selectSize="md"
              className="w-80"
            />
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              已選擇的值: <span className="font-mono font-semibold">{selectedValue || '(未選擇)'}</span>
            </p>
            {selectedValue && (
              <p className="text-sm text-gray-600 mt-2">
                已選擇的分類: <span className="font-semibold">
                  {categories.find(c => c.id === selectedValue)?.name}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* 資料結構診斷 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            資料結構診斷
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">總覽</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>總分類數: {categories.length}</li>
                <li>主分類數: {categories.filter(c => c.parent_id === null).length}</li>
                <li>子分類數: {categories.filter(c => c.parent_id !== null).length}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">階層結構</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {categories
                  .filter(c => c.parent_id === null)
                  .map(parent => {
                    const children = categories.filter(c => c.parent_id === parent.id);
                    return (
                      <div key={parent.id} className="border border-gray-200 rounded p-3">
                        <div className="font-medium text-gray-800 mb-2">
                          📁 {parent.name}
                          <span className="ml-2 text-xs text-gray-500">
                            ({children.length} 個子分類)
                          </span>
                        </div>
                        {children.length > 0 && (
                          <ul className="ml-4 space-y-1">
                            {children.map(child => (
                              <li key={child.id} className="text-sm text-gray-600">
                                📄 {child.name}
                              </li>
                            ))}
                          </ul>
                        )}
                        {children.length === 0 && (
                          <div className="ml-4 text-sm text-red-500">
                            ⚠️ 沒有子分類！
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
