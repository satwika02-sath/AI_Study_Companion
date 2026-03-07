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
    BookOpen,
    LogOut
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
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
    const router = useRouter();
    const { user } = useAuth();

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    // Hide sidebar on landing/auth pages
    if (pathname === "/" || pathname === "/login" || pathname === "/register") return null;

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
                                    ? "text-primary font-semibold translate-x-1"
                                    : "text-slate-500 hover:bg-slate-900/5 hover:text-primary hover:translate-x-1"
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
                            <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-primary" : "text-slate-400 group-hover:text-primary")} />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 mt-auto border-t border-slate-100 space-y-1">
                <Link
                    href="/settings"
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-all"
                >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
