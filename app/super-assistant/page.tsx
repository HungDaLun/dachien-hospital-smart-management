/**
 * Super Assistant Standalone Page
 * 獨立頁面模式，支援多螢幕與全螢幕操作
 * 包含 Vapi 語音整合
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Mic, Send, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceOrb from '@/components/executive-assistant/VoiceOrb';
import { useVapi, VapiStatus } from '@/hooks/use-vapi';

export default function SuperAssistantPage() {
    const [mode, setMode] = useState<'voice' | 'text'>('voice');
    const [displayText, setDisplayText] = useState('系統連線完成。嘿，今天有什麼我可以幫忙的嗎？');
    const [inputText, setInputText] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    // 使用 Vapi Hook
    const { status, isSessionActive, volumeLevel, errorMessage, toggleSession, startSession } = useVapi();

    // 確保只在客戶端渲染後才顯示動態內容
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 當切換到 Voice 模式且未連線時，自動連線
    useEffect(() => {
        if (mode === 'voice' && !isSessionActive && status === VapiStatus.IDLE) {
            // 自動啟動有點侵入性，視情況決定，這裡先讓使用者手動點擊或保持 Vapi 待命
            // startSession(); 
        }
    }, [mode, isSessionActive, status, startSession]);

    // 將 Vapi 狀態轉換為 VoiceOrb 狀態
    const getOrbStatus = () => {
        switch (status) {
            case VapiStatus.LISTENING:
                return 'listening';
            case VapiStatus.SPEAKING:
                return 'speaking';
            case VapiStatus.CONNECTING:
            case VapiStatus.LOADING:
                return 'processing';
            case VapiStatus.ERROR:
                return 'error';
            case VapiStatus.CONNECTED:
                return 'idle'; // 已連線但沒在說話
            default:
                return 'idle';
        }
    };

    // 處理文字輸入 (混合模式)
    const handleSendText = async () => {
        if (!inputText.trim()) return;

        const query = inputText;
        setInputText('');
        setDisplayText(`正在思考：${query}...`);

        // 這裡暫時維持原本的 API 呼叫，未來可以考慮讓 Vapi 也能接收文字指令
        try {
            const response = await fetch('/api/super-assistant/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: query,
                }),
            });

            const data = await response.json();
            setDisplayText(data.text || '我收到您的請求了，正在處理中。');
        } catch (error) {
            console.error('Send error:', error);
            setDisplayText('抱歉，發生了點錯誤。');
        }
    };

    const handleClose = () => {
        window.close();
    };

    return (
        <div className="h-[100dvh] w-screen bg-black text-white overflow-hidden flex flex-col fixed inset-0">
            <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-900/50 via-slate-950/80 to-black relative">

                {/* 頂部控制列 */}
                <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                            <Sparkles size={20} className="text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold tracking-wide">SUPER ASSISTANT</h2>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${status === VapiStatus.CONNECTED || status === VapiStatus.SPEAKING || status === VapiStatus.LISTENING ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                    {status === VapiStatus.IDLE ? 'Offline' : 'System Online'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* 主內容區 */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                    <AnimatePresence mode="wait">
                        {mode === 'voice' ? (
                            <motion.div
                                key="voice"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex flex-col items-center"
                            >
                                <div className="mb-6 cursor-pointer" onClick={toggleSession}>
                                    <VoiceOrb status={getOrbStatus()} volume={volumeLevel} />
                                    {!isSessionActive && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="bg-black/50 px-3 py-1 rounded-full text-xs text-amber-500 font-bold border border-amber-500/30 backdrop-blur-sm">Click to Start</span>
                                        </div>
                                    )}
                                </div>

                                {/* Fixed height text container to prevent overlap */}
                                <div className="w-full max-w-xl h-24 flex items-center justify-center p-4">
                                    <motion.p
                                        key={displayText}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed text-center line-clamp-3"
                                    >
                                        {status === VapiStatus.CONNECTING ? "連線中..." :
                                         status === VapiStatus.LISTENING ? "聆聽中..." :
                                         status === VapiStatus.SPEAKING ? "回應中..." :
                                         status === VapiStatus.ERROR ? (errorMessage || "發生錯誤") :
                                         displayText}
                                    </motion.p>
                                </div>

                            </motion.div>
                        ) : (
                            <motion.div
                                key="text"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full max-w-2xl h-full flex flex-col gap-6"
                            >
                                <div className="flex-1 bg-white/5 rounded-3xl p-6 overflow-y-auto border border-white/5">
                                    <div className="flex flex-col gap-4">
                                        <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                                            <p className="text-white/90">{displayText}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 全域輸入框 */}
                <div className="px-8 pb-2 w-full flex justify-center z-10">
                    <div className="w-full max-w-2xl flex gap-3 bg-white/5 p-3 rounded-full border border-white/10 focus-within:border-amber-500/50 transition-all backdrop-blur-md">
                        <textarea
                            autoFocus
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    e.preventDefault();
                                    handleSendText();
                                }
                            }}
                            placeholder="Type commands or chat..."
                            rows={1}
                            className="flex-1 bg-transparent px-6 py-2 outline-none text-white font-medium resize-none h-auto min-h-[40px] max-h-[120px]"
                        />
                        <button
                            onClick={handleSendText}
                            className="p-3 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-lg"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>

                {/* 底部功能列 */}
                <div className="p-4 flex justify-center gap-8 border-t border-white/5 bg-black/20">
                    <button
                        onClick={() => setMode('voice')}
                        className={`flex flex-col items-center gap-2 group transition-all ${mode === 'voice' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <div className={`p-4 rounded-3xl border transition-all ${mode === 'voice' ? 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/10' : 'bg-white/5 border-white/10 group-hover:bg-white/10'}`}>
                            <Mic size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Voice</span>
                    </button>

                    <button
                        onClick={() => setMode('text')}
                        className={`flex flex-col items-center gap-2 group transition-all ${mode === 'text' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <div className={`p-4 rounded-3xl border transition-all ${mode === 'text' ? 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/10' : 'bg-white/5 border-white/10 group-hover:bg-white/10'}`}>
                            <MessageSquare size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Text</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
