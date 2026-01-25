'use client';

import { useState } from 'react';
import { SearchResult, Knowledge } from '@/types/knowledge';
import { knowledgeApi, ApiError } from '@/lib/api/knowledge';
import KnowledgeInput from '@/presentation/components/search/KnowledgeInput';
import SearchResults from '@/presentation/components/search/SearchResults';
import KnowledgeDetail from '@/presentation/components/search/KnowledgeDetail';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';

export default function SearchPage() {
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [detailKnowledge, setDetailKnowledge] = useState<Knowledge | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [currentQuery, setCurrentQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (query: string) => {
        setIsSearching(true);
        setCurrentQuery(query);
        setSelectedIds([]);
        setError(null);
        try {
            const results = await knowledgeApi.search(query);
            setSearchResults(results);
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'An unexpected error occurred';
            setError(errorMessage);
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleConnect = async () => {
        if (selectedIds.length === 0) return;
        setIsConnecting(true);
        setError(null);
        try {
            // タイトルの生成（簡易版）
            const title = currentQuery.slice(0, 200).trim();
            
            const newKnowledge = await knowledgeApi.create({
                title: title || 'Untitled',
                content: currentQuery,
            });
            await knowledgeApi.connect(newKnowledge.id, selectedIds);

            setSearchResults([]);
            setSelectedIds([]);
            setCurrentQuery('');
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Failed to connect knowledge';
            setError(errorMessage);
            console.error('Connect error:', err);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleViewDetail = async (id: string) => {
        try {
            setError(null);
            const k = await knowledgeApi.getById(id);
            setDetailKnowledge(k);
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Failed to load knowledge details';
            setError(errorMessage);
            console.error('View detail error:', err);
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
                    {error && (
                        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                            {error}
                        </div>
                    )}
                </section>

                {searchResults.length > 0 && (
                    <section className="space-y-6">
                        <SearchResults
                            results={searchResults}
                            selectedIds={selectedIds}
                            onToggleSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])}
                            onViewDetail={handleViewDetail}
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
