"use client";

import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BrainCircuit, CheckCircle2, History, Settings2, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Question = {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
};

export default function QuizPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [topic, setTopic] = useState("");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);

    const startGeneration = async () => {
        if (!topic.trim()) return;
        setIsGenerating(true);
        setQuestions([]);
        setShowResults(false);
        setSelectedAnswers({});

        try {
            const res = await fetch("/api/quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic, k: 5 })
            });

            const data = await res.json();

            if (data.quiz) {
                // Map API response to our UI structure
                const mappedQuestions: Question[] = data.quiz.map((q: any, idx: number) => {
                    const correctIdx = q.options.indexOf(q.correct_answer);
                    return {
                        id: idx,
                        text: q.question,
                        options: q.options,
                        correctAnswer: correctIdx !== -1 ? correctIdx : 0,
                        explanation: q.explanation
                    };
                });
                setQuestions(mappedQuestions);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSelectAnswer = (questionId: number, optionIndex: number) => {
        if (showResults) return;
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const calculateScore = () => {
        let score = 0;
        questions.forEach((q) => {
            if (selectedAnswers[q.id] === q.correctAnswer) {
                score++;
            }
        });
        return score;
    };

    return (
        <PageTransition className="p-6 md:p-12 max-w-4xl mx-auto min-h-[calc(100vh-4rem)]">

            {/* Header / Input Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-200 pb-8 pt-4">
                <div className="flex-1">
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-3 font-outfit">AI Quiz Generator</h2>
                    <p className="text-[17px] text-slate-500 max-w-xl leading-relaxed font-medium">
                        Test your knowledge. Enter a topic to construct a personalized assessment based on your study materials.
                    </p>
                    <div className="mt-8 flex gap-3 max-w-lg">
                        <div className="relative flex-1 group">
                            <input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. History of ML, Chapter 2 of Biology..."
                                className="w-full h-14 relative bg-slate-50 border border-slate-200 rounded-[18px] pl-5 pr-5 text-[15px] focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-premium-sm"
                                onKeyDown={(e) => e.key === "Enter" && startGeneration()}
                            />
                        </div>
                        <Button
                            size="lg"
                            onClick={startGeneration}
                            disabled={isGenerating || !topic.trim()}
                            className="h-14 px-8 shadow-lg shadow-primary/20 text-base flex-shrink-0 rounded-[18px] font-bold"
                        >
                            {isGenerating ? (
                                <div className="h-5 w-12 flex items-center justify-center">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                </div>
                            ) : "Generate"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Loading Skeleton */}
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-8 pt-4"
                    >
                        {[1, 2, 3].map((i) => (
                            <Card key={`skel-${i}`} className="p-10 pt-12 relative overflow-hidden border-none shadow-soft-lg bg-white/50">
                                <Skeleton className="w-24 h-4 mb-10 absolute top-0 left-0 rounded-br-2xl" />
                                <Skeleton className="w-3/4 h-8 mb-10 mt-2" />
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map((j) => (
                                        <div key={`skel-opt-${j}`} className="w-full p-4 rounded-2xl border border-slate-100 flex items-center gap-4 bg-white/30">
                                            <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                                            <Skeleton className="w-1/2 h-4" />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Questions List */}
            <div className="space-y-10">
                <AnimatePresence mode="popLayout">
                    {questions.length > 0 && !isGenerating && questions.map((q, qIndex) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: qIndex * 0.1, duration: 0.5, ease: "easeOut" }}
                        >
                            <Card className={cn(
                                "transition-all duration-500 p-10 pt-12 relative overflow-hidden border-none shadow-premium-sm",
                                showResults ? "bg-white/90" : "bg-white/60 hover:shadow-soft-lg group"
                            )}>
                                {/* Number Badge */}
                                <div className="absolute top-0 left-0 bg-slate-50 border-b border-r border-slate-100 px-5 py-2.5 rounded-br-2xl">
                                    <span className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                        Question {qIndex + 1}
                                    </span>
                                </div>

                                <h3 className="text-[22px] font-bold text-slate-900 mb-8 leading-relaxed font-outfit">
                                    {q.text}
                                </h3>

                                <div className="space-y-4">
                                    {q.options.map((option, optIndex) => {
                                        const isSelected = selectedAnswers[q.id] === optIndex;
                                        const isCorrect = showResults && optIndex === q.correctAnswer;
                                        const isWrongSelection = showResults && isSelected && optIndex !== q.correctAnswer;

                                        return (
                                            <motion.button
                                                key={optIndex}
                                                onClick={() => handleSelectAnswer(q.id, optIndex)}
                                                whileHover={!showResults ? { x: 5 } : {}}
                                                whileTap={!showResults ? { scale: 0.995 } : {}}
                                                className={cn(
                                                    "w-full text-left p-4 pr-6 rounded-2xl border transition-all duration-300 flex items-center justify-between",
                                                    !showResults && !isSelected && "border-slate-100 bg-white/40 hover:border-primary/30 hover:bg-white text-slate-600",
                                                    !showResults && isSelected && "border-primary bg-primary/5 text-slate-900 font-semibold ring-2 ring-primary/20",
                                                    isCorrect && "border-green-500 bg-green-50 text-green-700 ring-4 ring-green-500/10",
                                                    isWrongSelection && "border-red-300 bg-red-50 text-red-600 ring-4 ring-red-500/5",
                                                    showResults && !isCorrect && !isWrongSelection && "border-slate-50 bg-slate-50/50 text-slate-400 opacity-60",
                                                    showResults ? "cursor-default" : "cursor-pointer"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all font-bold text-sm",
                                                        isSelected && !showResults ? "border-primary bg-primary text-white" : "border-slate-100 bg-slate-50 text-slate-400",
                                                        isCorrect && "border-green-500 bg-green-500 text-white",
                                                        isWrongSelection && "border-red-500 bg-red-500 text-white"
                                                    )}>
                                                        {String.fromCharCode(65 + optIndex)}
                                                    </div>
                                                    <span className="text-base">{option}</span>
                                                </div>
                                                {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 animate-in zoom-in-50 duration-500" />}
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Explanation Banner */}
                                <AnimatePresence>
                                    {showResults && q.explanation && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            className="mt-8 pt-6 border-t border-slate-100 overflow-hidden"
                                        >
                                            <div className="flex gap-3 bg-slate-50 p-5 rounded-2xl">
                                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                                <div className="text-sm">
                                                    <span className="font-bold text-slate-900 block mb-1">Explanation</span>
                                                    <p className="text-slate-500 font-medium leading-relaxed">{q.explanation}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Submit Quiz Area */}
                <AnimatePresence>
                    {questions.length > 0 && !isGenerating && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="pt-12 flex flex-col items-center justify-center border-t border-slate-100 mt-16 pb-20"
                        >
                            {!showResults ? (
                                <div className="text-center space-y-4">
                                    <Button
                                        size="lg"
                                        className="px-16 h-16 text-lg rounded-[22px] shadow-xl shadow-primary/20 font-black tracking-wide"
                                        onClick={() => setShowResults(true)}
                                        disabled={Object.keys(selectedAnswers).length < questions.length}
                                    >
                                        SUBMIT ASSESSMENT
                                    </Button>
                                    <p className="text-sm text-slate-400 font-bold tracking-widest uppercase">
                                        Answer all {questions.length} questions to continue
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center w-full max-w-lg">
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="mb-10 p-10 bg-white border border-slate-100 rounded-[40px] shadow-soft-xl"
                                    >
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Overall Score</p>
                                        <p className="text-7xl font-black text-slate-900 font-outfit">
                                            {calculateScore()}<span className="text-3xl text-slate-200">/{questions.length}</span>
                                        </p>
                                        <div className="mt-8 w-full bg-slate-100 h-2.5 rounded-full relative overflow-hidden">
                                            <motion.div
                                                className="absolute left-0 top-0 h-full bg-primary"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(calculateScore() / questions.length) * 100}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                            />
                                        </div>
                                    </motion.div>
                                    <div className="flex gap-4 justify-center">
                                        <Button
                                            size="lg"
                                            variant="secondary"
                                            className="rounded-2xl px-10 h-14 bg-slate-100 text-slate-600 hover:bg-slate-200 border-none font-bold"
                                            onClick={() => { setQuestions([]); setTopic(""); }}
                                        >
                                            Try Another Topic
                                        </Button>
                                        <Button
                                            size="lg"
                                            className="rounded-2xl px-10 h-14 shadow-lg font-bold"
                                            onClick={startGeneration}
                                        >
                                            Retake Quiz
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State */}
                {!isGenerating && questions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 rounded-[32px] bg-indigo-50 flex items-center justify-center mb-8 border border-indigo-100">
                            <BrainCircuit className="w-12 h-12 text-indigo-500 opacity-60" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-3 font-outfit">Ready to Test Your Knowledge?</h3>
                        <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
                            Once you enter a topic, our AI will scan your study materials and craft a unique assessment for you.
                        </p>
                    </div>
                )}
            </div>

        </PageTransition>
    );
}

