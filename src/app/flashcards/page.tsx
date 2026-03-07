"use client";

import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CornerUpRight, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/context/toast-context";
import { useAnalytics } from "@/context/analytics-context";

export default function FlashcardsPage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [topic, setTopic] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [cards, setCards] = useState<{ front: string; back: string }[]>([]);
    const { token } = useAuth();
    const { addToast } = useToast();
    const { trackFlashcard } = useAnalytics();

    const fetchFlashcards = async () => {
        if (!topic.trim()) return;
        setIsGenerating(true);
        try {
            const res = await fetch("/api/flashcards", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ topic, k: 5 })
            });
            const data = await res.json();
            if (data.flashcards) {
                setCards(data.flashcards);
                setCurrentIndex(0);
                setIsFlipped(false);
                addToast(`📚 ${data.flashcards.length} flashcards generated!`, 'success');
                trackFlashcard();
            } else {
                addToast('❌ Could not generate flashcards. Try again.', 'error');
            }
        } catch (err) {
            console.error(err);
            addToast('❌ Flashcard generation failed.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNext = () => {
        if (cards.length === 0) return;
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 200);
    };

    const handlePrev = () => {
        if (cards.length === 0) return;
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        }, 200);
    };

    const handleRestart = () => {
        if (cards.length === 0) return;
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex(0);
        }, 200);
    };

    return (
        <PageTransition className="min-h-[calc(100vh-4rem)] flex flex-col p-6 sm:p-12 relative">

            {/* Header / Input Area */}
            <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-8 gap-6 pt-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 font-outfit">Flashcards</h2>
                    <p className="text-slate-700 mt-1 font-bold">Generate custom cards from your study notes.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Enter topic..."
                            className="w-full h-11 px-5 rounded-full border border-slate-200 bg-white shadow-soft-sm text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:outline-none transition-all text-base font-bold placeholder:text-slate-400"
                            onKeyDown={(e) => e.key === "Enter" && fetchFlashcards()}
                        />
                    </div>
                    <Button
                        size="md"
                        className="rounded-full px-8 h-11 w-full sm:w-auto font-medium"
                        onClick={fetchFlashcards}
                        isLoading={isGenerating}
                    >
                        {isGenerating ? "Generating..." : "Generate"}
                    </Button>
                </div>
            </div>

            {/* Main Flashcard Display */}
            <div className="flex-1 w-full flex flex-col items-center justify-center max-w-4xl mx-auto pb-12">
                {cards.length > 0 ? (
                    <div className="w-full flex flex-col items-center">
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-300 shadow-sm text-xs font-black text-slate-600 mb-6 uppercase tracking-widest">
                            Card {currentIndex + 1} of {cards.length}
                        </div>

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
                                        "shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-shadow duration-500 rounded-[40px] border border-white/50 bg-white/70 backdrop-blur-2xl"
                                    )}
                                    onClick={() => setIsFlipped(!isFlipped)}
                                    style={{ transformStyle: "preserve-3d" }}
                                >
                                    {/* Card Surface */}
                                    <div className="w-full h-full flex flex-col items-center justify-center p-8 sm:p-16 relative">

                                        {/* Labels */}
                                        <span className={cn(
                                            "absolute top-8 left-10 text-[11px] font-black tracking-[0.2em] uppercase",
                                            isFlipped ? "text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20" : "text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
                                        )}>
                                            {isFlipped ? "Answer" : "Question"}
                                        </span>

                                        {/* Flip Hint */}
                                        <div className="absolute top-8 right-10 flex items-center gap-3 text-slate-700 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs font-black tracking-widest uppercase">Flip</span>
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                                                <CornerUpRight className="w-5 h-5" />
                                            </div>
                                        </div>

                                        {/* Main Text */}
                                        <h3 className={cn(
                                            "text-center transition-all duration-300 px-6 sm:px-12",
                                            isFlipped
                                                ? "text-xl sm:text-2xl md:text-3xl text-slate-900 max-w-2xl font-bold leading-[1.6] tracking-tight"
                                                : "text-3xl sm:text-4xl md:text-5xl text-slate-900 max-w-3xl font-black tracking-tighter leading-tight"
                                        )}>
                                            {isFlipped ? cards[currentIndex].back : cards[currentIndex].front}
                                        </h3>

                                        <p className="absolute bottom-10 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] opacity-40">Tap to reveal answer</p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Navigation Controls */}
                        <div className="flex items-center gap-4 sm:gap-8 mt-12 bg-white/80 backdrop-blur-md px-8 py-5 rounded-full shadow-premium-sm border border-slate-100">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-12 h-12 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                                onClick={handlePrev}
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </Button>

                            <div className="w-px h-8 bg-slate-100" />

                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-10 h-10 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                onClick={handleRestart}
                                title="Restart Deck"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </Button>

                            <div className="w-px h-8 bg-slate-100" />

                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-12 h-12 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                onClick={handleNext}
                            >
                                <ArrowRight className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center max-w-md px-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-indigo-500/10 to-primary/10 flex items-center justify-center mb-8 border border-primary/10 shadow-inner">
                            <Sparkles className="w-12 h-12 text-primary opacity-60" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Your Deck is Empty</h3>
                        <p className="text-slate-500 leading-relaxed font-medium">
                            Enter a topic above and let our AI transform your study notes into powerful active-recall flashcards.
                        </p>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
