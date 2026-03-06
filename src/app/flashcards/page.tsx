"use client";

import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CornerUpRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const deck = [
    {
        id: 1,
        front: "What is Backpropagation?",
        back: "An algorithm used in artificial neural networks to calculate a gradient that is needed in the calculation of the weights to be used in the network."
    },
    {
        id: 2,
        front: "Define supervised learning.",
        back: "A machine learning paradigm where the model is trained on labeled data to map inputs to specific outputs."
    },
    {
        id: 3,
        front: "What is overfitting?",
        back: "When a statistical model or machine learning algorithm learns the detail and noise in the training data to the extent that it negatively impacts the performance of the model on new data."
    },
    {
        id: 4,
        front: "What is a Convolutional Neural Network (CNN)?",
        back: "A class of deep neural networks, most commonly applied to analyzing visual imagery through filters and pooling."
    }
];

export default function FlashcardsPage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % deck.length);
        }, 200);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
        }, 200);
    };

    const handleRestart = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex(0);
        }, 200);
    };

    return (
        <PageTransition className="min-h-[calc(100vh-4rem)] flex flex-col p-6 sm:p-12 relative">

            {/* Header */}
            <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Flashcards</h2>
                    <p className="text-slate-500 mt-1">Topic: Deep Learning Fundamentals</p>
                </div>

                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm text-sm font-medium text-slate-600">
                    Card {currentIndex + 1} of {deck.length}
                </div>
            </div>

            {/* Main Flashcard Container */}
            <div className="flex-1 w-full flex flex-col items-center justify-center max-w-4xl mx-auto pb-12">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[500px] perspective-[1500px]">
                    <AnimatePresence initial={false} mode="wait">
                        <motion.div
                            key={currentIndex + (isFlipped ? "-back" : "-front")}
                            initial={{
                                rotateY: isFlipped ? -90 : 90,
                                opacity: 0,
                                scale: 0.95
                            }}
                            animate={{
                                rotateY: 0,
                                opacity: 1,
                                scale: 1
                            }}
                            exit={{
                                rotateY: isFlipped ? 90 : -90,
                                opacity: 0,
                                scale: 0.95
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20
                            }}
                            className={cn(
                                "absolute inset-0 w-full h-full cursor-pointer touch-manipulation group",
                                "shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.12)] transition-shadow duration-500 rounded-[32px] sm:rounded-[40px] border border-white/50 bg-white/70 backdrop-blur-2xl"
                            )}
                            onClick={() => setIsFlipped(!isFlipped)}
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            {/* Card Surface */}
                            <div className="w-full h-full flex flex-col items-center justify-center p-8 sm:p-16 relative">

                                {/* Labels */}
                                <span className={cn(
                                    "absolute top-8 left-8 text-sm font-bold tracking-widest uppercase",
                                    isFlipped ? "text-primary" : "text-slate-400"
                                )}>
                                    {isFlipped ? "Answer" : "Question"}
                                </span>

                                {/* Flip Hint */}
                                <div className="absolute top-8 right-8 flex items-center gap-2 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <span className="text-sm font-medium">Flip</span>
                                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                                        <CornerUpRight className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Main Text */}
                                <h3 className={cn(
                                    "text-center leading-relaxed font-medium",
                                    isFlipped
                                        ? "text-2xl sm:text-3xl text-slate-700 max-w-2xl font-normal leading-relaxed tracking-wide"
                                        : "text-3xl sm:text-4xl md:text-5xl text-slate-900 max-w-3xl font-bold tracking-tight"
                                )}>
                                    {isFlipped ? deck[currentIndex].back : deck[currentIndex].front}
                                </h3>

                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center gap-4 sm:gap-8 mt-12 bg-white/60 backdrop-blur-md px-6 py-4 rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/50">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 rounded-full text-slate-500 hover:text-slate-900 hover:bg-white/50"
                        onClick={handlePrev}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>

                    <div className="w-px h-8 bg-slate-200" />

                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 rounded-full text-slate-400 hover:text-slate-900 hover:bg-white/50"
                        onClick={handleRestart}
                        title="Restart Deck"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </Button>

                    <div className="w-px h-8 bg-slate-200" />

                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 rounded-full text-slate-500 hover:text-slate-900 hover:bg-white/50"
                        onClick={handleNext}
                    >
                        <ArrowRight className="w-6 h-6" />
                    </Button>
                </div>

            </div>
        </PageTransition>
    );
}
