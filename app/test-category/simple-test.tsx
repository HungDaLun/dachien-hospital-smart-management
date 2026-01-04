'use client';

import { useState } from 'react';

export default function SimpleHoverTest() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const items = [
    { id: '1', name: '人力資源', children: ['招募', '訓練', '績效'] },
    { id: '2', name: '財務管理', children: ['會計', '預算', '報表'] },
    { id: '3', name: '客戶服務', children: ['FAQ', '流程', '手冊'] },
  ];

  const handleMouseEnter = (id: string, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredId(id);
    setPosition({
      top: rect.top,
      left: rect.right + 4,
    });
    console.log('✅ Mouse Enter:', id, rect);
  };

  const handleMouseLeave = () => {
    console.log('❌ Mouse Leave');
    setTimeout(() => {
      setHoveredId(null);
      setPosition(null);
    }, 150);
  };

  const hoveredItem = items.find(item => item.id === hoveredId);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">簡化版 Hover 測試</h1>

        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-4">
            當前 hoveredId: <span className="font-mono">{hoveredId || '(null)'}</span>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            當前 position: <span className="font-mono">{JSON.stringify(position)}</span>
          </p>

          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item.id}
                onMouseEnter={(e) => handleMouseEnter(item.id, e)}
                onMouseLeave={handleMouseLeave}
                className={`
                  px-4 py-2 cursor-pointer rounded
                  ${hoveredId === item.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{item.name}</span>
                  <span className="text-gray-400">▶</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 浮出選單 */}
        {hoveredItem && position && (
          <div
            className="fixed bg-white border rounded-lg shadow-xl p-4 w-48"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              zIndex: 9999,
            }}
            onMouseEnter={() => console.log('進入子選單')}
            onMouseLeave={handleMouseLeave}
          >
            <h3 className="font-semibold mb-2">{hoveredItem.name}</h3>
            <ul className="space-y-1">
              {hoveredItem.children.map((child, idx) => (
                <li key={idx} className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer">
                  {child}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
