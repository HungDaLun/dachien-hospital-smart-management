/**
 * 對話視窗元件
 * 顯示對話訊息與輸入框
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Spinner } from '@/components/ui';
import ChatBubble from './ChatBubble';
import { Citation } from './CitationList';
import { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * Agent 資訊
 */
interface AgentInfo {
    id: string;
    name: string;
    description: string | null;
}

/**
 * 訊息介面
 */
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
    citations?: Citation[];
}

/**
 * 對話視窗屬性
 */
interface ChatWindowProps {
    agent: AgentInfo;
    dict: Dictionary;
}

export default function ChatWindow({ agent, dict }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    /**
     * 滾動到底部
     */
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 重置對話當 Agent 變更
    useEffect(() => {
        setMessages([]);
        setSessionId(null);
        setError(null);
        setInput('');
    }, [agent.id]);

    /**
     * 發送訊息
     */
    const handleSend = async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;

        setError(null);

        // 新增使用者訊息
        const userMessage: Message = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: trimmedInput,
            created_at: new Date().toISOString(),
        };

        // 新增空的 AI 回應佔位
        const aiMessageId = `ai-${Date.now()}`;
        const aiMessage: Message = {
            id: aiMessageId,
            role: 'assistant',
            content: '',
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage, aiMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agent_id: agent.id,
                    message: trimmedInput,
                    session_id: sessionId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || dict.common.error);
            }

            if (!response.body) throw new Error('伺服器未回傳資料流');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6).trim();
                        if (dataStr === '[DONE]') continue;

                        try {
                            const data = JSON.parse(dataStr);
                            if (data.text) {
                                accumulatedContent += data.text;
                                // 立即更新 UI
                                setMessages((prev) => prev.map(msg =>
                                    msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg
                                ));
                            }
                            if (data.session_id) {
                                setSessionId(data.session_id);
                            }
                            if (data.citations) {
                                setMessages((prev) => prev.map(msg =>
                                    msg.id === aiMessageId ? { ...msg, citations: data.citations } : msg
                                ));
                            }
                        } catch (e) {
                            console.error('解析位元流失敗:', e);
                        }
                    }
                }
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : dict.common.error);
            // 如果出錯且還沒內容，移除該 AI 佔位訊息
            setMessages((prev) => prev.filter(msg =>
                !(msg.id === aiMessageId && msg.content === '')
            ));
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    /**
     * 處理快速鍵發送 (Cmd+Enter 或 Ctrl+Enter)
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            e.stopPropagation(); // 阻斷冒泡至父表單
            handleSend();
        }
    };

    /**
     * 自動調整輸入框高度
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);

        // 自動調整高度
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };

    return (
        <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* 訊息區域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 歡迎訊息 */}
                {messages.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-3xl text-white">
                            👋
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                            {dict.chat.welcome_message.replace('{{name}}', agent.name)}
                        </h3>
                        <p className="mt-2">{dict.chat.select_agent}</p>
                    </div>
                )}

                {/* 訊息列表 */}
                {messages.map((message) => (
                    <ChatBubble
                        key={message.id}
                        role={message.role}
                        content={message.content}
                        agentName={agent.name}
                        citations={message.citations}
                        messageId={message.id} // 傳遞 messageId 用於回饋功能
                        dict={dict}
                    />
                ))}

                {/* 載入中指示 */}
                {isLoading && (
                    <div className="flex items-center gap-2 text-gray-500">
                        <Spinner size="sm" />
                        <Spinner size="sm" />
                        <span className="text-sm">{agent.name} {dict.chat.thinking}</span>
                    </div>
                )}

                {/* 錯誤訊息 */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                        {error}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setError(null)}
                            className="ml-2"
                        >
                            {dict.common.close}
                        </Button>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* 輸入區域 */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex items-end gap-3">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={dict.chat.type_message}
                        disabled={isLoading}
                        rows={1}
                        className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 
                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                     disabled:bg-gray-100 disabled:cursor-not-allowed
                     placeholder:text-gray-400"
                        style={{ minHeight: '48px', maxHeight: '200px' }}
                    />
                    <Button
                        type="button"
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        loading={isLoading}
                    >
                        {dict.common.actions}
                    </Button>
                </div>
            </div>
        </div>
    );
}
