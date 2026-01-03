/**
 * Neural Particles System (Phase B: Canvas 2D)
 * 能量粒子沿邊線流動系統
 * 效能優化：僅在可見區域渲染，節點數 < 100 時啟用
 */
'use client';

import { useEffect, useRef } from 'react';
import { Edge, Node } from 'reactflow';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    alpha: number;
    speed: number;
    edgeIndex: number;
    progress: number; // 0-1 沿邊線的進度
}

interface NeuralParticlesProps {
    nodes: Node[];
    edges: Edge[];
    enabled?: boolean;
    maxNodes?: number;
}

const DIKW_PARTICLE_COLORS = {
    data: 'rgba(6, 182, 212, 0.8)',
    information: 'rgba(14, 165, 233, 0.8)',
    knowledge: 'rgba(16, 185, 129, 0.8)',
    wisdom: 'rgba(139, 92, 246, 0.8)',
};

export default function NeuralParticles({
    nodes,
    edges,
    enabled = true,
    maxNodes = 100,
}: NeuralParticlesProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>();

    useEffect(() => {
        // 效能保護：節點過多時禁用
        if (!enabled || nodes.length > maxNodes) {
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 設定 Canvas 尺寸
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // 初始化粒子 - 每條邊線產生 2-3 個粒子
        const initParticles = () => {
            particlesRef.current = [];
            edges.forEach((edge, edgeIndex) => {
                const sourceNode = nodes.find((n) => n.id === edge.source);
                const targetNode = nodes.find((n) => n.id === edge.target);

                if (!sourceNode || !targetNode) return;

                // 獲取顏色（使用目標節點的 DIKW 層級）
                const dikwLevel = targetNode.data?.dikwLevel || 'data';
                const color = DIKW_PARTICLE_COLORS[dikwLevel as keyof typeof DIKW_PARTICLE_COLORS];

                // 每條邊線產生 2 個粒子
                for (let i = 0; i < 2; i++) {
                    particlesRef.current.push({
                        x: sourceNode.position.x,
                        y: sourceNode.position.y,
                        vx: 0,
                        vy: 0,
                        color,
                        size: Math.random() * 2 + 1,
                        alpha: Math.random() * 0.5 + 0.5,
                        speed: Math.random() * 0.005 + 0.003,
                        edgeIndex,
                        progress: Math.random(), // 隨機起始位置
                    });
                }
            });
        };

        initParticles();

        // 動畫循環
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((particle) => {
                const edge = edges[particle.edgeIndex];
                if (!edge) return;

                const sourceNode = nodes.find((n) => n.id === edge.source);
                const targetNode = nodes.find((n) => n.id === edge.target);

                if (!sourceNode || !targetNode) return;

                // 更新粒子沿邊線的進度
                particle.progress += particle.speed;
                if (particle.progress > 1) {
                    particle.progress = 0; // 循環
                    particle.alpha = Math.random() * 0.5 + 0.5; // 重置透明度
                }

                // 計算粒子位置（線性插值）
                particle.x = sourceNode.position.x + (targetNode.position.x - sourceNode.position.x) * particle.progress;
                particle.y = sourceNode.position.y + (targetNode.position.y - sourceNode.position.y) * particle.progress;

                // 繪製粒子
                ctx.save();
                ctx.globalAlpha = particle.alpha;
                ctx.fillStyle = particle.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = particle.color;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [nodes, edges, enabled, maxNodes]);

    // 效能保護：節點過多時不渲染
    if (!enabled || nodes.length > maxNodes) {
        return null;
    }

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 1 }}
        />
    );
}
