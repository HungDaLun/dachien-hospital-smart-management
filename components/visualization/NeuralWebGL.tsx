/**
 * Neural WebGL Enhancement (Phase C: WebGL)
 * 提供 Bloom 後處理效果與 3D 深度空間感
 * 效能優化：需 GPU 加速，預設禁用，可透過 Props 啟用
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { Node } from 'reactflow';

interface NeuralWebGLProps {
    nodes: Node[];
    enabled?: boolean;
    bloomIntensity?: number;
    depthIntensity?: number;
}

export default function NeuralWebGL({
    nodes,
    enabled = false,
    bloomIntensity = 0.5,
    depthIntensity = 0.3,
}: NeuralWebGLProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const animationRef = useRef<number>();
    const [gpuSupported, setGpuSupported] = useState(true);

    useEffect(() => {
        if (!enabled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // 初始化 WebGL
        const glContext = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!glContext) {
            console.warn('[Neural WebGL] WebGL not supported, falling back to CSS');
            setGpuSupported(false);
            return;
        }

        const gl = glContext as WebGLRenderingContext;
        glRef.current = gl;

        // 設定 Canvas 尺寸
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // ========== Vertex Shader ==========
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec4 a_color;
            attribute float a_depth;

            varying vec4 v_color;
            varying float v_depth;

            void main() {
                // 3D 深度效果 - Z 軸位移
                gl_Position = vec4(a_position, a_depth * ${depthIntensity.toFixed(2)}, 1.0);
                gl_PointSize = 20.0 - a_depth * 10.0; // 深度越大越小
                v_color = a_color;
                v_depth = a_depth;
            }
        `;

        // ========== Fragment Shader (Bloom Effect) ==========
        const fragmentShaderSource = `
            precision mediump float;
            varying vec4 v_color;
            varying float v_depth;

            void main() {
                // 計算距離中心的距離（圓形粒子）
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);

                // Bloom 光暈效果
                float bloom = exp(-dist * 5.0) * ${bloomIntensity.toFixed(2)};
                float alpha = v_color.a * (1.0 - dist * 2.0) * (1.0 + bloom);

                // 深度霧化效果
                float fog = 1.0 - v_depth * 0.3;

                gl_FragColor = vec4(v_color.rgb * fog, alpha);
            }
        `;

        // 編譯著色器
        const compileShader = (source: string, type: number) => {
            const shader = gl.createShader(type);
            if (!shader) return null;

            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('[WebGL] Shader compilation failed:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        };

        const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

        if (!vertexShader || !fragmentShader) {
            console.error('[WebGL] Shader compilation failed');
            return;
        }

        // 建立程式
        const program = gl.createProgram();
        if (!program) return;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('[WebGL] Program linking failed:', gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        // 準備頂點資料
        const prepareVertexData = () => {
            const vertices: number[] = [];
            const colors: number[] = [];
            const depths: number[] = [];

            nodes.forEach((node) => {
                // 正規化座標 (-1 到 1)
                const x = (node.position.x / window.innerWidth) * 2 - 1;
                const y = -((node.position.y / window.innerHeight) * 2 - 1);

                vertices.push(x, y);

                // DIKW 層級顏色
                const dikwColors: Record<string, [number, number, number, number]> = {
                    data: [0.02, 0.71, 0.83, 1.0],
                    information: [0.05, 0.65, 0.91, 1.0],
                    knowledge: [0.06, 0.73, 0.51, 1.0],
                    wisdom: [0.54, 0.36, 0.96, 1.0],
                };

                const dikwLevel = node.data?.dikwLevel || 'data';
                const color = dikwColors[dikwLevel] || dikwColors.data;
                colors.push(...color);

                // 深度（Wisdom 層最深）
                const depthMap: Record<string, number> = {
                    data: 0.1,
                    information: 0.3,
                    knowledge: 0.6,
                    wisdom: 1.0,
                };
                depths.push(depthMap[dikwLevel] || 0.1);
            });

            return { vertices, colors, depths };
        };

        const { vertices, colors, depths } = prepareVertexData();

        // 建立緩衝區
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        const depthBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, depthBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(depths), gl.STATIC_DRAW);

        // 綁定屬性
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const colorLocation = gl.getAttribLocation(program, 'a_color');
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.enableVertexAttribArray(colorLocation);
        gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

        const depthLocation = gl.getAttribLocation(program, 'a_depth');
        gl.bindBuffer(gl.ARRAY_BUFFER, depthBuffer);
        gl.enableVertexAttribArray(depthLocation);
        gl.vertexAttribPointer(depthLocation, 1, gl.FLOAT, false, 0, 0);

        // 渲染循環
        const render = () => {
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            gl.drawArrays(gl.POINTS, 0, vertices.length / 2);

            animationRef.current = requestAnimationFrame(render);
        };

        gl.clearColor(0, 0, 0, 0);
        render();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [nodes, enabled, bloomIntensity, depthIntensity]);

    if (!enabled || !gpuSupported) {
        return null;
    }

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 2, opacity: 0.4 }} // 半透明疊加
        />
    );
}
