/**
 * Super Assistant Standalone Page
 * 獨立頁面模式，支援多螢幕與全螢幕操作
 * 包含 Vapi 語音整合與 Line 風格文字對話
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Mic, Send, MessageSquare, Sparkles, MicOff, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceOrb from '@/components/executive-assistant/VoiceOrb';
import { useVapi, VapiStatus } from '@/hooks/use-vapi';
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export default function SuperAssistantPage() {
    const [mode, setMode] = useState<'voice' | 'text'>('text');

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init',
            role: 'assistant',
            content: '你好！我是你的企業超級管家。我可以協助你處理辦公室的大小事，提升工作效率。',
            timestamp: Date.now()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 使用 Vapi Hook
    const { status, isSessionActive, volumeLevel, errorMessage, toggleSession, isMuted, toggleMute } = useVapi();

    // 自動捲動到底部
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, mode]);

    // 處理文字輸入
    const handleSendText = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputText,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');

        // 模擬等待回應
        // 這裡可以選擇是否顯示一個 "Thinking..." 的暫時訊息，或是直接等待
        // 為了 UI 體驗，我們通常不做任何事，讓使用者知道請求已發送

        try {
            const response = await fetch('/api/super-assistant/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: userMsg.content,
                    sessionId: sessionId // 傳遞目前的 sessionId 以維持記憶
                }),
            });

            const data = await response.json();

            // 更新 Session ID
            if (data.sessionId && data.sessionId !== sessionId) {
                setSessionId(data.sessionId);
            }
            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.text || '我收到您的請求了，正在處理中。',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            console.error('Send error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '抱歉，發生了點錯誤，請稍後再試。',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        }
    };

    // 格式化時間
    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    };

    const handleClose = () => {
        window.close();
    };

    return (
        <div className="h-[100dvh] w-screen bg-black text-white flex flex-col fixed inset-0 overflow-hidden">
            {/* 主要背景層 */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-950/80 to-black pointer-events-none" />

            {/* 頂部 Header */}
            <div className="relative z-10 flex items-center justify-between p-4 border-b border-white/5 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        <Sparkles size={20} className="text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold tracking-wide text-sm md:text-base">SUPER ASSISTANT</h2>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === VapiStatus.CONNECTED ? 'bg-amber-400' : 'bg-amber-500'}`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${status === VapiStatus.CONNECTED ? 'bg-amber-500' : 'bg-amber-500'}`}></span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                {status === VapiStatus.CONNECTED ? 'Voice Active' : 'System Online'}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleClose}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                >
                    <X size={20} />
                </button>
            </div>

            {/* 主要內容區 (可捲動) */}
            <div className="relative z-0 flex-1 overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                    {mode === 'voice' ? (
                        /* Voice Mode Interface */
                        <motion.div
                            key="voice"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center p-6 relative"
                        >
                            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md gap-8">
                                {/* Visual Orb (Non-interactive mostly, just status) */}
                                <div className="scale-125 md:scale-150">
                                    <VoiceOrb status={status === VapiStatus.SPEAKING ? 'speaking' : status === VapiStatus.LISTENING ? 'listening' : status === VapiStatus.CONNECTING ? 'processing' : 'idle'} volume={volumeLevel} />
                                </div>

                                {/* Status Text / Transcription */}
                                <div className="min-h-[60px] text-center px-4 w-full">
                                    <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed line-clamp-3">
                                        {status === VapiStatus.CONNECTING ? "正在連線..." :
                                            status === VapiStatus.LISTENING ? "我在聽..." :
                                                status === VapiStatus.SPEAKING ? "正在回應..." :
                                                    status === VapiStatus.ERROR ? (errorMessage || "發生錯誤") :
                                                        "等待指令..."}
                                    </p>
                                </div>
                            </div>

                            {/* Tactical HUD Control Bar */}
                            <div className="absolute bottom-12 flex items-center justify-between gap-6 px-8 py-4 bg-black/40 border border-amber-500/30 backdrop-blur-md rounded-full w-full max-w-sm shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                                {/* Left: Mute Toggle */}
                                <button
                                    onClick={toggleMute}
                                    disabled={!isSessionActive}
                                    className={`p-3 rounded-full transition-all ${!isSessionActive ? 'opacity-30 cursor-not-allowed text-slate-500' :
                                        isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/50' :
                                            'hover:bg-amber-500/20 text-amber-500'
                                        }`}
                                >
                                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                </button>

                                {/* Center: System Status */}
                                <div className="flex flex-col items-center flex-1 min-w-[120px]">
                                    <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-amber-500/80 uppercase whitespace-nowrap">
                                        {status === VapiStatus.CONNECTING ? "INITIALIZING" :
                                            status === VapiStatus.LISTENING ? "LISTENING" :
                                                status === VapiStatus.SPEAKING ? "TRANSMITTING" :
                                                    status === VapiStatus.CONNECTED ? "LINK ACTIVE" :
                                                        "SYSTEM STANDBY"}
                                    </span>
                                </div>

                                {/* Right: Power / Connection */}
                                <button
                                    onClick={toggleSession}
                                    className={`p-3 rounded-full transition-all ${isSessionActive
                                        ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:bg-amber-400'
                                        : 'bg-transparent border border-white/20 text-white/50 hover:text-white hover:border-white/50'
                                        }`}
                                >
                                    <Power size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        /* Text Mode Interface (Line/Messenger Style) */
                        <motion.div
                            key="text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col bg-slate-950/30"
                        >
                            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex flex-col max-w-[85%] md:max-w-[70%] gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                            {/* Name Label */}
                                            {msg.role === 'assistant' && (
                                                <span className="text-[10px] text-white/40 ml-2">Super Assistant</span>
                                            )}

                                            {/* Bubble */}
                                            <div
                                                className={`px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed break-words shadow-sm ${msg.role === 'user'
                                                    ? 'bg-amber-600 text-white rounded-tr-none'
                                                    : 'bg-slate-800/80 border border-white/10 text-slate-100 rounded-tl-none backdrop-blur-sm'
                                                    }`}
                                            >
                                                {msg.role === 'assistant' ? (
                                                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0">
                                                        <ReactMarkdown
                                                            components={{
                                                                a: ({ ...props }) => <a {...props} className="text-amber-400 hover:underline" target="_blank" rel="noopener noreferrer" />,
                                                                strong: ({ ...props }) => <strong {...props} className="text-amber-200 font-bold" />,
                                                            }}
                                                        >
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <span>{msg.content}</span>
                                                )}
                                            </div>

                                            {/* Time */}
                                            <span className="text-[10px] text-white/30 px-1">
                                                {formatTime(msg.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Text Input Area */}
                            <div className="p-4 bg-black/60 backdrop-blur-md border-t border-white/10">
                                <div className="max-w-4xl mx-auto flex gap-3 bg-white/5 p-2 rounded-full border border-white/10 focus-within:border-amber-500/50 transition-all">
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                e.preventDefault();
                                                handleSendText();
                                            }
                                        }}
                                        placeholder="輸入訊息..."
                                        rows={1}
                                        className="flex-1 bg-transparent px-4 py-2 outline-none text-white font-medium resize-none max-h-[100px] scrollbar-hide"
                                        style={{ minHeight: '40px' }}
                                    />
                                    <button
                                        onClick={handleSendText}
                                        disabled={!inputText.trim()}
                                        className="p-3 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                                <div className="text-center mt-2">
                                    <span className="text-[10px] text-white/30">Cmd/Ctrl + Enter 發送</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 底部模式切換 (Always visible or contextual?) 
                User requests: "Chat like Line" -> Text mode should be full screen almost.
                Voice mode needs to be accessible.
                Let's keep the bottom bar style but make it smaller/overlay?
                Or just a toggle in the header? 
                Actually, Line has tabs at bottom.
            */}
            <div className="pb-safe pt-2 px-6 flex justify-center gap-12 bg-black border-t border-white/5 z-20">
                <button
                    onClick={() => setMode('text')}
                    className={`flex flex-col items-center gap-1 py-3 transition-all ${mode === 'text' ? 'text-amber-500' : 'text-slate-600 hover:text-slate-400'}`}
                >
                    <MessageSquare size={24} className={mode === 'text' ? 'fill-current' : ''} />
                    <span className="text-[10px] font-bold">訊息</span>
                </button>

                <button
                    onClick={() => setMode('voice')}
                    className={`flex flex-col items-center gap-1 py-3 transition-all ${mode === 'voice' ? 'text-amber-500' : 'text-slate-600 hover:text-slate-400'}`}
                >
                    <div className={`relative ${mode === 'voice' && isSessionActive ? 'animate-bounce' : ''}`}>
                        <Mic size={24} className={mode === 'voice' ? 'fill-current' : ''} />
                        {isSessionActive && <span className="absolute -top-1 -right-1 flex h-2 w-2 bg-red-500 rounded-full"></span>}
                    </div>
                    <span className="text-[10px] font-bold">語音</span>
                </button>
            </div>
        </div>
    );
}
