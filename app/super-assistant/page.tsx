/**
 * Super Assistant Standalone Page
 * 獨立頁面模式，支援多螢幕與全螢幕操作
 * 包含 LiveKit 語音整合
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Mic, Send, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceOrb from '@/components/executive-assistant/VoiceOrb';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useVoiceAssistant,
} from '@livekit/components-react';
import '@livekit/components-styles';

// 自定義 Hook 處理 Token 取得
function useLiveKitAuth() {
    const [token, setToken] = useState<string>("");
    const [url, setUrl] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch('/api/voice/token', {
                    method: 'POST',
                    body: JSON.stringify({}),
                });
                const data = await resp.json();
                if (data.token && data.url) {
                    setToken(data.token);
                    setUrl(data.url);
                } else {
                    // Try alternate response format if any
                    setToken(data.accessToken || data.token);
                    setUrl(data.url);
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : "Network error");
            }
        })();
    }, []);

    return { token, url, error };
}

// 內部組件：處理連線後的語音狀態
function VoiceAssistantSession({
    setDisplayText,
    setStatus,
    setVolume
}: {
    displayText: string;
    setDisplayText: (text: string) => void;
    setStatus: (status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error') => void;
    volume: number;
    setVolume: (vol: number) => void;
}) {
    const { state, audioTrack: _audioTrack } = useVoiceAssistant();

    useEffect(() => {
        // 將 LiveKit 狀態映射到 UI 狀態
        switch (state) {
            case 'listening':
                setStatus('listening');
                break;
            case 'thinking':
                setStatus('processing');
                setDisplayText("正在思考...");
                break;
            case 'speaking':
                setStatus('speaking');
                setDisplayText("正在回應...");
                break;
            default:
                setStatus('idle');
        }
    }, [state, setStatus, setDisplayText]);

    // 簡單的音量模擬
    useEffect(() => {
        if (state === 'speaking' || state === 'listening') {
            const interval = setInterval(() => {
                setVolume(Math.random());
            }, 100);
            return () => clearInterval(interval);
        } else {
            setVolume(0);
            return undefined;
        }
    }, [state, setVolume]);

    return (
        <RoomAudioRenderer />
    );
}

export default function SuperAssistantPage() {
    const [mode, setMode] = useState<'voice' | 'text'>('voice');
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
    const [displayText, setDisplayText] = useState('系統連線完成。嘿，今天有什麼我可以幫忙的嗎？');
    const [inputText, setInputText] = useState('');
    const [volume, setVolume] = useState(0);

    const { token, url, error } = useLiveKitAuth();

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

    if (error) {
        return <div className="h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
    }

    if (!token || !url) {
        return (
            <div className="h-[100dvh] w-screen bg-black flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <Sparkles className="animate-spin text-amber-500" size={32} />
                    <p>正在初始化語音系統...</p>
                </div>
            </div>
        );
    }

    return (
        <LiveKitRoom
            token={token}
            serverUrl={url}
            connect={true}
            audio={true}
            video={false}
            onConnected={() => console.log("LiveKit Connected")}
            onDisconnected={() => console.log("LiveKit Disconnected")}
            className="h-[100dvh] w-screen bg-black text-white overflow-hidden flex flex-col fixed inset-0"
        >
            {mode === 'voice' ? (
                <VoiceAssistantSession
                    displayText={displayText}
                    setDisplayText={setDisplayText}
                    setStatus={setStatus}
                    volume={volume}
                    setVolume={setVolume}
                />
            ) : null}

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
                                <div className={`w-1.5 h-1.5 rounded-full ${status !== 'idle' && status !== 'error' ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
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
                                className="flex flex-col items-center"
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
        </LiveKitRoom>
    );
}
