/**
 * JARVIS 律動光球 (VoiceOrb)
 * 提供語音互動時的視覺回饋
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

interface VoiceOrbProps {
    status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
    volume?: number; // 0-1
}

export default function VoiceOrb({ status, volume = 0 }: VoiceOrbProps) {
    // 根據狀態決定顏色
    const colors = useMemo(() => {
        switch (status) {
            case 'listening':
                return ['#22c55e', '#16a34a', '#22c55e']; // 綠色
            case 'processing':
                return ['#3b82f6', '#2563eb', '#3b82f6']; // 藍色
            case 'speaking':
                return ['#a855f7', '#9333ea', '#a855f7']; // 紫色
            case 'error':
                return ['#ef4444', '#dc2626', '#ef4444']; // 紅色
            default:
                return ['#6366f1', '#a855f7', '#6366f1']; // 藍紫漸層 (待機)
        }
    }, [status]);

    // 動畫設定
    const animationProps = useMemo(() => {
        if (status === 'listening') {
            return {
                scale: [1, 1.1 + volume * 0.5, 1],
                opacity: [0.6, 1, 0.6],
                transition: { duration: 0.5, repeat: Infinity },
            };
        }
        if (status === 'processing') {
            return {
                rotate: [0, 360],
                scale: [1, 0.9, 1],
                transition: { duration: 2, repeat: Infinity, ease: 'linear' as const },
            };
        }
        if (status === 'speaking') {
            return {
                scale: [1, 1 + volume * 1.5, 1],
                boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.4)',
                    `0 0 ${40 + volume * 60}px rgba(168, 85, 247, 0.8)`,
                    '0 0 20px rgba(168, 85, 247, 0.4)',
                ],
                transition: { duration: 0.2, repeat: Infinity },
            };
        }
        if (status === 'error') {
            return {
                x: [0, -5, 5, -5, 5, 0],
                transition: { duration: 0.4 },
            };
        }
        // 待機 (Idle)
        return {
            scale: [1, 1.05, 1],
            opacity: [0.6, 0.8, 0.6],
            transition: { duration: 3, repeat: Infinity },
        };
    }, [status, volume]);

    return (
        <div className="relative flex items-center justify-center w-64 h-64">
            {/* 背景光量 (Glow) */}
            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.1, 0.3, 0.1],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 rounded-full blur-3xl"
                style={{
                    background: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)`,
                }}
            />

            {/* 核心光球 (Inner Core) */}
            <motion.div
                animate={animationProps}
                className="relative w-40 h-40 rounded-full border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${colors[0]}22 0%, ${colors[1]}44 100%)`,
                }}
            >
                {/* 中心點 (Nucleus) */}
                <div className="w-8 h-8 rounded-full bg-white/40 blur-[2px]" />

                {/* 流光效果 (Energy Waves) */}
                <AnimatePresence>
                    {(status === 'speaking' || status === 'listening') && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0"
                        >
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        scale: [1, 2],
                                        opacity: [0.3, 0],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.5,
                                    }}
                                    className="absolute inset-0 rounded-full border border-white/30"
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* 狀態文字 */}
            <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-12 text-slate-400 text-sm font-medium tracking-widest uppercase"
            >
                {status === 'listening' && 'Listening'}
                {status === 'processing' && 'Thinking'}
                {status === 'speaking' && 'Speaking'}
                {status === 'idle' && 'Waiting'}
                {status === 'error' && 'Error'}
            </motion.div>
        </div>
    );
}
