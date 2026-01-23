'use client';

import { SearchResult } from '@/domain/models/Knowledge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, Check } from 'lucide-react';

interface SearchResultsProps {
    results: SearchResult[];
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onViewDetail: (id: string) => void;
}

export default function SearchResults({
    results,
    selectedIds,
    onToggleSelect,
    onViewDetail,
}: SearchResultsProps) {
    if (results.length === 0) return null;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                    Suggested Connections
                </h3>
                <Badge variant="secondary" className="font-mono text-xs">
                    {results.length} found
                </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {results.map(({ knowledge, relevanceScore }) => {
                    const isSelected = selectedIds.includes(knowledge.id);

                    return (
                        <Card
                            key={knowledge.id}
                            className={`group relative transition-all duration-200 cursor-pointer overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-md ${isSelected ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-card/50 hover:bg-accent/50'
                                }`}
                            onClick={() => onToggleSelect(knowledge.id)}
                        >
                            <CardContent className="p-4 flex gap-4">
                                <div className="pt-1">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => onToggleSelect(knowledge.id)}
                                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                    />
                                </div>

                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-semibold truncate leading-none mt-1 group-hover:text-primary transition-colors">
                                            {knowledge.title}
                                        </h4>
                                        {relevanceScore > 80 && (
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 shrink-0">
                                                High Match
                                            </Badge>
                                        )}
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                        {knowledge.content}
                                    </p>

                                    <div className="pt-2 flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground font-mono">
                                            ID: {knowledge.id.substring(0, 8)}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs hover:bg-transparent hover:text-primary p-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetail(knowledge.id);
                                            }}
                                        >
                                            View Details
                                            <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
