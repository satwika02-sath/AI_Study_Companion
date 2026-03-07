"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, UploadCloud, BrainCircuit, Layers, BookOpen, User, Github, Users, BarChart2, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { usePlan } from "@/context/plan-context";
import { memo } from "react";

const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Upload Notes", href: "/upload", icon: UploadCloud },
    { title: "Repo Explainer", href: "/analyze-repo", icon: Github },
    { title: "AI Tutor", href: "/chat", icon: MessageSquare },
    { title: "Quiz", href: "/quiz", icon: BrainCircuit },
    { title: "Flashcards", href: "/flashcards", icon: Layers },
    { title: "Team", href: "/team", icon: Users },
    { title: "Analytics", href: "/analytics", icon: BarChart2 },
];

export const Topbar = memo(function Topbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const { isPro, currentPlan } = usePlan();

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (pathname === "/" || pathname === "/login" || pathname === "/register") return null;

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
                                        : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
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
                <div className="flex items-center space-x-3 ml-auto">
                    {isPro && (
                        <Link href="/pricing" className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md shadow-violet-500/20 hover:opacity-90 transition-opacity">
                            <Crown className="w-3 h-3" />
                            {currentPlan === 'enterprise' ? 'Enterprise' : 'Pro'}
                        </Link>
                    )}
                    {!isPro && (
                        <Link href="/pricing" className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-violet-600 transition-colors">
                            <Crown className="w-3 h-3" /> Upgrade
                        </Link>
                    )}
                    <div className="hidden sm:flex flex-col items-end mr-1">
                        <span className="text-xs font-black text-slate-900 leading-none">
                            {user?.displayName || "Research Student"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                            Personal Workspace
                        </span>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center cursor-pointer group hover:bg-white hover:border-indigo-400 transition-all duration-300">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="User" className="w-full h-full rounded-xl object-cover" />
                        ) : (
                            <User className="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                        )}
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
});
