"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PageTransition } from "@/components/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type UploadState = "idle" | "uploading" | "success" | "error";

interface UploadFile {
    file: File;
    id: string;
    progress: number;
    status: UploadState;
}

export default function UploadPage() {
    const [files, setFiles] = useState<UploadFile[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map((file) => ({
            file,
            id: Math.random().toString(36).substring(7),
            progress: 0,
            status: "idle" as UploadState,
        }));

        setFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
        },
        maxSize: 10485760, // 10MB
    });

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const simulateUpload = (fileId: string) => {
        setFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, status: "uploading", progress: 0 } : f))
        );

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 15) + 5;

            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setFiles((prev) =>
                    prev.map((f) => (f.id === fileId ? { ...f, status: "success", progress: 100 } : f))
                );
            } else {
                setFiles((prev) =>
                    prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
                );
            }
        }, 200);
    };

    const handleProcessAll = () => {
        files.forEach((f) => {
            if (f.status === "idle") {
                simulateUpload(f.id);
            }
        });
    };

    return (
        <PageTransition className="p-6 md:p-12 max-w-4xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-center">

            <div className="text-center mb-10 w-full max-w-2xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold tracking-tight text-slate-900 mb-4"
                >
                    Upload Study Notes
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-slate-500"
                >
                    Add PDF documents to your smart knowledge base. Our AI tutor will process the material to help you learn faster.
                </motion.p>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <Card className="border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <CardContent className="p-1">
                        <div
                            {...getRootProps()}
                            className={cn(
                                "relative rounded-xl p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ease-in-out border-2 border-dashed m-1 bg-slate-50/50 hover:bg-slate-50",
                                isDragActive
                                    ? "border-primary bg-primary/5 scale-[0.98]"
                                    : "border-slate-200 hover:border-slate-300"
                            )}
                        >
                            <input {...getInputProps()} />

                            <motion.div
                                className={cn(
                                    "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 shadow-sm",
                                    isDragActive ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-white text-primary border border-slate-100"
                                )}
                                animate={{ y: isDragActive ? -10 : 0 }}
                            >
                                <UploadCloud className="w-10 h-10" />
                            </motion.div>

                            <div className="space-y-2 relative z-10">
                                <p className="text-xl font-semibold text-slate-900">
                                    {isDragActive ? "Drop your PDF here..." : "Drag & drop your PDF here"}
                                </p>
                                <p className="text-sm text-slate-500 font-medium">
                                    {isDragActive ? "Ready to upload" : "or click anywhere to browse your files"}
                                </p>
                                <div className="pt-4 flex items-center justify-center w-full">
                                    <span className="text-xs uppercase tracking-wider font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 inline-block shadow-sm">
                                        PDF Only (Max 10MB)
                                    </span>
                                </div>
                            </div>

                            {/* Decorative background glow on drag */}
                            <AnimatePresence>
                                {isDragActive && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 pointer-events-none rounded-xl"
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="mt-8 max-w-2xl mx-auto w-full">
                <AnimatePresence>
                    {files.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
                            <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2 mb-4 px-2">
                                Files Queue ({files.length})
                            </h3>

                            <div className="space-y-3">
                                <AnimatePresence>
                                    {files.map((fileObj) => (
                                        <motion.div
                                            key={fileObj.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            layout
                                        >
                                            <Card className="overflow-hidden border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] bg-white">
                                                <div className="p-4 flex items-center gap-4 relative bg-white z-10">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-sm",
                                                        fileObj.status === "success"
                                                            ? "bg-green-100 text-green-600"
                                                            : "bg-blue-50 text-blue-500 border border-blue-100/50"
                                                    )}>
                                                        {fileObj.status === "success" ? (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                            >
                                                                <CheckCircle2 className="w-6 h-6" />
                                                            </motion.div>
                                                        ) : (
                                                            <FileText className="w-6 h-6" />
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <p className="font-semibold text-slate-900 truncate">{fileObj.file.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-xs font-medium text-slate-500">
                                                                {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                            {fileObj.status === "uploading" && (
                                                                <>
                                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                                    <motion.span
                                                                        className="text-xs font-bold text-primary"
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                    >
                                                                        {fileObj.progress}%
                                                                    </motion.span>
                                                                </>
                                                            )}
                                                            {fileObj.status === "success" && (
                                                                <>
                                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                                    <span className="text-xs font-bold text-green-600">Complete</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {fileObj.status !== "uploading" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeFile(fileObj.id)}
                                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full shrink-0"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                {/* Animated Progress Bar */}
                                                <div className="h-1.5 w-full bg-slate-50 relative overflow-hidden">
                                                    <motion.div
                                                        className={cn(
                                                            "absolute top-0 left-0 h-full origin-left",
                                                            fileObj.status === "success" ? "bg-green-500" : "bg-primary"
                                                        )}
                                                        initial={{ scaleX: 0 }}
                                                        animate={{ scaleX: fileObj.progress / 100 }}
                                                        transition={{ ease: "linear", duration: 0.2 }}
                                                    />
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {files.some(f => f.status === "idle") && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-end pt-4"
                                >
                                    <Button
                                        size="lg"
                                        className=" shadow-md shadow-primary/20 px-8 py-6 text-base font-semibold w-full sm:w-auto"
                                        onClick={handleProcessAll}
                                    >
                                        Upload and Process Files
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}
