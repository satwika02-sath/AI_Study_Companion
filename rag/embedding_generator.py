"""
embedding_generator.py
-----------------------
Reusable module for converting text chunks into vector embeddings.

Uses HuggingFace sentence-transformers as the default embedding model
(no API key required, runs fully locally).

Default model: sentence-transformers/all-MiniLM-L6-v2
  • 384-dimensional dense vectors
  • Fast and accurate for semantic similarity tasks
  • ~80 MB model download on first use
"""

import os
from typing import List, Optional

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document

# ---------------------------------------------------------------------------
# Default embedding model
# ---------------------------------------------------------------------------
DEFAULT_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Module-level singleton so the model is only loaded once per process
_embedding_model: Optional[HuggingFaceEmbeddings] = None


def get_embedding_model(
    model_name: str = DEFAULT_EMBEDDING_MODEL,
) -> any:  # Type can be HuggingFaceEmbeddings or OpenAIEmbeddings
    """
    Return a cached embedding model instance.
    Prioritizes OpenRouter API embeddings in production to save memory.
    """
    global _embedding_model

    if _embedding_model is None:
        api_key = os.getenv("AI_API_KEY")
        # If we have an API key and are on Render/Production, use OpenRouter embeddings
        if api_key and os.getenv("RENDER"):
            print("[EmbeddingGenerator] Initializing API embeddings via OpenRouter (text-embedding-3-small) …")
            _embedding_model = OpenAIEmbeddings(
                model="openai/text-embedding-3-small", # OpenRouter compatible
                openai_api_key=api_key,
                openai_api_base="https://openrouter.ai/api/v1"
            )
        else:
            print(f"[EmbeddingGenerator] Initializing Local embeddings: '{model_name}' …")
            try:
                _embedding_model = HuggingFaceEmbeddings(
                    model_name=model_name,
                )
            except ImportError:
                print("[EmbeddingGenerator] ERROR: torch/sentence-transformers missing. Fallback to API required.")
                raise RuntimeError("Local embeddings failed. Ensure torch is installed or provide AI_API_KEY.")
        
        print("[EmbeddingGenerator] Model initialized successfully.")

    return _embedding_model


def embed_texts(
    texts: List[str],
    model_name: str = DEFAULT_EMBEDDING_MODEL,
) -> List[List[float]]:
    """
    Embed a list of plain text strings.

    Args:
        texts:      List of strings to embed.
        model_name: HuggingFace model to use.

    Returns:
        List of embedding vectors (each a list of floats).
    """
    model = get_embedding_model(model_name)
    embeddings = model.embed_documents(texts)
    print(
        f"[EmbeddingGenerator] Generated {len(embeddings)} embedding(s) "
        f"(dim={len(embeddings[0]) if embeddings else 'N/A'})"
    )
    return embeddings


def embed_query(
    query: str,
    model_name: str = DEFAULT_EMBEDDING_MODEL,
) -> List[float]:
    """
    Embed a single query string for similarity search.

    Args:
        query:      The search query.
        model_name: HuggingFace model to use.

    Returns:
        A single embedding vector (list of floats).
    """
    model = get_embedding_model(model_name)
    return model.embed_query(query)


def embed_documents(
    documents: List[Document],
    model_name: str = DEFAULT_EMBEDDING_MODEL,
) -> List[List[float]]:
    """
    Embed the page_content of LangChain Document objects.

    Args:
        documents:  List of LangChain Document objects.
        model_name: HuggingFace model to use.

    Returns:
        List of embedding vectors aligned to the input documents.
    """
    texts = [doc.page_content for doc in documents]
    return embed_texts(texts, model_name=model_name)
