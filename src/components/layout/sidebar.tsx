"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    MessageSquare,
    UploadCloud,
    BrainCircuit,
    Layers,
    Settings,
    BookOpen
} from "lucide-react";
import { motion } from "framer-motion";

const sidebarNavItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Upload Notes",
        href: "/upload",
        icon: UploadCloud,
    },
    {
        title: "AI Tutor Chat",
        href: "/chat",
        icon: MessageSquare,
    },
    {
        title: "Quiz Generator",
        href: "/quiz",
        icon: BrainCircuit,
    },
    {
        title: "Flashcards",
        href: "/flashcards",
        icon: Layers,
    },
];

export function Sidebar() {
    const pathname = usePathname();

    // Hide sidebar on landing page
    if (pathname === "/") return null;

    return (
        <aside className="sticky top-0 h-screen w-64 border-r border-border bg-card overflow-y-auto hidden md:flex flex-col">
            <div className="p-6 flex items-center space-x-3">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                </div>
                <span className="font-semibold text-lg tracking-tight">Study AI</span>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
                {sidebarNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group",
                                isActive
                                    ? "text-primary font-semibold"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 bg-muted rounded-lg -z-10"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 mt-auto">
                <Link
                    href="/settings"
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </Link>
            </div>
        </aside>
    );
}
