'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    Panel,
    useReactFlow,
    ReactFlowProvider,
    Handle,
    Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button, Spinner } from '@/components/ui';
import KnowledgeDetailSidebar from './KnowledgeDetailSidebar';

import {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceCollide,
    forceRadial,
    forceCenter
} from 'd3-force';


// DIKW Palette: Obsidian/Cosmic Style (High Contrast)
const DIKW_COLORS = {
    data: {
        bg: '#06B6D4',
        glow: 'rgba(6, 182, 212, 0.5)',
        text: '#9CA3AF' // Light Gray text per request
    },
    information: {
        bg: '#3B82F6',
        glow: 'rgba(59, 130, 246, 0.5)',
        text: '#9CA3AF'
    },
    knowledge: {
        bg: '#10B981',
        glow: 'rgba(16, 185, 129, 0.5)',
        text: '#9CA3AF'
    },
    wisdom: {
        bg: '#8B5CF6',
        glow: 'rgba(139, 92, 246, 0.6)',
        text: '#9CA3AF'
    },
};

// --- Star Node Component (Obsidian Style - Pure Dot) ---
interface StarNodeData {
    dikwLevel?: string;
    dimmed?: boolean;
    highlighted?: boolean;
    label?: string;
}

interface StarNodeProps {
    data: StarNodeData;
    selected?: boolean;
}

