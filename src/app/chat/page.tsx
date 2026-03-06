"use client";

import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Send, Sparkles, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

const initialMessages: Message[] = [
    {
        id: "1",
        role: "assistant",
        content: "Hi there! I am your AI Study Companion. Ask me a question about your uploaded notes or any general topic you want to learn."
    }
];

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessage: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages((prev) => [...prev, newMessage]);
        setInput("");
        setIsLoading(true);

        // Simulate AI response
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "That's a great question! Based on your context, the key concept here is understanding the dynamic nature of interactive learning. I can expand on specific examples if you'd like."
                }
            ]);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <PageTransition className="p-6 md:p-8 max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">AI Tutor Session</h2>
                    <p className="text-muted-foreground mt-1">Chat intelligently about your study materials.</p>
                </div>
                <Button variant="outline" className="hidden sm:flex">
                    <Search className="w-4 h-4 mr-2" />
                    Search History
                </Button>
            </div>

            <Card className="flex-1 overflow-hidden flex flex-col bg-card shadow-sm border-border relative">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                    }`}
                            >
                                {message.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                            </div>
                            <div
                                className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm ${message.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                                        : "bg-muted/50 border border-border/50 text-foreground rounded-tl-sm prose prose-sm max-w-none"
                                    }`}
                            >
                                {message.role === "assistant" ? (
                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                ) : (
                                    <p>{message.content}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-tl-sm px-5 py-4 flex flex-row items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
                                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-.3s]" />
                                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-.5s]" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-background border-t border-border">
                    <div className="relative">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask a question..."
                            className="w-full bg-muted/50 border border-input rounded-full pl-5 pr-14 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
                        />
                        <Button
                            size="icon"
                            className="absolute right-1.5 top-1.5 h-10 w-10 rounded-full"
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </PageTransition>
    );
}
