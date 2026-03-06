"use client";

import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BrainCircuit, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Question = {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
};

const mockQuestions: Question[] = [
    {
        id: 1,
        text: "What is the primary function of an activation function in a neural network?",
        options: [
            "To initialize the weights of the network",
            "To introduce non-linearity into the output of a neuron",
            "To calculate the loss function",
            "To backpropagate the errors"
        ],
        correctAnswer: 1,
    },
    {
        id: 2,
        text: "Which of the following is an example of unsupervised learning?",
        options: [
            "Predicting house prices based on features",
            "Classifying emails as spam or not spam",
            "Grouping customers based on purchasing behavior",
            "Translating English text to French"
        ],
        correctAnswer: 2,
    },
    {
        id: 3,
        text: "What does the term 'overfitting' refer to in machine learning?",
        options: [
            "When a model performs well on training data but poorly on unseen data",
            "When a model is too simple to capture the underlying trend",
            "When training data is too small to build a reliable model",
            "The process of stopping training early to save computation"
        ],
        correctAnswer: 0,
    }
];

export default function QuizPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);

    const startGeneration = () => {
        setIsGenerating(true);
        setQuestions([]);
        setShowResults(false);
        setSelectedAnswers({});

        // Simulate API delay
        setTimeout(() => {
            setIsGenerating(false);
            setQuestions(mockQuestions);
        }, 2500);
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

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-200 pb-8">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">AI Quiz Generator</h2>
                    <p className="text-lg text-slate-500 max-w-xl">
                        Test your knowledge. Click generate to construct a personalized assessment based on your current study materials.
                    </p>
                </div>
                <Button
                    size="lg"
                    onClick={startGeneration}
                    disabled={isGenerating}
                    className="h-14 px-8 shadow-md shadow-primary/20 text-base flex-shrink-0"
                >
                    {isGenerating ? (
                        <>
                            <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <BrainCircuit className="w-5 h-5 mr-2" />
                            Generate Quiz
                        </>
                    )}
                </Button>
            </div>

            {/* Loading Skeleton Animation */}
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6 pt-4"
                    >
                        {[1, 2, 3].map((i) => (
                            <Card key={`skel-${i}`} className="p-8 pt-10 rounded-[24px] border-slate-100/50 shadow-sm relative overflow-hidden bg-white/50">
                                <div className="absolute top-0 left-0 bg-slate-50 border-b border-r border-slate-100/50 px-4 py-2 rounded-br-2xl">
                                    <Skeleton className="w-20 h-3" />
                                </div>

                                <Skeleton className="w-3/4 h-7 mb-8 mt-2" />

                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map((j) => (
                                        <div key={`skel-opt-${j}`} className="w-full p-4 rounded-xl border border-slate-100 flex items-center gap-3">
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
            <div className="space-y-8">
                <AnimatePresence mode="popLayout">
                    {questions.map((q, qIndex) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: qIndex * 0.15, duration: 0.5, ease: "easeOut" }}
                        >
                            <Card className="bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 p-8 pt-10 relative overflow-hidden rounded-[24px]">

                                {/* Question Number Badge */}
                                <div className="absolute top-0 left-0 bg-slate-50 border-b border-r border-slate-100 px-4 py-2 rounded-br-2xl">
                                    <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                        Question {qIndex + 1}
                                    </span>
                                </div>

                                <h3 className="text-xl font-semibold text-slate-900 mb-6 leading-relaxed">
                                    {q.text}
                                </h3>

                                <div className="space-y-3">
                                    {q.options.map((option, optIndex) => {
                                        const isSelected = selectedAnswers[q.id] === optIndex;
                                        const isCorrect = showResults && optIndex === q.correctAnswer;
                                        const isWrongSelection = showResults && isSelected && optIndex !== q.correctAnswer;
                                        const isMissedCorrect = showResults && !isSelected && optIndex === q.correctAnswer;

                                        return (
                                            <motion.button
                                                key={optIndex}
                                                onClick={() => handleSelectAnswer(q.id, optIndex)}
                                                whileHover={!showResults ? { scale: 1.01, x: 4 } : {}}
                                                whileTap={!showResults ? { scale: 0.99 } : {}}
                                                className={cn(
                                                    "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group",
                                                    !showResults && !isSelected && "border-slate-200 hover:border-primary/50 hover:bg-slate-50 text-slate-600 hover:text-slate-900",
                                                    !showResults && isSelected && "border-primary bg-primary/5 text-primary ring-1 ring-primary",
                                                    isCorrect && "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500",
                                                    isWrongSelection && "border-red-300 bg-red-50 text-red-600",
                                                    showResults && !isCorrect && !isWrongSelection && "border-slate-100 bg-slate-50/50 text-slate-400 opacity-50 cursor-default",
                                                    showResults ? "cursor-default" : "cursor-pointer"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                                                        isSelected && !showResults ? "border-primary bg-primary text-white" : "border-slate-300 group-hover:border-primary/50",
                                                        isCorrect && "border-transparent bg-green-500 text-white",
                                                        isWrongSelection && "border-transparent bg-red-500 text-white"
                                                    )}>
                                                        <span className="text-xs font-semibold">
                                                            {String.fromCharCode(65 + optIndex)}
                                                        </span>
                                                    </div>
                                                    <span className="text-[15px]">{option}</span>
                                                </div>

                                                {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Submit Quiz Area */}
                <AnimatePresence>
                    {questions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="pt-8 flex flex-col items-center justify-center border-t border-slate-200 mt-12"
                        >
                            {!showResults ? (
                                <Button
                                    size="lg"
                                    className="px-12 h-14 text-lg rounded-full shadow-lg shadow-primary/20"
                                    onClick={() => setShowResults(true)}
                                    disabled={Object.keys(selectedAnswers).length < questions.length}
                                >
                                    Submit & Check Answers
                                </Button>
                            ) : (
                                <div className="text-center">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="mb-6 p-6 bg-white border border-slate-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] inline-block"
                                    >
                                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Final Score</p>
                                        <p className="text-5xl font-black text-slate-900">
                                            {calculateScore()} <span className="text-2xl text-slate-300">/ {questions.length}</span>
                                        </p>
                                    </motion.div>
                                    <div className="flex gap-4 justify-center">
                                        <Button variant="outline" size="lg" className="rounded-full px-8" onClick={() => setShowResults(false)}>
                                            Review Current
                                        </Button>
                                        <Button size="lg" className="rounded-full px-8 shadow-md" onClick={startGeneration}>
                                            Generate Another Quiz
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </PageTransition>
    );
}
