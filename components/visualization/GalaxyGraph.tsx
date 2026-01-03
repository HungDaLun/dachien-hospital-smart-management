'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
import dagre from 'dagre';
import { Button, Spinner } from '@/components/ui';
import KnowledgeDetailSidebar from './KnowledgeDetailSidebar';

// DIKW 層級色彩配置
const DIKW_COLORS = {
    data: { bg: 'rgba(6, 182, 212, 0.15)', border: '#06B6D4', glow: 'rgba(6, 182, 212, 0.4)' },
    information: { bg: 'rgba(14, 165, 233, 0.15)', border: '#0EA5E9', glow: 'rgba(14, 165, 233, 0.4)' },
    knowledge: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
    wisdom: { bg: 'rgba(139, 92, 246, 0.15)', border: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)' },
};

// Layout Helper
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 200;
    const nodeHeight = 60;

    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = direction === 'LR' ? Position.Left : Position.Top;
        node.sourcePosition = direction === 'LR' ? Position.Right : Position.Bottom;

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes: layoutedNodes, edges };
};

// 根據節點類型取得 DIKW 層級
const getDIKWLevel = (nodeType: string): keyof typeof DIKW_COLORS => {
    if (nodeType === 'file' || nodeType === 'input') return 'data';
    if (nodeType === 'framework_instance') return 'knowledge';
    return 'information';
};

interface GalaxyGraphProps {
    initialDepartments?: Array<{ id: string; name: string }>;
    currentUserRole?: string;
}

export default function GalaxyGraph({ initialDepartments = [], currentUserRole }: GalaxyGraphProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [selectedDept, setSelectedDept] = useState<string>('');
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedDept) params.append('department_id', selectedDept);

            const res = await fetch(`/api/knowledge/graph?${params.toString()}`);
            const data = await res.json();

            // Format nodes for React Flow - DIKW 配色與動畫
            const apiNodes = data.nodes.map((n: any) => {
                const dikwLevel = getDIKWLevel(n.type);
                const colors = DIKW_COLORS[dikwLevel];

                return {
                    id: n.id,
                    type: n.type,
                    data: { label: n.label, dikwLevel, ...n.data },
                    position: { x: 0, y: 0 },
                    style: {
                        background: colors.bg,
                        border: `2px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '13px',
                        fontWeight: n.type === 'framework_instance' ? 600 : 400,
                        color: '#F1F5F9',
                        boxShadow: `0 0 20px ${colors.glow}`,
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.3s ease',
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

    return (
        <div className="w-full h-full relative galaxy-graph-container">
            {/* 深色背景與微光點陣效果 */}
            <div className="absolute inset-0 bg-gray-900 galaxy-background" />

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
                panOnDrag={true}
                panOnScroll={false}
                zoomOnScroll={true}
                zoomOnDoubleClick={false}
                selectionOnDrag={false}
                minZoom={0.3}
                maxZoom={2}
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

                {/* Glassmorphism 控制面板 */}
                <Panel position="top-right" className="flex gap-2">
                    {showDeptFilter && (
                        <div className="glass-dark rounded-lg p-1">
                            <select
                                className="h-9 w-40 rounded-md bg-transparent px-3 py-1 text-sm text-gray-200 
                                           border border-white/10 shadow-sm transition-colors 
                                           focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-violet"
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                            >
                                <option value="" className="bg-gray-800">All Departments</option>
                                {initialDepartments.map(dept => (
                                    <option key={dept.id} value={dept.id} className="bg-gray-800">
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <Button
                        onClick={fetchData}
                        size="sm"
                        variant="outline"
                        className="!border-white/20 !text-gray-200 hover:!bg-white/10 hover:!border-white/30"
                    >
                        ✨ Refresh Galaxy
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

            <KnowledgeDetailSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                node={selectedNode}
            />
        </div>
    );
}

