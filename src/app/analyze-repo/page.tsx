"use client";

import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Github,
    Terminal,
    FileCode,
    Box,
    Network,
    MessageSquareCode,
    Loader2,
    CheckCircle2,
    Search,
    ChevronRight,
    SearchCode,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface RepoAnalysis {
    summary: string;
    important_files: string[];
    architecture: string;
    repo_url: string;
    indexed_chunks: number;
}

export default function AnalyzeRepoPage() {
    const [repoUrl, setRepoUrl] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
    const [query, setQuery] = useState("");
    const [isQuerying, setIsQuerying] = useState(false);
    const [queryResult, setQueryResult] = useState<string | null>(null);

    const startAnalysis = async () => {
        if (!repoUrl.trim()) return;
        setIsAnalyzing(true);
        setAnalysis(null);
        setQueryResult(null);

        try {
            const res = await fetch("/api/analyze_repo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repo_url: repoUrl })
            });

            const data = await res.json();
            if (res.ok) {
                setAnalysis(data);
            } else {
                alert(data.error || "Analysis failed");
            }
        } catch (err) {
            console.error(err);
            alert("Could not connect to backend");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const runQuery = async () => {
        if (!query.trim() || !analysis) return;
        setIsQuerying(true);
        try {
            const res = await fetch("/api/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: query, k: 3 })
            });
            const data = await res.json();
            if (data.results) {
                // Formatting results for display
                const combined = data.results.map((r: any) =>
                    `### File: ${r.metadata.source}\n${r.content}`
                ).join("\n\n---\n\n");
                setQueryResult(combined);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsQuerying(false);
        }
    };

    return (
        <PageTransition className="p-6 md:p-12 max-w-6xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col space-y-12">

            {/* Header Section */}
            <div className="text-center max-w-3xl mx-auto pt-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-xl"
                >
                    <Github className="w-3 h-3" />
                    GitHub Explainer
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-bold tracking-tight text-slate-900 mb-6 font-outfit"
                >
                    Decrypt Any Codebase
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-[18px] text-slate-500 font-medium leading-relaxed"
                >
                    Paste a GitHub URL to automatically clone, index, and explain the architecture of the repository.
                    Search through the code with semantic queries.
                </motion.p>

                {/* Search Bar */}
                <div className="mt-12 relative max-w-2xl mx-auto">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[28px] blur opacity-25 group-focus-within:opacity-50 transition duration-1000" />
                    <div className="relative flex gap-3">
                        <div className="relative flex-1">
                            <Github className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                placeholder="https://github.com/username/repo"
                                className="w-full h-16 bg-white border border-slate-200 rounded-[24px] pl-14 pr-6 text-[16px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-premium-lg font-mono text-sm"
                                onKeyDown={(e) => e.key === "Enter" && startAnalysis()}
                            />
                        </div>
                        <Button
                            size="lg"
                            className="h-16 px-10 rounded-[24px] shadow-2xl shadow-primary/20 font-black tracking-wide"
                            onClick={startAnalysis}
                            disabled={isAnalyzing || !repoUrl.trim()}
                        >
                            {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : "ANALYZE"}
                        </Button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {isAnalyzing ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="py-20 flex flex-col items-center space-y-8"
                    >
                        <div className="relative">
                            <div className="w-24 h-24 rounded-[32px] bg-slate-100 flex items-center justify-center animate-pulse">
                                <Terminal className="w-10 h-10 text-slate-300" />
                            </div>
                            <div className="absolute -bottom-1 -right-1">
                                <span className="flex h-5 w-5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500"></span>
                                </span>
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-slate-900">Scanning Repository</h3>
                            <p className="text-sm text-slate-400 font-medium tracking-widest uppercase">Cloning • Parsing • Embedding • Analyzing</p>
                        </div>
                    </motion.div>
                ) : analysis ? (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20"
                    >
                        {/* Summary & Files */}
                        <div className="lg:col-span-1 space-y-8">
                            <Card className="p-8 border-none shadow-premium-sm bg-white/60 backdrop-blur-md rounded-[32px]">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <Box className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Project Summary</h3>
                                </div>
                                <p className="text-[15px] leading-relaxed text-slate-700 font-medium">
                                    {analysis.summary}
                                </p>
                            </Card>

                            <Card className="p-8 border-none shadow-premium-sm bg-white/60 backdrop-blur-md rounded-[32px]">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                        <FileCode className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Important Files</h3>
                                </div>
                                <div className="space-y-3">
                                    {analysis.important_files.map((file, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-50 shadow-sm group hover:border-indigo-200 transition-colors">
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                            <span className="text-xs font-mono font-bold text-slate-600 truncate">{file}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-8 border-none shadow-premium-sm bg-slate-900 text-white rounded-[32px]">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <SearchCode className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="font-black text-xs uppercase tracking-widest text-white/50">Semantic Search</h3>
                                    </div>
                                    <Sparkles className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="space-y-4">
                                    <textarea
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Ask about the code..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:bg-white/10 transition-all resize-none h-24"
                                    />
                                    <Button
                                        className="w-full h-12 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs uppercase tracking-widest"
                                        onClick={runQuery}
                                        disabled={isQuerying}
                                    >
                                        {isQuerying ? "Searching..." : "Search Codebase"}
                                    </Button>
                                </div>
                            </Card>
                        </div>

                        {/* Architecture Explanation */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="p-10 border-none shadow-premium-sm bg-white/80 backdrop-blur-xl rounded-[40px] prose prose-slate max-w-none prose-headings:font-outfit prose-headings:font-bold prose-pre:bg-slate-50 prose-pre:text-slate-900 prose-pre:border prose-pre:border-slate-100 pb-20">
                                <div className="flex items-center gap-3 mb-10 not-prose">
                                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                                        <Network className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Architecture Report</h3>
                                        <p className="text-xs font-bold text-slate-900 mt-0.5">{analysis.repo_url.split('/').pop()}</p>
                                    </div>
                                </div>

                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {analysis.architecture}
                                </ReactMarkdown>
                            </Card>

                            <AnimatePresence>
                                {queryResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="not-prose"
                                    >
                                        <Card className="p-10 border-none shadow-premium-lg bg-indigo-900 text-indigo-50 rounded-[40px]">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                                    <MessageSquareCode className="w-5 h-5 text-white" />
                                                </div>
                                                <h3 className="font-black text-xs uppercase tracking-widest text-indigo-300">Semantic Context</h3>
                                            </div>
                                            <div className="prose prose-invert max-w-none text-indigo-100/90 text-sm prose-pre:bg-black/20 prose-pre:border-indigo-700/50">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {queryResult}
                                                </ReactMarkdown>
                                            </div>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-20 flex flex-col items-center justify-center opacity-40 grayscale"
                    >
                        <Github className="w-32 h-32 text-slate-200" />
                        <p className="mt-6 text-sm font-black tracking-widest uppercase text-slate-400">Ready to Analyze</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageTransition>
    );
}
