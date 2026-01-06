'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
    forceRadial
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
const StarNode = ({ data, selected }: any) => {
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

            {/* Interact Area - Changed cursor to grab */}
            <div className="absolute inset-0 -m-3 rounded-full cursor-grab active:cursor-grabbing z-0 bg-transparent" />

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
const getNodeRadius = (node: any) => {
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
    const d3Nodes = nodes.map((n) => ({
        ...n,
        x: n.position.x || Math.random() * 100 - 50, // Start near center
        y: n.position.y || Math.random() * 100 - 50
    }));
    const d3Links = edges.map((e) => ({ ...e, source: e.source, target: e.target }));

    const simulation = forceSimulation(d3Nodes as any)
        .force('link', forceLink(d3Links).id((d: any) => d.id).distance(100).strength(0.5)) // Looser links to allow radial structure
        .force('charge', forceManyBody().strength(-300)) // Repulsion to spacing
        .force('collide', forceCollide().radius(40).iterations(2)) // Avoid overlap
        .force('radial', forceRadial((d: any) => getNodeRadius(d), 0, 0).strength(0.8)) // Strong Radial Force for Rings
        .stop();

    const TICK_COUNT = 300;
    for (let i = 0; i < TICK_COUNT; ++i) {
        simulation.tick();
    }

    const layoutedNodes = d3Nodes.map((n: any) => ({
        ...n,
        position: { x: n.x, y: n.y },
    }));

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
}

function GalaxyGraphContent({
    focusNodeId,
    refreshTrigger = 0
}: GalaxyGraphProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);

    const [selectedDept] = useState<string>('');
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Highlighting State


    const { getEdges, getNodes, setCenter } = useReactFlow();

    // Effect: Fly to focused node
    useEffect(() => {
        if (focusNodeId && nodes.length > 0) {
            handleHitNode(focusNodeId);

            const target = nodes.find(n => n.id === focusNodeId);
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
    }, [focusNodeId, nodes, setCenter]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedDept) params.append('department_id', selectedDept);

            const res = await fetch(`/api/knowledge/graph?${params.toString()}`);
            const data = await res.json();

            // Initial Nodes without visual state
            const apiNodes = data.nodes.map((n: any) => {
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

            const apiEdges = data.edges.map((e: any) => ({
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

    // --- Neighbor Highlighting Logic ---
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


    }, [getEdges, getNodes, setNodes, setEdges]);

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

    // Reset on background click
    const onPaneClick = useCallback(() => {
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
                fitView
                fitViewOptions={{ padding: 0.2, includeHiddenNodes: false, duration: 200 }}
                minZoom={0.1}
                maxZoom={4}
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                attributionPosition="bottom-right"
                className="galaxy-flow"
                style={{ background: 'transparent' }}

                // Interaction Props Fixes
                panOnDrag={true}
                panOnScroll={true}
                zoomOnScroll={true}
                nodesDraggable={true} // Allow node dragging
                selectionOnDrag={false} // Disable selection box to ensure panning works
                preventScrolling={false}
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
