"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, UploadCloud, BrainCircuit, Layers, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Upload Notes", href: "/upload", icon: UploadCloud },
    { title: "AI Tutor", href: "/chat", icon: MessageSquare },
    { title: "Quiz Generator", href: "/quiz", icon: BrainCircuit },
    { title: "Flashcards", href: "/flashcards", icon: Layers },
];

export function Topbar() {
    const pathname = usePathname();

    if (pathname === "/") return null;

    return (
        <header className="sticky top-0 z-50 w-full bg-white/60 backdrop-blur-2xl border-b border-white/50 shadow-[0_4px_30px_rgb(0,0,0,0.03)] h-16">
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center space-x-2 mr-8">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-lg tracking-tight hidden sm:inline-block">Study AI</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex flex-1 items-center space-x-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "text-primary"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="topbar-active"
                                        className="absolute inset-0 bg-slate-100/80 rounded-md -z-10"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon className="w-4 h-4" />
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="flex items-center ml-auto">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
                        <User className="h-4 w-4 text-slate-600" />
                    </div>
                </div>
            </div>
        </header>
    );
}
