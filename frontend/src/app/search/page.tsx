'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SearchResult, Knowledge, TopicSegment } from '@/types/knowledge';
import { knowledgeApi, ApiError } from '@/lib/api/knowledge';
import KnowledgeInput from '@/presentation/components/search/KnowledgeInput';
import SearchResults from '@/presentation/components/search/SearchResults';
import KnowledgeDetail from '@/presentation/components/search/KnowledgeDetail';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus } from 'lucide-react';

export default function SearchPage() {
    const router = useRouter();
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [topicSegments, setTopicSegments] = useState<TopicSegment[]>([]);
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

    const handleAnalyzeTopics = useCallback(async (query: string) => {
        // 処理中の場合は無視（ボタンがdisabledになっているはずだが、念のため）
        if (isAnalyzing) {
            return;
        }

        setIsAnalyzing(true);
        setCurrentQuery(query);
        setSearchResults([]);
        setError(null);

        try {
            const topics = await knowledgeApi.analyzeTopics(query);
            setTopicSegments(topics);
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Failed to analyze topics';
            setError(errorMessage);
            console.error('Analyze topics error:', err);
            
            // エラー時はリトライ可能なメッセージを表示（サーバーエラーの場合）
            if (err instanceof ApiError && err.status >= 500) {
                setError(`${errorMessage} Please try again.`);
            }
        } finally {
            setIsAnalyzing(false);
        }
    }, [isAnalyzing]);

    const handleConnect = async () => {
        if (topicSegments.length === 0) return;
        setIsConnecting(true);
        setError(null);
        try {
            // 全てのトピックを自動的に接続
            await knowledgeApi.connectTopics(
                topicSegments.map((topic) => ({
                    title: topic.title,
                    content: topic.content,
                    // 関連度スコアが70以上の関連ナレッジIDを渡す（AIが自動的に結びつける）
                    relatedKnowledgeIds: topic.relatedKnowledge
                        ?.filter(r => r.relevanceScore >= 0.7)
                        .map(r => r.knowledge.id) || [],
                }))
            );

            // 処理完了後、/graphページに自動遷移
            router.push('/graph');
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Failed to connect knowledge';
            setError(errorMessage);
            console.error('Connect error:', err);
            
            // エラー時はリトライ可能なメッセージを表示（サーバーエラーの場合）
            if (err instanceof ApiError && err.status >= 500) {
                setError(`${errorMessage} Please try again.`);
            }
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
                                selectedIds={[]}
                                onToggleSelect={() => {}}
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
                                        const hasRelatedKnowledge = topic.relatedKnowledge && topic.relatedKnowledge.length > 0;
                                        const highMatchCount = topic.relatedKnowledge?.filter(r => r.relevanceScore >= 0.8).length || 0;
                                        
                                        return (
                                            <div
                                                key={index}
                                                className="group relative transition-all duration-200 overflow-hidden border rounded-lg p-4 border-border/50 hover:border-primary/50 hover:shadow-md bg-card/50 hover:bg-accent/50"
                                            >
                                                <div className="flex-1 min-w-0 space-y-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-semibold truncate leading-none mt-1 group-hover:text-primary transition-colors">
                                                            {topic.title}
                                                        </h4>
                                                        {highMatchCount > 0 && (
                                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 shrink-0">
                                                                {highMatchCount} High Match
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    
                                                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                                        {topic.content}
                                                    </p>

                                                    {hasRelatedKnowledge && (
                                                        <div className="pt-2 border-t border-border/50 space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-medium text-muted-foreground">
                                                                    Related Knowledge
                                                                </span>
                                                                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                                                    {topic.relatedKnowledge!.length}
                                                                </Badge>
                                                            </div>
                                                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                                                {topic.relatedKnowledge!.slice(0, 3).map((related, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="text-xs p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleViewDetail(related.knowledge.id);
                                                                        }}
                                                                    >
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center gap-1.5 mb-1">
                                                                                    <span className="font-medium truncate">
                                                                                        {related.knowledge.title}
                                                                                    </span>
                                                                                    {related.relevanceScore >= 0.8 && (
                                                                                        <Badge variant="outline" className="text-[9px] h-3.5 px-1">
                                                                                            High
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                                <p className="text-muted-foreground line-clamp-1">
                                                                                    {related.knowledge.content}
                                                                                </p>
                                                                            </div>
                                                                            <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                                                                                {Math.round(related.relevanceScore * 100)}%
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {topic.relatedKnowledge!.length > 3 && (
                                                                    <div className="text-xs text-muted-foreground text-center py-1">
                                                                        +{topic.relatedKnowledge!.length - 3} more
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {topicSegments.length > 0 && (
                            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
                                <Button
                                    size="lg"
                                    onClick={handleConnect}
                                    disabled={isConnecting}
                                    className="rounded-full shadow-xl px-8 h-12 text-base font-medium"
                                >
                                    {isConnecting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</>
                                    ) : (
                                        <><Plus className="mr-2 h-4 w-4" /> Connections</>
                                    )}
                                </Button>
                            </div>
                        )}
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
