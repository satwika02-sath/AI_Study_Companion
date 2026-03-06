"""
server.py
---------
FastAPI backend that exposes the RAG pipeline over HTTP.

Endpoints:
    POST /upload          – ingest one or more files into ChromaDB
    POST /upload_notes    - alias for /upload
    POST /query           – semantic search over indexed documents
    POST /ask             - retrieve context and explain (tutor)
    POST /ask_ai          - alias for /ask
    POST /quiz            - generate 5 MCQs
    POST /generate_quiz   - alias for /quiz
    POST /flashcards      - generate flashcards
    POST /generate_flashcards - alias for /flashcards
    POST /analyze_repo    - clone and explain GitHub repo
    DELETE /document/{fn} – remove a document from the index
    GET  /stats           – statistics
    GET  /health          – health check

Run with:
    uvicorn server:app --reload --port 8000
"""

import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from rag.rag_pipeline import (
    ingest_uploaded_bytes,
    query as rag_query,
    ask_tutor,
    generate_quiz as rag_generate_quiz,
    generate_flashcards as rag_generate_flashcards,
    remove_document,
    get_stats,
)
from rag.repo_explainer import clone_and_index_repo, explain_repo_architecture, query_repo

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AI Study Companion – RAG API",
    description="Retrieval-Augmented Generation backend for the AI Study Companion.",
    version="1.0.0",
)

# Allow the Next.js dev server (port 3000) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class QueryRequest(BaseModel):
    question: str
    k: int = 5
    source_filter: Optional[str] = None


class ChatRequest(BaseModel):
    question: str
    k: int = 3
    source_filter: Optional[str] = None


class QueryResult(BaseModel):
    content: str
    metadata: dict


class QueryResponse(BaseModel):
    question: str
    results: List[QueryResult]


class ChatResponse(BaseModel):
    question: str
    explanation: str
    sources: List[QueryResult]


class TopicRequest(BaseModel):
    topic: str
    k: int = 5


class UploadResult(BaseModel):
    file_name: str
    pages_loaded: int
    chunks_stored: int
    status: str


class RepoRequest(BaseModel):
    repo_url: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    """Simple health check."""
    return {"status": "ok"}


@app.post("/upload", response_model=List[UploadResult])
async def upload_files(files: List[UploadFile] = File(...)):
    """
    Accept one or more PDF / TXT files, ingest them into FAISS,
    and return ingestion statistics per file.
    """
    results = []
    supported = {".pdf", ".txt"}

    for upload in files:
        suffix = "." + upload.filename.rsplit(".", 1)[-1].lower() if "." in upload.filename else ""
        if suffix not in supported:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type '{suffix}' for '{upload.filename}'. "
                       f"Supported: {supported}",
            )

        file_bytes = await upload.read()

        try:
            result = ingest_uploaded_bytes(file_bytes, upload.filename, save_original=True)
            results.append(result)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process '{upload.filename}': {e}")

    return results


@app.post("/upload_notes", response_model=List[UploadResult])
async def upload_notes_endpoint(files: List[UploadFile] = File(...)):
    """Required alias for note uploads."""
    return await upload_files(files)


@app.post("/query", response_model=QueryResponse)
def query_documents(req: QueryRequest):
    """
    Perform a semantic similarity search over all indexed documents.
    """
    try:
        raw_results = rag_query(req.question, k=req.k, source_filter=req.source_filter)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return QueryResponse(
        question=req.question,
        results=[QueryResult(**r) for r in raw_results],
    )


@app.post("/ask", response_model=ChatResponse)
def ask_ai_tutor(req: ChatRequest):
    """
    Retrieve relevant study material and generate an explanation.
    """
    try:
        result = ask_tutor(
            question=req.question,
            k=req.k,
            source_filter=req.source_filter
        )
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ask_ai", response_model=ChatResponse)
def ask_ai_endpoint(req: ChatRequest):
    """Required alias for AI tutoring."""
    return ask_ai_tutor(req)


@app.post("/quiz")
def generate_quiz_endpoint(req: TopicRequest):
    """Generate 5 MCQs based on a specific topic."""
    try:
        return rag_generate_quiz(topic=req.topic, k=req.k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate_quiz")
def generate_quiz_alias(req: TopicRequest):
    """Required alias for quiz generation."""
    return generate_quiz_endpoint(req)


@app.post("/flashcards")
def generate_flashcards_endpoint(req: TopicRequest):
    """Generate flashcards from relevant study material."""
    try:
        return rag_generate_flashcards(topic=req.topic, k=req.k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate_flashcards")
def generate_flashcards_alias(req: TopicRequest):
    """Required alias for flashcard generation."""
    return generate_flashcards_endpoint(req)


@app.post("/analyze_repo")
def analyze_repo_endpoint(req: RepoRequest):
    """
    Analyze a GitHub repository:
    1. cloner and indexes.
    2. Explains architecture.
    """
    try:
        # Step 1: Clone & Index
        idx = clone_and_index_repo(req.repo_url)
        if "error" in idx:
            raise HTTPException(status_code=500, detail=idx["error"])
        
        # Step 2: Explain
        expl = explain_repo_architecture(req.repo_url)
        if "error" in expl:
            raise HTTPException(status_code=500, detail=expl["error"])
        
        return expl
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/query_repo")
def query_repo_endpoint(req: QueryRequest):
    """Specific query for the currently indexed codebase."""
    try:
        return query_repo(req.question, k=req.k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/document/{file_name}")
def delete_document_endpoint(file_name: str):
    """Remove all indexed chunks for a given file name."""
    try:
        return remove_document(file_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats")
def stats_endpoint():
    """Return status and file list."""
    try:
        return get_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
