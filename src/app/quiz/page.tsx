"use client";

import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, PlayCircle, Settings2 } from "lucide-react";

export default function QuizPage() {
    const [topic, setTopic] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const startGeneration = () => {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 2000); // mock generation
    };

    return (
        <PageTransition className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Quiz Generator</h2>
                <p className="text-muted-foreground mt-2">Test your knowledge by generating intelligent quizzes based on your notes or specific topics.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                            <Settings2 className="w-5 h-5" />
                        </div>
                        <CardTitle>Configure Quiz</CardTitle>
                        <CardDescription>Select topic, difficulty, and question amount.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Topic or Focus Area</label>
                            <input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. History of ML, Chapter 2 of Biology..."
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Difficulty</label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Number of Questions</label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm flex focus:ring-2 focus:ring-primary focus:outline-none">
                                <option>5 Questions</option>
                                <option>10 Questions</option>
                                <option>20 Questions</option>
                            </select>
                        </div>

                        <Button className="w-full mt-4" onClick={startGeneration} isLoading={isGenerating}>
                            <BrainCircuit className="w-4 h-4 mr-2" />
                            Generate Quiz
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
                            <PlayCircle className="w-5 h-5" />
                        </div>
                        <CardTitle>Recent Quizzes</CardTitle>
                        <CardDescription>Jump back into quizzes you have taken.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer">
                                    <div>
                                        <p className="text-sm font-medium">Data Structures</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">80% Score • 10 Qs</p>
                                    </div>
                                    <Button variant="ghost" size="sm">Retake</Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageTransition>
    );
}
