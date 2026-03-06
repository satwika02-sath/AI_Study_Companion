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

def _ensure_uploads_dir() -> None:
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


# ─ Core Pipeline Actions ─────────────────────────────────────────────────────

def ingest_file(file_path: str) -> dict:
    """
    Ingest a single document into the RAG pipeline.
    """
    print(f"\n[RAGPipeline] Ingesting: {file_path}")

    # 1. Load
    documents = load_document(file_path)

    # 2. Split
    chunks = split_documents(documents)

    # 3. Embed & Store in FAISS
    stored = add_documents(
        chunks,
        persist_directory=VECTOR_DIR,
    )

    return {
        "file_name": Path(file_path).name,
        "pages_loaded": len(documents),
        "chunks_stored": stored,
        "status": "success",
    }


def ingest_uploaded_bytes(
    file_bytes: bytes,
    file_name: str,
    save_original: bool = True,
) -> dict:
    """
    Handle bytes from an upload, process, and optionally save.
    """
    _ensure_uploads_dir()

    if save_original:
        dest = UPLOADS_DIR / file_name
        with open(dest, "wb") as f:
            f.write(file_bytes)
        file_path = str(dest)
    else:
        suffix = Path(file_name).suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(file_bytes)
            file_path = tmp.name

    try:
        result = ingest_file(file_path)
        result["file_name"] = file_name
        return result
    finally:
        if not save_original and os.path.exists(file_path):
            os.unlink(file_path)


def query(
    question: str,
    k: int = 5,
    source_filter: Optional[str] = None,
) -> List[dict]:
    """
    Top-k semantic search.
    """
    docs = similarity_search(
        question,
        k=k,
        persist_directory=VECTOR_DIR,
        source_filter=source_filter,
    )

    return [
        {"content": doc.page_content, "metadata": doc.metadata}
        for doc in docs
    ]


def ask_tutor(
    question: str, 
    k: int = 3, 
    source_filter: Optional[str] = None
) -> dict:
    """
    Retrieval-Augmented Generation (RAG) loop:
        1. Retrieve the top k results (default=3) from the vector store.
        2. Combine results into a context string.
        3. Pass question + context to the LLM agent.
        4. Return the explanation and the source chunks used.
    """
    print(f"\n[RAGPipeline] Asking tutor: '{question}' (top k={k})")
    
    # 1. & 2. Similarity search & retrieval
    results = query(question, k=k, source_filter=source_filter)
    
    if not results:
        return {
            "question": question,
            "explanation": (
                "I couldn't find any relevant study material to answer your "
                "question. Please try uploading more notes first!"
            ),
            "sources": []
        }

    # 3. Aggregating context content
    context_text = "\n\n---\n\n".join(
        [f"Chunk {i+1}:\n{res['content']}" for i, res in enumerate(results)]
    )

    # 4. Generate explanation via LLM
    explanation = explain_with_context(question=question, context=context_text)

    return {
        "question": question,
        "explanation": explanation,
        "sources": results
    }


def generate_quiz(topic: str, k: int = 5) -> dict:
    """
    RAG Orchestration for Quiz Generation.
    1. Retrieve k most relevant chunks for the topic.
    2. Pass chunks to LLM to generate exactly 5 MCQs.
    """
    print(f"[RAGPipeline] Generating quiz for topic: '{topic}'")
    
    results = query(topic, k=k)
    if not results:
        return {"error": "No study material found for this topic."}
    
    context = "\n\n---\n\n".join([r["content"] for r in results])
    quiz_data = generate_quiz_response(context)
    
    # Attach source info for reference
    quiz_data["sources"] = [r["metadata"].get("source_file") for r in results]
    return quiz_data


def generate_flashcards(topic: str, k: int = 5) -> dict:
    """
    RAG Orchestration for Flashcard Generation.
    1. Retrieve k chunks.
    2. Pass to LLM to create 'Front: Question, Back: Answer' pairs.
    """
    print(f"[RAGPipeline] Generating flashcards for topic: '{topic}'")

    results = query(topic, k=k)
    if not results:
        return {"error": "No study material found for flashcards."}

    context = "\n\n---\n\n".join([r["content"] for r in results])
    flashcard_data = generate_flashcards_response(context)
    
    return flashcard_data


def remove_document(file_name: str) -> dict:
    """
    Delete document from index and disk.
    """
    delete_document(
        source_file=file_name,
        persist_directory=VECTOR_DIR,
    )

    saved_path = UPLOADS_DIR / file_name
    if saved_path.exists():
        saved_path.unlink()

    return {"file_name": file_name, "status": "deleted"}


def get_stats() -> dict:
    """
    Aggregate stats from FAISS and uploads.
    """
    stats = get_collection_stats(persist_directory=VECTOR_DIR)
    
    _ensure_uploads_dir()
    # Ensure 'uploaded_files' is present for frontend compatibility
    # FAISS stats already has 'files' but we'll normalize
    stats["uploaded_files"] = stats.get("files", [])
    
    if not stats["uploaded_files"]:
        # Backup: check physical uploads dir
        stats["uploaded_files"] = [f.name for f in UPLOADS_DIR.iterdir() if f.is_file()]
    
    # Frontend expects certain keys
    stats["collection_name"] = "Global Index (FAISS)"
    
    return stats
