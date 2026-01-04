'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    MarkerType,
    Panel,
    Position,
    BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button, Spinner } from '@/components/ui';
import KnowledgeDetailSidebar from './KnowledgeDetailSidebar';
import NeuralParticles from './NeuralParticles';
import NeuralWebGL from './NeuralWebGL';

// DIKW 層級色彩配置 - 優化配色與對比度
const DIKW_COLORS = {
    data: { bg: 'rgba(6, 182, 212, 0.25)', border: '#06B6D4', glow: 'rgba(6, 182, 212, 0.3)' },
    information: { bg: 'rgba(14, 165, 233, 0.25)', border: '#0EA5E9', glow: 'rgba(14, 165, 233, 0.3)' },
    knowledge: { bg: 'rgba(16, 185, 129, 0.25)', border: '#10B981', glow: 'rgba(16, 185, 129, 0.3)' },
    wisdom: { bg: 'rgba(139, 92, 246, 0.25)', border: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.3)' },
};

// Layout Helper - 類神經網路佈局（每層垂直排列，層與層之間水平推進）
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    // 手動分層：依照 DIKW 層級（從左到右：Data → Information → Knowledge → Wisdom）
    const dataNodes = nodes.filter(n => n.data.dikwLevel === 'data');
    const infoNodes = nodes.filter(n => n.data.dikwLevel === 'information');
    const knowledgeNodes = nodes.filter(n => n.data.dikwLevel === 'knowledge');
    const wisdomNodes = nodes.filter(n => n.data.dikwLevel === 'wisdom');

    // 佈局參數：類神經網路風格
    const nodeHeight = 80;
    const verticalGap = 100; // 層內節點之間的垂直間距（同一列）
    const horizontalGap = 400; // 層與層之間的水平間距（從左到右）

    // 計算起始位置
    const startX = -600; // 從左側開始
    const startY = -300; // 垂直居中起始點

    // 定義層級配置（從左到右排列，每層的節點垂直排列）
    const layers = [
        {
            nodes: dataNodes,
            x: startX,
            label: 'Data Layer',
            level: 'data'
        },
        {
            nodes: infoNodes,
            x: startX + horizontalGap,
            label: 'Information Layer',
            level: 'information'
        },
        {
            nodes: knowledgeNodes,
            x: startX + horizontalGap * 2,
            label: 'Knowledge Layer',
            level: 'knowledge'
        },
        {
            nodes: wisdomNodes,
            x: startX + horizontalGap * 3,
            label: 'Wisdom Layer',
            level: 'wisdom'
        }
    ];

    const layoutedNodes: Node[] = [];

    // 類神經網路佈局：每層節點垂直排列（同一列），層與層之間水平推進（從左到右）
    layers.forEach((layer, layerIndex) => {
        const layerNodes = layer.nodes;
        if (layerNodes.length === 0) return;

        // 計算該層節點的總高度，並垂直居中對齊
        const totalHeight = layerNodes.length * nodeHeight + (layerNodes.length - 1) * verticalGap;
        const layerStartY = startY - totalHeight / 2;

        // 為該層的每個節點設定位置（垂直排列在同一列）
        layerNodes.forEach((node, index) => {
            const y = layerStartY + index * (nodeHeight + verticalGap);

            // 設定節點位置：X 軸是層的位置，Y 軸是節點在該層內的位置
            node.position = { x: layer.x, y };

            // 設定連接點位置：左側層從右側輸出，右側層從左側接收
            node.targetPosition = Position.Left;   // 接收來自左側層的連接
            node.sourcePosition = Position.Right;  // 向右側層輸出連接

            // 為節點添加層級標記（用於視覺化）
            if (!node.data) node.data = {};
            node.data.layerIndex = layerIndex;
            node.data.layerLabel = layer.label;

            layoutedNodes.push(node);
        });
    });

    // 優化邊線：確保連接線從左層指向右層（水平流向，類似神經網路）
    const layoutedEdges = edges.map(edge => ({
        ...edge,
        // 確保動畫方向符合水平流向（從左到右）
        animated: true,
        style: {
            ...edge.style,
            stroke: '#64748B',
            strokeWidth: 2,
        },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#64748B',
        },
    }));

    return { nodes: layoutedNodes, edges: layoutedEdges };
};

