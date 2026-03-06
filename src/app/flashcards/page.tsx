"use client";

import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

export default function FlashcardsPage() {
    const [isFlipped, setIsFlipped] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const cards = [
        { q: "What is Backpropagation?", a: "An algorithm used in artificial neural networks to calculate a gradient that is needed in the calculation of the weights to be used in the network." },
        { q: "Define supervised learning.", a: "A machine learning paradigm where the model is trained on labeled data." },
        { q: "What is overfitting?", a: "When a model learns the detail and noise in the training data to the extent that it negatively impacts performance on new data." },
    ];

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 150);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        }, 150);
    };

    return (
        <PageTransition className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 flex flex-col items-center h-[calc(100vh-4rem)]">
            <div className="w-full text-center mt-8 mb-4">
                <h2 className="text-3xl font-bold tracking-tight">Flashcards</h2>
                <p className="text-muted-foreground mt-2">Topic: Machine Learning Fundamentals</p>
            </div>

            <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center -mt-20">
                <div className="relative w-full aspect-[3/2] perspective-[1000px]">
                    <AnimatePresence initial={false} mode="wait">
                        <motion.div
                            key={currentIndex + (isFlipped ? "-flipped" : "-front")}
                            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="absolute inset-0 w-full h-full cursor-pointer"
                            onClick={() => setIsFlipped(!isFlipped)}
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            <div
                                className={`w-full h-full flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 rounded-3xl border border-border shadow-md bg-card transition-shadow hover:shadow-lg`}
                            >
                                <span className="absolute top-6 left-6 text-sm font-medium text-muted-foreground">
                                    {isFlipped ? "Answer" : "Question"}
                                </span>
                                <span className="absolute top-6 right-6 text-sm font-medium text-muted-foreground">
                                    {currentIndex + 1} / {cards.length}
                                </span>

                                <h3 className="text-2xl sm:text-3xl md:text-4xl text-center font-medium leading-tight">
                                    {isFlipped ? cards[currentIndex].a : cards[currentIndex].q}
                                </h3>

                                <p className="absolute bottom-6 text-sm text-muted-foreground opacity-60">Click card to flip</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-6 mt-12">
                    <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={handlePrev}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-muted-foreground">
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={handleNext}>
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </PageTransition>
    );
}
