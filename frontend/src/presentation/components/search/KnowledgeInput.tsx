'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface KnowledgeInputProps {
    onAnalyzeTopics?: (query: string) => void;
    isAnalyzing?: boolean;
}

export default function KnowledgeInput({
    onAnalyzeTopics,
    isAnalyzing = false,
}: KnowledgeInputProps) {
    const [query, setQuery] = useState('');

    const handleAnalyzeTopics = () => {
        if (query.trim() && onAnalyzeTopics) {
            onAnalyzeTopics(query);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleAnalyzeTopics();
        }
    };

    return (
        <div className="w-full">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Add New Knowledge</CardTitle>
                    <CardDescription>
                        Record your insights. AI will automatically find related connections from your past notes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="What did you learn today? (Cmd + Enter to analyze)"
                        className="min-h-[120px] resize-none text-base border-border/50 bg-background/50 focus:bg-background transition-colors"
                        disabled={isAnalyzing}
                    />
                    <div className="flex justify-end gap-2">
                        {onAnalyzeTopics && (
                            <Button
                                onClick={handleAnalyzeTopics}
                                disabled={isAnalyzing || !query.trim()}
                                className="w-full sm:w-auto"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    'Analyze Topics'
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
