/**
 * 對話視窗元件
 * 顯示對話訊息與輸入框
 * 遵循 EAKAP 科技戰情室設計系統規範
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Spinner } from '@/components/ui';
import ChatBubble from './ChatBubble';
import { Citation } from './CitationList';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { Send, Brain, ShieldAlert, Sparkles, Command } from 'lucide-react';

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
    confidenceScore?: number;
    needsReview?: boolean;
    reviewTriggers?: string[];
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
                            // Handle Metadata Block (Citations, Confidence, Review)
                            if (data.metadata) {
                                setMessages((prev) => prev.map(msg =>
                                    msg.id === aiMessageId ? {
                                        ...msg,
                                        citations: data.metadata.citations,
                                        confidenceScore: data.metadata.confidence,
                                        needsReview: data.metadata.needs_review,
                                        reviewTriggers: data.metadata.review_triggers ? data.metadata.review_triggers.map((t: any) => t.category || t) : []
                                    } : msg
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
            if (window.innerWidth > 768) {
                inputRef.current?.focus();
            }
        }
    };

    /**
     * 處理快速鍵發送 (Cmd+Enter 或 Ctrl+Enter)
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            e.stopPropagation();
            handleSend();
        }
    };

    /**
     * 自動調整輸入框高度
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };

    return (
        <div className="flex-1 flex flex-col bg-background-primary rounded-[32px] border border-white/5 overflow-hidden shadow-floating relative">
            {/* Header / Agent Status Bar */}
            <div className="bg-white/[0.02] border-b border-white/5 p-4 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20 text-primary-400">
                        <Brain size={18} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-text-primary uppercase tracking-widest">{agent.name} <span className="text-[9px] text-primary-500/60 ml-2">ACTIVE_NODE</span></h3>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.03] rounded-full border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                        <span className="text-[9px] font-black text-text-tertiary uppercase tracking-tighter">SECURE CHANNEL</span>
                    </div>
                </div>
            </div>

            {/* 訊息區域 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar relative">
                {/* 歡迎訊息 */}
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-primary-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative w-24 h-24 bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-white/10 rounded-[32px] flex items-center justify-center shadow-glow-cyan/5">
                                <Sparkles size={40} className="text-primary-400" />
                            </div>
                        </div>
                        <div className="space-y-2 max-w-sm">
                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">
                                {dict.chat.welcome_message.replace('{{name}}', agent.name)}
                            </h3>
                            <p className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">{dict.chat.select_agent}</p>
                        </div>
                        <div className="flex gap-3 pt-4">
                            {['分析當前趨勢', '調閱部門檔案', '生成戰術建議'].map((hint, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(hint)}
                                    className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-text-tertiary hover:text-primary-400 hover:border-primary-500/30 transition-all uppercase tracking-widest"
                                >
                                    {hint}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 訊息列表 */}
                <div className="space-y-10">
                    {messages.map((message) => (
                        <ChatBubble
                            key={message.id}
                            role={message.role}
                            content={message.content}
                            agentName={agent.name}
                            citations={message.citations}
                            confidenceScore={message.confidenceScore}
                            needsReview={message.needsReview}
                            reviewTriggers={message.reviewTriggers}
                            messageId={message.id}
                            dict={dict}
                        />
                    ))}
                </div>

                {/* 載入中指示 */}
                {isLoading && (
                    <div className="flex items-center gap-4 animate-in fade-in duration-500">
                        <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                            <Spinner size="sm" />
                        </div>
                        <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] animate-pulse">
                            {agent.name} {dict.chat.thinking}...
                        </span>
                    </div>
                )}

                {/* 錯誤訊息 */}
                {error && (
                    <div className="p-4 bg-semantic-danger/10 border border-semantic-danger/20 rounded-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3">
                            <ShieldAlert size={18} className="text-semantic-danger" />
                            <span className="text-xs font-bold text-semantic-danger">{error}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setError(null)}
                            className="h-8 px-4 text-semantic-danger hover:bg-semantic-danger/10 rounded-xl text-[10px] uppercase font-black"
                        >
                            {dict.common.close}
                        </Button>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* 輸入區域 */}
            <div className="p-6 bg-background-secondary/50 backdrop-blur-2xl border-t border-white/5 relative">
                <div className="max-w-4xl mx-auto relative group">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={dict.chat.type_message}
                        disabled={isLoading}
                        rows={1}
                        className="w-full bg-black/40 border border-white/10 rounded-[24px] pl-6 pr-32 py-4 text-sm text-text-primary placeholder:text-text-tertiary/20 focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500/30 outline-none transition-all resize-none shadow-inner custom-scrollbar"
                        style={{ minHeight: '56px', maxHeight: '200px' }}
                    />

                    <div className="absolute right-3 bottom-3 flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-1 opacity-20 group-focus-within:opacity-40 transition-opacity">
                            <div className="p-1 px-1.5 bg-white/10 rounded-md border border-white/10">
                                <Command size={10} className="text-text-primary" />
                            </div>
                            <span className="text-[10px] font-black text-text-primary">ENTER</span>
                        </div>
                        <Button
                            type="button"
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={`h-10 w-10 p-0 rounded-xl transition-all duration-300 ${input.trim() ? 'bg-primary-500 text-black shadow-glow-cyan' : 'bg-white/5 text-text-tertiary border-white/5'
                                }`}
                        >
                            {isLoading ? <Spinner size="sm" color="black" /> : <Send size={18} />}
                        </Button>
                    </div>
                </div>

                <p className="text-center mt-3 text-[9px] font-black text-text-tertiary uppercase tracking-widest opacity-30">
                    Neural Intelligence Protocol v3.0 <span className="mx-2">|</span> Powered by Gemini-3
                </p>
            </div>
        </div>
    );
}
