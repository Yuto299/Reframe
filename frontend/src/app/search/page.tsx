'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchResult, Knowledge, TopicSegment } from '@/types/knowledge';
import { knowledgeApi, ApiError } from '@/lib/api/knowledge';
import KnowledgeInput from '@/presentation/components/search/KnowledgeInput';
import SearchResults from '@/presentation/components/search/SearchResults';
import KnowledgeDetail from '@/presentation/components/search/KnowledgeDetail';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';

export default function SearchPage() {
    const router = useRouter();
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [topicSegments, setTopicSegments] = useState<TopicSegment[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [detailKnowledge, setDetailKnowledge] = useState<Knowledge | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [currentQuery, setCurrentQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (query: string) => {
        setIsSearching(true);
        setCurrentQuery(query);
        setSelectedIds([]);
        setTopicSegments([]);
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

    const handleAnalyzeTopics = async (query: string) => {
        setIsAnalyzing(true);
        setCurrentQuery(query);
        setSelectedIds([]);
        setSearchResults([]);
        setError(null);
        try {
            const topics = await knowledgeApi.analyzeTopics(query);
            setTopicSegments(topics);
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Failed to analyze topics';
            setError(errorMessage);
            console.error('Analyze topics error:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConnect = async () => {
        if (selectedIds.length === 0) return;
        setIsConnecting(true);
        setError(null);
        try {
            // トピック分割結果の場合
            if (topicSegments.length > 0) {
                const selectedTopics = topicSegments.filter((_, index) =>
                    selectedIds.includes(`topic-${index}`)
                );
                
                await knowledgeApi.connectTopics(
                    selectedTopics.map((topic) => ({
                        title: topic.title,
                        content: topic.content,
                        // 将来的にrelatedKnowledgeIdsを追加可能
                    }))
                );

                // 処理完了後、/graphページに自動遷移
                router.push('/graph');
            } else {
                // 通常の検索結果の場合（既存のロジック）
                const title = currentQuery.slice(0, 200).trim();
                
                const newKnowledge = await knowledgeApi.create({
                    title: title || 'Untitled',
                    content: currentQuery,
                });
                await knowledgeApi.connect(newKnowledge.id, selectedIds);

                setSearchResults([]);
                setSelectedIds([]);
                setCurrentQuery('');
            }
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
                    <KnowledgeInput
                        onSearch={handleSearch}
                        isSearching={isSearching}
                        onAnalyzeTopics={handleAnalyzeTopics}
                        isAnalyzing={isAnalyzing}
                    />
                    {error && (
                        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                            {error}
                        </div>
                    )}
                </section>

                {(searchResults.length > 0 || topicSegments.length > 0) && (
                    <section className="space-y-6">
                        {searchResults.length > 0 && (
                            <SearchResults
                                results={searchResults}
                                selectedIds={selectedIds}
                                onToggleSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])}
                                onViewDetail={handleViewDetail}
                            />
                        )}
                        {topicSegments.length > 0 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-sm font-medium text-muted-foreground">
                                        Analyzed Topics
                                    </h3>
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {topicSegments.length} topics
                                    </span>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                    {topicSegments.map((topic, index) => {
                                        const topicId = `topic-${index}`;
                                        const isSelected = selectedIds.includes(topicId);
                                        return (
                                            <div
                                                key={index}
                                                className={`group relative transition-all duration-200 cursor-pointer overflow-hidden border rounded-lg p-4 border-border/50 hover:border-primary/50 hover:shadow-md ${
                                                    isSelected
                                                        ? 'bg-primary/5 border-primary ring-1 ring-primary'
                                                        : 'bg-card/50 hover:bg-accent/50'
                                                }`}
                                                onClick={() =>
                                                    setSelectedIds((prev) =>
                                                        prev.includes(topicId)
                                                            ? prev.filter((p) => p !== topicId)
                                                            : [...prev, topicId]
                                                    )
                                                }
                                            >
                                                <div className="flex-1 min-w-0 space-y-2">
                                                    <h4 className="font-semibold truncate leading-none mt-1 group-hover:text-primary transition-colors">
                                                        {topic.title}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                                        {topic.content}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

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
                                    <><Plus className="mr-2 h-4 w-4" /> {topicSegments.length > 0 ? 'Connect Topics' : `Connect ${selectedIds.length} Items`}</>
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
