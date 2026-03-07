"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps, AnimatePresence } from "framer-motion";
import React, { useState, useRef, MouseEvent } from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, onClick, ...props }, ref) => {
        const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
        const buttonRef = useRef<HTMLButtonElement | null>(null);

        // Merge refs
        const setRefs = (element: HTMLButtonElement) => {
            buttonRef.current = element;
            if (typeof ref === "function") ref(element);
            else if (ref) ref.current = element;
        };

        const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
            if (buttonRef.current && !isLoading && !props.disabled) {
                const rect = buttonRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const newRipple = { x, y, id: Date.now() };
                setRipples((prev) => [...prev, newRipple]);

                setTimeout(() => {
                    setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
                }, 600); // 600ms corresponds to animation duration
            }

            if (onClick) {
                onClick(e);
            }
        };

        const variants = {
            primary: "bg-primary text-primary-foreground shadow-sm hover:shadow-[0_4px_14px_0_rgb(0,118,255,0.39)] hover:bg-primary/90",
            secondary: "bg-muted text-foreground shadow-sm hover:bg-muted/80",
            outline: "border border-border bg-transparent hover:bg-muted text-foreground",
            ghost: "bg-transparent text-foreground hover:bg-muted hover:shadow-sm",
            danger: "bg-red-500 text-white shadow-sm hover:shadow-[0_4px_14px_0_rgb(239,68,68,0.39)] hover:bg-red-600",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2",
            lg: "h-12 px-8 text-lg",
            icon: "h-10 w-10 flex items-center justify-center",
        };

        return (
            <motion.button
                ref={setRefs}
                onClick={handleClick}
                whileHover={{ scale: 1.02, y: -1, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                whileTap={{ scale: 0.96, y: 1 }}
                className={cn(
                    "relative overflow-hidden inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || props.disabled}
                {...(props as HTMLMotionProps<"button">)}
            >
                <AnimatePresence>
                    {ripples.map((ripple) => (
                        <motion.span
                            key={ripple.id}
                            initial={{ scale: 0, opacity: 0.35 }}
                            animate={{ scale: 4, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={cn(
                                "absolute rounded-full bg-current pointer-events-none",
                                // Adjust size based on button size to ensure ripple covers it
                                "w-32 h-32 -ml-16 -mt-16"
                            )}
                            style={{
                                left: ripple.x,
                                top: ripple.y,
                            }}
                        />
                    ))}
                </AnimatePresence>

                <span className="relative flex items-center justify-center z-10 w-full h-full pointer-events-none">
                    {isLoading ? (
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : null}
                    {children}
                </span>
            </motion.button>
        );
    }
);
Button.displayName = "Button";

export { Button };
