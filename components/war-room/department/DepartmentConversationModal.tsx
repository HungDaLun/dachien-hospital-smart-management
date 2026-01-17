'use client';

import React, { useState } from 'react';
import { WAR_ROOM_THEME } from '@/styles/war-room-theme';

interface DepartmentConversationModalProps {
    departmentId: string;
    departmentName: string;
    onClose: () => void;
}

import ReactMarkdown from 'react-markdown';

/**
 * 從 AI 回應中提取純文字內容
 * 處理可能的 JSON 格式回應，只提取 answer 欄位
 */
function extractCleanContent(text: string): string {
    if (!text) return text;

    try {
        // 1. 嘗試直接解析（如果整個內容就是 JSON）
        const parsed = JSON.parse(text);
        if (parsed.answer) {
            return parsed.answer;
        }
    } catch {
        // 不是純 JSON，繼續處理
    }

    try {
        // 2. 嘗試從 markdown code block 中提取 JSON
        const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```\s*$/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[1]);
            if (parsed.answer) {
                // 移除 JSON 區塊，只保留前面的文字（如果有的話）
                const beforeJson = text.substring(0, text.lastIndexOf('```json')).trim();
                return beforeJson || parsed.answer;
            }
        }
    } catch {
        // 不是有效的 JSON，繼續處理
    }

    try {
        // 3. 嘗試找最後一個 { ... } 並提取
        const lastBrace = text.lastIndexOf('{');
        if (lastBrace !== -1 && text.includes('"answer"')) {
            const jsonPart = text.substring(lastBrace);
            const parsed = JSON.parse(jsonPart);
            if (parsed.answer) {
                // 返回 JSON 之前的內容或 answer
                const beforeJson = text.substring(0, lastBrace).trim();
                return beforeJson || parsed.answer;
            }
        }
    } catch {
        // 解析失敗，返回原始內容
    }

    // 4. 移除可能殘留的 JSON 區塊標示
    return text.replace(/```json\s*\{[\s\S]*\}\s*```$/, '').trim();
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
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        // Add a placeholder for AI response
        setMessages(prev => [...prev, { role: 'ai', text: "" }]);

        try {
            const response = await fetch('/api/chat/department', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ departmentId, message: userMsg })
            });

            if (!response.ok) throw new Error('Chat API failed');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error('No reader found');

            let done = false;
            let fullText = "";

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value);
                fullText += chunkValue;

                // Update the last AI message with the accumulated text (during streaming, show raw)
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    if (newMessages[lastIndex].role === 'ai') {
                        newMessages[lastIndex] = { ...newMessages[lastIndex], text: fullText };
                    }
                    return newMessages;
                });
            }

            // 串流完成後，清理 JSON 格式，只保留純文字回答
            const cleanedText = extractCleanContent(fullText);
            setMessages(prev => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (newMessages[lastIndex].role === 'ai') {
                    newMessages[lastIndex] = { ...newMessages[lastIndex], text: cleanedText };
                }
                return newMessages;
            });

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                newMessages[lastIndex] = { role: 'ai', text: "⚠️ 連接部門大腦失敗，請檢查網路或 API 設定。" };
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Send only on Ctrl+Enter OR Cmd+Enter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div
                className="w-[800px] h-[80vh] rounded-lg flex flex-col overflow-hidden relative"
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
                                className={`max-w-[90%] p-4 rounded-lg ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'}`}
                            >
                                {m.role === 'ai' ? (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                h1: ({ node: _node, ...props }) => <h1 className="text-lg font-bold mb-2 text-blue-400" {...props} />,
                                                h2: ({ node: _node, ...props }) => <h2 className="text-md font-bold mb-2 text-blue-300" {...props} />,
                                                h3: ({ node: _node, ...props }) => <h3 className="text-base font-bold mb-2 text-white" {...props} />,
                                                p: ({ node: _node, ...props }) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
                                                ul: ({ node: _node, ...props }) => <ul className="list-disc pl-4 mb-3 space-y-1" {...props} />,
                                                ol: ({ node: _node, ...props }) => <ol className="list-decimal pl-4 mb-3 space-y-1" {...props} />,
                                                li: ({ node: _node, ...props }) => <li className="mb-1" {...props} />,
                                                strong: ({ node: _node, ...props }) => <strong className="text-blue-200 font-bold" {...props} />,
                                                hr: ({ node: _node, ...props }) => <hr className="border-gray-700 my-4" {...props} />
                                            }}
                                        >
                                            {m.text}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="whitespace-pre-wrap">{m.text}</div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="text-gray-500 italic text-sm">AI 正在思考中...</div>}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-700 bg-gray-900">
                    <div className="flex gap-2 items-end">
                        <textarea
                            className="flex-1 bg-gray-800 border-none rounded px-4 py-2 text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-500 resize-none"
                            placeholder="輸入訊息... (按 Ctrl + Enter 發送)"
                            rows={3}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded font-medium disabled:opacity-50 h-10 mb-1"
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
