'use client';

import { useState } from 'react';
import { SearchResult, Knowledge } from '@/domain/models/Knowledge';
import { MockKnowledgeRepository } from '@/infrastructure/repositories/MockKnowledgeRepository';
import { SearchKnowledgeUseCase } from '@/application/usecases/SearchKnowledgeUseCase';
import { ConnectKnowledgeUseCase } from '@/application/usecases/ConnectKnowledgeUseCase';
import KnowledgeInput from '@/presentation/components/search/KnowledgeInput';
import SearchResults from '@/presentation/components/search/SearchResults';
import KnowledgeDetail from '@/presentation/components/search/KnowledgeDetail';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';

const repository = new MockKnowledgeRepository();
const searchUseCase = new SearchKnowledgeUseCase(repository);
const connectUseCase = new ConnectKnowledgeUseCase(repository);

export default function SearchPage() {
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [detailKnowledge, setDetailKnowledge] = useState<Knowledge | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [currentQuery, setCurrentQuery] = useState('');

    // Note: user needs to generate the toast component first if not already done,
    // but assuming standard installation includes it or I'll add it if missing in next step.
    // shadcn init installs it usually under hooks/use-toast.ts but I didn't verify file.
    // I will check file existence in next step or just rely on manual add.

    const handleSearch = async (query: string) => {
        setIsSearching(true);
        setCurrentQuery(query);
        setSelectedIds([]);
        try {
            const results = await searchUseCase.execute(query);
            setSearchResults(results);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleConnect = async () => {
        if (selectedIds.length === 0) return;
        setIsConnecting(true);
        try {
            const newKnowledge = await repository.create({
                title: currentQuery.slice(0, 50) + (currentQuery.length > 50 ? '...' : ''),
                content: currentQuery,
            });
            await connectUseCase.execute(newKnowledge.id, selectedIds);

            setSearchResults([]);
            setSelectedIds([]);
            setCurrentQuery('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <main className="min-h-screen pt-20 pb-12 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
                <div className="space-y-2 text-center sm:text-left">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Knowledge Network</h1>
                    <p className="text-muted-foreground">Find and connect insights to build your second brain.</p>
                </div>

                <section className="bg-background">
                    <KnowledgeInput onSearch={handleSearch} isSearching={isSearching} />
                </section>

                {searchResults.length > 0 && (
                    <section className="space-y-6">
                        <SearchResults
                            results={searchResults}
                            selectedIds={selectedIds}
                            onToggleSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])}
                            onViewDetail={async (id) => {
                                const k = await repository.findById(id);
                                setDetailKnowledge(k);
                            }}
                        />

                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
                            <Button
                                size="lg"
                                onClick={handleConnect}
                                disabled={selectedIds.length === 0 || isConnecting}
                                className="rounded-full shadow-xl px-8 h-12 text-base font-medium"
                            >
                                {isConnecting ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</>
                                ) : (
                                    <><Plus className="mr-2 h-4 w-4" /> Connect {selectedIds.length} Items</>
                                )}
                            </Button>
                        </div>
                    </section>
                )}
            </div>

            <KnowledgeDetail
                knowledge={detailKnowledge}
                onClose={() => setDetailKnowledge(null)}
            />
        </main>
    );
}
