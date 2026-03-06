"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PageTransition } from "@/components/page-transition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UploadPage() {
    const [files, setFiles] = useState<File[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "text/plain": [".txt"],
        },
    });

    const removeFile = (name: string) => {
        setFiles((prev) => prev.filter((file) => file.name !== name));
    };

    return (
        <PageTransition className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Upload Notes</h2>
                <p className="text-muted-foreground mt-2">
                    Upload your PDFs or text files to add them to your knowledge base. Our AI tutor will study them to assist you.
                </p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 ease-in-out",
                            isDragActive
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                    >
                        <input {...getInputProps()} />
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <UploadCloud className="w-8 h-8 text-primary" />
                        </div>
                        {isDragActive ? (
                            <p className="text-xl font-medium">Drop the files here ...</p>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xl font-medium">Drag & drop files here, or click to select files</p>
                                <p className="text-sm text-muted-foreground">Supported formats: PDF, TXT (Max size: 10MB)</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {files.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Ready for Processing ({files.length})
                    </h3>
                    <div className="grid gap-3">
                        {files.map((file) => (
                            <Card key={file.name} className="py-3 px-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm leading-none">{file.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeFile(file.name)}>
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            </Card>
                        ))}
                    </div>
                    <div className="flex justify-end mt-6">
                        <Button size="lg" className="px-8 shadow-sm">
                            Process {files.length} Document{files.length > 1 ? "s" : ""}
                        </Button>
                    </div>
                </div>
            )}
        </PageTransition>
    );
}
