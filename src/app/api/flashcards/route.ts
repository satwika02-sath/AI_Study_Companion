import { NextRequest, NextResponse } from "next/server";

const RAG_BACKEND_URL = process.env.RAG_BACKEND_URL ?? "http://localhost:8000";

/**
 * POST /api/flashcards
 * Generates flashcards from study notes.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const backendRes = await fetch(`${RAG_BACKEND_URL}/flashcards`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await backendRes.json();
        if (!backendRes.ok) return NextResponse.json({ error: data.detail ?? "Flashcard generation failed" }, { status: backendRes.status });
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Could not reach the RAG backend." }, { status: 503 });
    }
}
