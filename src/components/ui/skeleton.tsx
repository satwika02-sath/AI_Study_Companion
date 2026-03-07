import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export function Skeleton({ className, ...props }: HTMLMotionProps<"div">) {
    return (
        <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0.8 }}
            transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1.2,
                ease: "easeInOut",
            }}
            className={cn("rounded-md bg-slate-200/60 dark:bg-slate-800/60", className)}
            {...props}
        />
    );
}
