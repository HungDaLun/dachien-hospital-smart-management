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

            // Format nodes for React Flow
            const apiNodes = data.nodes.map((n: any) => ({
                id: n.id,
                type: n.type, // Preserve original type (file or framework_instance)
                data: { label: n.label, ...n.data },
                position: { x: 0, y: 0 },
                style: n.type === 'file'
                    ? { background: '#f8fafc', border: '1px solid #94a3b8', borderRadius: '4px', width: 180, fontSize: '12px' }
                    : { background: '#f0fdf4', border: '2px solid #16a34a', borderRadius: '8px', width: 220, fontWeight: 'bold' }
            }));

            const apiEdges = data.edges.map((e: any) => ({
                id: e.id,
                source: e.source,
                target: e.target,
                animated: true,
                style: { stroke: '#94a3b8' },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
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
        <div className="w-full h-full bg-slate-50 relative">
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
                    <Spinner size="md" />
                    <span className="ml-3 text-gray-600">Mapping Galaxy...</span>
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
                attributionPosition="bottom-right"
            >
                <Controls />
                <MiniMap />
                <Background gap={12} size={1} variant={BackgroundVariant.Dots} />
                <Panel position="top-right" className="flex gap-2">
                    {showDeptFilter && (
                        <div className="bg-white rounded-md shadow-sm">
                            <select
                                className="h-9 w-40 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                            >
                                <option value="">All Departments</option>
                                {initialDepartments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <Button onClick={fetchData} size="sm" variant="outline">
                        Refresh Galaxy
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
