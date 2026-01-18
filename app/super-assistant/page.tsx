/**
 * Super Assistant Standalone Page
 * 獨立頁面模式，支援多螢幕與全螢幕操作
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Mic, Send, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceOrb from '@/components/executive-assistant/VoiceOrb';

export default function SuperAssistantPage() {
    const [mode, setMode] = useState<'voice' | 'text'>('voice');
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
    const [displayText, setDisplayText] = useState('系統連線完成。嘿，今天有什麼我可以幫忙的嗎？');
    const [inputText, setInputText] = useState('');
    const [volume, setVolume] = useState(0);

    // 模擬語音波紋
    useEffect(() => {
        if (status === 'listening' || status === 'speaking') {
            const interval = setInterval(() => {
                setVolume(Math.random());
            }, 100);
            return () => clearInterval(interval);
        } else {
            setVolume(0);
            return undefined;
        }
    }, [status]);

    // 處理發送訊息 (文字模式)
    const handleSendText = async () => {
        if (!inputText.trim()) return;

        const query = inputText;
        setInputText('');
        setDisplayText(`正在思考：${query}...`);
        setStatus('processing');

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
            setStatus('speaking');

            // 模擬說話結束
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error) {
            console.error('Send error:', error);
            setStatus('error');
            setDisplayText('抱歉，發生了點錯誤。');
        }
    };

    // 關閉視窗
    const handleClose = () => {
        window.close();
    };

    return (
        <div className="h-screen w-screen bg-black text-white overflow-hidden flex flex-col fixed inset-0">
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
                                <div className={`w-1.5 h-1.5 rounded-full ${status !== 'idle' ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">System Online</span>
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
                                className="flex flex-col items-center" // Removed gap-12, effectively handling spacing manually or via fixed containers
                            >
                                <div className="mb-6">
                                    <VoiceOrb status={status} volume={volume} />
                                </div>

                                {/* Fixed height text container to prevent overlap */}
                                <div className="w-full max-w-xl h-24 flex items-center justify-center p-4">
                                    <motion.p
                                        key={displayText}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed text-center line-clamp-3"
                                    >
                                        {displayText}
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
