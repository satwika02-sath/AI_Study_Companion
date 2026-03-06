import { NextRequest, NextResponse } from "next/server";

const RAG_BACKEND_URL = process.env.RAG_BACKEND_URL ?? "http://localhost:8000";

/**
 * POST /api/upload
 * Proxies file uploads from the Next.js frontend to the Python RAG backend.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Forward the exact same multipart form to the Python server
    const backendRes = await fetch(`${RAG_BACKEND_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.detail ?? "Upload failed" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[API /upload] Error:", message);
    return NextResponse.json(
      { error: "Could not reach the RAG backend. Is the Python server running?" },
      { status: 503 }
    );
  }
}