// 根據節點類型取得 DIKW 層級
const getDIKWLevel = (nodeType: string): keyof typeof DIKW_COLORS => {
    if (nodeType === 'file' || nodeType === 'input') return 'information';
    if (nodeType === 'framework_instance') return 'knowledge';
    return 'data';
};

interface GalaxyGraphProps {
    initialDepartments?: Array<{ id: string; name: string }>;
    currentUserRole?: string;
    enableWebGL?: boolean; // Phase C: WebGL 增強（預設禁用）
}

export default function GalaxyGraph({ initialDepartments = [], currentUserRole, enableWebGL: externalEnableWebGL = false }: GalaxyGraphProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [selectedDept, setSelectedDept] = useState<string>('');
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // 視覺效果模式控制（儲存在 localStorage）
    const [visualMode, setVisualMode] = useState<'performance' | 'default' | 'flagship'>('default');
    const [showSettingsPanel, setShowSettingsPanel] = useState(false);

    // 從 localStorage 讀取偏好設定
    useEffect(() => {
        const savedMode = localStorage.getItem('galaxy_visual_mode') as 'performance' | 'default' | 'flagship' | null;
        if (savedMode) {
            setVisualMode(savedMode);
        }
    }, []);

    // 計算是否啟用 WebGL（優先使用使用者設定）
    const enableWebGL = visualMode === 'flagship' || externalEnableWebGL;
    const enableParticles = visualMode !== 'performance';

    // 更新視覺模式
    const handleVisualModeChange = (mode: 'performance' | 'default' | 'flagship') => {
        setVisualMode(mode);
        localStorage.setItem('galaxy_visual_mode', mode);
        setShowSettingsPanel(false);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedDept) params.append('department_id', selectedDept);

            const res = await fetch(`/api/knowledge/graph?${params.toString()}`);
            const data = await res.json();

            // Format nodes for React Flow - DIKW 配色與神經脈動動畫
            const apiNodes = data.nodes.map((n: any) => {
                // Use the level from DB (n.data.dikwLevel) if available, otherwise fallback to type-based inference
                const dikwLevel = n.data?.dikwLevel || getDIKWLevel(n.type);
                const colors = DIKW_COLORS[dikwLevel as keyof typeof DIKW_COLORS] || DIKW_COLORS.data;

                // 為節點添加層級標記
                return {
                    id: n.id,
                    type: 'default',
                    data: {
                        label: n.label,
                        dikwLevel,
                        nodeType: n.type,
                        ...n.data
                    },
                    position: { x: 0, y: 0 },
                    style: {
                        background: colors.border,
                        color: '#FFFFFF',
                        border: `2px solid ${colors.border}`,
                        borderRadius: '8px',
                        padding: '10px',
                        fontSize: '12px',
                        width: '200px',
                    },
                };
            });

            // 能量流動邊線效果
            const apiEdges = data.edges.map((e: any) => ({
                id: e.id,
                source: e.source,
                target: e.target,
                animated: true,
                style: {
                    stroke: '#64748B',
                    strokeWidth: 2,
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#64748B',
                },
            }));

            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                apiNodes,
                apiEdges
            );

            console.log('[Galaxy Graph] Nodes:', layoutedNodes.length);
            console.log('[Galaxy Graph] Sample positions:', layoutedNodes.slice(0, 3).map(n => ({
                id: n.id.substring(0, 8),
                label: n.data.label.substring(0, 20),
                x: n.position.x,
                y: n.position.y
            })));
            console.log('[Galaxy Graph] Edges:', layoutedEdges.length, layoutedEdges);

            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        } catch (error) {
            console.error('Failed to fetch graph data:', error);
        } finally {
            setLoading(false);
        }
    }, [setNodes, setEdges, selectedDept]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setIsSidebarOpen(true);
    }, []);

    const showDeptFilter = currentUserRole === 'SUPER_ADMIN' && initialDepartments.length > 0;

    // 使用 useMemo 避免 ReactFlow 警告
    const proOptions = useMemo(() => ({ hideAttribution: true }), []);

    return (
        <div className="w-full h-full relative galaxy-graph-container">
            {/* 深色背景與微光點陣效果 */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 galaxy-background">
                {/* 星空粒子層 - 多層次 CSS 呼吸動畫 */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            radial-gradient(2px 2px at 20% 30%, rgba(6, 182, 212, 0.6), transparent),
                            radial-gradient(2px 2px at 60% 70%, rgba(14, 165, 233, 0.6), transparent),
                            radial-gradient(1.5px 1.5px at 50% 50%, rgba(16, 185, 129, 0.5), transparent),
                            radial-gradient(1.5px 1.5px at 80% 10%, rgba(139, 92, 246, 0.6), transparent),
                            radial-gradient(2px 2px at 90% 60%, rgba(6, 182, 212, 0.5), transparent),
                            radial-gradient(1px 1px at 33% 85%, rgba(14, 165, 233, 0.5), transparent),
                            radial-gradient(1px 1px at 15% 55%, rgba(16, 185, 129, 0.6), transparent),
                            radial-gradient(1.5px 1.5px at 75% 25%, rgba(139, 92, 246, 0.4), transparent),
                            radial-gradient(1px 1px at 45% 15%, rgba(6, 182, 212, 0.4), transparent),
                            radial-gradient(1px 1px at 85% 85%, rgba(14, 165, 233, 0.4), transparent),
                            radial-gradient(2px 2px at 10% 75%, rgba(16, 185, 129, 0.5), transparent),
                            radial-gradient(1px 1px at 65% 40%, rgba(139, 92, 246, 0.3), transparent)
                        `,
                        backgroundSize: '300% 300%',
                        animation: 'galaxy-breathe 8s ease-in-out infinite',
                    }}
                />
            </div>

            {/* 載入狀態 */}
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Spinner size="lg" />
                            <div className="absolute inset-0 animate-ping opacity-20">
                                <Spinner size="lg" />
                            </div>
                        </div>
                        <span className="text-gray-300 font-medium animate-pulse">
                            🌌 Mapping Galaxy...
                        </span>
                    </div>
                </div>
            )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                fitView
                fitViewOptions={{ padding: 0.2, includeHiddenNodes: false, duration: 200 }}
                panOnDrag={true}
                panOnScroll={false}
                zoomOnScroll={true}
                zoomOnDoubleClick={false}
                selectionOnDrag={false}
                minZoom={0.05}
                maxZoom={1.5}
                defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
                proOptions={proOptions}
                attributionPosition="bottom-right"
                className="galaxy-flow"
            >
                <Controls className="galaxy-controls" />
                <MiniMap
                    className="galaxy-minimap"
                    nodeColor={(node) => {
                        const level = node.data?.dikwLevel || 'data';
                        return DIKW_COLORS[level as keyof typeof DIKW_COLORS]?.border || '#64748B';
                    }}
                    maskColor="rgba(15, 23, 42, 0.8)"
                />
                <Background
                    gap={20}
                    size={1}
                    variant={BackgroundVariant.Dots}
                    color="#334155"
                />

                {/* Glassmorphism 控制面板 - 高度對齊修正 */}
                <Panel position="top-right" className="flex items-center gap-3 pr-4 pt-4">
                    {showDeptFilter && (
                        /* 直接使用 select，移除多餘外框 div，確保高度與 Button 一致 */
                        <select
                            className="h-9 w-40 rounded-md bg-white/5 px-3 py-1 text-sm text-gray-200
                                       border border-white/20 shadow-sm transition-all
                                       hover:bg-white/10 hover:border-white/30
                                       focus:outline-none focus:ring-2 focus:ring-accent-violet/50"
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                        >
                            <option value="" className="bg-gray-800 text-gray-200">All Departments</option>
                            {initialDepartments.map(dept => (
                                <option key={dept.id} value={dept.id} className="bg-gray-800 text-gray-200">
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* 視覺效果設定按鈕 */}
                    <div className="relative">
                        <Button
                            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                            size="sm"
                            variant="outline"
                            className="h-9 !border-white/20 !bg-white/5 !text-gray-200 hover:!bg-white/10 hover:!border-white/30 backdrop-blur-sm shadow-sm"
                        >
                            🎨 視覺效果
                        </Button>

                        {/* 設定面板 - 保持不變 */}
                        {showSettingsPanel && (
                            <div className="absolute top-12 right-0 w-64 glass-dark rounded-lg p-4 shadow-xl border border-white/10 z-50 animate-scale-in">
                                <h3 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                                    🌌 Neural Galaxy 模式
                                </h3>

                                <div className="space-y-2">
                                    {/* Performance Mode */}
                                    <button
                                        onClick={() => handleVisualModeChange('performance')}
                                        className={`w-full text-left px-3 py-2 rounded-md transition-all ${visualMode === 'performance'
                                            ? 'bg-accent-emerald/20 border border-accent-emerald/50 text-accent-emerald'
                                            : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="font-medium text-sm">⚡ 效能模式</div>
                                        <div className="text-xs opacity-75 mt-0.5">僅 CSS 動畫 (&lt; 5% CPU)</div>
                                    </button>

                                    {/* Default Mode */}
                                    <button
                                        onClick={() => handleVisualModeChange('default')}
                                        className={`w-full text-left px-3 py-2 rounded-md transition-all ${visualMode === 'default'
                                            ? 'bg-accent-sky/20 border border-accent-sky/50 text-accent-sky'
                                            : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="font-medium text-sm">✨ 平衡模式 (推薦)</div>
                                        <div className="text-xs opacity-75 mt-0.5">CSS + 粒子 (~15% CPU)</div>
                                    </button>

                                    {/* Flagship Mode */}
                                    <button
                                        onClick={() => handleVisualModeChange('flagship')}
                                        className={`w-full text-left px-3 py-2 rounded-md transition-all ${visualMode === 'flagship'
                                            ? 'bg-accent-violet/20 border border-accent-violet/50 text-accent-violet'
                                            : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="font-medium text-sm">🚀 旗艦模式</div>
                                        <div className="text-xs opacity-75 mt-0.5">全效果 + WebGL (~30% CPU)</div>
                                    </button>
                                </div>

                                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400">
                                    目前模式會自動儲存
                                </div>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={fetchData}
                        size="sm"
                        variant="outline"
                        className="h-9 !border-white/20 !bg-white/5 !text-gray-200 hover:!bg-white/10 hover:!border-white/30 backdrop-blur-sm shadow-sm"
                    >
                        ✨ 重新整理
                    </Button>
                </Panel>

                {/* DIKW 圖例 */}
                <Panel position="bottom-left" className="glass-dark rounded-lg p-3">
                    <div className="text-xs text-gray-400 font-medium mb-2">DIKW Layers</div>
                    <div className="flex flex-col gap-1.5">
                        {Object.entries(DIKW_COLORS).map(([level, colors]) => (
                            <div key={level} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                        backgroundColor: colors.border,
                                        boxShadow: `0 0 8px ${colors.glow}`
                                    }}
                                />
                                <span className="text-xs text-gray-300 capitalize">{level}</span>
                            </div>
                        ))}
                    </div>
                </Panel>
            </ReactFlow>

            {/* Phase B: 能量粒子系統 (Canvas 2D) - 動態啟用 */}
            <NeuralParticles
                nodes={nodes}
                edges={edges}
                enabled={enableParticles && !loading && nodes.length > 0}
                maxNodes={100}
            />

            {/* Phase C: WebGL 後處理效果（可選啟用） */}
            <NeuralWebGL
                nodes={nodes}
                enabled={enableWebGL && !loading && nodes.length > 0}
                bloomIntensity={0.5}
                depthIntensity={0.3}
            />

            <KnowledgeDetailSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                node={selectedNode}
            />
        </div>
    );
}

