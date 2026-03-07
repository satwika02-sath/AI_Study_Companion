import { NextRequest, NextResponse } from "next/server";

const RAG_BACKEND_URL = process.env.RAG_BACKEND_URL ?? "http://localhost:8000";

/**
 * POST /api/quiz
 * Generates MCQs from retrieved study material.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const authHeader = req.headers.get("authorization");
        
        const backendRes = await fetch(`${RAG_BACKEND_URL}/quiz`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                ...(authHeader ? { "Authorization": authHeader } : {})
            },
            body: JSON.stringify(body),
        });
        const data = await backendRes.json();
        if (!backendRes.ok) return NextResponse.json({ error: data.detail ?? "Quiz generation failed" }, { status: backendRes.status });
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Could not reach the RAG backend." }, { status: 503 });
    }
}
