"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar() {
    const pathname = usePathname();

    // Hide topbar on landing page
    if (pathname === "/") return null;

    // Derive page title from pathname
    const title = pathname.split("/").filter(Boolean)[0] || "Dashboard";
    const displayTitle = title.charAt(0).toUpperCase() + title.slice(1).replace("-", " ");

    return (
        <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-6">
            <div className="flex items-center">
                <h1 className="text-xl font-semibold tracking-tight">{displayTitle}</h1>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative hidden sm:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-9 w-64 rounded-md border border-input bg-muted/50 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>

                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                </Button>

                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors">
                    <User className="h-4 w-4 text-primary" />
                </div>
            </div>
        </header>
    );
}
