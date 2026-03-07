"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { PageTransition } from "@/components/page-transition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, User, FileText, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/context/toast-context";

// Lazy load heavy components
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

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

// Memoized Message Bubble
const MessageBubble = memo(({ message }: { message: Message }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
        >
            <div
                className={cn(
                    "w-9 h-9 flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-110",
                    message.role === "user"
                        ? "bg-slate-900 text-white rounded-[14px]"
                        : "bg-gradient-to-br from-blue-500 to-primary text-white rounded-[14px]"
                )}
            >
                {message.role === "user" ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>

            <div
                className={cn(
                    "max-w-[85%] sm:max-w-[75%] px-5 py-4 text-[15px] leading-relaxed shadow-sm",
                    message.role === "user"
                        ? "bg-slate-100 text-slate-900 rounded-[24px] rounded-tr-[8px] border border-slate-200/50"
                        : "bg-white backdrop-blur-md border border-slate-100 text-slate-900 rounded-[24px] rounded-tl-[8px] prose prose-slate prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-50 prose-pre:text-slate-900 prose-pre:border prose-pre:border-slate-100"
                )}
            >
                {message.role === "assistant" ? (
                    <ReactMarkdown>
                        {message.content}
                    </ReactMarkdown>
                ) : (
                    <p className="whitespace-pre-wrap font-medium">{message.content}</p>
                )}
            </div>
        </motion.div>
    );
});

MessageBubble.displayName = "MessageBubble";

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isTtsEnabled, setIsTtsEnabled] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const { token } = useAuth();
    const { addToast } = useToast();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, scrollToBottom]);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = "en-US";

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
                
                let userMessage = "Microphone error: " + event.error;
                
                if (event.error === 'not-allowed') {
                    userMessage = "🎤 Microphone permission denied. Please allow access in your browser settings.";
                } else if (event.error === 'network') {
                    userMessage = "🌐 Network error during speech recognition.";
                } else if (event.error === 'no-speech') {
                    userMessage = "🔇 No speech detected. Please try again.";
                } else if (event.error === 'service-not-allowed') {
                    userMessage = "❌ Speech service not allowed. Check browser compatibility or HTTPS requirements.";
                }
                
                addToast(userMessage, "error");
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [addToast]);

    const toggleListening = () => {
        if (typeof window !== "undefined" && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            addToast("⚠️ Speech Recognition often requires HTTPS for non-localhost connections.", "warning");
        }

        if (isListening) {
            try {
                recognitionRef.current?.stop();
            } catch (e) {
                console.error("Error stopping recognition:", e);
            }
            setIsListening(false);
        } else {
            if (!recognitionRef.current) {
                addToast("❌ Speech recognition not supported or initialization failed.", "error");
                return;
            }
            try {
                recognitionRef.current.start();
                setIsListening(true);
                addToast("🎙️ Listening...", "success");
            } catch (e) {
                console.error("Error starting recognition:", e);
                // If it's already started, just set state
                setIsListening(true);
            }
        }
    };

    const speak = useCallback((text: string) => {
        if (!isTtsEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
        
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
    }, [isTtsEnabled]);

    const handleSend = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const currentInput = input;
        const userMsg: Message = { id: Date.now().toString(), role: "user", content: currentInput };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/ask", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ question: currentInput, k: 3 })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to get response");

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.explanation
            };
            setMessages((prev) => [...prev, aiMsg]);
            
            // Trigger TTS
            speak(data.explanation);

        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "I couldn't connect to the AI Tutor backend.";
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: `⚠️ **Error**: ${errorMessage}`
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, token, speak]);

    return (
        <PageTransition className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col items-center">

            {/* Header */}
            <div className="w-full text-center mb-6 mt-4 relative">
                <h2 className="text-3xl font-black tracking-tight text-slate-900">AI Tutor</h2>
                <p className="text-slate-700 mt-2 max-w-lg mx-auto font-bold">
                    Your personal learning assistant. Ask questions, request summaries, or get code explained.
                </p>

                {/* TTS Toggle Overlay */}
                <div className="absolute right-0 top-0">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                            "rounded-full transition-all duration-300",
                            isTtsEnabled ? "bg-primary/10 text-primary" : "text-slate-400"
                        )}
                        onClick={() => {
                            if (typeof window !== "undefined" && window.speechSynthesis) {
                                setIsTtsEnabled(!isTtsEnabled);
                                if (!isTtsEnabled) {
                                    addToast("🔊 Voice response enabled", "success");
                                } else {
                                    window.speechSynthesis.cancel();
                                    addToast("🔇 Voice response disabled", "success");
                                }
                            } else {
                                addToast("❌ Text-to-Speech not supported in this browser.", "error");
                            }
                        }}
                    >
                        {isTtsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {/* Chat Container */}
            <Card className="flex-1 w-full flex flex-col overflow-hidden relative border-none shadow-premium-sm bg-white/40 backdrop-blur-sm">

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 scroll-smooth">
                    <AnimatePresence initial={false}>
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="flex gap-4 flex-row"
                            >
                                <div className="w-9 h-9 flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br from-blue-500 to-primary text-white rounded-[14px]">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="bg-white/60 backdrop-blur-md border border-slate-100 shadow-sm rounded-[24px] rounded-tl-[8px] px-5 py-5 flex items-center gap-1.5 h-[52px]">
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                        className="w-1.5 h-1.5 rounded-full bg-blue-500"
                                    />
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                        className="w-1.5 h-1.5 rounded-full bg-blue-500"
                                    />
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                        className="w-1.5 h-1.5 rounded-full bg-blue-500"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} className="h-2" />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/60 backdrop-blur-md border-t border-slate-100 mb-2">
                    <div className="relative group max-w-3xl mx-auto flex items-end gap-2">
                        
                        {/* Voice Input Button */}
                        <div className="relative">
                            <AnimatePresence>
                                {isListening && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1.5, opacity: 0.3 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="absolute inset-0 bg-red-400 rounded-2xl blur-xl"
                                    />
                                )}
                            </AnimatePresence>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={toggleListening}
                                className={cn(
                                    "h-[52px] w-[52px] rounded-2xl shrink-0 transition-all duration-300 relative z-10",
                                    isListening 
                                        ? "bg-red-500 text-white border-red-400 hover:bg-red-600 shadow-lg shadow-red-200" 
                                        : "text-slate-400 hover:text-slate-600 border-slate-200 bg-white"
                                )}
                            >
                                {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
                            </Button>
                        </div>

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
                                placeholder={isListening ? "Listening..." : "Message AI Tutor..."}
                                className="w-full relative bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-14 py-3.5 text-[15px] font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-slate-300 transition-all resize-none min-h-[52px] max-h-32 shadow-sm placeholder:text-slate-400"
                                rows={1}
                            />

                            <Button
                                size="icon"
                                className={cn(
                                    "absolute right-1.5 bottom-1.5 h-[40px] w-[40px] rounded-xl transition-all shadow-sm",
                                    input.trim() ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                )}
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <p className="text-center text-[11px] text-slate-400 mt-3 font-medium flex items-center justify-center gap-2">
                        {isSpeaking && <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-primary animate-pulse"/> AI is speaking...</span>}
                        <span>AI can make mistakes. Consider verifying important information.</span>
                    </p>
                </div>
            </Card>

        </PageTransition>
    );
}
