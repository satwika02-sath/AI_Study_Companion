"use client";

import dynamic from "next/dynamic";

const AIBackgroundSync = dynamic(
    () => import("@/components/ui/ai-background").then((mod) => mod.AIBackground),
    { ssr: false }
);

export function ClientBackground() {
    return <AIBackgroundSync />;
}
