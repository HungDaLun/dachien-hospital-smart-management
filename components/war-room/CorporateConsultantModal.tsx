'use client';

import React, { useState } from 'react';
import { WAR_ROOM_THEME } from '@/styles/war-room-theme';
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

interface CorporateConsultantModalProps {
    onClose: () => void;
}

export default function CorporateConsultantModal({
    onClose
}: CorporateConsultantModalProps) {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
        { role: 'ai', text: `您好！我是您的企業全域參謀。我已連結全公司所有知識庫與即時數據。請問您想掌握哪方面的狀況？` }
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
            const response = await fetch('/api/chat/corporate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
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
                newMessages[lastIndex] = { role: 'ai', text: "⚠️ 連接戰略大腦失敗，請檢察網路或 API 設定。" };
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div
                className="w-[900px] h-[85vh] rounded-2xl flex flex-col overflow-hidden relative shadow-2xl"
                style={{
                    backgroundColor: '#0f172a', // Slate 900
                    border: '1px solid ' + WAR_ROOM_THEME.accent.primary
                }}
            >
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                    <h3 className="font-bold flex items-center gap-3 text-white">
                        <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-lg">🤖</span>
                        <div>
                            <div className="text-lg tracking-wide">企業戰略參謀</div>
                            <div className="text-[10px] text-blue-400 font-mono uppercase">Corporate Strategic Consultant</div>
                        </div>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">✕</button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {m.role === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center mr-3 mt-1 text-sm">🤖</div>
                            )}
                            <div
                                className={`max-w-[85%] p-5 rounded-2xl ${m.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-sm'
                                    : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-sm'
                                    }`}
                            >
                                {m.role === 'ai' ? (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                h1: ({ node: _node, ...props }) => <h1 className="text-lg font-bold mb-3 text-blue-400" {...props} />,
                                                h2: ({ node: _node, ...props }) => <h2 className="text-base font-bold mb-2 text-purple-300" {...props} />,
                                                h3: ({ node: _node, ...props }) => <h3 className="text-sm font-bold mb-2 text-white/90" {...props} />,
                                                p: ({ node: _node, ...props }) => <p className="mb-4 last:mb-0 leading-relaxed custom-line-height" {...props} />,
                                                ul: ({ node: _node, ...props }) => <ul className="list-disc pl-4 mb-4 space-y-2 marker:text-blue-500" {...props} />,
                                                ol: ({ node: _node, ...props }) => <ol className="list-decimal pl-4 mb-4 space-y-2 marker:text-blue-500" {...props} />,
                                                li: ({ node: _node, ...props }) => <li className="pl-1" {...props} />,
                                                strong: ({ node: _node, ...props }) => <strong className="text-blue-200 font-bold" {...props} />,
                                                blockquote: ({ node: _node, ...props }) => <blockquote className="border-l-4 border-blue-500/50 pl-4 py-1 my-4 bg-blue-500/5 rounded-r italic text-gray-400" {...props} />,
                                                hr: ({ node: _node, ...props }) => <hr className="border-white/10 my-6" {...props} />,
                                                code: ({ node: _node, ...props }) => <code className="bg-black/30 px-1 py-0.5 rounded text-yellow-500 font-mono text-xs" {...props} />
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
                    {isLoading && (
                        <div className="flex justify-start ml-11">
                            <div className="px-4 py-3 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-xl rounded-tl-sm flex items-center gap-3">
                                <div className="relative w-3 h-3">
                                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                                    <div className="relative w-3 h-3 bg-blue-500 rounded-full"></div>
                                </div>
                                <span className="text-xs text-blue-300 font-mono tracking-widest uppercase animate-pulse">Processing Strategic Data...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-5 border-t border-white/10 bg-[#0b1120]">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 relative group">
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all outline-none"
                                placeholder="輸入指令... (Ctrl + Enter 發送)"
                                rows={1}
                                style={{ minHeight: '52px' }}
                                value={input}
                                onChange={e => {
                                    setInput(e.target.value);
                                    // Auto-grow
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                                onKeyDown={e => {
                                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            <div className="absolute right-2 bottom-2 text-[10px] text-gray-600 border border-gray-700 px-1.5 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                ⌘ + ↵ Send
                            </div>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center w-12 h-12"
                        >
                            <span className="-ml-0.5 mt-0.5">➤</span>
                        </button>
                    </div>
                    <div className="mt-3 flex gap-2 text-xs overflow-x-auto pb-1 scrollbar-none">
                        <span className="text-gray-500 flex-shrink-0 pt-0.5">戰略追問：</span>
                        <button onClick={() => setInput("目前最大的全域風險是什麼？")} className="flex-shrink-0 hover:bg-white/10 hover:text-white text-gray-400 border border-white/10 px-3 py-1 rounded-full transition-colors">⚠️ 最大風險</button>
                        <button onClick={() => setInput("總結本月各部門的營運狀況")} className="flex-shrink-0 hover:bg-white/10 hover:text-white text-gray-400 border border-white/10 px-3 py-1 rounded-full transition-colors">📊 營運總結</button>
                        <button onClick={() => setInput("請分析當前的財務跑道狀況")} className="flex-shrink-0 hover:bg-white/10 hover:text-white text-gray-400 border border-white/10 px-3 py-1 rounded-full transition-colors">💰 財務狀況</button>
                        <button onClick={() => setInput("跨部門協作上有發現什麼斷點嗎？")} className="flex-shrink-0 hover:bg-white/10 hover:text-white text-gray-400 border border-white/10 px-3 py-1 rounded-full transition-colors">🔗 協作斷點</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
