'use client';

import { Knowledge } from '@/types/knowledge';
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
            <SheetContent 
                className="!w-[400px] !max-w-[400px] border-l border-border/50 p-0 text-foreground bg-background overflow-hidden"
                style={{ width: '400px', maxWidth: '400px' }}
            >
                {knowledge && (
                    <ScrollArea className="h-full w-full">
                        <div className="p-6 pr-12 space-y-8">
                            <SheetHeader className="space-y-4 pr-0">
                                <div className="flex flex-col gap-2">
                                    <Badge variant="outline" className="font-mono text-xs text-muted-foreground break-all w-full">
                                        ID: {knowledge.id}
                                    </Badge>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3 shrink-0" />
                                        <span>{new Date(knowledge.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <SheetTitle className="text-2xl font-bold leading-tight break-words pr-0">
                                    {knowledge.title}
                                </SheetTitle>
                            </SheetHeader>

                            <div className="space-y-6 pr-0">
                                <div className="text-muted-foreground text-sm">
                                    <p className="whitespace-pre-wrap leading-relaxed break-words">{knowledge.content}</p>
                                </div>

                                {knowledge.connections.length > 0 && (
                                    <>
                                        <Separator className="bg-border/50" />
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-medium flex items-center gap-2">
                                                <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                                                Connections ({knowledge.connections.length})
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {knowledge.connections.map((id) => (
                                                    <Badge key={id} variant="secondary" className="font-mono text-xs break-all max-w-full">
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
