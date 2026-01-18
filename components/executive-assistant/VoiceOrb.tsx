/**
 * JARVIS 3D Voice Orb
 * High-fidelity 3D holographic sphere with breathing effects and complex wireframe geometry.
 */

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface VoiceOrbProps {
    status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
    volume?: number; // 0-1
}

export default function VoiceOrb({ status, volume = 0 }: VoiceOrbProps) {
    const [coreSize, setCoreSize] = useState(1);
    const [rotationSpeed, setRotationSpeed] = useState(10);

    // Dynamic breathing and rotation based on status
    useEffect(() => {
        if (status === 'speaking' || status === 'listening') {
            // Volume affects size directly for responsiveness
            setCoreSize(1 + volume * 0.5);
            setRotationSpeed(5); // Faster rotation when active
        } else if (status === 'processing') {
            setCoreSize(0.8); // Contract slightly while thinking
            setRotationSpeed(2); // Super fast spin
        } else {
            setCoreSize(1);
            setRotationSpeed(20); // Lazy spin
        }
    }, [volume, status]);

    const glowColor = status === 'error' ? '#ef4444' : '#f59e0b'; // Red or Amber
    const secondaryColor = status === 'error' ? '#dc2626' : '#d97706';

    return (
        <div className="relative flex items-center justify-center w-[300px] h-[300px] lg:w-[400px] lg:h-[400px]" style={{ perspective: '1000px' }}>

            {/* Main 3D Container - Rotates continuously */}
            <motion.div
                animate={{ rotateY: 360, rotateX: 10 }}
                transition={{ duration: rotationSpeed, repeat: Infinity, ease: "linear" }}
                className="relative w-64 h-64 flex items-center justify-center"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* 1. Core Sphere (Solid/Energy Glow) */}
                <motion.div
                    animate={{ scale: coreSize }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl"
                    style={{
                        transform: 'translateZ(0)',
                        boxShadow: `0 0 50px ${glowColor}, inset 0 0 30px ${glowColor}`
                    }}
                />

                {/* 2. Inner Wireframe Geodesic Sphere */}
                <div className="absolute inset-0 rounded-full border border-amber-500/30 opacity-50" style={{ transform: 'rotateY(0deg) translateZ(0)' }} />
                <div className="absolute inset-0 rounded-full border border-amber-500/30 opacity-50" style={{ transform: 'rotateY(90deg)' }} />
                <div className="absolute inset-0 rounded-full border border-amber-500/30 opacity-50" style={{ transform: 'rotateX(90deg)' }} />

                {/* 3. Complex Rotating Rings Layers */}
                {/* Equator Ring - Thick */}
                <motion.div
                    animate={{ rotateZ: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-20%] rounded-full border-2 border-amber-400/40 border-dashed"
                    style={{ transform: 'rotateX(70deg)' }}
                />

                {/* Diagonal Orbit Ring 1 */}
                <motion.div
                    animate={{ rotateZ: -360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-40%] rounded-full border border-amber-300/20"
                    style={{ transform: 'rotateX(60deg) rotateY(45deg)' }}
                >
                    <div className="absolute top-0 left-1/2 w-2 h-2 bg-amber-200 rounded-full shadow-[0_0_10px_#fff]" />
                </motion.div>

                {/* Diagonal Orbit Ring 2 */}
                <motion.div
                    animate={{ rotateZ: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-60%] rounded-full border border-amber-500/20 border-dotted"
                    style={{ transform: 'rotateX(-60deg) rotateY(-45deg)' }}
                />

                {/* 4. Floating Data Particles (Simulated 3D cloud) */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-amber-300 rounded-full"
                        animate={{
                            opacity: [0.3, 1, 0.3],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: 2 + (i % 3),
                            repeat: Infinity,
                            delay: i * 0.2
                        }}
                        style={{
                            transform: `rotateY(${i * 45}deg) rotateX(45deg) translateZ(${140 + Math.sin(i) * 20}px)`
                        }}
                    />
                ))}

                {/* Central Bright Energy Core */}
                <motion.div
                    animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute w-32 h-32 bg-amber-100/20 rounded-full blur-md"
                    style={{ boxShadow: `0 0 60px ${secondaryColor}` }}
                />
            </motion.div>

            {/* Background Ambient Glow (Static 2D) */}
            <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 rounded-full blur-[100px] -z-10"
                style={{ background: `radial-gradient(circle, ${glowColor}22 0%, transparent 60%)` }}
            />

        </div>
    );
}
