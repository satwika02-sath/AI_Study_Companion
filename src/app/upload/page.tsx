"use client";

import { useState, useCallback, useEffect, memo } from "react";
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
    Layers,
    Copy,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/context/toast-context";
import { useAnalytics } from "@/context/analytics-context";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Client Cache ─────────────────────────────────────────────────────────────
let statsCache: VectorStats | null = null;
let lastStatsFetch = 0;
const CACHE_TTL = 30000; // 30 seconds

// ─── Types ────────────────────────────────────────────────────────────────────
type UploadStatus = "idle" | "uploading" | "success" | "error";

interface FileEntry {
    file: File;
    status: UploadStatus;
    result?: { pages_loaded: number; chunks_stored: number; preview?: string };
    error?: string;
}

interface VectorStats {
    collection_name: string;
    total_chunks: number;
    persist_directory: string;
    uploaded_files: string[];
}

// ─── Memoized Sub-components ──────────────────────────────────────────────────

const IndexStatusCard = memo(({ stats, error }: { stats: VectorStats | null; error: boolean }) => (
    <Card className="border-none shadow-premium-sm bg-white/40 backdrop-blur-md overflow-hidden relative group">
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
            {error ? (
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
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white/20 p-5 rounded-2xl border border-white/40">
                            <Skeleton className="h-3 w-20 mb-3" />
                            <Skeleton className="h-8 w-12" />
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
    </Card>
));
IndexStatusCard.displayName = "IndexStatusCard";

const QueueItem = memo(({ entry, onRemove }: { entry: FileEntry; onRemove: (name: string) => void }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        layout
        className="group"
    >
        <Card className={cn(
            "overflow-hidden border-none shadow-premium-sm transition-all duration-500",
            entry.status === "success" ? "bg-white/70" : "bg-white/40"
        )}>
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-6 min-w-0">
                    <div className={cn(
                        "w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 shadow-lg transition-all duration-500 group-hover:scale-105 group-hover:rotate-3",
                        entry.status === "success"
                            ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                            : entry.status === "uploading"
                                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                                : "bg-white text-slate-400 border border-slate-100"
                    )}>
                        {entry.status === "uploading" ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                        ) : entry.status === "success" ? (
                            <CheckCircle2 className="w-8 h-8" />
                        ) : entry.status === "error" ? (
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        ) : (
                            <FileText className="w-8 h-8" />
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="text-xl font-black text-slate-900 truncate font-outfit leading-tight mb-2">
                            {entry.file.name}
                        </p>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-slate-400 tracking-wider">{(entry.file.size / 1024 / 1024).toFixed(2)} MB</span>
                            {entry.status === "success" && entry.result && (
                                <>
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">
                                        {entry.result.chunks_stored} Vectors
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {(entry.status === "idle" || entry.status === "error") && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(entry.file.name)}
                        className="w-12 h-12 rounded-2xl hover:bg-red-50 hover:text-red-500 text-slate-300 transition-all duration-300"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                )}
            </div>

            <AnimatePresence>
                {entry.status === "success" && entry.result?.preview && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="px-6 pb-6 overflow-hidden"
                    >
                        <div className="relative group/preview">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 backdrop-blur-xl rounded-[32px] border border-white shadow-inner pointer-events-none" />
                            
                            <div className="relative p-7 space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Context Extraction</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Primary Segment Preview</p>
                                        </div>
                                    </div>
                                    <CopyButton text={entry.result.preview} />
                                </div>
                                
                                <div className="text-[15px] leading-[1.8] text-slate-700 font-medium whitespace-pre-wrap selection:bg-indigo-100 selection:text-indigo-900 font-outfit">
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 1, delay: 0.3 }}
                                    >
                                        {entry.result.preview}
                                    </motion.span>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 opacity-20" />
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Processed by AI Tutor Engine</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {entry.status === "uploading" && (
                <div className="h-1.5 bg-slate-100 w-full relative overflow-hidden">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        style={{ width: "50%" }}
                    />
                </div>
            )}
        </Card>
    </motion.div>
));
QueueItem.displayName = "QueueItem";

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className={cn(
                "h-10 px-4 rounded-2xl border transition-all duration-300 group/copy",
                copied 
                    ? "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600" 
                    : "bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:border-blue-300 hover:text-blue-600 shadow-sm"
            )}
        >
            {copied ? (
                <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 animate-in zoom-in duration-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Saved</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <Copy className="w-4 h-4 transition-transform group-hover/copy:scale-110" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Copy</span>
                </div>
            )}
        </Button>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function UploadPage() {
    const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { token } = useAuth();
    const { addToast } = useToast();
    const { trackUpload } = useAnalytics();
    const [stats, setStats] = useState<VectorStats | null>(statsCache);
    const [statsError, setStatsError] = useState(false);

    const fetchStats = useCallback(async (force = false) => {
        // Don't attempt if auth token isn't ready yet
        if (!token) return;

        const now = Date.now();
        if (!force && statsCache && (now - lastStatsFetch < CACHE_TTL)) {
            return;
        }

        try {
            const res = await fetch("/api/stats", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
                statsCache = data;
                lastStatsFetch = now;
                setStatsError(false);
            } else if (res.status === 401) {
                // Auth not ready yet — don't show backend offline, just retry
                setStatsError(false);
            } else {
                // Genuine non-OK server error (5xx)
                setStatsError(true);
            }
        } catch {
            // Network error means server is truly unreachable
            setStatsError(true);
        }
    }, [token]);

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
            "text/plain": [".txt"],
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
            "image/bmp": [".bmp"],
            "image/tiff": [".tiff"]
        },
        maxSize: 10 * 1024 * 1024,
    });

    const removeFile = useCallback((name: string) => {
        setFileEntries((prev) => prev.filter((e) => e.file.name !== name));
    }, []);

    const processFiles = async () => {
        const pending = fileEntries.filter((e) => e.status === "idle");
        if (!pending.length) return;

        setIsProcessing(true);
        for (const entry of pending) {
            setFileEntries(prev => prev.map(e => e.file.name === entry.file.name ? { ...e, status: "uploading" } : e));
            try {
                const formData = new FormData();
                formData.append("files", entry.file);
                const res = await fetch("/api/upload", { 
                    method: "POST", 
                    body: formData,
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Upload failed");
                const result = Array.isArray(data) ? data[0] : data;
                setFileEntries(prev => prev.map(e => e.file.name === entry.file.name ? { ...e, status: "success", result } : e));
                addToast(`✅ "${entry.file.name}" uploaded & indexed successfully!`, 'success');
                trackUpload();
            } catch (err) {
                setFileEntries(prev => prev.map(e => e.file.name === entry.file.name ? { ...e, status: "error", error: (err as any).message } : e));
                addToast(`❌ Failed to upload "${entry.file.name}"`, 'error');
            }
        }
        setIsProcessing(false);
        fetchStats(true);
    };

    const pendingCount = fileEntries.filter((e) => e.status === "idle").length;

    return (
        <PageTransition className="p-6 md:p-12 max-w-5xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col space-y-10">
            <div className="text-center max-w-2xl mx-auto pt-4">
                <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-4 font-outfit">Knowledge Base</h2>
                <p className="text-[17px] text-slate-600 font-semibold leading-relaxed">
                    Upload your PDF documents and study notes. Our AI tutor will index the content
                    to provide personalized answers, quizzes, and flashcards.
                </p>
            </div>

            <IndexStatusCard stats={stats} error={statsError} />

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="relative">
                <div
                    {...getRootProps()}
                    className={cn(
                        "relative rounded-[40px] p-16 sm:p-24 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500 ease-in-out border-2 border-dashed bg-white/40 hover:bg-white/60",
                        isDragActive ? "border-primary bg-primary/5 scale-[0.99] shadow-premium-lg" : "border-slate-200 hover:border-primary/30"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className={cn(
                        "w-24 h-24 rounded-[32px] flex items-center justify-center mb-10 transition-all duration-500 shadow-premium-sm",
                        isDragActive ? "bg-primary text-white scale-110" : "bg-white text-primary border border-slate-100"
                    )}>
                        <UploadCloud className="w-12 h-12" />
                    </div>
                    <div className="space-y-3 relative z-10">
                        <h3 className="text-3xl font-black text-slate-900 font-outfit">{isDragActive ? "Drop to Index" : "Deploy Your Knowledge"}</h3>
                        <p className="text-[17px] text-slate-500 font-medium max-w-sm mx-auto">Click to browse or drag and drop files here</p>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {fileEntries.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-6 pb-20">
                        <div className="flex items-center justify-between px-4">
                            <h3 className="text-sm font-black tracking-[0.2em] text-slate-400 uppercase flex items-center gap-3">
                                <Layers className="w-4 h-4" /> Queue ({fileEntries.length})
                            </h3>
                            {pendingCount > 0 && (
                                <Button size="lg" className="rounded-2xl px-10 h-14 shadow-xl shadow-primary/20 font-bold" onClick={processFiles} disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5 mr-3" /> Process Documents</>}
                                </Button>
                            )}
                        </div>
                        <div className="grid gap-4">
                            {fileEntries.map((entry) => (
                                <QueueItem key={entry.file.name} entry={entry} onRemove={removeFile} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageTransition>
    );
}
