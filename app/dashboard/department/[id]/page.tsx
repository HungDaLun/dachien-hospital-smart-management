'use client';

import React, { useState } from 'react';
import DepartmentConversationModal from '@/components/war-room/department/DepartmentConversationModal';
import { WAR_ROOM_THEME } from '@/styles/war-room-theme';

// Mock Data for Prototype
const MOCK_DEPT = {
    id: 'd1',
    name: '銷售部門',
    brief: {
        top_updates: ['第三季目標超標 15%', '與 Acme Corp 簽署新企業合約'],
        urgent_items: ['客戶 X 合約續約待處理'],
        ai_summary: '整體表現強勁。銷售團隊超標，但下週需專注於續約以防流失。',
        stats: { total_files: 120, files_updated_today: 5 }
    }
};

export default function DepartmentWarRoomPage({ params }: { params: { id: string } }) {
    const [isChatOpen, setIsChatOpen] = useState(false);

    // In real app: Fetch data using params.id
    console.log('Viewing Department:', params.id);
    const dept = MOCK_DEPT;

    return (
        <div
            className="min-h-full p-8"
            style={{
                backgroundColor: WAR_ROOM_THEME.background.primary,
                color: WAR_ROOM_THEME.text.primary,
                minHeight: 'calc(100vh - 64px)'
            }}
        >
            <div className="max-w-[1200px] mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{dept.name} 戰情室</h1>
                        <p className="text-gray-400">每日情報簡報</p>
                    </div>
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-purple-500/30 transition-all"
                    >
                        <span>💬</span> 開始深入分析
                    </button>
                </div>

                {/* Daily Brief Card */}
                <div
                    className="p-8 rounded-lg border mb-8"
                    style={{
                        backgroundColor: WAR_ROOM_THEME.background.secondary,
                        borderColor: 'rgba(255,255,255,0.1)'
                    }}
                >
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-bold text-blue-400">今日高層簡報</h2>
                        <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-bold text-white mb-2 uppercase text-sm tracking-wider">執行摘要</h3>
                        <p className="text-lg leading-relaxed text-gray-300">{dept.brief.ai_summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-black/20 p-4 rounded">
                            <h4 className="font-bold text-green-400 mb-3 border-b border-green-400/20 pb-2">重點更新</h4>
                            <ul className="space-y-2">
                                {dept.brief.top_updates.map((u, i) => (
                                    <li key={i} className="flex gap-2 text-gray-300">
                                        <span className="text-green-500">✓</span> {u}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-black/20 p-4 rounded">
                            <h4 className="font-bold text-red-400 mb-3 border-b border-red-400/20 pb-2">緊急事項</h4>
                            <ul className="space-y-2">
                                {dept.brief.urgent_items.map((u, i) => (
                                    <li key={i} className="flex gap-2 text-gray-300">
                                        <span className="text-red-500">⚠</span> {u}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Files List Snapshot */}
                <div className="rounded-lg p-6" style={{ backgroundColor: WAR_ROOM_THEME.background.secondary }}>
                    <h3 className="font-bold mb-4">近期知識更新</h3>
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="border-b border-gray-700 pb-2">
                            <tr>
                                <th className="pb-2">檔案名稱</th>
                                <th className="pb-2">日期</th>
                                <th className="pb-2">狀態</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-2 text-white">Q3_Sales_Report.pdf</td>
                                <td>今天 10:00 AM</td>
                                <td className="text-green-400">已處理</td>
                            </tr>
                            <tr>
                                <td className="py-2 text-white">Client_X_Contract_Draft.docx</td>
                                <td>昨天</td>
                                <td className="text-yellow-400">分析中</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {isChatOpen && (
                    <DepartmentConversationModal
                        departmentId={dept.id}
                        departmentName={dept.name}
                        onClose={() => setIsChatOpen(false)}
                    />
                )}
            </div>
        </div>
    );
}
