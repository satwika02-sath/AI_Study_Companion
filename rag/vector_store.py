"""
vector_store.py
---------------
Reusable module for storing and querying document embeddings using FAISS.

FAISS (Facebook AI Similarity Search) is used as the vector backend for 
better reliability on Windows environments where ChromaDB may have 
Pydantic/dependency conflicts.

Persistence:
    The index is saved to and loaded from 'faiss_index' directory.
"""

import os
from pathlib import Path
from typing import List, Optional

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

from rag.embedding_generator import get_embedding_model

# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------
DEFAULT_PERSIST_DIR = "faiss_index"
DEFAULT_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Note: FAISS doesn't support multiple "collections" in one folder easily 
# like Chroma. We'll treat the folder as the single store.

# ─── Global Vector Store Cache ───────────────────────────────────────────────
_vector_store_cache = {}

def _get_vector_store(
    persist_directory: str = DEFAULT_PERSIST_DIR,
    embedding_model: str = DEFAULT_EMBEDDING_MODEL,
    user_id: Optional[str] = None,
) -> Optional[FAISS]:
    """
    Load the FAISS index from disk or return from cache.
    """
    if user_id:
        persist_directory = os.path.join(persist_directory, user_id)
    
    cache_key = (persist_directory, embedding_model)
    if cache_key in _vector_store_cache:
        return _vector_store_cache[cache_key]

    embeddings = get_embedding_model(embedding_model)
    
    if os.path.exists(persist_directory) and os.path.exists(os.path.join(persist_directory, "index.faiss")):
        print(f"[VectorStore] Loading FAISS index from '{persist_directory}' ...")
        store = FAISS.load_local(
            persist_directory, 
            embeddings, 
            allow_dangerous_deserialization=True
        )
        _vector_store_cache[cache_key] = store
        return store
    return None


def add_documents(
    chunks: List[Document],
    persist_directory: str = DEFAULT_PERSIST_DIR,
    embedding_model: str = DEFAULT_EMBEDDING_MODEL,
    user_id: Optional[str] = None,
) -> int:
    """
    Embed and store document chunks in FAISS index.
    If an index already exists, it is merged with the new chunks.
    """
    if user_id:
        persist_directory = os.path.join(persist_directory, user_id)
    if not chunks:
        print("[VectorStore] No chunks to store.")
        return 0

    embeddings = get_embedding_model(embedding_model)
    
    # Try to load existing
    store = _get_vector_store(persist_directory, embedding_model, user_id=None) # Directory already adjusted
    
    if store is None:
        # Create new
        store = FAISS.from_documents(chunks, embeddings)
    else:
        # Add to existing
        store.add_documents(chunks)
    
    # Save/Persist
    Path(persist_directory).mkdir(parents=True, exist_ok=True)
    store.save_local(persist_directory)

    # Update cache
    cache_key = (persist_directory, embedding_model)
    _vector_store_cache[cache_key] = store

    print(f"[VectorStore] Stored/updated {len(chunks)} chunk(s) in '{persist_directory}'")
    return len(chunks)


def similarity_search(
    query: str,
    k: int = 5,
    persist_directory: str = DEFAULT_PERSIST_DIR,
    embedding_model: str = DEFAULT_EMBEDDING_MODEL,
    source_filter: Optional[str] = None,
    user_id: Optional[str] = None,
) -> List[Document]:
    """
    Retrieve the top-k most relevant chunks.
    """
    if user_id:
        persist_directory = os.path.join(persist_directory, user_id)

    store = _get_vector_store(persist_directory, embedding_model, user_id=None)
    
    if store is None:
        print("[VectorStore] Index not found. Returning empty results.")
        return []

    # FAISS doesn't have a built-in 'where' filter like ChromaDB 
    # for metadata out-of-the-box in the same way, but we can filter 
    # the results manually or use the Search with metadata if k is large.
    
    # Get more results than k if filtering to ensure we have enough
    fetch_k = k * 3 if source_filter else k
    results = store.similarity_search(query, k=fetch_k)
    
    if source_filter:
        results = [doc for doc in results if doc.metadata.get("source_file") == source_filter]
        results = results[:k]
    
    print(f"[VectorStore] Query returned {len(results)} result(s) for: '{query[:60]}...'")
    return results


def delete_document(
    source_file: str,
    persist_directory: str = DEFAULT_PERSIST_DIR,
    embedding_model: str = DEFAULT_EMBEDDING_MODEL,
    user_id: Optional[str] = None,
) -> None:
    """
    Delete all chunks of a document. 
    """
    if user_id:
        persist_directory = os.path.join(persist_directory, user_id)

    store = _get_vector_store(persist_directory, embedding_model, user_id=None)
    if store is None:
        return

    # Get all doc IDs where source matches
    # Since we use metadata, we have to filter the internal dictionary
    all_docs = getattr(store.docstore, "_dict", {})
    ids_to_del = [
        id_ for id_, doc in all_docs.items() 
        if doc.metadata.get("source_file") == source_file
    ]
    
    if ids_to_del:
        store.delete(ids_to_del)
        store.save_local(persist_directory)
        print(f"[VectorStore] Deleted chunks for '{source_file}' from FAISS index.")


def get_collection_stats(
    persist_directory: str = DEFAULT_PERSIST_DIR,
    embedding_model: str = DEFAULT_EMBEDDING_MODEL,
    user_id: Optional[str] = None,
) -> dict:
    """
    Return FAISS index stats.
    """
    if user_id:
        persist_directory = os.path.join(persist_directory, user_id)

    store = _get_vector_store(persist_directory, embedding_model, user_id=None)
    count = 0
    unique_files = set()
    
    if store:
        _dict = getattr(store.docstore, "_dict", {})
        count = len(_dict)
        for doc in _dict.values():
            if "source_file" in doc.metadata:
                unique_files.add(doc.metadata["source_file"])

    return {
        "engine": "FAISS",
        "total_chunks": count,
        "total_files": len(unique_files),
        "files": list(unique_files),
        "persist_directory": persist_directory,
    }
