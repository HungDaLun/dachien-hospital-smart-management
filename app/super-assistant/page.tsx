/**
 * Super Assistant Standalone Page
 * 獨立頁面模式，支援多螢幕與全螢幕操作
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Mic, Send, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceOrb from '@/components/executive-assistant/VoiceOrb';
import {
    LiveKitRoom,
    useVoiceAssistant,
    RoomAudioRenderer,
} from '@livekit/components-react';

export default function SuperAssistantPage() {
    const [mode, setMode] = useState<'voice' | 'text'>('voice');
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
    const [displayText, setDisplayText] = useState('系統連線完成。嘿，今天有什麼我可以幫忙的嗎？');
    const [inputText, setInputText] = useState('');
    const [volume, setVolume] = useState(0);

    // LiveKit 狀態
    const [lkToken, setLkToken] = useState<string | null>(null);
    const [lkUrl, setLkUrl] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    // 取得 LiveKit Token
    const connectToVoice = useCallback(async () => {
        if (lkToken) return;
        setIsConnecting(true);
        try {
            const response = await fetch('/api/voice/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agent_id: 'super-assistant' }),
            });
            const data = await response.json();
            if (data.token) {
                setLkToken(data.token);
                setLkUrl(data.url);
            } else {
                console.error('Failed to get LiveKit token:', data.error);
                setStatus('error');
            }
        } catch (error) {
            console.error('Voice connection error:', error);
            setStatus('error');
        } finally {
            setIsConnecting(false);
        }
    }, [lkToken]);

    // 當切換到語音模式時自動連線
    useEffect(() => {
        if (mode === 'voice') {
            connectToVoice();
        }
    }, [mode, connectToVoice]);

    // 模擬語音波紋 (非 LiveKit 模式下使用，若 LiveKit 已連線則由其提供音量)
    useEffect(() => {
        if (!lkToken && (status === 'listening' || status === 'speaking')) {
            const interval = setInterval(() => {
                setVolume(Math.random());
            }, 100);
            return () => clearInterval(interval);
        } else if (!lkToken) {
            setVolume(0);
        }
        return undefined;
    }, [status, lkToken]);

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
                                <div className={`w-1.5 h-1.5 rounded-full ${lkToken ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                    {lkToken ? 'Voice System Connected' : (isConnecting ? 'Connecting...' : 'System Online')}
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
                                className="flex flex-col items-center justify-center w-full"
                            >
                                {lkToken && lkUrl ? (
                                    <LiveKitRoom
                                        token={lkToken}
                                        serverUrl={lkUrl}
                                        connect={true}
                                        audio={true}
                                        video={false}
                                        onDisconnected={() => {
                                            setLkToken(null);
                                            setStatus('idle');
                                        }}
                                        className="flex flex-col items-center"
                                    >
                                        <VoiceAssistantCore
                                            setStatus={setStatus}
                                            setDisplayText={setDisplayText}
                                            setVolume={setVolume}
                                        />

                                        <div className="mt-8">
                                            <VoiceOrb status={status} volume={volume} />
                                        </div>

                                        <div className="w-full max-w-xl h-24 flex items-center justify-center p-4 mt-8">
                                            <motion.p
                                                key={displayText}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed text-center line-clamp-3 italic"
                                            >
                                                {displayText}
                                            </motion.p>
                                        </div>

                                        <RoomAudioRenderer />
                                    </LiveKitRoom>
                                ) : (
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="relative">
                                            <VoiceOrb status={isConnecting ? 'processing' : 'idle'} volume={0} />
                                            {isConnecting && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-slate-400 animate-pulse">
                                            {isConnecting ? '正在初始化語音系統...' : '點擊底部 Voice 按鈕啟動'}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="text"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full max-w-2xl h-[calc(100vh-350px)] flex flex-col gap-6"
                            >
                                <div className="flex-1 bg-white/5 rounded-3xl p-6 overflow-y-auto border border-white/5 scrollbar-hide">
                                    <div className="flex flex-col gap-4">
                                        <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                                            <p className="text-white/90">{displayText}</p>
                                        </div>
                                        {/* 這裡未來可以加入訊息歷史 */}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 文字模式專用輸入框：僅在 mode === 'text' 時顯示 */}
                {mode === 'text' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-8 pb-6 w-full flex justify-center z-10"
                    >
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
                                placeholder="輸入指令或與管家交談..."
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
                    </motion.div>
                )}

                {/* 底部功能列 */}
                <div className="p-6 pb-10 flex justify-center gap-12 border-t border-white/5 bg-black/40 backdrop-blur-xl">
                    <button
                        onClick={() => setMode('voice')}
                        className={`flex flex-col items-center gap-3 group transition-all ${mode === 'voice' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <div className={`p-5 rounded-full border transition-all duration-300 ${mode === 'voice' ? 'bg-amber-500 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-white/5 border-white/10 group-hover:bg-white/10'}`}>
                            <Mic size={28} className={mode === 'voice' ? 'text-black' : ''} />
                        </div>
                        <span className="text-[12px] font-bold uppercase tracking-[0.2em]">Voice</span>
                    </button>

                    <button
                        onClick={() => setMode('text')}
                        className={`flex flex-col items-center gap-3 group transition-all ${mode === 'text' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <div className={`p-5 rounded-full border transition-all duration-300 ${mode === 'text' ? 'bg-amber-500 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-white/5 border-white/10 group-hover:bg-white/10'}`}>
                            <MessageSquare size={28} className={mode === 'text' ? 'text-black' : ''} />
                        </div>
                        <span className="text-[12px] font-bold uppercase tracking-[0.2em]">Text</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * 內部組件：處理 LiveKit 語音助手邏輯與狀態串接
 */
function VoiceAssistantCore({
    setStatus,
    setDisplayText,
    setVolume
}: {
    setStatus: (s: any) => void,
    setDisplayText: (t: string) => void,
    setVolume: (v: number) => void
}) {
    const { state } = useVoiceAssistant();

    // 監聽轉錄內容
    useEffect(() => {
        if (state === 'listening') {
            setStatus('listening');
        } else if (state === 'speaking') {
            setStatus('speaking');
        } else if (state === 'thinking') {
            setStatus('processing');
        } else {
            setStatus('idle');
        }
    }, [state, setStatus]);

    // 簡單的音量模擬（當語音助手正在說話時）
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state === 'speaking') {
            interval = setInterval(() => {
                setVolume(0.5 + Math.random() * 0.5);
            }, 100);
        } else if (state === 'listening') {
            interval = setInterval(() => {
                setVolume(0.1 + Math.random() * 0.2);
            }, 100);
        } else {
            setVolume(0);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [state, setVolume]);

    // 更新顯示文字 (從助手獲取即時回應)
    // 註：實際運作時，這部分通常由 LiveKit 語音助手插件同步到 metadata 或特定的 Data Channel
    useEffect(() => {
        if (state === 'speaking') {
            // 當助手開始說話時，我們可以更新一段文字
            // setDisplayText('語音助手正在回應中...');
        }
    }, [state, setDisplayText]);

    return null;
}
