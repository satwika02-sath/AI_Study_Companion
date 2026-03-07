import { NextRequest, NextResponse } from "next/server";

const RAG_BACKEND_URL = process.env.RAG_BACKEND_URL ?? "http://localhost:8000";

/**
 * GET /api/stats
 * Fetch ChromaDB collection statistics and list of uploaded files.
 */
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        const backendRes = await fetch(`${RAG_BACKEND_URL}/stats`, {
            headers: authHeader ? { "Authorization": authHeader } : {}
        });
        const data = await backendRes.json();
        if (!backendRes.ok) {
            return NextResponse.json({ error: data.detail ?? "Stats fetch failed" }, { status: backendRes.status });
        }
        return NextResponse.json(data, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Could not reach the RAG backend." }, { status: 503 });
    }
}
