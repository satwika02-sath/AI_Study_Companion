import { NextRequest, NextResponse } from "next/server";

const RAG_BACKEND_URL = process.env.RAG_BACKEND_URL ?? "http://localhost:8000";

/**
 * POST /api/ask
 * Proxy the AI Tutor question + context generation.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const authHeader = req.headers.get("authorization");

        const backendRes = await fetch(`${RAG_BACKEND_URL}/ask`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                ...(authHeader ? { "Authorization": authHeader } : {})
            },
            body: JSON.stringify(body),
        });

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(
                { error: data.detail ?? "Tutor query failed" },
                { status: backendRes.status }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[API /ask] Error:", message);
        return NextResponse.json(
            { error: "Could not reach the RAG backend. Is the Python server running?" },
            { status: 503 }
        );
    }
}
