import { NextRequest, NextResponse } from "next/server";

const RAG_BACKEND_URL = process.env.RAG_BACKEND_URL ?? "http://localhost:8000";

/**
 * POST /api/analyze_repo
 * Proxy GitHub URL to Python backend for cloning and architectural analysis.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const backendRes = await fetch(`${RAG_BACKEND_URL}/analyze_repo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(
                { error: data.error || data.detail || "Repository analysis failed" },
                { status: backendRes.status }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[API /analyze_repo] Error:", message);
        return NextResponse.json(
            { error: "Could not reach the RAG backend. Is the Python server running?" },
            { status: 503 }
        );
    }
}
