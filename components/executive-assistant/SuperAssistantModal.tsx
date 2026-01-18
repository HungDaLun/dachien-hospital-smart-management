/**
 * 超級管家模態視窗 (SuperAssistantModal)
 * 展示 JARVIS UI 並處理語音/文字對話邏輯
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Mic, Send, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceOrb from '@/components/executive-assistant/VoiceOrb';

interface SuperAssistantModalProps {
    onClose: () => void;
}

export default function SuperAssistantModal({ onClose }: SuperAssistantModalProps) {
    const [mode, setMode] = useState<'voice' | 'text'>('voice');
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
    const [displayText, setDisplayText] = useState('您好，我是超級管家。有什麼我可以幫您的？');
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
            const response = await fetch('/api/integrations/line/webhook', { // 暫時共用入口或改為 internal API
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: 'web',
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* 背景遮罩 */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            {/* 視窗本體 */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-4xl h-[80vh] bg-gradient-to-b from-slate-900/50 via-slate-950/80 to-black rounded-[2rem] border border-white/10 shadow-3xl overflow-hidden flex flex-col"
            >
                {/* 頂部控制列 */}
                <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <Sparkles size={20} className="text-indigo-400" />
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
                        onClick={onClose}
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
                                className="flex flex-col items-center gap-12"
                            >
                                <VoiceOrb status={status} volume={volume} />
                                <div className="max-w-xl text-center">
                                    <motion.p
                                        key={displayText}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-2xl text-white/90 font-medium leading-relaxed"
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
                                        <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                                            <p className="text-white/90">{displayText}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 bg-white/5 p-3 rounded-full border border-white/10 focus-within:border-indigo-500/50 transition-all">
                                    <input
                                        autoFocus
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                                        placeholder="Type anything..."
                                        className="flex-1 bg-transparent px-6 py-2 outline-none text-white font-medium"
                                    />
                                    <button
                                        onClick={handleSendText}
                                        className="p-3 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-all shadow-lg"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 底部功能列 */}
                <div className="p-8 flex justify-center gap-8 border-t border-white/5 bg-black/20">
                    <button
                        onClick={() => setMode('voice')}
                        className={`flex flex-col items-center gap-2 group transition-all ${mode === 'voice' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <div className={`p-4 rounded-3xl border transition-all ${mode === 'voice' ? 'bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/10' : 'bg-white/5 border-white/10 group-hover:bg-white/10'}`}>
                            <Mic size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Voice</span>
                    </button>

                    <button
                        onClick={() => setMode('text')}
                        className={`flex flex-col items-center gap-2 group transition-all ${mode === 'text' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <div className={`p-4 rounded-3xl border transition-all ${mode === 'text' ? 'bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/10' : 'bg-white/5 border-white/10 group-hover:bg-white/10'}`}>
                            <MessageSquare size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Text</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
