"use client";

import { PageTransition } from "@/components/page-transition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, MessageSquare, BrainCircuit, Layers, Clock } from "lucide-react";
import Link from "next/link";

const quickLinks = [
    {
        title: "Upload Notes",
        description: "Add new PDF or text notes to your knowledge base.",
        icon: UploadCloud,
        href: "/upload",
        color: "bg-blue-500/10 text-blue-500",
    },
    {
        title: "AI Tutor Chat",
        description: "Ask questions and get explanations on any topic.",
        icon: MessageSquare,
        href: "/chat",
        color: "bg-green-500/10 text-green-500",
    },
    {
        title: "Quiz Generator",
        description: "Test your knowledge with custom generated quizzes.",
        icon: BrainCircuit,
        href: "/quiz",
        color: "bg-purple-500/10 text-purple-500",
    },
    {
        title: "Flashcards",
        description: "Review concepts with spaced repetition flashcards.",
        icon: Layers,
        href: "/flashcards",
        color: "bg-orange-500/10 text-orange-500",
    },
];

const recentActivity = [
    { id: 1, action: "Generated Quiz", topic: "Machine Learning Basics", time: "2 hours ago" },
    { id: 2, action: "Uploaded Note", topic: "Chapter 4: Neural Networks", time: "Yesterday" },
    { id: 3, action: "Chat Session", topic: "Explain Backpropagation", time: "2 days ago" },
];

export default function DashboardPage() {
    return (
        <PageTransition className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Welcome back, Student</h2>
                <p className="text-muted-foreground">Here is an overview of your study progress and quick actions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="outline-none">
                        <Card hoverable className="h-full cursor-pointer border-transparent hover:border-border transition-colors group">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${link.color} group-hover:scale-110 transition-transform`}>
                                    <link.icon className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-lg">{link.title}</CardTitle>
                                <CardDescription className="line-clamp-2 mt-2">
                                    {link.description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Study Progress Overview</CardTitle>
                        <CardDescription>Your activity over the last 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center border-t border-border/50 bg-muted/10">
                        {/* Placeholder for a chart */}
                        <p className="text-muted-foreground text-sm">Chart visualization will appear here.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Your latest interactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium leading-none">{activity.action}</p>
                                        <p className="text-xs text-muted-foreground">{activity.topic}</p>
                                        <p className="text-xs text-muted-foreground/60">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-6">View All Activity</Button>
                    </CardContent>
                </Card>
            </div>
        </PageTransition>
    );
}
