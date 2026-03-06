"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-3xl flex flex-col items-center"
      >
        <div className="inline-flex items-center space-x-2 bg-muted/50 px-3 py-1 rounded-full text-sm font-medium text-muted-foreground mb-8 border border-border">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Intelligent Learning Platform</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-foreground mb-6">
          Your personal <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary/80 to-primary">AI Study Companion</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Upload your notes, interact with an AI tutor, generate intelligent quizzes, and master concepts faster with interactive flashcards.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg group">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/upload">
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg">
              <BrainCircuit className="mr-2 w-5 h-5" />
              Try Demo
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
