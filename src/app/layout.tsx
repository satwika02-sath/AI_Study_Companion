import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Study Companion",
  description: "A modern, intelligent study companion for your notes and quizzes.",
};

import { Topbar } from "@/components/layout/topbar";
import { ClientBackground } from "@/components/ui/client-background";
import { AuthProvider } from "@/components/auth-provider";
import { ToastProvider } from "@/context/toast-context";
import { ToastContainer } from "@/components/ui/toast-container";
import { PlanProvider } from "@/context/plan-context";
import { AnalyticsProvider } from "@/context/analytics-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased text-slate-800 leading-relaxed min-h-screen flex flex-col relative`}
      >
        <AuthProvider>
          <ToastProvider>
            <PlanProvider>
              <AnalyticsProvider>
                <ClientBackground />
                <div className="relative z-10 flex flex-col min-h-screen">
                  <Topbar />
                  <main className="flex-1 w-full flex flex-col pt-4 pb-12">
                    {children}
                  </main>
                </div>
                <ToastContainer />
              </AnalyticsProvider>
            </PlanProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
