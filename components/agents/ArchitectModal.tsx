/**
 * AI 架構師聊天面板元件
 * 右側滑入式面板，讓用戶可以一邊與 AI 對話一邊即時看到表單更新
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Spinner } from '@/components/ui';
import { Dictionary } from '@/lib/i18n/dictionaries';

interface ArchitectResponse {
    name: string;
    description: string;
    system_prompt: string;
    suggested_knowledge_rules: { rule_type: 'TAG' | 'DEPARTMENT'; rule_value: string }[];
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    blueprint?: ArchitectResponse;
    timestamp: Date;
}

interface ArchitectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (blueprint: ArchitectResponse) => void;
    departmentContext?: string;
    dict: Dictionary;
}

export default function ArchitectModal({ isOpen, onClose, onApply, departmentContext, dict }: ArchitectModalProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const t = dict.agents.architect;

    // 初始化歡迎訊息
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: t.welcome,
                timestamp: new Date()
            }]);
        }
    }, [isOpen, messages.length, t.welcome]);

    // 自動滾動到最新訊息
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 開啟時自動聚焦輸入框
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/agents/architect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    intent: userMessage.content,
                    department_context: departmentContext
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Consultation failed');

            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: `✅ ${t.suggestion_ready}`,
                blueprint: json.data,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err: any) {
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: `❌ ${t.error_occurred}: ${err.message || 'Something went wrong'}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleApplyBlueprint = (message: ChatMessage) => {
        if (message.blueprint) {
            onApply(message.blueprint);
            setAppliedIds(prev => new Set(prev).add(message.id));
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* 背景遮罩 */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* 右側滑入面板 */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">

                {/* 標題列 */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                🤖 {t.title}
                                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal">
                                    {t.subtitle}
                                </span>
                            </h2>
                            <p className="text-violet-100 text-sm mt-1">{t.description}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors p-1"
                            title={t.close_panel}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 聊天訊息區 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                        ? 'bg-violet-600 text-white rounded-br-md'
                                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                                    }`}
                            >
                                {/* 訊息內容 */}
                                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>

                                {/* 藍圖卡片 */}
                                {msg.blueprint && (
                                    <div className="mt-3 space-y-3 pt-3 border-t border-gray-100">
                                        {/* Agent 名稱 */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500">{t.agent_name}</label>
                                            <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-900 font-medium text-sm">
                                                {msg.blueprint.name}
                                            </div>
                                        </div>

                                        {/* Agent 描述 */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500">{t.agent_description}</label>
                                            <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-700 text-sm">
                                                {msg.blueprint.description}
                                            </div>
                                        </div>

                                        {/* 知識庫綁定 */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500">{t.knowledge_bindings}</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {msg.blueprint.suggested_knowledge_rules.length > 0 ? (
                                                    msg.blueprint.suggested_knowledge_rules.map((rule, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded text-xs border border-violet-100 font-medium"
                                                        >
                                                            {rule.rule_type === 'DEPARTMENT' ? '🏢 ' : '🏷️ '}
                                                            {rule.rule_value}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">{t.no_bindings}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* 系統提示詞預覽 */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500">{t.system_prompt_strategy}</label>
                                            <div className="p-2 bg-gray-900 text-gray-300 rounded font-mono text-xs max-h-32 overflow-y-auto whitespace-pre-wrap">
                                                {msg.blueprint.system_prompt.slice(0, 300)}
                                                {msg.blueprint.system_prompt.length > 300 && '...'}
                                            </div>
                                        </div>

                                        {/* 套用按鈕 */}
                                        <Button
                                            onClick={() => handleApplyBlueprint(msg)}
                                            disabled={appliedIds.has(msg.id)}
                                            className={`w-full mt-2 ${appliedIds.has(msg.id)
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                                }`}
                                            size="sm"
                                        >
                                            {appliedIds.has(msg.id) ? (
                                                <span className="flex items-center justify-center gap-1">
                                                    ✓ {t.applied}
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-1">
                                                    ✨ {t.apply}
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* 載入中指示器 */}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white text-gray-800 shadow-sm border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Spinner size="sm" />
                                    {t.thinking}
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* 輸入區 */}
                <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
                    <div className="flex gap-2">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t.input_placeholder}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none text-sm"
                            rows={2}
                            disabled={loading}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="bg-violet-600 hover:bg-violet-700 text-white self-end"
                        >
                            {loading ? <Spinner size="sm" color="white" /> : t.send}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
