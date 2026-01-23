'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings2 } from 'lucide-react';

interface GraphSettingsProps {
    showDate: boolean;
    onToggleDate: () => void;
}

export default function GraphSettings({ showDate, onToggleDate }: GraphSettingsProps) {
    return (
        <Card className="w-64 shadow-lg bg-card/90 backdrop-blur border-border/50">
            <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Display Settings
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="show-date" className="text-sm font-normal text-muted-foreground flex-1 cursor-pointer">
                        Show Dates
                    </Label>
                    <Switch id="show-date" checked={showDate} onCheckedChange={onToggleDate} />
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Controls</p>
                    <ul className="text-xs text-muted-foreground/70 space-y-1.5 list-disc pl-4">
                        <li>Click node for details</li>
                        <li>Scroll to zoom</li>
                        <li>Drag to pan</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
