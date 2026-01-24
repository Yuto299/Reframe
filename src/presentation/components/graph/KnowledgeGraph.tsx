'use client';

import { useCallback, useEffect } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
    MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Knowledge } from '@/domain/models/Knowledge';

interface KnowledgeGraphProps {
    knowledgeList: Knowledge[];
    onNodeClick: (knowledge: Knowledge) => void;
    showDate: boolean;
}

export default function KnowledgeGraph({
    knowledgeList,
    onNodeClick,
    showDate,
}: KnowledgeGraphProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (knowledgeList.length === 0) return;

        // Layout configuration
        const newNodes: Node[] = knowledgeList.map((knowledge, index) => {
            const angle = (index / knowledgeList.length) * 2 * Math.PI;
            const radius = 300 + (index % 2) * 40; // Zigzag circle

            return {
                id: knowledge.id,
                position: {
                    x: Math.cos(angle) * radius + 400,
                    y: Math.sin(angle) * radius + 300,
                },
                data: {
                    label: (
                        <div className="flex flex-col gap-1">
                            <div className="font-semibold leading-snug break-words">
                                {knowledge.title}
                            </div>
                            {showDate && (
                                <div className="text-[10px] text-muted-foreground font-mono">
                                    {new Date(knowledge.createdAt).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    ),
                },
                style: {
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    padding: '12px',
                    width: 200, // Slightly wider for better readability
                    cursor: 'grab',
                    boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.2)', // Stronger shadow for depth
                    fontSize: '13px',
                    fontWeight: 500,
                },
                // Removed transition to fix drag lag
                className: 'hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-transform duration-75',
            };
        });

        const newEdges: Edge[] = [];
        const processed = new Set<string>();

        knowledgeList.forEach((k) => {
            k.connections.forEach((targetId) => {
                const key = [k.id, targetId].sort().join('-');
                if (!processed.has(key)) {
                    processed.add(key);
                    newEdges.push({
                        id: key,
                        source: k.id,
                        target: targetId,
                        type: 'default',
                        style: { stroke: 'hsl(var(--border))', strokeWidth: 2 }, // Thicker edges
                        animated: true,
                    });
                }
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [knowledgeList, showDate, setNodes, setEdges]);

    const onNodeClickInternal = useCallback((_event: unknown, node: Node) => {
        const k = knowledgeList.find(item => item.id === node.id);
        if (k) onNodeClick(k);
    }, [knowledgeList, onNodeClick]);

    if (knowledgeList.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                <p className="text-lg font-medium">No knowledge graph yet</p>
                <p className="text-sm">Add connections in the Search page to visualize them here.</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClickInternal}
                fitView
                minZoom={0.5}
                maxZoom={2}
            >
                <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(var(--muted-foreground) / 0.3)" />
                <Controls showInteractive={false} />
                <MiniMap
                    nodeColor="hsl(var(--primary))"
                    maskColor="hsl(var(--background) / 0.8)"
                    style={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                    }}
                />
            </ReactFlow>
        </div>
    );
}
