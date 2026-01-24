'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Network, Search } from 'lucide-react';

export default function Navigation() {
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                        <Network className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Kinetic</span>
                </Link>

                <div className="flex items-center gap-1">
                    <Button
                        variant={pathname === '/search' ? 'secondary' : 'ghost'}
                        size="sm"
                        asChild
                    >
                        <Link href="/search" className="gap-2">
                            <Search className="h-4 w-4" />
                            Search
                        </Link>
                    </Button>
                    <Button
                        variant={pathname === '/graph' ? 'secondary' : 'ghost'}
                        size="sm"
                        asChild
                    >
                        <Link href="/graph" className="gap-2">
                            <Network className="h-4 w-4" />
                            Graph
                        </Link>
                    </Button>
                </div>
            </div>
        </nav>
    );
}
