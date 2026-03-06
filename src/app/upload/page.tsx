"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PageTransition } from "@/components/page-transition";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    UploadCloud,
    FileText,
    CheckCircle2,
    X,
    Loader2,
    Database,
    AlertCircle,
    Sparkles,
    Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface FileEntry {
    file: File;
    status: UploadStatus;
    result?: { pages_loaded: number; chunks_stored: number };
    error?: string;
}

interface VectorStats {
    collection_name: string;
    total_chunks: number;
    persist_directory: string;
    uploaded_files: string[];
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function UploadPage() {
    const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [stats, setStats] = useState<VectorStats | null>(null);
    const [statsError, setStatsError] = useState(false);

    // Fetch vector DB stats from the FastAPI backend
    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch("/api/stats");
            if (res.ok) {
                setStats(await res.json());
                setStatsError(false);
            } else {
                setStatsError(true);
            }
        } catch {
            setStatsError(true);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFileEntries((prev) => [
            ...prev,
            ...acceptedFiles
                .filter((f) => !prev.some((e) => e.file.name === f.name))
                .map((f) => ({ file: f, status: "idle" as UploadStatus })),
        ]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "text/plain": [".txt"]
        },
        maxSize: 10 * 1024 * 1024, // 10MB
    });

    const removeFile = (name: string) => {
        setFileEntries((prev) => prev.filter((e) => e.file.name !== name));
    };

    const processFiles = async () => {
        const pending = fileEntries.filter((e) => e.status === "idle");
        if (!pending.length) return;

        setIsProcessing(true);

        for (const entry of pending) {
            // Update UI to show processing
            setFileEntries((prev) =>
                prev.map((e) =>
                    e.file.name === entry.file.name ? { ...e, status: "uploading" } : e
                )
            );

            try {
                const formData = new FormData();
                formData.append("files", entry.file);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error ?? "Insignificant data or unsupported format.");
                }

                // API returns an array of results
                const result = Array.isArray(data) ? data[0] : data;

                setFileEntries((prev) =>
                    prev.map((e) =>
                        e.file.name === entry.file.name
                            ? { ...e, status: "success", result }
                            : e
                    )
                );
            } catch (err) {
                const message = err instanceof Error ? err.message : "Upload error";
                setFileEntries((prev) =>
                    prev.map((e) =>
                        e.file.name === entry.file.name
                            ? { ...e, status: "error", error: message }
                            : e
                    )
                );
            }
        }

        setIsProcessing(false);
        fetchStats(); // Refresh DB stats
    };

    const pendingCount = fileEntries.filter((e) => e.status === "idle").length;
    const successCount = fileEntries.filter((e) => e.status === "success").length;

    return (
        <PageTransition className="p-6 md:p-12 max-w-5xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col space-y-10">

            {/* Header Section */}
            <div className="text-center max-w-2xl mx-auto pt-4">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold tracking-tight text-slate-900 mb-4 font-outfit"
                >
                    Knowledge Base
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-[17px] text-slate-500 font-medium leading-relaxed"
                >
                    Upload your PDF documents and study notes. Our AI tutor will index the content
                    to provide personalized answers, quizzes, and flashcards.
                </motion.p>
            </div>

            {/* Vector DB Status Card */}
            <Card className="border-none shadow-premium-sm bg-white/40 backdrop-blur-md overflow-hidden relative group">
                {/* Decorative border bottom */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 w-full opacity-50" />

                <CardHeader className="pb-4 pt-6 border-b border-white/40 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-black tracking-widest text-slate-800 flex items-center gap-3 uppercase">
                        <Database className="w-5 h-5 text-blue-500" />
                        Index Status
                    </CardTitle>
                    {stats && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-wider">Live</span>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="pt-8 pb-8">
                    {statsError ? (
                        <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600">
                            <AlertCircle className="w-6 h-6 shrink-0" />
                            <div className="text-sm">
                                <p className="font-bold">Backend Offline</p>
                                <p className="opacity-80">Please ensure the Python server is running on port 8000.</p>
                            </div>
                        </div>
                    ) : stats ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <div className="bg-white/40 p-5 rounded-2xl border border-white/60 shadow-inner">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Segments</p>
                                <p className="text-3xl font-black text-slate-900 font-outfit">{stats.total_chunks}</p>
                            </div>
                            <div className="bg-white/40 p-5 rounded-2xl border border-white/60 shadow-inner">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Source Files</p>
                                <p className="text-3xl font-black text-slate-900 font-outfit">{stats.uploaded_files.length}</p>
                            </div>
                            <div className="bg-white/40 p-5 rounded-2xl border border-white/60 shadow-inner">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Storage</p>
                                <p className="text-sm font-bold text-slate-600 mt-2 truncate max-w-full">FAISS ({stats.persist_directory})</p>
                            </div>

                            {stats.uploaded_files.length > 0 && (
                                <div className="col-span-full pt-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Indexed Documents</p>
                                    <div className="flex flex-wrap gap-2">
                                        {stats.uploaded_files.map((filename) => (
                                            <div key={filename} className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 hover:border-primary/20 transition-colors">
                                                <FileText className="w-4 h-4 text-primary" />
                                                <span className="text-xs font-bold text-slate-700">{filename}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 gap-3">
                            <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Waking up RAG engine...</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Drop Zone */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
            >
                <div
                    {...getRootProps()}
                    className={cn(
                        "relative rounded-[40px] p-16 sm:p-24 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500 ease-in-out border-2 border-dashed bg-white/40 hover:bg-white/60",
                        isDragActive
                            ? "border-primary bg-primary/5 scale-[0.99] shadow-premium-lg"
                            : "border-slate-200 hover:border-primary/30"
                    )}
                >
                    <input {...getInputProps()} />

                    <motion.div
                        className={cn(
                            "w-24 h-24 rounded-[32px] flex items-center justify-center mb-10 transition-all duration-500 shadow-premium-sm",
                            isDragActive ? "bg-primary text-white scale-110" : "bg-white text-primary border border-slate-100"
                        )}
                        animate={{ y: isDragActive ? -15 : 0 }}
                    >
                        <UploadCloud className="w-12 h-12" />
                    </motion.div>

                    <div className="space-y-3 relative z-10">
                        <h3 className="text-3xl font-black text-slate-900 font-outfit">
                            {isDragActive ? "Drop to Index" : "Deploy Your Knowledge"}
                        </h3>
                        <p className="text-[17px] text-slate-500 font-medium max-w-sm mx-auto">
                            {isDragActive ? "Your documents are ready for processing" : "Drag & drop PDF study notes or click to browse files"}
                        </p>
                        <div className="pt-8 flex items-center justify-center gap-3">
                            <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 bg-white/80 px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">
                                PDF Documents
                            </span>
                            <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 bg-white/80 px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">
                                Max 10MB
                            </span>
                        </div>
                    </div>

                    {/* Drag Aura */}
                    <AnimatePresence>
                        {isDragActive && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 pointer-events-none rounded-[40px]"
                            />
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* File Management Section */}
            <AnimatePresence>
                {fileEntries.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 pt-6 pb-20"
                    >
                        <div className="flex items-center justify-between px-4">
                            <h3 className="text-sm font-black tracking-[0.2em] text-slate-400 uppercase flex items-center gap-3">
                                <Layers className="w-4 h-4" />
                                Processing Queue ({fileEntries.length})
                            </h3>
                            {pendingCount > 0 && (
                                <Button
                                    size="lg"
                                    className="rounded-2xl px-10 h-14 shadow-xl shadow-primary/20 font-bold"
                                    onClick={processFiles}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Indexing...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="w-5 h-5" />
                                            <span>Process {pendingCount} Document{pendingCount !== 1 ? "s" : ""}</span>
                                        </div>
                                    )}
                                </Button>
                            )}
                        </div>

                        <div className="grid gap-4">
                            {fileEntries.map((entry) => (
                                <motion.div
                                    key={entry.file.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    layout
                                >
                                    <Card className={cn(
                                        "overflow-hidden border-none shadow-soft-sm transition-all duration-300",
                                        entry.status === "success" ? "bg-emerald-50/40" : "bg-white/60"
                                    )}>
                                        <div className="p-5 flex items-center justify-between">
                                            <div className="flex items-center gap-5 min-w-0">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-105",
                                                    entry.status === "success"
                                                        ? "bg-emerald-500 text-white"
                                                        : entry.status === "uploading"
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-slate-100 text-slate-400"
                                                )}>
                                                    {entry.status === "uploading" ? (
                                                        <Loader2 className="w-7 h-7 animate-spin" />
                                                    ) : entry.status === "success" ? (
                                                        <CheckCircle2 className="w-7 h-7" />
                                                    ) : entry.status === "error" ? (
                                                        <AlertCircle className="w-7 h-7 text-red-500" />
                                                    ) : (
                                                        <FileText className="w-7 h-7" />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-lg font-bold text-slate-900 truncate font-outfit leading-none mb-2">
                                                        {entry.file.name}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-slate-400">{(entry.file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                        {entry.status === "success" && entry.result && (
                                                            <>
                                                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                                                                    ✓ {entry.result.chunks_stored} Vector Chunks
                                                                </span>
                                                            </>
                                                        )}
                                                        {entry.status === "error" && (
                                                            <span className="text-xs font-bold text-red-500">{entry.error}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {(entry.status === "idle" || entry.status === "error") && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeFile(entry.file.name)}
                                                    className="w-10 h-10 rounded-full hover:bg-red-50 hover:text-red-500 text-slate-300 transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </Button>
                                            )}
                                        </div>

                                        {/* Progress Bar (Visual Only for feel) */}
                                        {entry.status === "uploading" && (
                                            <div className="h-1 bg-blue-100 w-full relative overflow-hidden">
                                                <motion.div
                                                    className="absolute inset-0 bg-blue-500"
                                                    initial={{ x: "-100%" }}
                                                    animate={{ x: "0%" }}
                                                    transition={{ duration: 3, repeat: Infinity }}
                                                />
                                            </div>
                                        )}
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </PageTransition>
    );
}
