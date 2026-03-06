"use client";

import { useState, useRef, useEffect } from "react";
import { PageTransition } from "@/components/page-transition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, User, FileText, ArrowDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

const initialMessages: Message[] = [
    {
        id: "1",
        role: "assistant",
        content: "Hi there! I am your **AI Study Companion**. \n\nYou can ask me questions about your uploaded notes, or we can discuss any topic you want to learn. For example, you could ask me to:\n- *Explain a complex concept*\n- *Summarize a chapter*\n- *Write a code snippet for an algorithm*"
    }
];

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = () => {
        if (!input.trim() || isLoading) return;

        const newMessage: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages((prev) => [...prev, newMessage]);
        setInput("");
        setIsLoading(true);

        // Simulate AI response stream
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "That's an excellent question! Let's break it down step by step:\n\n### 1. The Core Concept\nFirst, we need to understand the fundamental principles. When you look at how standard algorithms are structured, they often follow a specific pattern of execution.\n\n```python\ndef example_function(data):\n    # Here is a typical block of code\n    result = []\n    for item in data:\n        if item.is_valid():\n            result.append(item.process())\n    return result\n```\n\n### 2. Application\nNotice how the `is_valid()` check prevents unnecessary processing. This is a common optimization technique."
                }
            ]);
            setIsLoading(false);
        }, 2000);
    };

    return (
        <PageTransition className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col items-center">

            {/* Header */}
            <div className="w-full text-center mb-6 mt-4">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">AI Tutor</h2>
                <p className="text-slate-500 mt-2 max-w-lg mx-auto">
                    Your personal learning assistant. Ask questions, request summaries, or get code explained.
                </p>
            </div>

            {/* Chat Container */}
            <Card className="flex-1 w-full flex flex-col bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-100 overflow-hidden relative">

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
                    <AnimatePresence initial={false}>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                            >
                                {/* Avatar */}
                                <div
                                    className={cn(
                                        "w-9 h-9 flex items-center justify-center shrink-0 shadow-sm",
                                        message.role === "user"
                                            ? "bg-slate-900 text-white rounded-[14px]"
                                            : "bg-gradient-to-br from-blue-500 to-primary text-white rounded-[14px]"
                                    )}
                                >
                                    {message.role === "user" ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                                </div>

                                {/* Message Bubble */}
                                <div
                                    className={cn(
                                        "max-w-[85%] sm:max-w-[75%] px-5 py-4 text-[15px] leading-relaxed",
                                        message.role === "user"
                                            ? "bg-slate-100 text-slate-900 rounded-[24px] rounded-tr-[8px]"
                                            : "bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] text-slate-800 rounded-[24px] rounded-tl-[8px] prose prose-slate prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-50 prose-pre:text-slate-800 prose-pre:border prose-pre:border-slate-100"
                                    )}
                                >
                                    {message.role === "assistant" ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {message.content}
                                        </ReactMarkdown>
                                    ) : (
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex gap-4 flex-row"
                            >
                                <div className="w-9 h-9 flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br from-blue-500 to-primary text-white rounded-[14px]">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-[24px] rounded-tl-[8px] px-5 py-5 flex items-center gap-1.5 h-[52px]">
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                        className="w-1.5 h-1.5 rounded-full bg-slate-400"
                                    />
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                        className="w-1.5 h-1.5 rounded-full bg-slate-400"
                                    />
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                        className="w-1.5 h-1.5 rounded-full bg-slate-400"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} className="h-2" />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100 mb-2">
                    <div className="relative group max-w-3xl mx-auto flex items-end gap-2">
                        <Button variant="outline" size="icon" className="h-[52px] w-[52px] rounded-2xl shrink-0 text-slate-400 hover:text-slate-600 border-slate-200">
                            <FileText className="w-5 h-5" />
                        </Button>

                        <div className="relative flex-1">
                            {/* Input Glow Effect */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-primary/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />

                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Message AI Tutor..."
                                className="w-full relative bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-14 py-3.5 text-[15px] focus:outline-none focus:bg-white focus:border-slate-300 transition-all resize-none min-h-[52px] max-h-32 shadow-sm"
                                rows={1}
                            />

                            <Button
                                size="icon"
                                className={cn(
                                    "absolute right-1.5 bottom-1.5 h-[40px] w-[40px] rounded-xl transition-all shadow-sm",
                                    input.trim() ? "bg-primary text-white hover:bg-slate-800" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                )}
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">
                        AI can make mistakes. Consider verifying important information.
                    </p>
                </div>
            </Card>

        </PageTransition>
    );
}
