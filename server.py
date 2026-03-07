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

import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"  # Fix Intel OpenMP crash on Windows

import asyncio
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from rag.auth import get_current_user, User

from rag.rag_pipeline import (
    ingest_uploaded_bytes,
    ingest_file,
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

@app.on_event("startup")
async def startup_event():
    """
    Validate that critical environment variables exist at startup.
    """
    api_key = os.getenv("AI_API_KEY")
    if not api_key:
        print("\n" + "!"*60)
        print("FATAL ERROR: AI_API_KEY is missing from environment variables.")
        print("Please check your .env file and add AI_API_KEY=your_key")
        print("!"*60 + "\n")
        # Forcing a graceful shutdown of the process by raising a SystemExit-like error 
        # is complex in uvicorn's event loop, but get_llm will also raise a RuntimeError.
        # We'll print a loud warning here.

# Allow the Next.js dev server (port 3000) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
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
    pages_loaded: Optional[int] = None
    chunks_stored: int
    status: str
    preview: Optional[str] = None


# ─── Result Cache (In-Memory) ────────────────────────────────────────────────
# Persistent during server lifetime to speed up repeated queries/quizzes
_result_cache = {}

def get_cache_key(endpoint: str, payload: dict, user_id: str) -> str:
    import json
    # Sort keys for deterministic hashing
    payload_str = json.dumps(payload, sort_keys=True)
    return f"{user_id}:{endpoint}:{payload_str}"

def sanitize_repo_url(url: str) -> str:
    """
    Cleans up common URL mangling patterns.
    - Double prepending: https://githubhttps://github.com
    - Mangled prefix: githuhttps://github.com
    - Extra characters/whitespace
    """
    url = url.strip()
    # If the URL contains multiple "https://github.com", take the last clean one
    if "https://github.com" in url:
        parts = url.split("https://github.com")
        clean_path = parts[-1].strip()
        # Remove trailing .git and any accidental prefix characters
        # Sometimes it looks like 'b/username/repo' if sliced poorly
        if clean_path.startswith('b'):
             clean_path = clean_path[1:]
        if clean_path.startswith('/'):
             clean_path = clean_path[1:]
        
        return f"https://github.com/{clean_path}"
    
    return url

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
async def upload_files(
    files: List[UploadFile] = File(...),
    user: User = Depends(get_current_user)
):
    """
    Accept PDF, TXT, or Image files, ingest them via MAS (with OCR if needed),
    and return ingestion statistics.
    """
    results = []
    supported = {".pdf", ".txt", ".docx", ".png", ".jpg", ".jpeg", ".bmp", ".tiff"}

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
            # 1. Save and get path
            file_path = ingest_uploaded_bytes(file_bytes, upload.filename, save_original=True, user_id=user.uid)
            # 2. Agentic Ingestion (Async)
            result = await ingest_file(file_path, user_id=user.uid)
            
            # 3. Cache Invalidation: Only clear relevant entries if possible, 
            # but for now we'll just be more targeted or log clearly.
            global _result_cache
            # Invalidate all cache for this user since their data has changed
            keys_to_remove = [k for k in _result_cache.keys() if k.startswith(f"{user.uid}:")]
            for k in keys_to_remove:
                _result_cache.pop(k, None)
            
            print(f"[Server] Cache invalidated for user {user.uid} due to new ingestion.")
            
            results.append(UploadResult(**result))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process '{upload.filename}': {e}")

    return results


@app.post("/upload_notes", response_model=List[UploadResult])
async def upload_notes_endpoint(
    files: List[UploadFile] = File(...),
    user: User = Depends(get_current_user)
):
    """Required alias for note uploads."""
    return await upload_files(files, user)


@app.post("/query", response_model=QueryResponse)
async def query_documents(req: QueryRequest, user: User = Depends(get_current_user)):
    """
    Perform a semantic similarity search over all indexed documents.
    """
    try:
        # Offload synchronous RAG query to a thread
        raw_results = await asyncio.to_thread(
            rag_query, req.question, k=req.k, source_filter=req.source_filter, user_id=user.uid
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return QueryResponse(
        question=req.question,
        results=[QueryResult(**r) for r in raw_results],
    )


@app.post("/ask", response_model=ChatResponse)
async def ask_ai_tutor(req: ChatRequest, user: User = Depends(get_current_user)):
    """
    Retrieve relevant study material and generate an explanation via MAS.
    """
    cache_key = get_cache_key("ask", req.dict(), user.uid)
    if cache_key in _result_cache:
        print("[Server] Returning cached ASK response.")
        return ChatResponse(**_result_cache[cache_key])

    try:
        result = await ask_tutor(
            question=req.question,
            k=req.k,
            source_filter=req.source_filter,
            user_id=user.uid
        )
        _result_cache[cache_key] = result
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ask_ai", response_model=ChatResponse)
async def ask_ai_endpoint(req: ChatRequest, user: User = Depends(get_current_user)):
    """Required alias for AI tutoring."""
    # Ensure call to ask_ai_tutor is awaited correctly
    return await ask_ai_tutor(req, user)


@app.post("/quiz")
async def generate_quiz_endpoint(req: TopicRequest, user: User = Depends(get_current_user)):
    """Generate 5 MCQs based on a specific topic via Assessment Agent."""
    cache_key = get_cache_key("quiz", req.dict(), user.uid)
    if cache_key in _result_cache:
        print("[Server] Returning cached QUIZ response.")
        return _result_cache[cache_key]

    try:
        res = await rag_generate_quiz(topic=req.topic, k=req.k, user_id=user.uid)
        _result_cache[cache_key] = res
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate_quiz")
async def generate_quiz_alias(req: TopicRequest, user: User = Depends(get_current_user)):
    """Required alias for quiz generation."""
    return await generate_quiz_endpoint(req, user)


@app.post("/flashcards")
async def generate_flashcards_endpoint(req: TopicRequest, user: User = Depends(get_current_user)):
    """Generate flashcards via Assessment Agent."""
    cache_key = get_cache_key("flashcards", req.dict(), user.uid)
    if cache_key in _result_cache:
        print("[Server] Returning cached FLASHCARDS response.")
        return _result_cache[cache_key]

    try:
        res = await rag_generate_flashcards(topic=req.topic, k=req.k, user_id=user.uid)
        _result_cache[cache_key] = res
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate_flashcards")
async def generate_flashcards_alias(req: TopicRequest, user: User = Depends(get_current_user)):
    """Required alias for flashcard generation."""
    return await generate_flashcards_endpoint(req, user)


@app.post("/analyze_repo")
async def analyze_repo_endpoint(req: RepoRequest, user: User = Depends(get_current_user)):
    """
    Analyze a GitHub repository:
    1. cloner and indexes.
    2. Explains architecture.
    """
    try:
        # Step 1: Clone & Index - Sanitize URL first
        sanitized_url = sanitize_repo_url(req.repo_url)
        print(f"[Server] Analyzing repo: {sanitized_url} (Original: {req.repo_url})")
        
        idx = await asyncio.to_thread(clone_and_index_repo, sanitized_url, user_id=user.uid)
        if "error" in idx:
            raise HTTPException(status_code=500, detail=idx["error"])
        
        # Step 2: Explain
        expl = await explain_repo_architecture(sanitized_url, user_id=user.uid)
        if "error" in expl:
            raise HTTPException(status_code=500, detail=expl["error"])
        
        return expl
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/query_repo")
async def query_repo_endpoint(req: QueryRequest, user: User = Depends(get_current_user)):
    """Specific query for the currently indexed codebase."""
    try:
        return await asyncio.to_thread(query_repo, req.question, k=req.k, user_id=user.uid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/document/{file_name}")
async def delete_document_endpoint(file_name: str, user: User = Depends(get_current_user)):
    """Remove all indexed chunks for a given file name."""
    try:
        res = await asyncio.to_thread(remove_document, file_name, user_id=user.uid)
        # Invalidate cache for this user
        global _result_cache
        keys_to_remove = [k for k in _result_cache.keys() if k.startswith(f"{user.uid}:")]
        for k in keys_to_remove:
            _result_cache.pop(k, None)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats")
async def stats_endpoint(user: User = Depends(get_current_user)):
    """Return status and file list."""
    try:
        return await asyncio.to_thread(get_stats, user_id=user.uid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
