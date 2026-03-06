"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AIBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-slate-50 pointer-events-none">
            {/* Vibrant Animated Gradient Background for stronger glass effect */}
            <motion.div
                className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-300/40 blur-[120px]"
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute top-[10%] -right-[10%] w-[50%] h-[70%] rounded-full bg-purple-300/40 blur-[150px]"
                animate={{
                    x: [0, -80, 0],
                    y: [0, 100, 0],
                    scale: [1, 1.05, 1],
                }}
                transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-cyan-300/30 blur-[120px]"
                animate={{
                    x: [0, -50, 0],
                    y: [0, -50, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Neural Network SVG Lines Pattern */}
            <div className="absolute inset-0 opacity-[0.25]">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="neural-net" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                            <circle cx="20" cy="20" r="1.5" fill="#94A3B8" />
                            <circle cx="80" cy="40" r="2" fill="#94A3B8" />
                            <circle cx="40" cy="80" r="1.5" fill="#94A3B8" />
                            <line x1="20" y1="20" x2="80" y2="40" stroke="#CBD5E1" strokeWidth="0.5" />
                            <line x1="80" y1="40" x2="40" y2="80" stroke="#CBD5E1" strokeWidth="0.5" />
                            <line x1="40" y1="80" x2="20" y2="20" stroke="#CBD5E1" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#neural-net)" />
                </svg>
            </div>

            {/* Floating Geometric Shapes */}
            <motion.div
                className="absolute top-1/4 left-1/4 w-32 h-32 border border-blue-200/30 rounded-full"
                animate={{ y: [0, -30, 0], rotate: [0, 45, 0], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-1/3 right-1/4 w-48 h-48 border border-slate-300/30 rounded-3xl"
                animate={{ y: [0, 40, 0], rotate: [0, -30, 0], opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Translucent overlay to blend everything */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />
        </div>
    );
}
