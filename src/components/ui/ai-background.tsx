"use client";

import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";

export const AIBackground = memo(function AIBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-slate-50 pointer-events-none">
            {/* Optimized Animated Gradient Background */}
            <motion.div
                className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-300/30 blur-[60px]"
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                style={{ willChange: "transform" }}
            />
            <motion.div
                className="absolute top-[10%] -right-[10%] w-[50%] h-[70%] rounded-full bg-purple-300/30 blur-[80px]"
                animate={{
                    x: [0, -40, 0],
                    y: [0, 60, 0],
                }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                style={{ willChange: "transform" }}
            />
            <motion.div
                className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-cyan-300/20 blur-[60px]"
                animate={{
                    x: [0, -30, 0],
                    y: [0, -30, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ willChange: "transform" }}
            />

            {/* Simplified Neural Network SVG */}
            <div className="absolute inset-0 opacity-[0.15]">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="neural-net" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                            <circle cx="20" cy="20" r="1" fill="#94A3B8" />
                            <circle cx="100" cy="50" r="1.5" fill="#94A3B8" />
                            <line x1="20" y1="20" x2="100" y2="50" stroke="#CBD5E1" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#neural-net)" />
                </svg>
            </div>

            {/* Grain/Noise texture for premium feel without heavy filters */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            
            {/* Lighter blend overlay */}
            <div className="absolute inset-0 bg-white/20" />
        </div>
    );
});
