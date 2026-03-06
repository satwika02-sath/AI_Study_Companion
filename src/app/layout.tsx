import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Study Companion",
  description: "A modern, intelligent study companion for your notes and quizzes.",
};

import { Topbar } from "@/components/layout/topbar";
import { AIBackground } from "@/components/ui/ai-background";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased text-slate-800 leading-relaxed min-h-screen flex flex-col relative`}
      >
        <AIBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
            <Topbar />
            <main className="flex-1 w-full flex flex-col pt-4 pb-12">
            {children}
            </main>
        </div>
      </body>
    </html>
  );
}