const StarNode = ({ data, selected }: StarNodeProps) => {
    const level = data.dikwLevel || 'data';
    const colors = DIKW_COLORS[level as keyof typeof DIKW_COLORS] || DIKW_COLORS.data;

    // Dimming Logic: Read from data.dimmed
    const isDimmed = data.dimmed;
    const isHighlighted = data.highlighted;

    // Size: Slightly larger dots as requested
    const baseSize = level === 'wisdom' ? 20 : level === 'knowledge' ? 16 : level === 'information' ? 12 : 8;
    const size = isHighlighted ? baseSize * 1.6 : baseSize;

    return (
        <div
            className={`group relative flex flex-col items-center justify-center pointer-events-auto transition-all duration-500 ease-out ${isDimmed ? 'opacity-30 grayscale-[0.5]' : 'opacity-100'}`}
        >
            {/* The Star Dot (Pure, no border) */}
            <div
                className="rounded-full transition-all duration-300 pointer-events-none"
                style={{
                    width: size,
                    height: size,
                    backgroundColor: isHighlighted || selected ? '#FFFFFF' : colors.bg,
                    boxShadow: isHighlighted || selected
                        ? `0 0 20px 4px ${colors.glow}, 0 0 8px #fff`
                        : `0 0 0 transparent`, // No glow by default unless highlighted/selected for cleaner look? Or subtle glow?
                    // User said "obsidian style", which is usually flat unless active.
                    // Let's add very subtle glow for identification.
                }}
            />
            {(!isHighlighted && !selected) && (
                <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 6px ${colors.glow}`, opacity: 0.6 }} />
            )}

            {/* Label - Always visible but transparent white */}
            <div
                className={`
                    absolute top-full mt-1.5 px-2 py-0.5 rounded text-[10px] font-sans tracking-wide whitespace-nowrap z-50
                    transition-all duration-200 pointer-events-none font-medium
                    ${(isHighlighted || selected) ? 'opacity-100 text-white scale-110 z-[60] bg-black/40 backdrop-blur-[1px]' :
                        'opacity-40 text-white/80 hover:opacity-100'}
                `}
                style={{
                    textShadow: '0 1px 3px rgba(0,0,0,1)' // Strong shadow for contrast
                }}
            >
                {data.label}
            </div>

            {/* Interact Area - 確保拖曳區域可被正確點擊 */}
            <div
                className="absolute inset-0 -m-4 rounded-full cursor-grab active:cursor-grabbing"
                style={{ zIndex: 10 }}
            />

            <Handle
                type="target"
                position={Position.Top}
                isConnectable={false} // Disable connection interaction (no crosshair)
                className="opacity-0 !bg-transparent"
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 1, height: 1, border: 'none', pointerEvents: 'none' }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={false} // Disable connection interaction (no crosshair)
                className="opacity-0 !bg-transparent"
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 1, height: 1, border: 'none', pointerEvents: 'none' }}
            />
        </div>
    );
};

const nodeTypes = {
    default: StarNode,
    custom_particle: StarNode, // Register new type
    file: StarNode,
    input: StarNode,
    framework_instance: StarNode,
};

// Helper to determine Ring Radius based on type/level
interface NodeWithData {
    id: string;
    type?: string;
    data?: {
        nodeType?: string;
        dikwLevel?: string;
    };
}

const getNodeRadius = (node: NodeWithData) => {
    const type = node.data?.nodeType || node.type;
    const level = node.data?.dikwLevel;

    // Center: Wisdom or High-Level Concepts
    if (level === 'wisdom') return 0;

    // Inner Ring: Frameworks / Knowledge
    if (type === 'framework_instance' || level === 'knowledge') return 250;

    // Middle Ring: Files / Information
    if (type === 'file' || type === 'input' || level === 'information') return 500;

    // Outer Ring: Data / Other
    return 750;
};

// Layout Helper
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    // 找出哪些節點是孤立的（沒有連接）
    const connectedNodeIds = new Set<string>();
    edges.forEach(e => {
        connectedNodeIds.add(e.source);
        connectedNodeIds.add(e.target);
    });

    const d3Nodes = nodes.map((n, index) => {
        // 給所有節點圓形分散的初始位置
        const isIsolated = !connectedNodeIds.has(n.id);
        const angle = (index / nodes.length) * 2 * Math.PI;
        // 孤立節點放更外圍
        const radius = isIsolated ? 800 + Math.random() * 300 : 200 + Math.random() * 150;

        return {
            ...n,
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        };
    });
    const d3Links = edges.map((e) => ({ ...e, source: e.source, target: e.target }));

    interface D3Node {
        id: string;
        x: number;
        y: number;
        [key: string]: unknown;
    }

    const simulation = forceSimulation(d3Nodes as D3Node[])
        .force('center', forceCenter(0, 0)) // 強制置中
        .force('link', forceLink(d3Links).id((d) => (d as D3Node).id).distance(200).strength(0.4)) // 連接的節點靠近但距離增加
        .force('charge', forceManyBody().strength(-1200)) // 大幅增加斥力使節點分散
        .force('collide', forceCollide().radius(100).iterations(4)) // 增加碰撞半徑避免重疊
        .force('radial', forceRadial((d) => getNodeRadius(d as NodeWithData), 0, 0).strength(0.15)) // 進一步降低徑向力
        .stop();

    const TICK_COUNT = 500; // 增加迭代次數使佈局更穩定
    for (let i = 0; i < TICK_COUNT; ++i) {
        simulation.tick();
    }

    const layoutedNodes = (d3Nodes as (Node & { x: number; y: number })[]).map((n) => ({
        ...n,
        position: { x: n.x, y: n.y },
    })) as Node[];

    return { nodes: layoutedNodes, edges };
};

const getDIKWLevel = (nodeType: string): keyof typeof DIKW_COLORS => {
    if (nodeType === 'file' || nodeType === 'input') return 'information';
    if (nodeType === 'framework_instance') return 'knowledge';
    return 'data';
};

interface GalaxyGraphProps {
    initialDepartments?: Array<{ id: string; name: string }>;
    currentUserRole?: string;
    enableWebGL?: boolean;
    focusNodeId?: string | null;
    refreshTrigger?: number;
    isVisible?: boolean; // 新增：容器是否可見
}

function GalaxyGraphContent({
    focusNodeId,
    refreshTrigger = 0,
    isVisible = true
}: GalaxyGraphProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);

    const [selectedDept] = useState<string>('');
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Highlighting State
    // 追蹤上次處理的 focusNodeId，避免重複處理造成無限循環
    const prevFocusNodeIdRef = useRef<string | null>(null);

    // 新增：追蹤拖曳狀態，避免在拖曳過程中觸發不預期的狀態更新
    const isDraggingRef = useRef<boolean>(false);
    const dragEndTimeRef = useRef<number>(0);

    const { getEdges, getNodes, setCenter, fitView } = useReactFlow();

    // 當容器變為可見時，重新觸發 fitView 置中
    useEffect(() => {
        if (isVisible && !loading && nodes.length > 0) {
            // 延遲執行確保容器已完全展開
            const timer = setTimeout(() => {
                fitView({ padding: 0.4, duration: 600 });
            }, 300);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [isVisible, loading, nodes.length, fitView]);

    // --- Neighbor Highlighting Logic (定義在 useEffect 之前) ---
    const handleHitNode = useCallback((nodeId: string) => {
        const _edges = getEdges();

        // Find neighbors
        const neighborIds = new Set<string>();
        neighborIds.add(nodeId); // Include self

        _edges.forEach(edge => {
            if (edge.source === nodeId) neighborIds.add(edge.target);
            if (edge.target === nodeId) neighborIds.add(edge.source);
        });

        // Update Nodes State
        setNodes(nds => nds.map(node => ({
            ...node,
            data: {
                ...node.data,
                dimmed: !neighborIds.has(node.id),
                highlighted: neighborIds.has(node.id)
            }
        })));

        // Update Edges State
        setEdges(eds => eds.map(edge => {
            const isConnected = edge.source === nodeId || edge.target === nodeId;
            return {
                ...edge,
                style: {
                    ...edge.style,
                    stroke: isConnected ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.05)',
                    strokeWidth: isConnected ? 1.5 : 0.5
                },
                zIndex: isConnected ? 10 : 0
            };
        }));
    }, [getEdges, setNodes, setEdges]);

    // Effect: Fly to focused node
    // 注意：不將 nodes 加入依賴，改用 getNodes() 來獲取最新狀態
    // 這樣可以避免 handleHitNode 更新 nodes 後又觸發此 effect 造成無限循環
    useEffect(() => {
        // 只在 focusNodeId 真正改變時才處理
        if (focusNodeId && focusNodeId !== prevFocusNodeIdRef.current) {
            const currentNodes = getNodes();
            if (currentNodes.length > 0) {
                prevFocusNodeIdRef.current = focusNodeId;
                handleHitNode(focusNodeId);

                const target = currentNodes.find(n => n.id === focusNodeId);
                if (target) {
                    // If focus is triggered externally, we assume sidebar opens
                    const zoomLevel = 1.2;
                    // Sidebar is on the RIGHT. We want the node to appear on the LEFT.
                    // Camera Center = Node Position + Offset (to the right)
                    const offsetX = 250;
                    setCenter(target.position.x + offsetX, target.position.y, { zoom: zoomLevel, duration: 1200 });

                    setSelectedNode(target);
                    setIsSidebarOpen(true);
                }
            }
        }
        // 當 focusNodeId 被清除時，重設追蹤值
        if (!focusNodeId) {
            prevFocusNodeIdRef.current = null;
        }
    }, [focusNodeId, getNodes, setCenter, handleHitNode]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedDept) params.append('department_id', selectedDept);

            const res = await fetch(`/api/knowledge/graph?${params.toString()}`);
            const data = await res.json();

            // Initial Nodes without visual state
            interface ApiNode {
                id: string;
                type: string;
                label: string;
                data?: Record<string, unknown>;
            }

            interface ApiEdge {
                id: string;
                source: string;
                target: string;
            }

            const apiNodes = (data.nodes as ApiNode[]).map((n) => {
                const dikwLevel = n.data?.dikwLevel || getDIKWLevel(n.type);
                return {
                    id: n.id,
                    type: 'custom_particle', // Rename to avoid default ReactFlow styles
                    data: {
                        label: n.label,
                        dikwLevel,
                        nodeType: n.type,
                        ...n.data,
                        dimmed: false,
                        highlighted: false
                    },
                    position: { x: 0, y: 0 },
                    // Explicitly override any wrapper styles
                    style: { background: 'transparent', border: 'none', padding: 0.5, boxShadow: 'none', width: 'auto' },
                    draggable: true, // Explicitly enable dragging
                };
            });

            const apiEdges = (data.edges as ApiEdge[]).map((e) => ({
                id: e.id,
                source: e.source,
                target: e.target,
                id_source: e.source,
                id_target: e.target,
                type: 'straight', // Force straight lines as requested
                animated: false,
                style: {
                    stroke: 'rgba(255, 255, 255, 0.4)', // Increased base visibility (was 0.1)
                    strokeWidth: 1.0, // Thicker base lines
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
    }, [setNodes, setEdges, selectedDept, refreshTrigger]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );



    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        handleHitNode(node.id); // Trigger highlight
        setSelectedNode(node);  // Show content
        setIsSidebarOpen(true);

        // Center the node with offset to the LEFT (so it doesn't hide behind sidebar)
        // Sidebar width is max-w-2xl (approx 670px) or similar. 
        // We want the node to be centered in the remaining space.
        // Assuming 1920 width, sidebar is 600, remaining is 1320. Center is 660.
        // Screen center is 960. Diff is 300.
        // So we need to shift the view center to the Right by ~300px.
        const offset = 250;
        setCenter(node.position.x + offset, node.position.y, { zoom: 1.5, duration: 800 });
    }, [handleHitNode, setCenter]);

    // 節點開始拖曳時，設定拖曳狀態
    const onNodeDragStart = useCallback(() => {
        isDraggingRef.current = true;
    }, []);

    // 節點拖曳結束時，重置拖曳狀態並記錄時間
    const onNodeDragStop = useCallback(() => {
        isDraggingRef.current = false;
        dragEndTimeRef.current = Date.now();
    }, []);

    // Reset on background click
    // 修正：在拖曳結束後短暂時間內不處理 pane click，避免誤觸
    const onPaneClick = useCallback(() => {
        // 如果正在拖曳，或者剛剛拖曳結束（200ms 內），忽略這次點擊
        if (isDraggingRef.current || Date.now() - dragEndTimeRef.current < 200) {
            return;
        }

        setNodes(nds => nds.map(node => ({
            ...node,
            data: { ...node.data, dimmed: false, highlighted: false }
        })));
        setEdges(eds => eds.map(edge => ({
            ...edge,
            style: { ...edge.style, stroke: 'rgba(255, 255, 255, 0.4)', strokeWidth: 1.0 }
        })));
        setIsSidebarOpen(false); // Close sidebar when clicking empty space
    }, [setNodes, setEdges]);

    // Listen to changes in edges to ensure they get updated if simulation runs late? 
    // Usually d3 runs once. ReactFlow manages state. This is fine.



    return (
        <div className="w-full h-full relative galaxy-graph-container bg-[#0B0C0E]">
            {/* Obsidian-like Dark Background with subtle grid */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: 'radial-gradient(#333 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}
                />
            </div>

            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0B0C0E]">
                    <div className="flex flex-col items-center gap-4">
                        <Spinner size="lg" />
                        <span className="text-text-tertiary font-black text-[10px] tracking-[0.2em] uppercase animate-pulse">Neural Galaxy Synchronizing...</span>
                    </div>
                </div>
            )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onNodeDragStart={onNodeDragStart}
                onNodeDragStop={onNodeDragStop}
                fitView
                fitViewOptions={{ padding: 0.4, includeHiddenNodes: false, duration: 800 }}
                minZoom={0.1}
                maxZoom={4}
                attributionPosition="bottom-right"
                className="galaxy-flow"
                style={{ background: 'transparent' }}

                // 互動設定：
                // panOnDrag={true} 允許左鍵在空白區域拖曳平移畫面
                panOnDrag={true}
                panOnScroll={true}
                zoomOnScroll={true}
                nodesDraggable={true}
                selectionOnDrag={false}
                preventScrolling={true}

                // 確保節點拖曳事件被正確處理
                nodeDragThreshold={2}
            >
                <Controls className="galaxy-controls !bg-background-secondary/80 !backdrop-blur-md !border-white/10 !fill-text-tertiary" />
                <MiniMap
                    className="galaxy-minimap !bg-background-secondary/80 !backdrop-blur-md !border-white/10"
                    nodeColor={(node) => {
                        const level = node.data?.dikwLevel || 'data';
                        return DIKW_COLORS[level as keyof typeof DIKW_COLORS]?.bg || '#fff';
                    }}
                    maskColor="rgba(0, 0, 0, 0.6)"
                />

                <Panel position="top-right" className="flex items-center gap-3 pr-4 pt-4">
                    <Button
                        onClick={fetchData}
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 p-0 rounded-xl border border-white/5 bg-white/5 text-text-tertiary hover:text-text-primary hover:bg-white/10 transition-all"
                        title="Refresh"
                    >
                        ↻
                    </Button>
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

export default function GalaxyGraph(props: GalaxyGraphProps) {
    return (
        <ReactFlowProvider>
            <GalaxyGraphContent {...props} />
        </ReactFlowProvider>
    );
}
