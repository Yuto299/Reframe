'use client';

import { useState, useEffect } from 'react';
import { Knowledge } from '@/domain/models/Knowledge';
import { MockKnowledgeRepository } from '@/infrastructure/repositories/MockKnowledgeRepository';
import { GetAllKnowledgeUseCase } from '@/application/usecases/GetAllKnowledgeUseCase';
import KnowledgeGraph from '@/presentation/components/graph/KnowledgeGraph';
import GraphSettings from '@/presentation/components/graph/GraphSettings';
import KnowledgeDetail from '@/presentation/components/search/KnowledgeDetail'; // Reuse Sheet detail for consistency
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';

const repository = new MockKnowledgeRepository();
const getAllUseCase = new GetAllKnowledgeUseCase(repository);

export default function GraphPage() {
    const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
    const [selectedKnowledge, setSelectedKnowledge] = useState<Knowledge | null>(null);
    const [showDate, setShowDate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadKnowledge = async () => {
        setIsLoading(true);
        try {
            const data = await getAllUseCase.execute();
            setKnowledgeList(data);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadKnowledge();
    }, []);

    return (
        <div className="h-screen w-full flex flex-col pt-16 bg-background">
            <div className="flex-1 relative">
                {/* Graph Area */}
                <KnowledgeGraph
                    knowledgeList={knowledgeList}
                    onNodeClick={setSelectedKnowledge}
                    showDate={showDate}
                />

                {/* Floating Controls */}
                <div className="absolute top-6 left-6 z-10 space-y-4">
                    <GraphSettings
                        showDate={showDate}
                        onToggleDate={() => setShowDate(!showDate)}
                    />

                    <Card className="p-4 w-64 border-border/50 bg-card/90 backdrop-blur">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-2xl font-bold">{knowledgeList.length}</div>
                                <div className="text-xs text-muted-foreground">Nodes</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {Math.floor(knowledgeList.reduce((acc, k) => acc + k.connections.length, 0) / 2)}
                                </div>
                                <div className="text-xs text-muted-foreground">Edges</div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadKnowledge}
                            disabled={isLoading}
                            className="w-full mt-4"
                        >
                            <RefreshCw className={`mr-2 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh Data
                        </Button>
                    </Card>
                </div>
            </div>

            <KnowledgeDetail
                knowledge={selectedKnowledge}
                onClose={() => setSelectedKnowledge(null)}
            />
        </div>
    );
}
