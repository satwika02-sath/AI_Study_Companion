"use client";

import { PageTransition } from "@/components/page-transition";
import { UploadCloud, MessageSquare, BrainCircuit, Layers, ArrowRight, Users, BarChart2, Crown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { usePlan } from "@/context/plan-context";

const dashboardActions = [
    {
        title: "Upload Notes",
        description: "Add PDFs or text notes to your personal knowledge base for the AI to analyze.",
        icon: UploadCloud,
        href: "/upload",
        color: "text-blue-600",
        bg: "bg-blue-100",
    },
    {
        title: "Ask AI Tutor",
        description: "Chat with your intelligent tutor to get explanations, summaries, and help.",
        icon: MessageSquare,
        href: "/chat",
        color: "text-purple-600",
        bg: "bg-purple-100",
    },
    {
        title: "Generate Quiz",
        description: "Test your retention by generating custom quizzes from your study material.",
        icon: BrainCircuit,
        href: "/quiz",
        color: "text-green-600",
        bg: "bg-green-100",
    },
    {
        title: "Flashcards",
        description: "Review core concepts using interactive, spaced-repetition flashcards.",
        icon: Layers,
        href: "/flashcards",
        color: "text-orange-600",
        bg: "bg-orange-100",
    },
    {
        title: "Team Collaboration",
        description: "Invite collaborators to access and study shared notes together.",
        icon: Users,
        href: "/team",
        color: "text-violet-600",
        bg: "bg-violet-100",
    },
    {
        title: "Analytics",
        description: "Track your study activity, AI usage, and learning progress over time.",
        icon: BarChart2,
        href: "/analytics",
        color: "text-indigo-600",
        bg: "bg-indigo-100",
    },
    {
        title: "Upgrade Plan",
        description: "Unlock unlimited AI questions, quizzes, and team collaboration with Pro.",
        icon: Crown,
        href: "/pricing",
        color: "text-amber-600",
        bg: "bg-amber-100",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <PageTransition className="p-6 md:p-12 max-w-7xl mx-auto space-y-10">

            {/* Header */}
            <div className="flex flex-col gap-2">
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-bold tracking-tight text-slate-900"
                >
                    Welcome back, {user?.displayName?.split(' ')[0] || "Student"}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-lg text-slate-600 font-medium"
                >
                    Select an action below to continue your smart learning journey.
                </motion.p>
            </div>

            {/* Grid of Actions */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {dashboardActions.map((action) => (
                    <Link key={action.href} href={action.href} className="outline-none block h-full">
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ y: -6, scale: 1.01, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                            className="group h-full bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.15)] transition-all duration-300 flex flex-col cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${action.bg} ${action.color} group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                                    <action.icon className="w-7 h-7" />
                                </div>

                                {/* Subtle arrow indicator that slides in on hover */}
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                                    <ArrowRight className="w-5 h-5 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out" />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2">{action.title}</h3>
                            <p className="text-slate-600 leading-relaxed font-medium flex-1">
                                {action.description}
                            </p>

                        </motion.div>
                    </Link>
                ))}
            </motion.div>

        </PageTransition>
    );
}
