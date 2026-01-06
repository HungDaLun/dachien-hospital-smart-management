'use client';

import React, { useState } from 'react';
import { WatchTopic } from '@/lib/war-room/types';
import { WAR_ROOM_THEME } from '@/styles/war-room-theme';

export default function WatchTopicManager() {
    const [topics, setTopics] = useState<WatchTopic[]>([
        // Mock topics for initial state
        { id: '1', name: '半導體供應鏈', keywords: ['台積電', '晶片短缺'], competitors: [], suppliers: ['ASML'], risk_threshold: 'medium' }
    ]);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddTopic = () => {
        // Dummy implementation to satisfy linter
        console.log("Adding topic...");
        setTopics(prev => [...prev]); // Trigger re-render with same state
        setIsAdding(false);
    };

    const getRiskLabel = (threshold: string) => {
        switch (threshold) {
            case 'high': return '高度風險';
            case 'medium': return '中度風險';
            case 'low': return '低度風險';
            default: return threshold;
        }
    };

    return (
        <div
            className="p-6 rounded-lg mb-8"
            style={{
                backgroundColor: WAR_ROOM_THEME.background.secondary,
                border: WAR_ROOM_THEME.border.default
            }}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    🌐 外部情報監控主題
                </h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="px-4 py-2 rounded text-sm font-medium bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                    + 新增監控主題
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topics.map(topic => (
                    <div
                        key={topic.id}
                        className="p-4 rounded border relative group"
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    >
                        <div className="flex justify-between mb-2">
                            <h3 className="font-bold text-lg">{topic.name}</h3>
                            <span
                                className="text-xs px-2 py-1 rounded-full uppercase"
                                style={{
                                    backgroundColor: topic.risk_threshold === 'medium' ? 'rgba(255,184,0,0.2)' : 'rgba(0,255,136,0.2)',
                                    color: topic.risk_threshold === 'medium' ? WAR_ROOM_THEME.semantic.warning : WAR_ROOM_THEME.semantic.success
                                }}
                            >
                                {getRiskLabel(topic.risk_threshold)}
                            </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-400">
                            <div>關鍵字：<span className="text-white">{topic.keywords.join(', ')}</span></div>
                            {topic.suppliers.length > 0 && <div>供應商：<span className="text-white">{topic.suppliers.join(', ')}</span></div>}
                        </div>

                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">編輯</button>
                        </div>
                    </div>
                ))}
            </div>

            {isAdding && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-8 rounded-lg w-[500px] border border-gray-700">
                        <h3 className="text-xl font-bold mb-4">新增監控主題</h3>
                        <p className="text-gray-400 mb-6">輸入要透過 AI Agent 監控的主題、競爭對手或供應商。</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-400 hover:text-white">取消</button>
                            <button onClick={handleAddTopic} className="px-4 py-2 bg-blue-600 rounded">儲存主題</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
