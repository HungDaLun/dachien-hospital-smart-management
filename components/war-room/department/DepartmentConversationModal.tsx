'use client';

import React, { useState } from 'react';
import { WAR_ROOM_THEME } from '@/styles/war-room-theme';

interface DepartmentConversationModalProps {
    departmentId: string;
    departmentName: string;
    onClose: () => void;
}

export default function DepartmentConversationModal({
    departmentId,
    departmentName,
    onClose
}: DepartmentConversationModalProps) {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
        { role: 'ai', text: `您好！我已載入 ${departmentName} 的所有背景資訊。請問您想了解什麼？` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Log for debugging and to use departmentId
        console.log(`Sending message to department ${departmentId}:`, input);

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        // Mock AI Response for prototype
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'ai',
                text: `(AI 模擬) 根據 ${departmentName} 第一季報告，營收成長 15%。然而，'SC_Risk.pdf' 中指出供應鏈存在風險。`
            }]);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div
                className="w-[800px] h-[600px] rounded-lg flex flex-col overflow-hidden relative"
                style={{
                    backgroundColor: WAR_ROOM_THEME.background.secondary,
                    border: '1px solid ' + WAR_ROOM_THEME.accent.secondary
                }}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex justify-between items-center" style={{ backgroundColor: WAR_ROOM_THEME.background.tertiary }}>
                    <h3 className="font-bold flex items-center gap-2">
                        <span className="text-xl">💬</span>
                        與 {departmentName} 對話
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                            >
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="text-gray-500 italic text-sm">AI 正在思考中...</div>}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-700 bg-gray-900">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-gray-800 border-none rounded px-4 py-2 text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="詢問關於此部門的問題..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded font-medium disabled:opacity-50"
                        >
                            發送
                        </button>
                    </div>
                    <div className="mt-2 flex gap-2 text-xs text-gray-400">
                        <span>建議提問：</span>
                        <button onClick={() => setInput("目前最大的風險是什麼？")} className="hover:text-white border border-gray-700 px-2 py-1 rounded">目前最大的風險是什麼？</button>
                        <button onClick={() => setInput("上週工作摘要")} className="hover:text-white border border-gray-700 px-2 py-1 rounded">上週工作摘要</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
