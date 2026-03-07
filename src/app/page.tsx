"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, MessageSquare, Layers, Code } from "lucide-react";

export default function LandingPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);

  const features = [
    {
      title: "AI Tutor",
      description: "Get contextual explanations and dynamic study assistance 24/7.",
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Quiz Generator",
      description: "Instantly create tailored quizzes to test retention and mastery.",
      icon: BrainCircuit,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Flashcards",
      description: "Interactive, spaced-repetition flashcards to memorize anything.",
      icon: Layers,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Codebase Explainer",
      description: "Upload your snippets and let AI break down logic step-by-step.",
      icon: Code,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 relative overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ y: y1 }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-400/15 rounded-full blur-[150px] pointer-events-none"
        animate={{
          x: [0, -40, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{ y: y2 }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8 flex flex-col items-center">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-4xl mb-32"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium text-slate-600 mb-8 border border-white/40 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>Platform v2.0 Live</span>
          </motion.div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[1.1]">
            AI Study Companion
          </h1>

          <p className="text-xl sm:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-12">
            Multimodal AI Tutor for Smarter Learning
          </p>

          <Link href="/dashboard">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Button size="lg" className="h-16 px-10 text-xl font-semibold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all bg-slate-900 text-white hover:bg-slate-800">
                Get Started
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Features Section */}
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">Core Features</h2>
            <p className="text-lg text-slate-500">Everything you need to accelerate your understanding.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="h-full bg-white/70 backdrop-blur-xl border border-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 group cursor-default">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
