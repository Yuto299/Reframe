'use client';

import { Knowledge } from '@reframe/shared';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar, Link as LinkIcon } from 'lucide-react';

interface KnowledgeDetailProps {
    knowledge: Knowledge | null;
    onClose: () => void;
}

export default function KnowledgeDetail({ knowledge, onClose }: KnowledgeDetailProps) {
    return (
        <Sheet open={!!knowledge} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[90vw] sm:w-[540px] border-l border-border/50 p-0 text-foreground bg-background">
                {knowledge && (
                    <ScrollArea className="h-full">
                        <div className="p-6 space-y-8">
                            <SheetHeader className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                                        ID: {knowledge.id}
                                    </Badge>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(knowledge.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <SheetTitle className="text-2xl font-bold leading-tight">
                                    {knowledge.title}
                                </SheetTitle>
                            </SheetHeader>

                            <div className="space-y-6">
                                <div className="prose prose-invert prose-sm max-w-none text-muted-foreground">
                                    <p className="whitespace-pre-wrap leading-relaxed">{knowledge.content}</p>
                                </div>

                                {knowledge.connections.length > 0 && (
                                    <>
                                        <Separator className="bg-border/50" />
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-medium flex items-center gap-2">
                                                <LinkIcon className="h-3.5 w-3.5" />
                                                Connections ({knowledge.connections.length})
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {knowledge.connections.map((id) => (
                                                    <Badge key={id} variant="secondary" className="font-mono text-xs">
                                                        {id}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                )}
            </SheetContent>
        </Sheet>
    );
}
