"""
rag_pipeline.py
---------------
High-level RAG pipeline orchestration for the AI Study Companion.
Wires together loading, chunking, embedding, and FAISS indexing.
"""

import os
import shutil
import tempfile
from pathlib import Path
from typing import List, Optional

from rag.document_loader import load_document
from rag.text_splitter import split_documents
from rag.vector_store import (
    add_documents,
    similarity_search,
    delete_document,
    get_collection_stats,
)
from rag.llm_engine import explain_with_context, generate_quiz_response, generate_flashcards_response

# ---------------------------------------------------------------------------
# Paths & defaults
# ---------------------------------------------------------------------------
UPLOADS_DIR = Path("uploads")        # Original files
VECTOR_DIR = "faiss_index"           # Vector index storage

def _ensure_uploads_dir(user_id: Optional[str] = None) -> Path:
    base = UPLOADS_DIR
    if user_id:
        base = base / user_id
    base.mkdir(parents=True, exist_ok=True)
    return base


def query(
    question: str,
    k: int = 5,
    source_filter: Optional[str] = None,
    user_id: Optional[str] = None,
) -> List[dict]:
    """
    Top-k semantic search.
    """
    docs = similarity_search(
        question,
        k=k,
        persist_directory=VECTOR_DIR,
        source_filter=source_filter,
        user_id=user_id,
    )

    return [
        {"content": doc.page_content, "metadata": doc.metadata}
        for doc in docs
    ]


from rag.agents import CoordinatorAgent

# ─── Singletons ──────────────────────────────────────────────────────────────
_coordinator: Optional[CoordinatorAgent] = None

def get_coordinator() -> CoordinatorAgent:
    global _coordinator
    if _coordinator is None:
        _coordinator = CoordinatorAgent()
    return _coordinator

# ─ Core Pipeline Actions ─────────────────────────────────────────────────────

async def ingest_file(file_path: str, user_id: Optional[str] = None) -> dict:
    """
    Ingest a single document using the Agentic Pipeline.
    """
    print(f"\n[RAGPipeline] Agentic Ingestion: {file_path}")
    
    coordinator = get_coordinator()
    num_chunks, preview = await coordinator.handle_ingestion(file_path, user_id=user_id)

    return {
        "file_name": Path(file_path).name,
        "chunks_stored": num_chunks,
        "preview": preview,
        "status": "success" if num_chunks > 0 else "failed",
    }


def ingest_uploaded_bytes(
    file_bytes: bytes,
    file_name: str,
    save_original: bool = True,
    user_id: Optional[str] = None,
) -> str:
    """
    Handle bytes from an upload, process, and optionally save.
    This remains synchronous as it's a wrapper for the async ingest_file.
    Note: In server.py we await the call to ingest_file.
    """
    user_uploads_dir = _ensure_uploads_dir(user_id)
    
    if save_original:
        dest = user_uploads_dir / file_name
        with open(dest, "wb") as f:
            f.write(file_bytes)
        file_path = str(dest)
    else:
        suffix = Path(file_name).suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(file_bytes)
            file_path = tmp.name

    return file_path # Return path for the async ingest_file call in server.py


async def ask_tutor(
    question: str, 
    k: int = 3, 
    source_filter: Optional[str] = None,
    user_id: Optional[str] = None
) -> dict:
    """
    Retrieval-Augmented Generation (RAG) loop using MAS.
    """
    print(f"\n[RAGPipeline] Asking COORDINATED agents: '{question}'")
    coordinator = get_coordinator()
    result = await coordinator.handle_ask(question, k=k, source_filter=source_filter, user_id=user_id)
    
    return {
        "question": question,
        "explanation": result["explanation"],
        "sources": result["sources"]
    }


async def generate_quiz(topic: str, k: int = 5, user_id: Optional[str] = None) -> dict:
    """
    RAG Orchestration for Quiz Generation via QuizAgent.
    """
    print(f"[RAGPipeline] Generating agentic quiz for topic: '{topic}'")
    coordinator = get_coordinator()
    return await coordinator.handle_quiz(topic, k=k, user_id=user_id)


async def generate_flashcards(topic: str, k: int = 5, user_id: Optional[str] = None) -> dict:
    """
    RAG Orchestration for Flashcard Generation via FlashcardAgent.
    """
    print(f"[RAGPipeline] Generating agentic flashcards for topic: '{topic}'")
    coordinator = get_coordinator()
    return await coordinator.handle_flashcards(topic, k=k, user_id=user_id)


def remove_document(file_name: str, user_id: Optional[str] = None) -> dict:
    """
    Delete document from index and disk.
    """
    delete_document(
        source_file=file_name,
        persist_directory=VECTOR_DIR,
        user_id=user_id
    )

    user_uploads_dir = _ensure_uploads_dir(user_id)
    saved_path = user_uploads_dir / file_name
    if saved_path.exists():
        saved_path.unlink()

    return {"file_name": file_name, "status": "deleted"}


def get_stats(user_id: Optional[str] = None) -> dict:
    """
    Aggregate stats from FAISS and uploads.
    """
    stats = get_collection_stats(persist_directory=VECTOR_DIR, user_id=user_id)
    
    user_uploads_dir = _ensure_uploads_dir(user_id)
    stats["uploaded_files"] = stats.get("files", [])
    
    if not stats["uploaded_files"]:
        stats["uploaded_files"] = [f.name for f in user_uploads_dir.iterdir() if f.is_file()]
    
    stats["collection_name"] = "Global Index (FAISS)"
    return stats
