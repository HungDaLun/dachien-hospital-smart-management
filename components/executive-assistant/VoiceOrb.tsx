/**
 * JARVIS 律動光球 (VoiceOrb)
 * 仿鋼鐵人 UI 風格：金黃色全息投影、科技感、類雜訊光圈
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface VoiceOrbProps {
    status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
    volume?: number; // 0-1
}

export default function VoiceOrb({ status, volume = 0 }: VoiceOrbProps) {
    // 依賴 volume/status 的即時半徑 (模擬呼吸)
    const [coreSize, setCoreSize] = useState(1);

    useEffect(() => {
        if (status === 'speaking' || status === 'listening') {
            setCoreSize(1 + volume * 0.8);
        } else {
            setCoreSize(1);
        }
    }, [volume, status]);

    const isActive = status === 'listening' || status === 'speaking' || status === 'processing';

    // 核心光暈顏色 - 金黃/琥珀色系
    const glowColor = status === 'error' ? '#ef4444' : '#f59e0b'; // Amber-500

    return (
        <div className="relative flex items-center justify-center w-[400px] h-[400px]">
            {/* 1. 背景大氛圍光 (Ambient Glow) */}
            <motion.div
                animate={{
                    opacity: [0.1, 0.2, 0.1],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full blur-[80px]"
                style={{
                    background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`
                }}
            />

            {/* 2. 外部複雜旋轉環 (Outer Tech Rings) */}
            {/* 環 1: 慢速逆時針 */}
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute w-[320px] h-[320px] rounded-full border border-amber-500/20 border-dashed"
            />

            {/* 環 2: 快速順時針 (有缺口) */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute w-[280px] h-[280px] rounded-full border-t border-b border-amber-400/30"
            />

            {/* 環 3: 刻度環 (Ticks) */}
            <motion.div
                animate={{ rotate: 180 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute w-[360px] h-[360px] flex items-center justify-center opacity-30"
            >
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-full h-[2px] bg-amber-500/50"
                        style={{ transform: `rotate(${i * 30}deg) translateX(48%)`, width: '10px' }}
                    />
                ))}
            </motion.div>

            {/* 3. 核心全息結構 (Holographic Core) - 會呼吸 */}
            <motion.div
                animate={{
                    scale: status === 'processing' ? [1, 0.9, 1] : coreSize,
                    rotate: status === 'processing' ? 360 : 0
                }}
                transition={{
                    scale: { type: "spring", stiffness: 300, damping: 20 },
                    rotate: { duration: 1, repeat: Infinity, ease: "linear" }
                }}
                className="relative flex items-center justify-center"
            >
                {/* 內部多層幾何體 */}
                <div className="relative w-40 h-40 flex items-center justify-center">

                    {/* 內層網格球 (Wireframe Sphere effect) */}
                    <motion.div
                        animate={{ rotateY: 360, rotateX: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute w-32 h-32 rounded-full border border-amber-300/40 opacity-80"
                        style={{
                            boxShadow: `0 0 20px ${glowColor}44, inset 0 0 20px ${glowColor}44`
                        }}
                    >
                        {/* 經緯線模擬 */}
                        <div className="absolute inset-0 rounded-full border-l border-r border-amber-300/30 w-full h-full transform scale-x-50" />
                        <div className="absolute inset-0 rounded-full border-t border-b border-amber-300/30 w-full h-full transform scale-y-50" />
                    </motion.div>

                    {/* 核心能量點 (Nucleus) */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.8, 1, 0.8]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute w-16 h-16 rounded-full bg-amber-100 blur-md z-10"
                        style={{
                            boxShadow: `0 0 40px ${glowColor}, 0 0 20px #fff`
                        }}
                    />

                    {/* 周圍粒子 (Particles) */}
                    <AnimatePresence>
                        {isActive && [...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0.5, 1.5],
                                    x: (Math.random() - 0.5) * 100,
                                    y: (Math.random() - 0.5) * 100
                                }}
                                transition={{
                                    duration: 1 + Math.random(),
                                    repeat: Infinity,
                                    delay: i * 0.2
                                }}
                                className="absolute w-1 h-1 bg-amber-300 rounded-full blur-[1px]"
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* 4. 數據流動線條 (Data Streams) - 只有在說話時出現 */}
            <AnimatePresence>
                {status === 'speaking' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none"
                    >
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={`wave-${i}`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-amber-400/30"
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 5. 狀態文字 (Tech Label) */}
            <div className="absolute -bottom-16 flex flex-col items-center gap-1">
                <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex items-center gap-2"
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'error' ? 'bg-red-500' : 'bg-amber-400'}`} />
                    <span className="text-amber-400/80 text-xs font-bold tracking-[0.2em] font-mono">
                        {status === 'idle' ? 'SYSTEM READY' :
                            status === 'listening' ? 'LISTENING...' :
                                status === 'processing' ? 'PROCESSING DATA' :
                                    status === 'speaking' ? 'VOCALIZING' : 'SYSTEM ERROR'}
                    </span>
                </motion.div>
                <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            </div>
        </div>
    );
}
